import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import CommunityHeader from "@/components/community/CommunityHeader";
import PostComposer from "@/components/post/PostComposer";
import PostFeed from "@/components/post/PostFeed";
import { PostWithDetails } from "@/types";

interface CommunityPageProps {
  params: { slug: string };
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const community = await prisma.community.findUnique({
    where: { slug: params.slug },
    include: {
      creator: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      _count: {
        select: { members: true, posts: true },
      },
    },
  });

  if (!community) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  let isMember = false;
  let isAdmin = false;

  if (currentUser) {
    const membership = await prisma.communityMember.findUnique({
      where: {
        userId_communityId: {
          userId: currentUser.id,
          communityId: community.id,
        },
      },
    });
    isMember = !!membership;
    isAdmin = membership?.role === "ADMIN";
  }

  const posts = await prisma.post.findMany({
    where: {
      communityId: community.id,
      parentId: null,
    },
    orderBy: { createdAt: "desc" },
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
      <CommunityHeader community={community} isMember={isMember} isAdmin={isAdmin} />

      {isMember && currentUser && (
        <PostComposer
          communityId={community.id}
          userAvatar={currentUser.avatar}
          userName={currentUser.name}
        />
      )}

      <PostFeed posts={posts} currentUserId={currentUser?.id} />
    </div>
  );
}
