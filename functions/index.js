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
  if (!meta) return false; // 未知/欠落 plan の会は公開対象に含めない（フロントの enrich 不能データを流さない）
  if (meta.brand === 'closed') return false;
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
    // 日程調整由来の会（◯回答との突合・優先表示用）。非機密のみ公開
    fromPollId: s.fromPollId || null,
    fromPollIndex: typeof s.fromPollIndex === 'number' ? s.fromPollIndex : null,
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

// X ハンドルの正規化（先頭@/＠除去・全空白除去・小文字化）。入力と保存値の両方に適用して比較する
function normalizeHandle(h) {
  if (h == null) return '';
  return String(h).replace(/\s+/g, '').replace(/^[@＠]+/, '').toLowerCase();
}
// 参加者本人に返してよい最小限のプロフィール（notes/phone/email/spent は返さない）
function toSafeProfile(c) {
  return {
    id: c.id,
    name: c.name || '',
    handle: c.handle || null,
    tier: c.tier || '新規',
    total: c.total ?? 0,
    favorite: c.favorite || null,
  };
}

// =====================================================================
// 参加者: プロフィールのリンク/取得（Google ログイン後）
//   - uid に既にリンク済み顧客があれば返す（ハンドル不要）
//   - 未リンクでハンドル未指定なら { linked:false }（フロントが入力UIを出す）
//   - ハンドル指定時: 既存顧客と正規化照合し、未リンクならリンク。なければ新規作成。
//   - なりすまし対策: 既に別 uid にリンク済みの顧客へは結びつけず、新規顧客を作る
//   - 返すのは安全プロフィールのみ
// =====================================================================
exports.claimProfile = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const uid = request.auth.uid;
    const rawHandle = (request.data && request.data.handle) || '';
    const normHandle = normalizeHandle(rawHandle);

    const snap = await db.collection('customers').get();

    // 1) 既に uid にリンク済み → そのまま返す
    const linkedDoc = snap.docs.find((d) => d.data().authUid === uid);
    if (linkedDoc) return { linked: true, profile: toSafeProfile(linkedDoc.data()) };

    // 2) ハンドル未指定 → 入力を促す
    if (!normHandle) return { linked: false };
    if (normHandle.length > 50) throw new HttpsError('invalid-argument', 'ハンドル名が長すぎます。');

    // 3) 正規化一致の既存顧客
    const matchDoc = snap.docs.find((d) => normalizeHandle(d.data().handle) === normHandle);
    if (matchDoc && !matchDoc.data().authUid) {
      // 未リンク → トランザクションで再確認してリンク
      const ref = matchDoc.ref;
      const profile = await db.runTransaction(async (tx) => {
        const fresh = await tx.get(ref);
        const c = fresh.data();
        if (c.authUid && c.authUid !== uid) return null; // 競合
        tx.update(ref, { authUid: uid, handleNorm: normHandle });
        return toSafeProfile({ ...c, authUid: uid });
      });
      if (profile) return { linked: true, profile };
      // 競合時は新規作成へ
    }

    // 4) 新規顧客を作成（既存に紐づけない＝なりすまし防止）
    const newId = Date.now();
    const displayName = (request.auth.token && request.auth.token.name) || rawHandle.trim() || 'ゲスト';
    const newCustomer = {
      id: newId,
      authUid: uid,
      name: displayName,
      handle: '@' + normHandle,
      handleNorm: normHandle,
      phone: '', email: '',
      joined: new Date().toISOString().slice(0, 10),
      total: 0, lastVisit: null, spent: 0,
      tier: '新規', favorite: null, notes: '',
      avatar: displayName.slice(0, 1),
      createdVia: 'self',
    };
    await db.collection('customers').doc(String(newId)).set(newCustomer);
    return { linked: true, profile: toSafeProfile(newCustomer), created: true };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('claimProfile failed', err);
    throw new HttpsError('internal', 'プロフィールの設定に失敗しました。');
  }
});

// uid から自分の顧客レコードを解決（authUid 一致）。見つからなければ null
async function resolveMyCustomer(uid) {
  const snap = await db.collection('customers').get();
  const doc = snap.docs.find((d) => d.data().authUid === uid);
  return doc ? doc.data() : null;
}
// 自分の予約に見せる会情報（公開フィールド＋自分は参加者なので meetingUrl も含める）
function toMyBookingSession(s) {
  return { ...toPublicSession(s), meetingUrl: s.meetingUrl || null };
}

