// =====================================================================
// Firestore データアクセス層（sessions コレクション）
// =====================================================================
// 方針:
//   - DBは段階的移行。現段階は sessions のみ Firestore 化（participants/customers/schedulePolls は React state のまま）
//   - ドキュメントID = String(session.id)。id（数値）はフィールドとしても保存し、
//     アプリ内の数値ID前提（enrichSession / s.id === id 比較 / 各 mutator）を変えずに済むようにする
//   - Firestore には常に「生（raw）の session」を保存（enrichSession 済みオブジェクトは保存しない）

import { db } from './firebase';
import {
  collection, getDocs, onSnapshot, query, where,
  doc, addDoc, setDoc, updateDoc, deleteDoc, writeBatch, runTransaction,
} from 'firebase/firestore';

const SESSIONS = 'sessions';

// Firestore は undefined を受け付けないため、undefined のキーを除去する
function clean(obj) {
  const out = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
}

// 一回だけ取得（ステップ2の初期読み込み用）
export async function fetchSessions() {
  const snap = await getDocs(collection(db, SESSIONS));
  return snap.docs.map((d) => d.data());
}

// リアルタイム購読（ステップ3用）。戻り値は unsubscribe 関数
export function subscribeSessions(onChange, onError) {
  return onSnapshot(
    collection(db, SESSIONS),
    (snap) => onChange(snap.docs.map((d) => d.data())),
    onError,
  );
}

// 作成・全上書き
export function saveSession(session) {
  return setDoc(doc(db, SESSIONS, String(session.id)), clean(session));
}

// 部分更新
export function patchSession(id, patch) {
  return updateDoc(doc(db, SESSIONS, String(id)), clean(patch));
}

// 削除（会のみ）。紐づく参加者ごと消す場合は removeSessionWithParticipants を使う
export function removeSession(id) {
  return deleteDoc(doc(db, SESSIONS, String(id)));
}

