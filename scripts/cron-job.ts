import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

import puppeteer from 'puppeteer';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LM_STUDIO_BASE_URL = process.env.LM_STUDIO_BASE_URL;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Input file path
const INPUT_FILE_PATH = path.join(process.cwd(), 'data', 'urls.txt');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function scrapeTweet(url: string, browser: any) {
    console.log(`Scraping ${url}...`);
    const page = await browser.newPage();

    try {
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        // Wait a bit longer for heavy sites
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Get full HTML for Readability
        const html = await page.content();
        const doc = new JSDOM(html, { url });
        const reader = new Readability(doc.window.document);
        const article = reader.parse();

        // Fallback to meta tags if Readability fails or returns empty
        const metaDescription = await page.$eval('meta[property="og:description"]', (el: any) => el.content).catch(() => '');
        const metaTitle = await page.$eval('title', (el: any) => el.innerText).catch(() => '');

        // Prioritize Readability content, but fallback to description
        let content = article && article.textContent ? article.textContent.trim() : "";

        // If content is very short (likely login wall or failed parse), use meta description
        if (content.length < 50 && metaDescription.length > content.length) {
            content = metaDescription;
        }

        // If still empty, try title
        if (!content) {
            content = metaTitle || "No content extracted";
        }

        // Clean up whitespace
        // Clean up whitespace and truncate to avoid token limit errors (approx 5000 chars)
        content = content.replace(/\s+/g, ' ').trim().substring(0, 5000);

        // Attempt to find external links (Basic logic kept)
        const externalLinks = await page.$$eval('a', (anchors: any[]) => {
            return anchors
                .map((a: any) => a.href)
                .filter((href: string) => !href.includes('twitter.com') && !href.includes('x.com') && !href.includes('t.co') && href.startsWith('http'));
        });
        const linkedUrl = externalLinks.length > 0 ? externalLinks[0] : null;

        // Extract ID from URL
        const idMatch = url.match(/status\/(\d+)/);
        const tweetId = idMatch ? idMatch[1] : `unknown-${Date.now()}`;

        // Extract Username
        const userMatch = url.match(/x\.com\/([^/]+)/) || url.match(/twitter\.com\/([^/]+)/);
        const username = userMatch ? userMatch[1] : 'unknown';

        return {
            id: tweetId,
            username,
            text: content,
            url: linkedUrl,
            originalUrl: url,
            created_at: new Date().toISOString() // We can't easily scrape exact date without selectors
        };

    } catch (error) {
        console.warn(`Failed to scrape ${url}:`, error);
        return null;
    } finally {
        await page.close();
    }
}