// =====================================================================
// 参加者: 自分のデータのみ取得（マイページ・予約済み・回答済み・招待表示の元）
//   他人のデータは一切返さない。プロフィールは最小開示。
// =====================================================================
exports.getMyData = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const me = await resolveMyCustomer(request.auth.uid);
    if (!me) return { linked: false };
    const myId = me.id;

    const [partSnap, sessSnap, resSnap] = await Promise.all([
      db.collection('participants').where('customerId', '==', myId).get(),
      db.collection('sessions').get(),
      db.collection('pollResponses').where('customerId', '==', myId).get(),
    ]);

    const sessionsById = {};
    sessSnap.forEach((d) => { const s = d.data(); sessionsById[s.id] = s; });

    const bookings = partSnap.docs.map((d) => {
      const p = d.data();
      const s = sessionsById[p.sessionId];
      return {
        id: p.id,
        sessionId: p.sessionId,
        paid: p.paid === true,
        paymentStatus: p.paymentStatus || (p.paid === true ? 'confirmed' : 'unpaid'),
        cancelled: p.cancelled === true,
        role: p.role || null,
        session: s ? toMyBookingSession(s) : null,
      };
    });

    const responses = resSnap.docs.map((d) => {
      const r = d.data();
      return { id: r.id, pollId: r.pollId, answers: r.answers || {} };
    });

    const invitedSessions = [];
    sessSnap.forEach((d) => {
      const s = d.data();
      if (s.status === 'open' && Array.isArray(s.invitedCustomerIds) && s.invitedCustomerIds.includes(myId)) {
        invitedSessions.push(toPublicSession(s));
      }
    });

    return { linked: true, profile: toSafeProfile(me), bookings, responses, invitedSessions };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('getMyData failed', err);
    throw new HttpsError('internal', 'マイデータの取得に失敗しました。');
  }
});

// =====================================================================
// 参加者: 自分のプロフィール編集（表示名・Xハンドル）
//   ハンドル変更時は他顧客との重複（正規化一致）を拒否
// =====================================================================
exports.updateMyProfile = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const me = await resolveMyCustomer(request.auth.uid);
    if (!me) throw new HttpsError('failed-precondition', 'プロフィール未設定です。');
    const data = request.data || {};
    const name = requireString(data.name, '表示名', { max: 50 });
    const normHandle = normalizeHandle(data.handle);
    if (!normHandle) throw new HttpsError('invalid-argument', 'Xハンドルを入力してください。');
    if (normHandle.length > 50) throw new HttpsError('invalid-argument', 'Xハンドルが長すぎます。');

    // 他の顧客が同じ正規化ハンドルを持っていないか
    const snap = await db.collection('customers').get();
    const conflict = snap.docs.find((d) => d.data().id !== me.id && normalizeHandle(d.data().handle) === normHandle);
    if (conflict) throw new HttpsError('already-exists', 'そのXハンドルは既に使われています。');

    const handle = '@' + normHandle;
    await db.collection('customers').doc(String(me.id)).update({ name, handle, handleNorm: normHandle });
    return { ok: true, profile: toSafeProfile({ ...me, name, handle }) };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('updateMyProfile failed', err);
    throw new HttpsError('internal', 'プロフィール更新に失敗しました。');
  }
});

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
// 窓口2: 予約（要ログイン。本人として予約。定員チェックはトランザクション内）
// =====================================================================
exports.createReservation = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const data = request.data || {};
    const sessionIdRaw = data.sessionId;
    if (sessionIdRaw === undefined || sessionIdRaw === null || String(sessionIdRaw).length === 0) {
      throw new HttpsError('invalid-argument', '会が指定されていません。');
    }
    const note = optionalString(data.note, '伝言', { max: 500 });
    const me = await resolveMyCustomer(request.auth.uid);
    if (!me) throw new HttpsError('failed-precondition', 'プロフィール未設定です。Xハンドルを設定してください。');

    const sessionRef = db.collection('sessions').doc(String(sessionIdRaw));

    const result = await db.runTransaction(async (tx) => {
      const sessSnap = await tx.get(sessionRef);
      if (!sessSnap.exists) throw new HttpsError('not-found', '指定された会が見つかりません。');
      const s = sessSnap.data();
      // 公開会、または自分が招待されたクローズド会のみ予約可
      const invited = Array.isArray(s.invitedCustomerIds) && s.invitedCustomerIds.includes(me.id);
      if (s.status !== 'open' || !(isPublicSession(s) || invited)) {
        throw new HttpsError('failed-precondition', 'この会は現在予約を受け付けていません。');
      }

      const capacity = (PLAN_META[s.plan] || {}).capacity ?? 0;
      const partSnap = await tx.get(db.collection('participants').where('sessionId', '==', s.id));
      let active = 0;
      let dup = false;
      partSnap.forEach((d) => {
        const p = d.data();
        if (p.cancelled === true) return;
        active += 1;
        if (p.customerId === me.id) dup = true;   // 本人での二重予約防止
      });
      if (dup) throw new HttpsError('already-exists', 'この会はすでに予約済みです。');
      if (capacity > 0 && active >= capacity) throw new HttpsError('resource-exhausted', '申し訳ありません。この会は定員に達しています。');

      const ref = db.collection('participants').doc();
      const participant = {
        id: ref.id,
        sessionId: s.id,
        customerId: me.id,          // 本人
        name: me.name,              // 氏名/ハンドルは顧客レコードから（なりすまし防止）
        handle: me.handle || null,
        paid: false,                // 入金は運営者が確認
        paidAt: null,
        paymentStatus: 'unpaid',    // 未送金 → reported(送金済み申告) → confirmed(入金確認済み)
        cancelled: false,
        refunded: false,
        role: null,
        note: note || null,
        createdVia: 'self',
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
// 予約のキャンセル（要ログイン・自分の予約のみ）
// =====================================================================
exports.cancelReservation = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const participantId = (request.data && request.data.participantId) || '';
    if (!participantId) throw new HttpsError('invalid-argument', '予約が指定されていません。');
    const me = await resolveMyCustomer(request.auth.uid);
    if (!me) throw new HttpsError('failed-precondition', 'プロフィール未設定です。');

    const ref = db.collection('participants').doc(String(participantId));
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpsError('not-found', '予約が見つかりません。');
      const p = snap.data();
      if (p.customerId !== me.id) throw new HttpsError('permission-denied', '自分の予約のみキャンセルできます。');
      if (p.cancelled === true) return;
      tx.update(ref, { cancelled: true, cancelledAt: nowStamp() });
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('cancelReservation failed', err);
    throw new HttpsError('internal', 'キャンセル処理でエラーが発生しました。');
  }
});