// 会＋紐づく参加者を原子的に削除（#3-B 孤児participant防止）。
//   削除直前に participants を最新クエリで取り直してから batch 化するため、
//   ローカルstateの取りこぼし（直近の予約）も拾える。完全な同時挿入は次回削除で回収。
export async function removeSessionWithParticipants(id) {
  const partSnap = await getDocs(query(collection(db, PARTICIPANTS_COL), where('sessionId', '==', id)));
  const batch = writeBatch(db);
  batch.delete(doc(db, SESSIONS, String(id)));
  partSnap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// サンプル投入（DEV用シード）。setDoc なので冪等（同じ id は重複せず上書き）
export async function seedSessions(sessionsArr) {
  await Promise.all(
    sessionsArr.map((s) => setDoc(doc(db, SESSIONS, String(s.id)), clean(s))),
  );
}

// =====================================================================
// customers コレクション（読み取り専用UIだが、書き込みヘルパーも将来用に用意）
// =====================================================================
const CUSTOMERS_COL = 'customers';

export function subscribeCustomers(onChange, onError) {
  return onSnapshot(
    collection(db, CUSTOMERS_COL),
    (snap) => onChange(snap.docs.map((d) => d.data())),
    onError,
  );
}
export function saveCustomer(customer) {
  return setDoc(doc(db, CUSTOMERS_COL, String(customer.id)), clean(customer));
}
export function patchCustomer(id, patch) {
  return updateDoc(doc(db, CUSTOMERS_COL, String(id)), clean(patch));
}
export function removeCustomer(id) {
  return deleteDoc(doc(db, CUSTOMERS_COL, String(id)));
}
export async function seedCustomers(customersArr) {
  await Promise.all(
    customersArr.map((c) => setDoc(doc(db, CUSTOMERS_COL, String(c.id)), clean(c))),
  );
}

// =====================================================================
// participants コレクション（参加申込）。id は 'p1' 等の文字列
// =====================================================================
const PARTICIPANTS_COL = 'participants';

export function subscribeParticipants(onChange, onError) {
  return onSnapshot(
    collection(db, PARTICIPANTS_COL),
    (snap) => onChange(snap.docs.map((d) => d.data())),
    onError,
  );
}
export function saveParticipant(participant) {
  return setDoc(doc(db, PARTICIPANTS_COL, String(participant.id)), clean(participant));
}
export function patchParticipant(id, patch) {
  return updateDoc(doc(db, PARTICIPANTS_COL, String(id)), clean(patch));
}
export function removeParticipant(id) {
  return deleteDoc(doc(db, PARTICIPANTS_COL, String(id)));
}
export async function seedParticipants(participantsArr) {
  await Promise.all(
    participantsArr.map((p) => setDoc(doc(db, PARTICIPANTS_COL, String(p.id)), clean(p))),
  );
}

// =====================================================================
// schedulePolls コレクション（日程調整）。id は 'poll1' 等の文字列
// =====================================================================
const SCHEDULE_POLLS_COL = 'schedulePolls';

export function subscribeSchedulePolls(onChange, onError) {
  return onSnapshot(
    collection(db, SCHEDULE_POLLS_COL),
    (snap) => onChange(snap.docs.map((d) => d.data())),
    onError,
  );
}
export function saveSchedulePoll(poll) {
  return setDoc(doc(db, SCHEDULE_POLLS_COL, String(poll.id)), clean(poll));
}
export function patchSchedulePoll(id, patch) {
  return updateDoc(doc(db, SCHEDULE_POLLS_COL, String(id)), clean(patch));
}
export function removeSchedulePoll(id) {
  return deleteDoc(doc(db, SCHEDULE_POLLS_COL, String(id)));
}
export async function seedSchedulePolls(pollsArr) {
  await Promise.all(
    pollsArr.map((p) => setDoc(doc(db, SCHEDULE_POLLS_COL, String(p.id)), clean(p))),
  );
}

// =====================================================================
// pollResponses コレクション（日程調整の回答）。id は 'res1' 等の文字列
// =====================================================================
const POLL_RESPONSES_COL = 'pollResponses';

export function subscribePollResponses(onChange, onError) {
  return onSnapshot(
    collection(db, POLL_RESPONSES_COL),
    (snap) => onChange(snap.docs.map((d) => d.data())),
    onError,
  );
}
export function savePollResponse(response) {
  return setDoc(doc(db, POLL_RESPONSES_COL, String(response.id)), clean(response));
}
export function removePollResponse(id) {
  return deleteDoc(doc(db, POLL_RESPONSES_COL, String(id)));
}
export async function seedPollResponses(responsesArr) {
  await Promise.all(
    responsesArr.map((r) => setDoc(doc(db, POLL_RESPONSES_COL, String(r.id)), clean(r))),
  );
}

// =====================================================================
// announcements コレクション（告知配信履歴）
// エントリに id を持たないため、追加は addDoc（自動ID）。読み取りは date 降順でソート。
// シードは決定的ID（seed-N）で setDoc し、再投入しても重複しないようにする。
// =====================================================================
const ANNOUNCEMENTS_COL = 'announcements';

export function subscribeAnnouncements(onChange, onError) {
  return onSnapshot(
    collection(db, ANNOUNCEMENTS_COL),
    (snap) => {
      const rows = snap.docs.map((d) => d.data());
      // date は 'YYYY-MM-DD HH:MM' 文字列。新しい順に並べる
      rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      onChange(rows);
    },
    onError,
  );
}
export function addAnnouncement(entry) {
  return addDoc(collection(db, ANNOUNCEMENTS_COL), clean(entry));
}
export async function seedAnnouncements(entriesArr) {
  await Promise.all(
    entriesArr.map((e, i) => setDoc(doc(db, ANNOUNCEMENTS_COL, `seed-${i}`), clean(e))),
  );
}

// =====================================================================
// 日程調整の確定を原子的にコミット（複数会の作成＋ポール更新を1トランザクション）
//   複数日確定対応: sessions[] を一括で set（各 id は呼び出し側で pollId 由来の決定論的ID
//   `s_${pollId}_${index}` にしてあるため、万一2回走っても同じドキュメントに上書き＝二重作成にならない）。
//   #3-A 二重確定防止: tx内でpollを読み、status!=='open' なら 'already-confirmed' で中断。
//   参加者の自動登録は廃止（確定後、参加者が各自で予約する＝先着）。
//   告知は非クリティカルのためtx外（呼び出し側でtx成功後に実行）。
//   失敗時は 'poll-not-found' / 'already-confirmed' を Error.message で投げる。
// =====================================================================
export async function commitPollConfirmation({ sessions, pollId, pollPatch }) {
  await runTransaction(db, async (tx) => {
    const pollRef = doc(db, SCHEDULE_POLLS_COL, String(pollId));
    const pollSnap = await tx.get(pollRef); // 読み取りは書き込みより前（Firestoreトランザクション規則）
    if (!pollSnap.exists()) throw new Error('poll-not-found');
    if (pollSnap.data().status !== 'open') throw new Error('already-confirmed');
    (sessions || []).forEach((s) => {
      tx.set(doc(db, SESSIONS, String(s.id)), clean(s));
    });
    tx.update(pollRef, clean(pollPatch));
  });
}
