'use client';

import { Post } from '@/lib/types';
import styles from './PostCard.module.css';
import { ExternalLink, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PostCard({ post }: { post: Post }) {
    // Logic for "New": created within last 24 hours
    const isNew = new Date(post.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;

    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <div className={styles.categoryWrapper}>
                    <span className={styles.category}>{post.category}</span>
                    <span className={styles.difficulty}>{post.difficulty}</span>
                </div>
                {isNew && <span className={styles.newBadge}>NEW</span>}
            </div>

            {post.title && (
                <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', lineHeight: '1.4' }}>
                    <a
                        href={post.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {post.title}
                    </a>
                </h3>
            )}

            <div className={styles.content}>
                {post.summary ? (
                    <ReactMarkdown>{post.summary}</ReactMarkdown>
                ) : (
                    <p>{post.content}</p>
                )}
            </div>

            {post.tags && post.tags.length > 0 && (
                <div className={styles.tags}>
                    {post.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>#{tag}</span>
                    ))}
                </div>
            )}

            <div className={styles.footer}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} />
                    <time suppressHydrationWarning>
                        {new Date(post.posted_at || post.created_at).toLocaleDateString('ja-JP')}
                    </time>
                </div>
                {post.url && (
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                        OPEN <ExternalLink size={14} />
                    </a>
                )}
            </div>
        </article>
    );
}
