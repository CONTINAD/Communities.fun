"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/actions/bookmark";

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked: boolean;
}

export default function BookmarkButton({
  postId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, setIsPending] = useState(false);

  async function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    if (isPending) return;

    setIsPending(true);
    setBookmarked((prev) => !prev);

    try {
      const result = await toggleBookmark(postId);
      if (!result.success) {
        setBookmarked(bookmarked);
      }
    } catch {
      setBookmarked(bookmarked);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleBookmark}
      className="group flex items-center"
      disabled={isPending}
    >
      <div
        className={`rounded-full p-2 transition-colors group-hover:bg-accent/10 ${
          bookmarked ? "text-accent" : "text-text-secondary"
        }`}
      >
        <Bookmark
          size={18}
          className={bookmarked ? "fill-accent stroke-accent" : ""}
        />
      </div>
    </button>
  );
}
