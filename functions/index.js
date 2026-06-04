// =====================================================================
// Cloud Functions（参加者向け公開窓口）— N主宰人狼会
// =====================================================================
// 役割: 参加者（未認証）は Firestore に直アクセスできない。公開情報の閲覧・予約・
//       日程調整の回答は、ここの onCall 窓口（Admin SDK でルールを迂回）経由でのみ行う。
//       ★ customers（個人情報）にはどの窓口からも一切アクセスしない。
//       ★ 出力はホワイトリスト方式（必要な公開フィールドだけを明示的に返す）。
//       ★ 入力は型・必須・長さをサーバー側で検証し、定員チェックもサーバー側で行う。
//
// リージョン: asia-northeast1（東京）。フロントの getFunctions も同一リージョンに合わせる。

const admin = require('firebase-admin');
const { setGlobalOptions } = require('firebase-functions/v2');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

admin.initializeApp();
setGlobalOptions({ region: 'asia-northeast1' });

const db = admin.firestore();

// プランの定員・ブランド（フロントの PLAN_DEFS と一致させること。capacity/brand のみ）
// ※ App.jsx の PLAN_DEFS を変更したら、ここも同期する
const PLAN_META = {
  okiraku_zoom_10: { brand: 'okiraku', capacity: 10 },
  okiraku_zoom_14: { brand: 'okiraku', capacity: 14 },
  okiraku_guest:   { brand: 'okiraku', capacity: 12 },
  taimen_akiba:    { brand: 'taimen',  capacity: 12 },
  taimen_suriaro:  { brand: 'taimen',  capacity: 12 },
  stepup_solo:     { brand: 'stepup',  capacity: 12 },
  stepup_solo_pro: { brand: 'stepup',  capacity: 12 },
  stepup_double:   { brand: 'stepup',  capacity: 12 },
  event_custom:    { brand: 'event',   capacity: 14 },
  closed_custom:   { brand: 'closed',  capacity: 12 },
};

// 招待制（クローズド）会は本人特定不可のため公開窓口の対象外
function isPublicSession(s) {
  if (!s || s.status !== 'open') return false;
  const meta = PLAN_META[s.plan];
  if (meta && meta.brand === 'closed') return false;
  if (Array.isArray(s.invitedCustomerIds) && s.invitedCustomerIds.length > 0) return false;
  return true;
}
function isPublicPoll(p) {
  return !!p && p.status === 'open' && (p.invitedCustomerIds == null);
}

// 公開してよい会フィールドだけを返す（meetingUrl・invitedCustomerIds 等は含めない）
function toPublicSession(s) {
  const meta = PLAN_META[s.plan] || {};
  return {
    id: s.id,
    date: s.date || null,
    day: s.day || null,
    time: s.time || null,
    plan: s.plan || null,
    gm: s.gm || null,
    platform: s.platform || null,
    guestName: s.guestName || null,
    guestBio: s.guestBio || null,
    customTitle: s.customTitle || null,
    customPrice: s.customPrice ?? null,
    capacity: meta.capacity ?? null,
    status: s.status,
  };
}
function toPublicPoll(p) {
  return {
    id: p.id,
    title: p.title || '',
    brand: p.brand || null,
    plan: p.plan || null,
    candidateDates: Array.isArray(p.candidateDates) ? p.candidateDates : [],
    deadline: p.deadline || null,
    note: p.note || '',
    createdBy: p.createdBy || null,
    status: p.status,
  };
}

