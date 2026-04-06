"use client";

import { useState } from "react";
import { toggleFollow } from "@/actions/follow";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  followerCount: number;
}

export default function FollowButton({
  targetUserId,
  isFollowing: initialIsFollowing,
  followerCount: initialFollowerCount,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isHovering, setIsHovering] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (isPending) return;

    setIsPending(true);

    // Optimistic update
    const prevFollowing = isFollowing;
    const prevCount = followerCount;
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);

    try {
      const result = await toggleFollow(targetUserId);

      if ("error" in result) {
        // Revert on error
        setIsFollowing(prevFollowing);
        setFollowerCount(prevCount);
      }
    } catch {
      // Revert on failure
      setIsFollowing(prevFollowing);
      setFollowerCount(prevCount);
    } finally {
      setIsPending(false);
    }
  }

  const label = isFollowing ? (isHovering ? "Unfollow" : "Following") : "Follow";

  const className = isFollowing
    ? isHovering
      ? "rounded-full border border-danger px-6 py-2 font-bold text-danger transition-colors hover:bg-danger/10"
      : "rounded-full border border-border-primary px-6 py-2 font-bold text-text-primary transition-colors"
    : "rounded-full bg-accent px-6 py-2 font-bold text-white transition-colors hover:bg-accent-hover";

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isPending}
      className={`min-w-[100px] text-sm ${className} ${
        isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {label}
    </button>
  );
}
