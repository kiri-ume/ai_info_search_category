# Deployment & Operation Instructions

This app is designed to be purely "Free Tier" compatible and supports local AI operation.

## 1. Supabase Setup (Database)
1. Create a new project on [Supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`.
3. Go to **Project Settings -> API** and copy:
   - `URL`
   - `anon` public key
   - `service_role` secret key (Keep this safe!)

## 2. AI Configuration
You have two options for AI analysis:

### Option A: Google Gemini API (Cloud - Free Tier)
1. Get a free API Key from [Google AI Studio](https://makersuite.google.com/app/apikey).
2. Set `GEMINI_API_KEY` in your environment.
3. *Note: The Free Tier has strict rate limits. The script includes a 20s delay between requests to mitigate this.*

### Option B: LM Studio (Local - Free & Private)
1. Download [LM Studio](https://lmstudio.ai/).
2. Load a model (e.g., `Llama-3` or `Mistral`).
3. Start the **Local Server** (Port 1234).
4. Set `LM_STUDIO_BASE_URL=http://localhost:1234` in your environment.
5. The script will automatically prioritize Local LLM if this URL is set.

## 3. Automation Setup (GitHub Actions)
If you want to run the analysis daily on the cloud (GitHub Actions), you must use **Option A (Gemini)** because GitHub runners cannot access your local LM Studio.

Go to your GitHub Repository Settings -> **Secrets and variables** -> **Actions** and add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `DISCORD_WEBHOOK_URL` (For notifications)

## 4. Vercel Deployment (Frontend)
1. Import this repository in Vercel.
2. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy!

## 5. Usage (Adding Content)
1. Add URLs to `data/urls.txt` (one per line).
2. Run the script:
   - **Locally**: `npx tsx scripts/cron-job.ts`
   - **Cloud**: It will run automatically every day at 09:00 JST via GitHub Actions.

## Notes on Scraping
- The project uses **Mozilla Readability** and **Puppeteer** to extract high-quality content from blogs, news sites, and social media.
- For X (Twitter), it attempts to extract content from meta tags if direct access is blocked.
