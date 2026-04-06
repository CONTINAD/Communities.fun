"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { likePost } from "@/actions/post";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (isPending) return;

    setIsPending(true);
    setLiked((prev) => !prev);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const result = await likePost(postId);
      if (!result.success) {
        setLiked(liked);
        setCount(initialCount);
      }
    } catch {
      setLiked(liked);
      setCount(initialCount);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      className="group flex items-center gap-1"
      disabled={isPending}
    >
      <div
        className={`rounded-full p-2 transition-colors group-hover:bg-like/10 ${
          liked ? "text-like" : "text-text-secondary"
        }`}
      >
        <Heart
          size={18}
          className={liked ? "fill-like stroke-like" : ""}
        />
      </div>
      {count > 0 && (
        <span
          className={`text-[13px] transition-colors group-hover:text-like ${
            liked ? "text-like" : "text-text-secondary"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
