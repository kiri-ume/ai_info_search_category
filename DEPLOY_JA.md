# デプロイおよび運用手順書

このアプリは、SupabaseのFreeプランやVercelのHobbyプランなどの**無料枠**で動作するように設計されています。また、ローカルLLMを使った運用もサポートしています。

## 1. Supabaseのセットアップ (データベース)
1. [Supabase.com](https://supabase.com) で新しいプロジェクトを作成します。
2. 左メニューの **SQL Editor** を開き、`supabase/schema.sql` と `supabase/add_title.sql` の内容をコピーして実行します。
3. **Project Settings -> API** に移動し、以下の情報を取得します:
   - `URL`
   - `anon` public key (公開キー)
   - `service_role` secret key (秘密キー: 取り扱い注意！)

## 2. AIの設定
運用方針に合わせて、以下の2つのオプションから選択してください。

### オプションA: Google Gemini API (クラウド - 無料枠あり)
1. [Google AI Studio](https://makersuite.google.com/app/apikey) で無料のAPIキーを取得します。
2. 環境変数 `GEMINI_API_KEY` に設定します。
3. *注意: 無料枠にはレート制限があります。スクリプトは制限回避のためにリクエスト間に待機時間を設けています。*

### オプションB: LM Studio (ローカル - 無料・プライベート)
1. [LM Studio](https://lmstudio.ai/) をダウンロードします。
2. モデルをロードします (推奨: `Llama-3` 系や `Mistral-Nemo` など)。
3. **Local Server** タブでサーバーを起動します (ポート1234)。
4. 環境変数に `LM_STUDIO_BASE_URL=http://localhost:1234/v1` を設定します。
5. このURLが設定されている場合、システムは自動的にローカルAIを優先して使用します。

## 3. 自動化の設定 (GitHub Actions: クラウド運用する場合)
もしGitHub Actionsを使って毎日自動更新したい場合は、ローカルPCのAIは使えないため、**オプションA (Gemini)** を選ぶ必要があります。

GitHubリポジトリの Settings -> **Secrets and variables** -> **Actions** に以下の変数を登録します:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `DISCORD_WEBHOOK_URL` (Discord通知用)

## 4. Vercelへのデプロイ (フロントエンド)
1. Vercelにこのリポジトリをインポートします。
2. **Environment Variables** (環境変数) に以下を設定します:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deployボタンを押してデプロイ完了です！
   *注意: `SUPABASE_SERVICE_ROLE_KEY` やAI用のキーは、Webサイト側では不要なのでVercelには設定しないでください。*

## 5. 運用方法 (コンテンツの追加)
1. `data/urls.txt` にURLを追加します (1行に1つ)。
2. データ収集を実行します:
   - **ローカル運用**: 自分のPCで `npx tsx scripts/cron-job.ts` を実行します。
   - **クラウド自動運用**: 毎日9:00 (JST) にGitHub Actionsが自動実行します。

## 補足: スクレイピングについて
- ブログやニュースサイトの記事本文の抽出には **Mozilla Readability** を使用しています。
- X (Twitter) については、API制限を回避するため、メタタグからの情報抽出を試みます。
