// =====================================================================
// Cloud Functions 窓口クライアント（参加者向け）
// =====================================================================
// 参加者は Firestore に直アクセスせず、ここ経由で公開窓口（onCall）を呼ぶ。
// リージョンはデプロイ先（asia-northeast1）と必ず一致させる。

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from './firebase';

const fns = getFunctions(app, 'asia-northeast1');

// 窓口1: 公開情報（会一覧・公開日程調整・予約人数/回答集計）
export function fetchPublicData() {
  return httpsCallable(fns, 'getPublicData')().then((r) => r.data);
}

// 参加者: プロフィールのリンク/取得（Google ログイン後）。{ handle? } を渡す
export function claimProfile(payload) {
  return httpsCallable(fns, 'claimProfile')(payload || {}).then((r) => r.data);
}

// 窓口2: 予約（サーバー側で定員チェック）
export function bookSession(payload) {
  return httpsCallable(fns, 'createReservation')(payload).then((r) => r.data);
}

// 窓口3: 日程調整に回答（同一人物は上書き）
export function answerPoll(payload) {
  return httpsCallable(fns, 'submitPollResponse')(payload).then((r) => r.data);
}

// ※一時: 運営者クレーム付与（S4 で関数ごと削除する）
export function claimAdmin(secret) {
  return httpsCallable(fns, 'claimAdmin')({ secret }).then((r) => r.data);
}