// ---- 入力バリデーション ----
function requireString(v, field, { min = 1, max = 100 } = {}) {
  if (typeof v !== 'string') throw new HttpsError('invalid-argument', `${field}を正しく入力してください。`);
  const t = v.trim();
  if (t.length < min) throw new HttpsError('invalid-argument', `${field}を入力してください。`);
  if (t.length > max) throw new HttpsError('invalid-argument', `${field}が長すぎます。`);
  return t;
}
function optionalString(v, field, { max = 100 } = {}) {
  if (v == null || v === '') return '';
  if (typeof v !== 'string') throw new HttpsError('invalid-argument', `${field}を正しく入力してください。`);
  const t = v.trim();
  if (t.length > max) throw new HttpsError('invalid-argument', `${field}が長すぎます。`);
  return t;
}
const ANSWER_VALUES = new Set(['yes', 'maybe', 'no']);
function validateAnswers(answers, candidateCount) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new HttpsError('invalid-argument', '回答の形式が正しくありません。');
  }
  const keys = Object.keys(answers);
  if (keys.length === 0) throw new HttpsError('invalid-argument', '回答を1つ以上選択してください。');
  if (keys.length > 60) throw new HttpsError('invalid-argument', '回答数が多すぎます。');
  const cleaned = {};
  for (const k of keys) {
    const idx = Number(k);
    if (!Number.isInteger(idx) || idx < 0 || idx >= candidateCount) {
      throw new HttpsError('invalid-argument', '回答の候補日が不正です。');
    }
    if (!ANSWER_VALUES.has(answers[k])) {
      throw new HttpsError('invalid-argument', '回答の値が不正です。');
    }
    cleaned[String(idx)] = answers[k];
  }
  return cleaned;
}

// 同一人物の判定キー（匿名のため handle 優先、無ければ name）
function identityKey(name, handle) {
  const h = (handle || '').trim().toLowerCase();
  if (h) return 'h:' + h;
  return 'n:' + (name || '').trim().toLowerCase();
}
function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

// =====================================================================
// 窓口1: 公開情報の読み取り
// =====================================================================
exports.getPublicData = onCall(async () => {
  try {
    const [sessSnap, partSnap, pollSnap, resSnap] = await Promise.all([
      db.collection('sessions').get(),
      db.collection('participants').get(),
      db.collection('schedulePolls').get(),
      db.collection('pollResponses').get(),
    ]);

    // 公開対象の会
    const sessions = [];
    const publicSessionIds = new Set();
    sessSnap.forEach((d) => {
      const s = d.data();
      if (isPublicSession(s)) { sessions.push(toPublicSession(s)); publicSessionIds.add(s.id); }
    });

    // 予約人数の集計のみ（誰が予約したかの個人情報は返さない）
    const sessionCounts = {};
    partSnap.forEach((d) => {
      const p = d.data();
      if (p.cancelled === true) return;
      if (!publicSessionIds.has(p.sessionId)) return;
      sessionCounts[p.sessionId] = (sessionCounts[p.sessionId] || 0) + 1;
    });

    // 公開中の日程調整
    const polls = [];
    const publicPollIds = new Set();
    pollSnap.forEach((d) => {
      const p = d.data();
      if (isPublicPoll(p)) { polls.push(toPublicPoll(p)); publicPollIds.add(p.id); }
    });

    // 候補日ごとの ◯△× 集計のみ（回答者の個人情報は返さない）
    const pollCounts = {};
    polls.forEach((p) => {
      pollCounts[p.id] = p.candidateDates.map(() => ({ yes: 0, maybe: 0, no: 0 }));
    });
    resSnap.forEach((d) => {
      const r = d.data();
      if (!publicPollIds.has(r.pollId)) return;
      const arr = pollCounts[r.pollId];
      if (!arr || !r.answers) return;
      Object.keys(r.answers).forEach((k) => {
        const idx = Number(k);
        const val = r.answers[k];
        if (arr[idx] && ANSWER_VALUES.has(val)) arr[idx][val] += 1;
      });
    });

    return { sessions, sessionCounts, polls, pollCounts };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('getPublicData failed', err);
    throw new HttpsError('internal', '公開情報の取得に失敗しました。時間をおいて再度お試しください。');
  }
});

