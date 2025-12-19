# AI Learning Resource Catalog

An automated application that aggregates, analyzes, and categorizes learning resources (Tweets, Blogs, Articles) using AI.

## 🚀 Features

- **Automated Scraping**: Fetches URLs from a list (`data/urls.txt`) and extracts content from various sources (X/Twitter, Note, Hatena Blog, etc.).
- **Smart Content Extraction**: Uses Mozilla Readability to parse article bodies accurately.
- **AI Analysis**:
  - Automatically categorizes content (AI, Web Dev, Career, etc.).
  - Determines difficulty level (Beginner, Intermediate, Advanced).
  - Extracts relevant tags.
  - Generates a **Structured 3-Point Summary** (Theme, About, Target).
- **Hybrid AI Support**: Supports both **Google Gemini API** (Cloud) and **LM Studio** (Local LLM) for privacy and cost control.
- **Modern UI**: Dark-themed, responsive interface built with Next.js 15.
- **Notifications**: Sends daily updates to Discord.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, CSS Modules
- **Backend/DB**: Supabase (PostgreSQL)
- **AI**: Google Gemini API / Local LLM (via LM Studio)
- **Scraping**: Puppeteer, JSDOM, Readability
- **Automation**: Github Actions (Scheduled Cron) / Local Node Scripts

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 18+
- Supabase Account (Free Tier)
- Google Gemini API Key (Optional if using Local LLM)
- LM Studio (Optional if using Gemini)

### 2. Installation
```bash
git clone https://github.com/your/repo.git
cd ai_info_srch_catg
npm install
```

### 3. Environment Setup
Create a `.env.local` file based on `DOTENV_TEMPLATE.md`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=... (Optional)
LM_STUDIO_BASE_URL=http://localhost:1234/v1 (Optional)
DISCORD_WEBHOOK_URL=... (Optional)
```

### 4. Database Setup
Run the SQL script in `supabase/schema.sql` on your Supabase SQL Editor to create tables.

### 5. Running the Application

**Frontend (Viewer):**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

**Data Aggregation (Crawler):**
Add URLs to `data/urls.txt` (one per line).
Run the analysis script:
```bash
npx tsx scripts/cron-job.ts
```

## 🤖 Using Local LLM (LM Studio)
This project supports using a local LLM instead of Gemini to avoid rate limits and API costs.

1. Download and install **LM Studio**.
2. Load a model (e.g., `Llama-3-8B-Instruct` or `Mistral-Nemo`).
3. Start the **Local Server** (default port: `1234`).
4. Set `LM_STUDIO_BASE_URL=http://localhost:1234` in `.env.local`.
5. Run the cron job script. The system will automatically detect the local URL and prioritize it.

## 📂 Project Structure
- `src/app`: Next.js App Router pages
- `src/components`: UI Components (PostCard, etc.)
- `scripts`: Node.js scripts for scraping and AI analysis
- `data`: Input data files (urls.txt)
- `supabase`: Database schema definitions

## 📜 Update History
- **2025-12-18 Ver0.1.0**: Initial baseline release.
- **2025-12-19 Ver0.1.1**:
  - Added **"Like" button** (with local storage duplicate prevention).
  - Implemented **Keyword Search** (instant filtering for title, summary, tags).
  - Added **Old Posts Folding** (default hides posts older than 1 week, expandable).
