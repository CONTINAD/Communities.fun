"use client";

import { useState } from "react";
import { joinCommunity, leaveCommunity } from "@/actions/community";

interface JoinButtonProps {
  communityId: string;
  isMember: boolean;
}

export default function JoinButton({
  communityId,
  isMember: initialIsMember,
}: JoinButtonProps) {
  const [isMember, setIsMember] = useState(initialIsMember);
  const [isHovering, setIsHovering] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (isPending) return;

    setIsPending(true);

    // Optimistic update
    const prevState = isMember;
    setIsMember(!isMember);

    try {
      const result = isMember
        ? await leaveCommunity(communityId)
        : await joinCommunity(communityId);

      if ("error" in result) {
        // Revert on error
        setIsMember(prevState);
      }
    } catch {
      // Revert on failure
      setIsMember(prevState);
    } finally {
      setIsPending(false);
    }
  }

  // Determine button label and styling
  const label = isMember ? (isHovering ? "Leave" : "Joined") : "Join";

  const className = isMember
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
