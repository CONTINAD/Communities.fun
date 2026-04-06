import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as unknown as Record<string, string>).id;
  const cursor = request.nextUrl.searchParams.get("cursor");
  const communityId = request.nextUrl.searchParams.get("communityId");
  const authorId = request.nextUrl.searchParams.get("authorId");
  const type = request.nextUrl.searchParams.get("type") || "home";
  const limit = 20;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { parentId: null };

  if (type === "home") {
    const memberships = await prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });
    where.communityId = { in: memberships.map((m) => m.communityId) };
  } else if (type === "community" && communityId) {
    where.communityId = communityId;
  } else if (type === "profile" && authorId) {
    where.authorId = authorId;
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          image: true,
        },
      },
      community: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { likes: true, replies: true, reposts: true },
      },
      likes: {
        where: { userId },
        select: { userId: true },
      },
    },
  });

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return NextResponse.json({ posts: data, nextCursor });
}
