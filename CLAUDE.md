# N主宰人狼会 管理ツール - プロジェクト方針

## プロジェクト概要
- アプリ名: N主宰人狼会（管理ツール）
- 種別: 人狼会運営者向け 予約・顧客・支払い管理 Webアプリ
- 技術: Vite + React + lucide-react（アイコン）
- 配信: Vercel（git push で自動デプロイ）
- 位置づけ: 人狼会を事業として運営する顧客向けの業務ツール。日程調整・予約受付・顧客管理・支払い管理・告知をアプリ内で一元化する（従来は Twitter DM / LINE / 調整さん / PayPay に分散していた）
- コンパニオンアプリ: 「N主宰人狼会 CAST」(役職配布アプリ / React Native) は別リポジトリ・別プロジェクト。本アプリとはデザインを統一するが、コードは独立

## 開発ステータス
- 現在: **Phase 1 完了**（Firebase化＋日程調整＋セキュリティ＝運営者/参加者の二層アクセス）・Vercel運用中
- 構成: フロントは **単一ファイル構成**（`src/App.jsx`）＋ `src/lib/`（firebase/firestore/functions/auth）＋ `functions/`（Cloud Functions・別npm）
- 受託の**段階開発**: Phase 1=基本機能、Phase 2=配信の実配信・PayPay自動決済・顧客編集強化・配役履歴（→末尾「Phase構成」）

## 利用シーン
運営者（管理者）が会を作成し、参加者がアプリ上で予約・支払い。オンライン（Zoom/Google Meet）と対面の両方を扱う。GMが役職を割り振り、参加者が自分の役職を確認。告知・リマインドもアプリから配信。

## 画面構成
- **参加者画面**: ホーム（ブランドタブ＋開催スケジュール＋カレンダー切替）/ 会の検索・絞り込み / 予約フロー（PayPay） / マイページ / お知らせ
- **管理者画面**: ダッシュボード / 会の管理（一覧＋カレンダー切替） / 参加者・支払い / 役職割り振り / 告知センター / 顧客管理
- **画面はURLで分離**: `/` = 参加者画面、`/admin` = 管理画面。参加者には管理画面の存在を一切見せないため、ルート(`/`)には管理導線（トグル・ログイン入口等）を出さない
  - ルーティングは軽量実装（react-router 不使用）。`window.location.pathname` を state で持ち `popstate` 購読＋`history.pushState`（`navigate()`）でリロードなし遷移。判定は `isAdminRoute`（`/admin` 配下か）1箇所
  - `/admin`: 未ログイン→LoginScreen / ログイン済み＆!isAdmin→AdminNoPermission（どちらも「参加者ページに戻る」=`navigate('/')`）/ isAdmin→管理画面
  - 画面間の移動導線は **isAdmin のときだけ**ヘッダーに出す（参加者は isAdmin にならないので絶対に見えない）: `/admin`で「参加者画面を見る」(`→/`)、`/`で「管理画面へ戻る」(`→/admin`)。旧「参加者/管理者トグル」「フッター運営者ログイン」は廃止
  - **Vercel**: SPA直アクセス（`/admin`）で404にならないよう `vercel.json` の rewrites で全パスを `/index.html` に向ける（必須）
- 役職割り振りは管理アプリから分離し、専用アプリ『人狼会CAST』として別開発（管理画面の「役職割り振り」タブは案内パネルのみ表示。RoleAssignment/RolesList のコードはCAST移植参照用に残置）

## アーキテクチャ（Firebase / データアクセス二層）
- バックエンド: **Firebase**（Firestore + Auth）。プロジェクト `n-jinrou-kanri` / リージョン **asia-northeast1（東京）** / **Blaze プラン**
- 認証: **運営者=メール/パスワード＋admin カスタムクレーム** / **参加者=Google ログイン**
- **データアクセスは二層**（厳守）:
  - **運営者** = Firestore に**直接アクセス**（admin クレーム保有時のみ・realtime 購読）。購読は `isAdmin` の時だけ開く
  - **参加者** = **Cloud Functions 窓口経由のみ**（Firestore 直アクセス不可。リスナーも開かない）
