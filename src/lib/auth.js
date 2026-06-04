// =====================================================================
// 認証ヘルパー（Firebase Auth・メール/パスワード）
// =====================================================================
// 運営者ログイン用。設定はソース直書きせず firebase.js（環境変数）の auth を使う。

import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// メール/パスワードでログイン
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ログアウト
export function signOutUser() {
  return signOut(auth);
}

// ログイン状態の監視。callback(user|null) が呼ばれる。戻り値は unsubscribe 関数
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
