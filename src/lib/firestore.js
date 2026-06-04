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
  collection, getDocs, onSnapshot,
  doc, setDoc, updateDoc, deleteDoc,
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

// 削除
export function removeSession(id) {
  return deleteDoc(doc(db, SESSIONS, String(id)));
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