- **Cloud Functions（8関数・東京）**: `getPublicData` / `getMyData` / `claimProfile` / `createReservation` / `cancelReservation` / `reportPayment` / `submitPollResponse` / `updateMyProfile`
- `src/lib/` 構成:
  - `firebase.js` … 初期化（設定は `import.meta.env.VITE_FIREBASE_*` から）
  - `firestore.js` … **運営者用**データアクセス層（`subscribeX/saveX/patchX/removeX/seedX`、`commitPollConfirmation`＝確定の writeBatch）
  - `functions.js` … **参加者用**の窓口クライアント（`httpsCallable`、東京リージョン）
  - `auth.js` … 認証（`signIn`/`signInWithGoogle`/`signOutUser`/`onAuthChange`）
- フロントの Context: `ToastProvider` / `AuthProvider`(user,isAdmin) / `CustomersProvider`(運営者のみ購読) / `ParticipantProvider`(参加者の自分データ=getMyData)

## セキュリティ設計の要点（厳守）
- `firestore.rules`: **admin クレーム保有者のみ全コレクション読み書き可、それ以外は全拒否**（`match /{document=**}` ＋ `request.auth != null && request.auth.token.admin == true`）
- 参加者の窓口は**全てホワイトリスト出力**: 顧客の `notes / phone / email / spent` は**絶対に返さない**（`toSafeProfile` / `toPublicSession`）。`meetingUrl` も予約者本人にのみ返す
- 全窓口に**所有チェック**（本人=authUid から解決した customerId のデータのみ操作可）。`updateMyProfile` は name/handle/handleNorm の3キーしか書かない
- Cloud Functions は **Admin SDK** で動くのでルールを迂回できる → だから参加者は窓口経由なら動く
- 環境変数 `VITE_FIREBASE_*` は **Git 管理外**（`.env.local`）。**Vercel には別途登録が必要**。秘密は Secret Manager 管理（ソース直書き禁止）

## ブランド体系（重要・厳守）
会は5つのブランドに分類される。`BRAND` 定数と `PLAN_DEFS` 定数で一元管理。

| キー | 名称 | 頭文字 | プライマリ | アクセント |
|---|---|---|---|---|
| okiraku | お気楽人狼会 | オ | #5b9bd5（水色） | #f5c542（からし黄） |
| stepup | ステップアップ人狼会 | ス | #6b5dc7（紫） | #3fb8d4（ターコイズ） |
| taimen | 対面人狼会 | 対 | #5e5a6a（スモークグレー） | #c54a4a（赤） |
| event | イベント会 | イ | #e8645f | #f5c542 |
| closed | クローズド会 | ク | #5a5a6e | #a89968 |

### プラン（PLAN_DEFS）
- お気楽（Zoom）: 10人村¥2,000 / 14人村¥2,000 / ゲスト会¥5,000
- ステップアップ（Zoom）: 単独ゲスト基本¥4,000 / 単独ゲスト(ギャラ高)¥4,500 / Wゲスト¥4,000
- 対面: アキバ人狼館¥2,500 / スリアロβスタジオ¥2,500
- イベント会: 金額都度設定 / クローズド会: 金額都度設定・招待制
- ※「いわつきクローズ」はクローズド会として扱う（専用プランは廃止済み）

## データモデル（全て Firestore コレクション。doc ID = `String(id)`、id はフィールドにも保持）
- `sessions`（会）: id, date, day, time, plan, gm, platform, meetingUrl, guestName, guestBio, customTitle, customPrice, invitedCustomerIds, status, fromPollId
- `participants`（参加申込）: id, sessionId, customerId, name, handle, paid, paidAt, **paymentStatus**(unpaid/reported/confirmed), cancelled, refunded, role, note
- `customers`（顧客）: id, name, handle, phone, email, joined, total, lastVisit, spent, tier, favorite, notes, avatar, **authUid**(Google uid とのリンク), **handleNorm**(正規化ハンドル)
- `schedulePolls` / `pollResponses`（日程調整・**実装済み**）: poll は candidateDates[], status(open/confirmed/closed), confirmedIndex, invitedCustomerIds。response は answers{添字: yes/maybe/no}, customerId
- `announcements`（告知履歴）: 運営の配信記録（doc ID は addDoc 自動 or seed-N）
- ※新規 customer/参加者の id は `Date.now()`（数値）、Functions 生成の participant/response は Firestore auto-id（文字列）。比較は型に注意

## デザインシステム（厳守）