// =====================================================================
// 窓口2: 予約（定員チェックはサーバー側でトランザクション内に行う）
// =====================================================================
exports.createReservation = onCall(async (request) => {
  try {
    const data = request.data || {};
    const sessionIdRaw = data.sessionId;
    if (sessionIdRaw === undefined || sessionIdRaw === null || String(sessionIdRaw).length === 0) {
      throw new HttpsError('invalid-argument', '会が指定されていません。');
    }
    const name = requireString(data.name, 'お名前', { max: 50 });
    const handle = optionalString(data.handle, 'ハンドル名', { max: 50 });
    const note = optionalString(data.note, '伝言', { max: 500 });
    const idKey = identityKey(name, handle);

    const sessionRef = db.collection('sessions').doc(String(sessionIdRaw));

    const result = await db.runTransaction(async (tx) => {
      const sessSnap = await tx.get(sessionRef);
      if (!sessSnap.exists) throw new HttpsError('not-found', '指定された会が見つかりません。');
      const s = sessSnap.data();
      if (!isPublicSession(s)) throw new HttpsError('failed-precondition', 'この会は現在予約を受け付けていません。');

      const capacity = (PLAN_META[s.plan] || {}).capacity ?? 0;
      const partSnap = await tx.get(db.collection('participants').where('sessionId', '==', s.id));
      let active = 0;
      let dup = false;
      partSnap.forEach((d) => {
        const p = d.data();
        if (p.cancelled === true) return;
        active += 1;
        if (identityKey(p.name, p.handle) === idKey) dup = true;
      });
      if (dup) throw new HttpsError('already-exists', 'この会はすでに予約済みです。');
      if (capacity > 0 && active >= capacity) throw new HttpsError('resource-exhausted', '申し訳ありません。この会は定員に達しています。');

      const ref = db.collection('participants').doc();
      const participant = {
        id: ref.id,
        sessionId: s.id,
        customerId: null,           // 匿名予約
        name,
        handle: handle || null,
        paid: false,                // 入金は運営者が確認（既存フローに合流）
        paidAt: null,
        cancelled: false,
        refunded: false,
        role: null,
        note: note || null,
        createdVia: 'public',
        createdAt: nowStamp(),
      };
      tx.set(ref, participant);
      return { id: ref.id, sessionId: s.id, remaining: capacity > 0 ? capacity - active - 1 : null };
    });

    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('createReservation failed', err);
    throw new HttpsError('internal', '予約処理でエラーが発生しました。時間をおいて再度お試しください。');
  }
});

// =====================================================================
// 窓口3: 日程調整に回答（同じ人の再回答は上書き）
// =====================================================================
exports.submitPollResponse = onCall(async (request) => {
  try {
    const data = request.data || {};
    const pollIdRaw = data.pollId;
    if (pollIdRaw === undefined || pollIdRaw === null || String(pollIdRaw).length === 0) {
      throw new HttpsError('invalid-argument', '日程調整が指定されていません。');
    }
    const name = requireString(data.name, 'お名前', { max: 50 });
    const handle = optionalString(data.handle, 'ハンドル名', { max: 50 });
    const idKey = identityKey(name, handle);

    const pollRef = db.collection('schedulePolls').doc(String(pollIdRaw));

    const result = await db.runTransaction(async (tx) => {
      const pollSnap = await tx.get(pollRef);
      if (!pollSnap.exists) throw new HttpsError('not-found', '指定された日程調整が見つかりません。');
      const poll = pollSnap.data();
      if (!isPublicPoll(poll)) throw new HttpsError('failed-precondition', 'この日程調整は現在回答を受け付けていません。');

      const candidateCount = Array.isArray(poll.candidateDates) ? poll.candidateDates.length : 0;
      const answers = validateAnswers(data.answers, candidateCount);

      // 同一人物の既存回答を探して上書き（無ければ新規）
      const existingSnap = await tx.get(db.collection('pollResponses').where('pollId', '==', poll.id));
      let targetRef = null;
      let existingComment = '';
      existingSnap.forEach((d) => {
        const r = d.data();
        if (targetRef) return;
        if (identityKey(r.name, r.handle) === idKey) {
          targetRef = d.ref;
          existingComment = r.comment || '';
        }
      });
      const created = !targetRef;
      if (!targetRef) targetRef = db.collection('pollResponses').doc();

      const response = {
        id: targetRef.id,
        pollId: poll.id,
        customerId: null,           // 匿名回答
        name,
        handle: handle || null,
        answers,
        comment: existingComment,
        respondedAt: nowStamp(),
      };
      tx.set(targetRef, response, { merge: false });
      return { id: targetRef.id, created };
    });

    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('submitPollResponse failed', err);
    throw new HttpsError('internal', '回答の送信でエラーが発生しました。時間をおいて再度お試しください。');
  }
});
