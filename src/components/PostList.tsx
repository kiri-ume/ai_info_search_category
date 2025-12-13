'use client';

import { useState } from 'react';
import { Post } from '@/lib/types';
import PostCard from './PostCard';
import styles from './PostList.module.css';

export default function PostList({ initialPosts }: { initialPosts: Post[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Get unique categories from posts, handle potential nulls
    const categories = ['All', ...Array.from(new Set(initialPosts.map(p => p.category || 'Uncategorized')))];

    const filteredPosts = selectedCategory === 'All'
        ? initialPosts
        : initialPosts.filter(post => (post.category || 'Uncategorized') === selectedCategory);

    return (
        <>
            <div className={styles.filterContainer}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`${styles.filterButton} ${selectedCategory === cat ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <section className={styles.grid}>
                {filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}

                {filteredPosts.length === 0 && (
                    <div className={styles.emptyState}>
                        No posts found for {selectedCategory}.
                    </div>
                )}
            </section>
        </>
    );
}
