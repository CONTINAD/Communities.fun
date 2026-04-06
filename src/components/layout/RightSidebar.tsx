import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import RightSidebarSearch from "./RightSidebarSearch";

export default async function RightSidebar() {
  // Fetch real trending communities (most members)
  const trending = await prisma.community.findMany({
    where: { isPublic: true },
    orderBy: { members: { _count: "desc" } },
    take: 4,
    select: {
      name: true,
      slug: true,
      _count: { select: { members: true } },
    },
  });

  // Fetch newest communities
  const newest = await prisma.community.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      name: true,
      slug: true,
      avatar: true,
      _count: { select: { members: true } },
    },
  });

  return (
    <aside className="hidden lg:flex fixed top-0 right-0 h-full w-[350px] border-l border-border-primary bg-bg-primary flex-col overflow-y-auto">
      {/* Search */}
      <div className="sticky top-0 bg-bg-primary pt-3 pb-3 px-4 z-10">
        <RightSidebarSearch />
      </div>

      {/* Trending Communities */}
      {trending.length > 0 && (
        <div className="mx-4 mt-3 bg-bg-secondary rounded-2xl overflow-hidden">
          <h2 className="text-xl font-extrabold text-text-primary px-4 pt-4 pb-3">
            Trending
          </h2>
          {trending.map((community, i) => (
            <Link
              key={community.slug}
              href={`/communities/${community.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover/50 transition-colors"
            >
              <span className="text-text-secondary text-[13px] font-bold w-4 text-right">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-text-primary font-bold text-[15px] block truncate">
                  {community.name}
                </span>
                <div className="flex items-center gap-1 text-text-secondary text-[13px]">
                  <Users size={12} />
                  <span>
                    {community._count.members.toLocaleString()}{" "}
                    {community._count.members === 1 ? "member" : "members"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          <Link
            href="/explore?sort=popular"
            className="block px-4 py-4 text-accent text-[15px] hover:bg-bg-hover/50 transition-colors"
          >
            Show more
          </Link>
        </div>
      )}

      {/* New Communities */}
      {newest.length > 0 && (
        <div className="mx-4 mt-4 mb-4 bg-bg-secondary rounded-2xl overflow-hidden">
          <h2 className="text-xl font-extrabold text-text-primary px-4 pt-4 pb-3">
            New Communities
          </h2>
          {newest.map((community) => (
            <Link
              key={community.slug}
              href={`/communities/${community.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hover/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex-shrink-0 flex items-center justify-center overflow-hidden">
                {community.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={community.avatar}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-accent text-sm font-bold">
                    {community.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-text-primary font-bold text-[15px] truncate">
                  {community.name}
                </span>
                <span className="text-text-secondary text-[13px]">
                  {community._count.members} members
                </span>
              </div>
            </Link>
          ))}
          <Link
            href="/explore?sort=newest"
            className="block px-4 py-4 text-accent text-[15px] hover:bg-bg-hover/50 transition-colors"
          >
            Show more
          </Link>
        </div>
      )}
    </aside>
  );
}