### カラー
- ベース背景 #fbfaf7 / カード #ffffff
- テキスト: メイン #2c3140 / サブ #6b6e7a / 薄 #9499a8
- ボーダー #e8e5dd / 破線 #e0ddd6
- ブランドフィルタ選択中はページ背景がブランドの softer 色に変化（0.6s transition）

### 役職カラー（ROLE_STYLES）
- 人狼 #d44a4a / #fde8e8 / 人狼陣営
- 狂人 #d97757 / #fce8e0 / 人狼陣営
- 占い師 #3a8dc4 / #e6f1f9 / 村人陣営
- 霊媒師 #6e57b8 / #ece8f7 / 村人陣営
- 騎士 #c9962a / #fdf3d8 / 村人陣営
- 共有者 #4a9968 / #e6f3eb / 村人陣営
- 村人 #6b6b6b / #efefef / 村人陣営

### タイポグラフィ
- ベース: Inter + Hiragino Maru Gothic ProN 系
- 見出し（.maru）: Zen Maru Gothic（丸ゴシック, 700/900）
- 数字（.num）: DM Mono（等幅）
- アクセント手書き（.hand）: Caveat
- Google Fonts を style タグ内 @import で読み込み（Web版なので @import 可）

### UIパターン
- 角丸: カード14 / ボタン8〜12 / 大カード18 / ピル999
- 上部アクセントバー6px（ブランド連動グラデーション、0.6s transition）
- アニメーション: fadeUp / float / modalIn / toastIn（CSS keyframes）
- 役職カードは「伏せる/開く」トグル
- 日付表示は必ず `fmtMD(date, day)` → 「5/15（金）」形式
- カレンダーは月曜始まり、土=青/日=赤、対面会は📍アイコン付き

## 既存の共通基盤（再利用すること）
- `ToastProvider` / `useToast()` → `push(message, type)` で右下トースト（type: success/info/warn/error）
- `<ModalShell>` + `<ModalHeader>` → 共通モーダルの枠
- `<ConfirmModal>` → 確認ダイアログ（入金確認・削除・確定などに使用）
- `<BackButton>` → 大きめの戻るボタン（ブランド色対応）
- `fmtYen(n)` → ¥1,000 形式 / `fmtMD(date, day)` → 5/15（金）形式
- `enrichSession(s)` → 生sessionにbrand/plan情報を合成。**冪等**（enrich済みを再度渡しても安全）
- `MonthCalendar` / `DaySessionsPopup` → カレンダー表示と日別ポップアップ
- `SessionFormModal` → 会の新規作成・編集フォーム
- `getCalendarLabel(s)` → カレンダーマス内のラベル生成（「×10」「×単(狼月)」等）

## コーディング規約

### 必須ルール
- 既存の単一ファイル構成を尊重。新機能は既存の共通基盤（Toast/Modal/ヘルパー）を流用
- 色は BRAND / ROLE_STYLES 定数から参照。直書きしない
- ブランド・プラン・料金は BRAND / PLAN_DEFS に集約。ハードコードしない
- 日付整形は fmtMD / 金額整形は fmtYen を必ず使う
- session を扱う関数は enrichSession を通す（冪等なので多重呼び出しOK）

### 禁止事項
- **localStorage / sessionStorage は使用禁止**（artifactsで動かないため。状態は React state で保持）
- console.log のデバッグ残し
- 既存の動作している機能を壊す変更（特にブランド体系・データモデル）
- 個人情報（電話・メール）を URL パラメータに載せない

## デプロイ
- **フロント（Vercel）**: `git add . && git commit && git push` で自動再デプロイ。反映されない場合はハードリロード or Redeploy（Build Cache オフ）。**Vercel に `VITE_FIREBASE_*` の環境変数登録が必要**
- **Firebase（Vercel とは別系統）**:
  - Functions: `npx firebase-tools deploy --only functions`（削除を伴う時は `--force`）
  - ルール: `npx firebase-tools deploy --only firestore:rules`
  - `firebase-tools` は**ルート package.json に入れない**（Vercel ビルドを重くしないため）＝常に `npx firebase-tools` 経由
  - ログイン/シークレット設定は対話 → セッション内なら `! npx firebase-tools login`（**`!` の後に半角スペース必須**。連結するとエラー）
- ローカル確認: `npm run dev` / ビルド検証: `npm run build`（＋ `npx eslint src/` で no-undef / no-unused-vars を確認）