async function analyzeWithLocalLLM(text: string, url: string | null) {
    const prompt = `
    Analyze the following social media post for a learning resource categorization app.
    
    Post Content: "${text}"
    Linked URL: "${url || 'None'}"
    
    Task:
    1. Determine the category (e.g., AI, Web Dev, Math, Career, General).
    2. Determine difficulty (Beginner, Intermediate, Advanced, General).
    3. Extract up to 3 relevant tags.
    4. Check if it looks like a paywalled or purely sales content without educational value.
    5. Generate a summary strictly in the following Markdown format (Must be in Japanese):
       - **Theme**: (Core topic in 3-5 Japanese words)
       - **About**: (1 sentence explanation in Japanese)
       - **Target**: (Target audience in 3-5 Japanese words)
    
    IMPORTANT: Return valid JSON only. The "summary" field must contain the pre-formatted Markdown string in Japanese.

    Example Output:
    {
      "category": "AI",
      "difficulty": "Intermediate",
      "tags": ["LLM", "RAG", "Optimization"],
      "is_paywalled": false,
      "summary": "- **Theme**: RAG精度の向上手法\n- **About**: チャンクサイズ変更ではなく、階層的なチャンキングによってRAGシステムを最適化する方法を解説しています。\n- **Target**: AIエンジニア、データサイエンティスト"
    }

    Output JSON format:
    {
      "category": "String",
      "difficulty": "String",
      "tags": ["String"],
      "is_paywalled": boolean,
      "summary": "String (The Markdown text in Japanese as specified above)"
    }
  `;

    try {
        const response = await fetch(`${LM_STUDIO_BASE_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are an AI assistant that analyzes learning resources and returns strictly valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.1,
                max_tokens: -1,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`LM Studio Error: ${response.statusText}`);
        }

        const data: any = await response.json();
        const content = data.choices[0].message.content;
        console.log(`[DEBUG] Raw LLM Response:`, content); // Inspect the raw output
        const cleanText = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);

    } catch (e) {
        console.error('Local LLM Analysis failed:', e);
        throw e;
    }
}

async function analyzeContent(text: string, url: string | null) {
    if (LM_STUDIO_BASE_URL) {
        try {
            console.log('Using Local LLM (LM Studio) for analysis...');
            return await analyzeWithLocalLLM(text, url);
        } catch (e) {
            console.warn('Falling back if possible, otherwise returning error.');
            // Don't fall back to Gemini automatically to respect user preference, or handle error clearly.
            return {
                category: 'Error',
                difficulty: 'Unknown',
                tags: [],
                is_paywalled: false,
                summary: ''
            };
        }
    }

    if (!genAI) {
        return {
            category: 'Uncategorized',
            difficulty: 'Unknown',
            tags: ['no-ai-key'],
            is_paywalled: false,
            summary: ''
        };
    }

    // If there is a linked URL, we should conceptually "read" it. 
    // Since we can't easily browse it here without getting blocked or complex logic,
    // we will ask AI to infer from the URL and Tweet text. 
    // Ideally, we would fetch the linked page content here as well.

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `
    Analyze the following social media post for a learning resource categorization app.
    
    Post Content: "${text}"
    Linked URL: "${url || 'None'}"
    
    Task:
    1. Determine the category (e.g., AI, Web Dev, Math, Career, General).
    2. Determine difficulty (Beginner, Intermediate, Advanced, General).
    3. Extract up to 3 relevant tags.
    4. Check if it looks like a paywalled or purely sales content without educational value.
    5. Generate a structured summary with exactly 3 items:
       - Theme (What is the core topic in 3-5 words)
       - About (What is this resource explaining in 1 sentence)
       - Target (Who should read this in 3-5 words)
    
    Output JSON format:
    {
      "category": "String",
      "difficulty": "String",
      "tags": ["String"],
      "is_paywalled": boolean,
      "summary": "String (Markdown format with the 3 items above)"
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error('AI Analysis failed:', e);
        return {
            category: 'Error',
            difficulty: 'Unknown',
            tags: [],
            is_paywalled: false,
            summary: ''
        };
    }
}

async function notifyChat(newPostsCount: number) {
    if (!DISCORD_WEBHOOK_URL || newPostsCount === 0) return;

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `🤖 **Daily Update**: \`${newPostsCount}\` new learning resources have been added to the catalog!`
            })
        });
    } catch (e) {
        console.error('Notification failed:', e);
    }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    console.log('Starting file-based aggregation...');

    if (!fs.existsSync(INPUT_FILE_PATH)) {
        console.log(`No input file found at ${INPUT_FILE_PATH}`);
        return;
    }

    const fileContent = fs.readFileSync(INPUT_FILE_PATH, 'utf-8');
    const urls = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0 && line.startsWith('http'));

    if (urls.length === 0) {
        console.log('No URLs found in file.');
        return;
    }

    console.log(`Found ${urls.length} URLs to process.`);

    const browser = await puppeteer.launch({
        headless: true, // "new" is deprecated, true is preferred
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for standard CI environments
    });

    let newPostsCount = 0;


    for (const url of urls) {
        // Wait 20 seconds before processing next to avoid 429 Rate Limit
        await sleep(20000);

        try {
            const tweetData = await scrapeTweet(url, browser);

            if (!tweetData) continue;

            console.log(`[DEBUG] Scraped Content for ${tweetData.id}:`, tweetData.text.substring(0, 200) + '...');

            // Check if exists
            const { data: existing } = await supabase
                .from('analyzed_posts')
                .select('id')
                .eq('external_id', tweetData.id)
                .single();

            if (existing) {
                console.log(`Skipping existing: ${tweetData.id}`);
                continue;
            }

            // Upsert Source (We need a source to link to)
            const { data: sourceData, error: sourceError } = await supabase
                .from('learning_sources')
                .upsert({ username: tweetData.username }, { onConflict: 'username' })
                .select()
                .single();

            if (sourceError || !sourceData) {
                console.error('Failed to create/get source for', tweetData.username, sourceError);
                continue;
            }

            // Analyze
            const analysis = await analyzeContent(tweetData.text, tweetData.url);

            if (analysis.category === 'Error') {
                console.warn(`Skipping due to AI Analysis error: ${tweetData.id}`);
                continue;
            }

            if (analysis.is_paywalled) {
                console.log(`Skipping paywalled content: ${tweetData.id}`);
                continue;
            }

            // Insert
            const { error: insertError } = await supabase.from('analyzed_posts').insert({
                source_id: sourceData.id,
                external_id: tweetData.id,
                content: tweetData.text,
                url: tweetData.url || tweetData.originalUrl,
                category: analysis.category,
                difficulty: analysis.difficulty,
                tags: analysis.tags,
                summary: analysis.summary,
                posted_at: tweetData.created_at, // Approximate
            });

            if (!insertError) {
                newPostsCount++;
                console.log(`Added: ${tweetData.id}`);
            } else {
                console.error('Insert error:', insertError);
            }
        } catch (e) {
            console.error(`Error processing URL ${url}:`, e);
        }
    }

    await browser.close();
    await notifyChat(newPostsCount);
    console.log(`Done. Added ${newPostsCount} new posts.`);
}

run();
