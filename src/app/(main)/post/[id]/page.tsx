import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import PostCard from "@/components/post/PostCard";
import PostFeed from "@/components/post/PostFeed";
import ReplyThread from "@/components/post/ReplyThread";
import { PostWithDetails } from "@/types";

interface PostPageProps {
  params: { id: string };
}

export default async function PostPage({ params }: PostPageProps) {
  const currentUser = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      community: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { likes: true, replies: true, reposts: true },
      },
      likes: {
        where: currentUser ? { userId: currentUser.id } : { userId: "" },
        select: { userId: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const replies = await prisma.post.findMany({
    where: { parentId: post.id },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      community: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { likes: true, replies: true, reposts: true },
      },
      likes: {
        where: currentUser ? { userId: currentUser.id } : { userId: "" },
        select: { userId: true },
      },
    },
  }) as PostWithDetails[];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="rounded-full p-2 -ml-2 transition-colors hover:bg-bg-hover"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </Link>
          <h1 className="text-xl font-bold text-text-primary">Post</h1>
        </div>
      </div>

      {/* Main post */}
      <PostCard
        post={post as PostWithDetails}
        currentUserId={currentUser?.id}
      />

      {/* Reply composer */}
      {currentUser && (
        <ReplyThread postId={post.id} userAvatar={currentUser.avatar} />
      )}

      {/* Replies */}
      <PostFeed posts={replies} currentUserId={currentUser?.id} />
    </div>
  );
}
