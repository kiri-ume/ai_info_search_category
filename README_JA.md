# AI学習リソースカタログ

AIを活用して、X (Twitter)、ブログ、技術記事などの学習リソースを収集、分析、要約、カテゴライズする自動化アプリケーションです。

## 🚀 主な機能

- **自動スクレイピング**: `data/urls.txt` リストからURLを読み込み、コンテンツを抽出します（X/Twitter、Note、Zenn、はてなブログなどに対応）。
- **高精度な本文抽出**: Mozilla Readability を使用し、記事の本文を正確に抽出します。
- **AIによる分析・要約**:
  - 全体をカテゴリ分け（AI, Web開発, キャリアなど）。
  - 難易度判定（初級、中級、上級）。
  - 関連タグの抽出。
  - **3点要約の生成**: Theme（テーマ）、About（概要）、Target（対象読者）を日本語で要約します。
- **ハイブリッドAI対応**: **Google Gemini API** (クラウド) と **LM Studio** (ローカルLLM) の両方に対応。プライバシーやコストに応じて使い分け可能です。
- **モダンなUI**: Next.js 15 で構築された、レスポンシブなダークテーマUI。カテゴリごとのフィルタリング機能付き。
- **通知機能**: 更新情報をDiscordに通知します。

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React, CSS Modules
- **バックエンド/DB**: Supabase (PostgreSQL)
- **AI**: Google Gemini API / Local LLM (via LM Studio)
- **スクレイピング**: Puppeteer, JSDOM, Readability
- **自動化**: Github Actions (定期実行) / Local Node Scripts (手動バッチ)

## 🏁 はじめ方

### 1. 前提条件
- Node.js 18以上
- Supabase アカウント (Freeプランで可)
- Google Gemini API キー (ローカルLLMを使う場合は不要)
- LM Studio (Geminiを使う場合は不要)

### 2. インストール
```bash
git clone https://github.com/your/repo.git
cd ai_info_srch_catg
npm install
```

### 3. 環境設定
`DOTENV_TEMPLATE.md` を参考に `.env.local` ファイルを作成します。

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=... (任意)
LM_STUDIO_BASE_URL=http://localhost:1234/v1 (任意)
DISCORD_WEBHOOK_URL=... (任意)
```

### 4. データベースのセットアップ
SupabaseのSQLエディタで、`supabase/schema.sql` および `supabase/add_title.sql` の内容を実行してテーブルを作成・更新してください。

### 5. アプリケーションの実行

**フロントエンド (閲覧):**
```bash
npm run dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

**データ収集 (クローラー & AI解析):**
`data/urls.txt` に解析したいURLを1行ずつ記述します。
以下のコマンドでスクリプトを実行します。
```bash
npx tsx scripts/cron-job.ts
```

## 🤖 ローカルLLM (LM Studio) の利用
API制限やコストを気にせず利用するため、ローカルLLMの使用を推奨しています。

1. **LM Studio** をダウンロードしてインストールします。
2. モデルをロードします (例: `Llama-3` や `Mistral` 系)。
3. **Local Server** を起動します (デフォルトポート: `1234`)。
4. `.env.local` に `LM_STUDIO_BASE_URL=http://localhost:1234` を設定します。
5. スクリプト (`cron-job.ts`) を実行すると、自動的にローカルサーバーが優先して使用されます。

## 📂 プロジェクト構造
- `src/app`: Next.js App Router ページ
- `src/components`: UIコンポーネント (PostCard, PostListなど)
- `scripts`: スクレイピングとAI解析を行うNode.jsスクリプト
- `data`: 入力データファイル (urls.txt)
- `supabase`: データベースのスキーマ定義ファイル

## 📜 更新履歴
- **2025-12-18 Ver0.1.0**: ベースラインとして設定。
- **2025-12-19 Ver0.1.1**: 機能追加アップデート
  - **いいねボタン**の設置 (LocalStorageによる簡易的な重複防止付き)。
  - **単語検索機能**の実装 (タイトル、要約、タグからのインクリメンタルサーチ)。
  - **過去記事の折りたたみ表示** (1週間以上前の記事はデフォルトで非表示にし、ボタンで展開)。
  - **IT関連度判定と公開ステータス管理** (AIによる自動保留機能 `pending_review` の実装)。