## 作業フロー
1. 計画（/plan）：既存コードを読んで影響範囲を把握
2. 実装：フェーズごとに区切る
3. ローカルで動作確認（npm run dev）→ ブラウザで実際に触る
4. 自己レビュー（/review）
5. npm run build が通ることを確認
6. コミット
7. push して Vercel 反映を確認

## 過去のハマりどころ（開発しながら追記）
- **enrichSession は必ず冪等に**：enrich済みのsessionを再度 enrichSession に渡すと `PLAN_DEFS[オブジェクト]` が undefined になり `undefined.brand` でホワイトアウト（画面真っ白）した。冪等ガードを必ず維持すること
- **props の渡し忘れに注意**：AdminView → SessionsAdmin へ addSession/deleteSession を渡し忘れて「会の管理」タブでエラーが出た。子コンポーネントに必要な関数を渡しているか確認
- **lucide-react のアイコン名**：バージョンによって存在しないアイコンがある（過去に Twitter が廃止されていてエラー）。使う前に実在を確認
- **fmtMD は防御的に**：date が undefined でも落ちないようガード済み。新しい呼び出し箇所でも null/undefined を渡さないよう注意
- **ブランドアイコンは透明PNG**：元画像は黒背景だったため透明化処理済み。差し替え時は背景透過を確認
- **BRAND[filter] アクセス**：filter が 'all' のとき BRAND.all は存在しないので、三項演算子で 'all' を先に弾くこと

### Firebase化で得た重要な教訓（最重要・繰り返し防止）
1. **ブラウザ自動翻訳による React クラッシュ**：`index.html` が `lang="en"` のまま日本語だと、Chrome 自動翻訳が DOM を書き換え、画面遷移で React が `removeChild` クラッシュ（白画面）。**真因はコードのバグではない**。対策＝`<html lang="ja" translate="no">` ＋ `<meta name="google" content="notranslate">`。加えて `ErrorBoundary` で白画面を防ぐ
2. **設計変更時は `firestore.rules` を必ず再点検**：「参加者もログインする」に変えた際、ルールが `request.auth != null` のままだと**参加者全員が顧客データにアクセス可能**になる。認証の前提が変わったらルール見直し必須（→ `admin` クレーム判定に）
3. **ビルド成功 ≠ 実機で動く**：import 漏れ（例 `fetchPublicData`）はビルドを通過しても実行時 `ReferenceError`。実機確認と `npx eslint`（no-undef）が必須
4. **Cloud Functions の初回デプロイは 403 が出やすい**：必要 API 有効化直後はサービスアカウントの provisioning が間に合わず失敗。少し待って再デプロイで成功
5. **コード削除 ≠ 本番から削除**：Cloud Functions はソースから消しても、再デプロイ（削除確認 `--force`）しないと本番に残る
6. **複数コレクションをまたぐ書き込みは writeBatch で原子化**：`confirmPoll`（会作成＋参加者登録＋ポール更新）をバラバラに書くと途中失敗で不整合・会の二重作成。`commitPollConfirmation` でまとめる
7. **購読カットの順序**：参加者の読み取りを窓口化（getPublicData/getMyData）**してから**購読を切る。逆順だと参加者画面が無限ローディング
8. **X ハンドル照合（既存客の移行）**：正規化＝先頭の `@`/`＠` 除去 → 全空白除去（全角含む）→ 小文字化。入力側と既存 `customers` 側の**両方に適用**してから照合。なりすまし対策＝既に別 uid にリンク済みの顧客は奪えない（トランザクションで再確認、競合時は新規作成）

## Phase構成（受託の段階開発・進行中）
- **Phase 1（今回・完了）**: 予約・顧客・支払い管理・日程調整・役職割り振りの基本機能、PayPay 自己申告（レベル2＝送金自己申告→運営者確認）、Firebase化＋二層セキュリティ
- **Phase 2（今後）**: 告知の実配信（メール/SNS 連携）、PayPay 自動決済（レベル3）、顧客編集UI強化、役職割り振りの履歴保存・分析
- 管理画面に **Phase 2 バッジ**で未実装/拡張予定を明示（`PHASE_NOTES` で一元管理。`planned`=Phase 2 予定/グレー、`expand`=拡張予定/淡色）。**参加者画面には出さない**
