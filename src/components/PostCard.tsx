'use client';

import { Post } from '@/lib/types';
import styles from './PostCard.module.css';
import { ExternalLink, Clock, ThumbsUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import { incrementLike } from '@/app/actions';

function LikeButton({ postId, initialCount }: { postId: string, initialCount: number }) {
    const [count, setCount] = useState(initialCount);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        const likedParams = localStorage.getItem('liked_posts');
        if (likedParams) {
            const likedList = JSON.parse(likedParams);
            if (likedList.includes(postId)) {
                setHasLiked(true);
            }
        }
    }, [postId]);

    const handleLike = async () => {
        if (hasLiked) return;

        setCount(prev => prev + 1);
        setHasLiked(true);

        // Optimistic update
        try {
            await incrementLike(postId);

            // Save to local storage
            const likedParams = localStorage.getItem('liked_posts');
            let likedList = likedParams ? JSON.parse(likedParams) : [];
            likedList.push(postId);
            localStorage.setItem('liked_posts', JSON.stringify(likedList));
        } catch (error) {
            console.error('Failed to like:', error);
            // Rollback if needed, but for likes it's usually fine to ignore
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`${styles.likeButton} ${hasLiked ? styles.liked : ''}`}
            disabled={hasLiked}
            aria-label="Like this post"
        >
            <ThumbsUp size={16} fill={hasLiked ? "currentColor" : "none"} />
            <span>{count > 0 ? count : ''}</span>
        </button>
    );
}

export default function PostCard({ post }: { post: Post }) {
    // Logic for "New": posted today (matches local system date)
    const postDate = new Date(post.posted_at || post.created_at);
    const today = new Date();
    const isNew = postDate.toDateString() === today.toDateString();

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={14} />
                        <time suppressHydrationWarning>
                            {new Date(post.posted_at || post.created_at).toLocaleDateString('ja-JP')}
                        </time>
                    </div>
                </div>

                <div className={styles.actions}>
                    <LikeButton postId={post.id} initialCount={post.like_count || 0} />
                    {post.url && (
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.linkButton}>
                            OPEN <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