// =====================================================================
// 支払い自己申告（要ログイン・自分の予約のみ）。PayPay L2: 未送金→送金済み申告
//   実際の入金確認（confirmed）は運営者が管理画面で行う（Admin SDK 直接更新）
// =====================================================================
exports.reportPayment = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const participantId = (request.data && request.data.participantId) || '';
    if (!participantId) throw new HttpsError('invalid-argument', '予約が指定されていません。');
    const me = await resolveMyCustomer(request.auth.uid);
    if (!me) throw new HttpsError('failed-precondition', 'プロフィール未設定です。');

    const ref = db.collection('participants').doc(String(participantId));
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new HttpsError('not-found', '予約が見つかりません。');
      const p = snap.data();
      if (p.customerId !== me.id) throw new HttpsError('permission-denied', '自分の予約のみ操作できます。');
      if (p.cancelled === true) throw new HttpsError('failed-precondition', 'キャンセル済みの予約です。');
      if (p.paid === true || p.paymentStatus === 'confirmed') return; // 既に入金確認済み
      tx.update(ref, { paymentStatus: 'reported', reportedAt: nowStamp() });
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('reportPayment failed', err);
    throw new HttpsError('internal', '送金申告でエラーが発生しました。');
  }
});

// =====================================================================
// 窓口3: 日程調整に回答（要ログイン。本人として upsert）
// =====================================================================
exports.submitPollResponse = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError('unauthenticated', 'ログインしてください。');
    const data = request.data || {};
    const pollIdRaw = data.pollId;
    if (pollIdRaw === undefined || pollIdRaw === null || String(pollIdRaw).length === 0) {
      throw new HttpsError('invalid-argument', '日程調整が指定されていません。');
    }
    const me = await resolveMyCustomer(request.auth.uid);
    if (!me) throw new HttpsError('failed-precondition', 'プロフィール未設定です。Xハンドルを設定してください。');

    const pollRef = db.collection('schedulePolls').doc(String(pollIdRaw));

    const result = await db.runTransaction(async (tx) => {
      const pollSnap = await tx.get(pollRef);
      if (!pollSnap.exists) throw new HttpsError('not-found', '指定された日程調整が見つかりません。');
      const poll = pollSnap.data();
      // 公開ポール、または自分が招待されたポールのみ回答可
      const invited = Array.isArray(poll.invitedCustomerIds) && poll.invitedCustomerIds.includes(me.id);
      if (poll.status !== 'open' || !(isPublicPoll(poll) || invited)) {
        throw new HttpsError('failed-precondition', 'この日程調整は現在回答を受け付けていません。');
      }

      const candidateCount = Array.isArray(poll.candidateDates) ? poll.candidateDates.length : 0;
      const answers = validateAnswers(data.answers, candidateCount);

      // #4 決定論的ID `${pollId}_${customerId}`：同一人物は同じドキュメントに upsert。
      //   全件クエリ（ポール全回答のロック）が不要になり、ロック範囲が自分の1ドキュメントのみ＝
      //   大勢が同じ日程調整に同時回答してもトランザクション競合が起きにくい。
      const responseId = `${poll.id}_${me.id}`;
      const targetRef = db.collection('pollResponses').doc(responseId);
      const existingSnap = await tx.get(targetRef);        // 読み取りは書き込みより前
      const created = !existingSnap.exists;
      const existingComment = existingSnap.exists ? (existingSnap.data().comment || '') : '';

      const response = {
        id: responseId,
        pollId: poll.id,
        customerId: me.id,          // 本人
        name: me.name,
        handle: me.handle || null,
        answers,
        comment: existingComment,
        respondedAt: nowStamp(),
      };
      tx.set(targetRef, response, { merge: false });
      return { id: responseId, created };
    });

    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    logger.error('submitPollResponse failed', err);
    throw new HttpsError('internal', '回答の送信でエラーが発生しました。時間をおいて再度お試しください。');
  }
});
