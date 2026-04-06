import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import CommunityCard from "@/components/community/CommunityCard";
import SearchBar from "@/components/community/SearchBar";
import { Users, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

interface ExplorePageProps {
  searchParams: { q?: string; sort?: string };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const query = searchParams.q?.trim() || "";
  const sort = searchParams.sort || "popular";

  const currentUser = await getCurrentUser();

  // Build where clause
  const where: Record<string, unknown> = { isPublic: true };
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { slug: { contains: query.toLowerCase() } },
    ];
  }

  // Build orderBy
  let orderBy: Record<string, unknown> = {};
  switch (sort) {
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "popular":
    default:
      orderBy = { members: { _count: "desc" } };
      break;
  }

  const communities = await prisma.community.findMany({
    where: where as never,
    orderBy: orderBy as never,
    include: {
      _count: {
        select: { members: true, posts: true },
      },
    },
  });

  // Get communities the user hasn't joined yet for "Suggested" section
  let suggestedCommunities: typeof communities = [];
  if (currentUser && !query) {
    const userCommunityIds = (
      await prisma.communityMember.findMany({
        where: { userId: currentUser.id },
        select: { communityId: true },
      })
    ).map((m) => m.communityId);

    suggestedCommunities = await prisma.community.findMany({
      where: {
        isPublic: true,
        id: { notIn: userCommunityIds },
      },
      orderBy: { members: { _count: "desc" } },
      take: 6,
      include: {
        _count: {
          select: { members: true, posts: true },
        },
      },
    });
  }

  // Get trending (most posts in recent time) — simplified: most posts overall
  let trendingCommunities: typeof communities = [];
  if (!query) {
    trendingCommunities = await prisma.community.findMany({
      where: { isPublic: true },
      orderBy: { posts: { _count: "desc" } },
      take: 5,
      include: {
        _count: {
          select: { members: true, posts: true },
        },
      },
    });
  }

  const isSearching = !!query;

  return (
    <div>
      {/* Header with search */}
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-text-primary">Explore</h1>
        </div>
        <div className="px-4 pb-3">
          <SearchBar defaultValue={query} />
        </div>
      </div>

      {/* Sort tabs (only when not searching) */}
      {!isSearching && (
        <div className="flex border-b border-border-primary">
          <Link
            href="/explore?sort=popular"
            className={`relative flex-1 py-3 text-center text-[15px] transition-colors hover:bg-bg-hover ${
              sort === "popular"
                ? "text-text-primary font-bold"
                : "text-text-secondary font-medium"
            }`}
          >
            Popular
            {sort === "popular" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-14 rounded-full bg-accent" />
            )}
          </Link>
          <Link
            href="/explore?sort=newest"
            className={`relative flex-1 py-3 text-center text-[15px] transition-colors hover:bg-bg-hover ${
              sort === "newest"
                ? "text-text-primary font-bold"
                : "text-text-secondary font-medium"
            }`}
          >
            Newest
            {sort === "newest" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-14 rounded-full bg-accent" />
            )}
          </Link>
        </div>
      )}

      {/* Search results */}
      {isSearching && (
        <div className="px-4 py-3 border-b border-border-primary">
          <p className="text-sm text-text-secondary">
            {communities.length} result{communities.length !== 1 ? "s" : ""} for{" "}
            <span className="text-text-primary font-medium">&quot;{query}&quot;</span>
          </p>
        </div>
      )}

      {/* Suggested for you (not joined yet) */}
      {!isSearching && suggestedCommunities.length > 0 && (
        <section className="border-b border-border-primary">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <Sparkles size={18} className="text-accent" />
            <h2 className="text-[17px] font-bold text-text-primary">Suggested for you</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 pt-2">
            {suggestedCommunities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {!isSearching && trendingCommunities.length > 0 && (
        <section className="border-b border-border-primary">
          <div className="flex items-center gap-2 px-4 pt-4 pb-1">
            <TrendingUp size={18} className="text-accent" />
            <h2 className="text-[17px] font-bold text-text-primary">Trending</h2>
          </div>
          <div className="divide-y divide-border-primary">
            {trendingCommunities.map((community, i) => (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-bg-hover transition-colors"
              >
                <span className="text-text-secondary text-sm font-bold w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-text-primary truncate">
                    {community.name}
                  </p>
                  <div className="flex items-center gap-1 text-text-secondary text-[13px]">
                    <Users size={12} />
                    <span>{community._count.members} members</span>
                    <span className="mx-1">·</span>
                    <span>{community._count.posts} posts</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All communities / search results grid */}
      <section>
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <h2 className="text-[17px] font-bold text-text-primary">
            {isSearching ? "Results" : "All Communities"}
          </h2>
        </div>

        {communities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            {isSearching ? (
              <>
                <h3 className="text-text-primary text-xl font-bold mb-2">
                  No results found
                </h3>
                <p className="text-text-secondary text-[15px] text-center max-w-sm">
                  Try a different search term or create a new community.
                </p>
                <Link
                  href="/communities/create"
                  className="mt-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-6 py-2.5 text-[15px] transition-colors"
                >
                  Create Community
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-text-primary text-xl font-bold mb-2">
                  No communities yet
                </h3>
                <p className="text-text-secondary text-[15px] text-center max-w-sm">
                  Be the first to create a community and start something great.
                </p>
                <Link
                  href="/communities/create"
                  className="mt-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-6 py-2.5 text-[15px] transition-colors"
                >
                  Create Community
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 pt-2">
            {communities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
