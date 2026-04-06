"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PostWithDetails } from "@/types";
import PostCard from "@/components/post/PostCard";

interface InfiniteFeedProps {
  initialPosts: PostWithDetails[];
  currentUserId?: string;
  type: "home" | "community" | "profile";
  communityId?: string;
  authorId?: string;
}

export default function InfiniteFeed({
  initialPosts,
  currentUserId,
  type,
  communityId,
  authorId,
}: InfiniteFeedProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(
    initialPosts.length >= 20
      ? initialPosts[initialPosts.length - 1]?.id ?? null
      : null
  );
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);

  async function loadMore() {
    if (loading || !hasMore || !cursor) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        type,
        cursor,
      });
      if (communityId) params.set("communityId", communityId);
      if (authorId) params.set("authorId", authorId);

      const res = await fetch(`/api/posts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoading(false);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h3 className="text-text-primary text-xl font-bold mb-1">
          No posts yet
        </h3>
        <p className="text-text-secondary text-[15px] text-center max-w-sm">
          When members post, their posts will show up here. Be the first to
          start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} hideCommunity={type === "community"} />
      ))}

      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-accent hover:bg-accent/10 font-bold rounded-full px-6 py-2.5 text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </span>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <p className="text-text-secondary text-[14px]">No more posts</p>
        </div>
      )}
    </div>
  );
}
