export type Post = {
    id: string;
    content: string;
    summary?: string;
    title?: string;
    url: string | null;
    category: string;
    difficulty: string;
    tags: string[];
    is_paywalled: boolean;
    posted_at: string;
    created_at: string;
    source?: {
        username: string;
    };
};
