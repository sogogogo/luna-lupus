// =====================================================================
// 認証ヘルパー（Firebase Auth）
// =====================================================================
// 運営者: メール/パスワード（＋カスタムクレーム admin:true）
// 参加者: Google ログイン
// 設定はソース直書きせず firebase.js（環境変数）の auth を使う。

import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// 運営者: メール/パスワードでログイン
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// 参加者: Google でログイン
export function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

// ログアウト
export function signOutUser() {
  return signOut(auth);
}

// ログイン状態の監視。callback(user|null) が呼ばれる。戻り値は unsubscribe 関数
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
