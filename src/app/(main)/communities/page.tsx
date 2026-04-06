import Link from "next/link";
import Image from "next/image";
import { Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export default async function CommunitiesPage() {
  const user = await requireAuth();

  const memberships = await prisma.communityMember.findMany({
    where: { userId: user.id },
    include: {
      community: {
        include: {
          _count: {
            select: { members: true, posts: true },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">
            Your Communities
          </h1>
          <Link
            href="/communities/create"
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-4 py-2 text-sm transition-colors"
          >
            <Plus size={16} />
            Create
          </Link>
        </div>
      </div>

      {memberships.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <h3 className="text-text-primary text-xl font-bold mb-2">
            No communities yet
          </h3>
          <p className="text-text-secondary text-[15px] text-center max-w-sm mb-6">
            Join or create a community to get started.
          </p>
          <Link
            href="/explore"
            className="bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-6 py-3 text-[15px] transition-colors"
          >
            Explore Communities
          </Link>
        </div>
      ) : (
        <div>
          {memberships.map((membership) => {
            const community = membership.community;

            return (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-hover border-b border-border-primary"
              >
                {/* Community avatar */}
                {community.avatar ? (
                  <Image
                    src={community.avatar}
                    alt={community.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-lg">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Community info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary text-[15px] truncate">
                      {community.name}
                    </span>
                    {membership.role !== "MEMBER" && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          membership.role === "ADMIN"
                            ? "bg-accent/15 text-accent"
                            : "bg-yellow-500/15 text-yellow-500"
                        }`}
                      >
                        {membership.role === "ADMIN" ? "Admin" : "Mod"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-text-secondary text-[13px]">
                    <Users size={12} />
                    <span>
                      {community._count.members.toLocaleString()}{" "}
                      {community._count.members === 1 ? "member" : "members"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
