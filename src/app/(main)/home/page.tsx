import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import PostFeed from "@/components/post/PostFeed";
import { PostWithDetails } from "@/types";

export default async function HomePage() {
  const user = await requireAuth();

  const memberships = await prisma.communityMember.findMany({
    where: { userId: user.id },
    select: { communityId: true },
  });

  const communityIds = memberships.map((m) => m.communityId);

  if (communityIds.length === 0) {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
          <h1 className="text-xl font-bold text-text-primary">Home</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <h3 className="text-text-primary text-xl font-bold mb-2">
            Welcome to Communities.fun
          </h3>
          <p className="text-text-secondary text-[15px] text-center max-w-sm mb-6">
            Join some communities to see posts here
          </p>
          <Link
            href="/explore"
            className="bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-6 py-3 text-[15px] transition-colors"
          >
            Explore Communities
          </Link>
        </div>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    where: {
      communityId: { in: communityIds },
      parentId: null,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
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
        where: { userId: user.id },
        select: { userId: true },
      },
    },
  }) as PostWithDetails[];

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
        <h1 className="text-xl font-bold text-text-primary">Home</h1>
      </div>
      <PostFeed posts={posts} currentUserId={user.id} />
    </div>
  );
}
