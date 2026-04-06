"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  Trash2,
  Pin,
} from "lucide-react";
import { deletePost } from "@/actions/post";
import { togglePinPost } from "@/actions/pin";
import { PostWithDetails } from "@/types";
import LikeButton from "./LikeButton";
import RepostButton from "./RepostButton";
import BookmarkButton from "./BookmarkButton";

interface PostCardProps {
  post: PostWithDetails;
  currentUserId?: string;
  /** Hide the community badge (e.g. when viewing a community feed) */
  hideCommunity?: boolean;
  isAdmin?: boolean;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function PostCard({ post, currentUserId, hideCommunity = false, isAdmin = false }: PostCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinned, setIsPinned] = useState(post.pinned ?? false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isRepost = !!post.repostOf;
  const displayPost = isRepost && post.repostOf ? post.repostOf : post;
  const displayAuthor = isRepost && post.repostOf
    ? post.repostOf.author
    : post.author;

  const authorAvatar = displayAuthor.avatar || displayAuthor.image;
  const isAuthor = currentUserId === post.authorId;
  const isLiked = post.likes.some((like) => like.userId === currentUserId);
  const isBookmarked = post.bookmarks?.some((b) => b.userId === currentUserId) ?? false;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCardClick() {
    router.push(`/post/${post.id}`);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    setMenuOpen(false);
    try {
      await deletePost(post.id);
    } catch {
      setIsDeleting(false);
    }
  }

  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        url: `${window.location.origin}/post/${post.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`
      );
    }
  }

  async function handlePin(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    const result = await togglePinPost(post.id);
    if ("pinned" in result) {
      setIsPinned(!!result.pinned);
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className={`border-b border-border-primary px-4 py-3 transition-colors hover:bg-bg-hover cursor-pointer ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Pinned header */}
      {isPinned && (
        <div className="flex items-center gap-2 ml-6 mb-1 text-text-secondary text-[13px]">
          <Pin size={14} />
          <span className="font-bold">Pinned</span>
        </div>
      )}

      {/* Repost header */}
      {isRepost && (
        <div className="flex items-center gap-2 ml-6 mb-1 text-text-secondary text-[13px]">
          <Repeat2 size={14} />
          <span className="font-bold">{post.author.name}</span>
          <span>reposted</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/${displayAuthor.username}`);
            }}
            className="w-10 h-10 rounded-full overflow-hidden bg-bg-tertiary cursor-pointer"
          >
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={displayAuthor.name || ""}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm font-bold">
                {(displayAuthor.name || "?")[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top line */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 min-w-0">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/profile/${displayAuthor.username}`);
                }}
                className="font-bold text-text-primary hover:underline truncate cursor-pointer"
              >
                {displayAuthor.name}
              </span>
              <span className="text-text-secondary truncate">
                @{displayAuthor.username}
              </span>
              <span className="text-text-secondary flex-shrink-0">·</span>
              <span className="text-text-secondary flex-shrink-0 hover:underline">
                {timeAgo(displayPost.createdAt)}
              </span>
            </div>

            {/* More menu */}
            {(isAuthor || isAdmin) && (
              <div ref={menuRef} className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  className="rounded-full p-2 text-text-secondary hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  <MoreHorizontal size={18} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-bg-primary border border-border-primary rounded-xl shadow-lg overflow-hidden min-w-[200px]">
                    {isAdmin && (
                      <button
                        onClick={handlePin}
                        className="flex items-center gap-3 w-full px-4 py-3 text-text-primary hover:bg-bg-secondary transition-colors text-[15px] font-bold"
                      >
                        <Pin size={18} />
                        {isPinned ? "Unpin post" : "Pin post"}
                      </button>
                    )}
                    {isAuthor && (
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-3 w-full px-4 py-3 text-danger hover:bg-bg-secondary transition-colors text-[15px] font-bold"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Community badge */}
          {!hideCommunity && post.community?.name && (
            <div className="text-[13px] text-text-secondary mt-0.5">
              in{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/communities/${post.community.slug}`);
                }}
                className="text-accent hover:underline cursor-pointer"
              >
                {post.community.name}
              </span>
            </div>
          )}

          {/* Post content */}
          {displayPost.content && (
            <p className="text-text-primary text-[15px] leading-normal mt-0.5 whitespace-pre-wrap break-words">
              {displayPost.content}
            </p>
          )}

          {/* Image */}
          {displayPost.image && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border-primary">
              <Image
                src={displayPost.image}
                alt="Post image"
                width={600}
                height={400}
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between mt-3 max-w-[425px] -ml-2">
            {/* Reply */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${post.id}`);
              }}
              className="group flex items-center gap-1"
            >
              <div className="rounded-full p-2 text-text-secondary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                <MessageCircle size={18} />
              </div>
              {post._count.replies > 0 && (
                <span className="text-[13px] text-text-secondary group-hover:text-accent">
                  {post._count.replies}
                </span>
              )}
            </button>

            {/* Repost */}
            <RepostButton
              postId={post.id}
              communityId={post.communityId}
              initialReposted={false}
              initialCount={post._count.reposts}
            />

            {/* Like */}
            <LikeButton
              postId={post.id}
              initialLiked={isLiked}
              initialCount={post._count.likes}
            />

            {/* Share */}
            <button
              onClick={handleShare}
              className="group flex items-center"
            >
              <div className="rounded-full p-2 text-text-secondary transition-colors group-hover:bg-accent/10 group-hover:text-accent">
                <Share size={18} />
              </div>
            </button>

            {/* Bookmark */}
            <BookmarkButton
              postId={post.id}
              initialBookmarked={isBookmarked}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
