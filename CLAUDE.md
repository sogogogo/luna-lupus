# N主宰人狼会 管理ツール - プロジェクト方針

## プロジェクト概要
- アプリ名: N主宰人狼会（管理ツール）
- 種別: 人狼会運営者向け 予約・顧客・支払い管理 Webアプリ
- 技術: Vite + React + lucide-react（アイコン）
- 配信: Vercel（git push で自動デプロイ）
- 位置づけ: 人狼会を事業として運営する顧客向けの業務ツール。日程調整・予約受付・顧客管理・支払い管理・告知をアプリ内で一元化する（従来は Twitter DM / LINE / 調整さん / PayPay に分散していた）
- コンパニオンアプリ: 「N主宰人狼会 CAST」(役職配布アプリ / React Native) は別リポジトリ・別プロジェクト。本アプリとはデザインを統一するが、コードは独立

## 開発ステータス
- 現在: v14 まで実装済み・Vercel運用中
- 構成: **単一ファイル構成**（`src/App.jsx` に全機能、約3,500行）
- 次のマイルストーン: 日程調整機能（調整さん機能）の追加 → 余裕があればファイル分割リファクタ

## 利用シーン
運営者（管理者）が会を作成し、参加者がアプリ上で予約・支払い。オンライン（Zoom/Google Meet）と対面の両方を扱う。GMが役職を割り振り、参加者が自分の役職を確認。告知・リマインドもアプリから配信。

## 画面構成
- **参加者画面**: ホーム（ブランドタブ＋開催スケジュール＋カレンダー切替）/ 会の検索・絞り込み / 予約フロー（PayPay） / マイページ / お知らせ
- **管理者画面**: ダッシュボード / 会の管理（一覧＋カレンダー切替） / 参加者・支払い / 役職割り振り / 告知センター / 顧客管理
- 画面上部のトグルで「参加者 / 管理者」を切り替え

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

## データモデル
- `sessions`（会）: id, date, day, time, plan, gm, platform, meetingUrl, guestName, guestBio, customTitle, customPrice, invitedCustomerIds, status
- `participants`（参加申込）: id, sessionId, customerId, name, handle, paid, paidAt, cancelled, refunded, role
- `CUSTOMERS`（顧客）: id, name, handle, phone, email, joined, total, lastVisit, spent, tier, favorite, notes, avatar
- `schedulePolls` / `pollResponses`（日程調整・実装予定）: 別途指示書 @claude_code_task_schedule_polls.md 参照

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
- `git add . && git commit -m "..." && git push` で Vercel が自動再デプロイ
- 反映されない場合: ブラウザのハードリロード（Cmd/Ctrl+Shift+R）、または Vercel ダッシュボードで Redeploy（Build Cache オフ）
- ローカル確認: `npm run dev` / ビルド検証: `npm run build`

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
