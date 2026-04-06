"use client";

import { useState } from "react";
import { Repeat2 } from "lucide-react";
import { repost } from "@/actions/post";

interface RepostButtonProps {
  postId: string;
  communityId: string;
  initialReposted: boolean;
  initialCount: number;
}

export default function RepostButton({
  postId,
  communityId,
  initialReposted,
  initialCount,
}: RepostButtonProps) {
  const [reposted, setReposted] = useState(initialReposted);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function handleRepost(e: React.MouseEvent) {
    e.stopPropagation();
    if (isPending) return;

    setIsPending(true);
    setReposted((prev) => !prev);
    setCount((prev) => (reposted ? prev - 1 : prev + 1));

    try {
      const result = await repost(postId, communityId);
      if (!result.success) {
        setReposted(reposted);
        setCount(initialCount);
      }
    } catch {
      setReposted(reposted);
      setCount(initialCount);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleRepost}
      className="group flex items-center gap-1"
      disabled={isPending}
    >
      <div
        className={`rounded-full p-2 transition-colors group-hover:bg-success/10 ${
          reposted ? "text-success" : "text-text-secondary"
        }`}
      >
        <Repeat2 size={18} />
      </div>
      {count > 0 && (
        <span
          className={`text-[13px] transition-colors group-hover:text-success ${
            reposted ? "text-success" : "text-text-secondary"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
