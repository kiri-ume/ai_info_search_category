'use client';

import { useState } from 'react';
import { Post } from '@/lib/types';
import PostCard from './PostCard';
import styles from './PostList.module.css';
import { Search } from 'lucide-react';

export default function PostList({ initialPosts }: { initialPosts: Post[] }) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showAllHistory, setShowAllHistory] = useState(false);

    // Get unique categories from posts, handle potential nulls
    const categories = ['All', ...Array.from(new Set(initialPosts.map(p => p.category || 'Uncategorized')))];

    // Logic:
    // 1. Filter by Category & Search Query => filteredPosts
    // 2. If NO search query is active, hide posts older than 7 days (unless showAllHistory is true)

    // Step 1: Basic Filtering
    const filteredPosts = initialPosts.filter(post => {
        const categoryMatch = selectedCategory === 'All' || (post.category || 'Uncategorized') === selectedCategory;
        const query = searchQuery.toLowerCase();
        const searchMatch = !query ||
            (post.title?.toLowerCase().includes(query)) ||
            (post.summary?.toLowerCase().includes(query)) ||
            (post.tags?.some(tag => tag.toLowerCase().includes(query))) ||
            (post.category?.toLowerCase().includes(query));
        return categoryMatch && searchMatch;
    });

    // Step 2: Time-based Folding
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const isOldPost = (post: Post) => {
        const date = new Date(post.posted_at || post.created_at);
        return date < oneWeekAgo;
    };

    // If searching, always show all. Else, respect the toggle.
    const shouldShowAll = searchQuery.length > 0 || showAllHistory;

    const visiblePosts = shouldShowAll
        ? filteredPosts
        : filteredPosts.filter(post => !isOldPost(post));

    const hiddenCount = filteredPosts.length - visiblePosts.length;

    return (
        <>
            <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={20} />
                <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

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
                {visiblePosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}

                {/* Empty State */}
                {visiblePosts.length === 0 && hiddenCount === 0 && (
                    <div className={styles.emptyState}>
                        No posts found for "{searchQuery}" in {selectedCategory}.
                    </div>
                )}
            </section>

            {/* Show "Older Posts" button nicely separated from the grid */}
            {!shouldShowAll && hiddenCount > 0 && (
                <div className={styles.showMoreSection}>
                    <div className={styles.dividerLine} />
                    <button
                        className={styles.largeShowMoreButton}
                        onClick={() => setShowAllHistory(true)}
                    >
                        Older Posts (+{hiddenCount})
                    </button>
                </div>
            )}
        </>
    );
}
