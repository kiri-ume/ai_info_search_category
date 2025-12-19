import { supabase } from '@/lib/supabase';
import { Post } from '@/lib/types';
import PostList from '@/components/PostList';
import styles from './page.module.css';

export const revalidate = 0;

export default async function Home() {
  let posts: Post[] | null = null;

  try {
    const { data, error } = await supabase
      .from('analyzed_posts')
      .select('*')
      .eq('status', 'published')
      .order('posted_at', { ascending: false });

    if (!error && data) {
      posts = data as any;
    }
  } catch (e) {
    console.warn("Supabase connection failed or not configured, falling back to mock data.");
  }

  // Fallback Mock Data for Demo purposes if DB is empty or unconfigured
  const displayPosts: Post[] = (posts && posts.length > 0) ? posts : [
    {
      id: 'mock-1',
      content: 'Just dropped a comprehensive tutorial on Transformer Architecture visualizers. It really helps to intuitively understand attention mechanisms.',
      url: 'https://example.com',
      category: 'AI / ML',
      difficulty: 'Intermediate',
      tags: ['transformer', 'visualization', 'nlp'],
      is_paywalled: false,
      posted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      content: 'Top 10 resources for learning Rust in 2025. #RustLang',
      url: 'https://example.com/rust',
      category: 'Programming',
      difficulty: 'Beginner',
      tags: ['rust', 'webassembly'],
      is_paywalled: false,
      posted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'mock-3',
      content: 'New researches on Agentic workflows showing 30% efficiency boost. Read the full paper below.',
      url: 'https://arxiv.org/abs/2301.12345',
      category: 'Research',
      difficulty: 'Advanced',
      tags: ['agents', 'llm', 'automation'],
      is_paywalled: false,
      posted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-4',
      content: 'How to center a div in 2025 (It is still flexbox).',
      url: 'https://css-tricks.com',
      category: 'Frontend',
      difficulty: 'Beginner',
      tags: ['css', 'webdev'],
      is_paywalled: false,
      posted_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    }
  ];

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Daily Learning Field</h1>
        <p className={styles.subtitle}>
          Automated curation of high-value learning resources.
          Analyzed and Categorized by AI.
        </p>
      </header>

      <PostList initialPosts={displayPosts} />
    </main>
  );
}
