'use server';

import { supabase } from '@/lib/supabase';

export async function incrementLike(postId: string) {
    // Use RPC for atomic increment
    const { error } = await supabase.rpc('increment_like', { post_id: postId });

    if (error) {
        console.error('Error incrementing like via RPC:', error);

        // Fallback: Fetch and Update (Prone to race conditions, use only if RPC fails/not exists)
        const { data: post, error: fetchError } = await supabase
            .from('analyzed_posts')
            .select('like_count')
            .eq('id', postId)
            .single();

        if (!fetchError && post) {
            await supabase
                .from('analyzed_posts')
                .update({ like_count: (post.like_count || 0) + 1 })
                .eq('id', postId);
        }
    }
}
