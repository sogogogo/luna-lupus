// =====================================================================
// Cloud Functions（参加者向け公開窓口）— N主宰人狼会
// =====================================================================
// 役割: 参加者（未認証）は Firestore に直アクセスできない。公開情報の閲覧・予約・
//       日程調整の回答は、ここの onCall 窓口（Admin SDK でルールを迂回）経由でのみ行う。
//       customers（個人情報）は窓口から一切返さない。
//
// リージョン: asia-northeast1（東京）。フロントの getFunctions も同一リージョンに合わせる。
//
// S0（足場）: 初期化のみ。窓口本体（getPublicData / bookSession / answerPoll）は S1 で実装する。

const admin = require('firebase-admin');
const { setGlobalOptions } = require('firebase-functions/v2');

admin.initializeApp();

// 全関数の既定リージョンを東京に
setGlobalOptions({ region: 'asia-northeast1' });

// 窓口の実装は S1 で追加予定:
//   exports.getPublicData = onCall(...)
//   exports.bookSession   = onCall(...)
//   exports.answerPoll    = onCall(...)
