// =====================================================================
// Firebase 初期化（接続の土台）
// =====================================================================
// 方針:
//   - 設定値はソースに直書きせず、必ず環境変数（import.meta.env.VITE_FIREBASE_*）経由で読む
//   - 実値は .env.local に記入（Git管理外）。キー名の見本は .env.example を参照
//   - DBは段階的に移行する方針のため、現段階では初期化と export のみ（既存の React state は未置換）
//
// 動作確認の方法（次フェーズのデータ移行前の疎通チェック用）:
//   1. .env.local に Firebase コンソールの構成値を記入する
//   2. アプリ内の任意コンポーネントで一時的に下記を試す（確認後に必ず削除）:
//        import { db, auth } from './lib/firebase';
//        import { collection, getDocs } from 'firebase/firestore';
//        getDocs(collection(db, 'healthcheck'))
//          .then(s => console.log('Firestore OK:', s.size))
//          .catch(e => console.error('Firestore NG:', e));
//      → 権限エラーなく応答が返れば疎通OK（コレクションは空でよい）
//   3. 認証は `auth.app.name` が "[DEFAULT]" を返せば初期化済み
//   ※ CLAUDE.md の禁止事項に従い、確認用 console.log はコミット前に残さないこと

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 環境変数から構成を組み立てる（値はビルド時に Vite が埋め込む。VITE_ プレフィックス必須）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 未設定（.env.local 未記入）の場合に気づけるよう、開発時のみ警告を出す
if (import.meta.env.DEV && !firebaseConfig.apiKey) {
  console.warn('[firebase] VITE_FIREBASE_* が未設定です。.env.local を確認してください（.env.example 参照）。');
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
