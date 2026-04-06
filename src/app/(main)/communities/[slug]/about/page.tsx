import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import CommunityHeader from "@/components/community/CommunityHeader";

interface CommunityAboutPageProps {
  params: { slug: string };
}

export default async function CommunityAboutPage({
  params,
}: CommunityAboutPageProps) {
  const community = await prisma.community.findUnique({
    where: { slug: params.slug },
    include: {
      creator: {
        select: { id: true, name: true, username: true, avatar: true },
      },
      rules: {
        orderBy: { order: "asc" },
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

  const createdDate = new Date(community.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div>
      <CommunityHeader community={community} isMember={isMember} isAdmin={isAdmin} />

      <div className="px-4 py-6 space-y-6">
        {/* Description */}
        {community.description && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-2">
              About
            </h2>
            <p className="text-[15px] text-text-secondary whitespace-pre-wrap">
              {community.description}
            </p>
          </div>
        )}

        {/* Rules */}
        {community.rules.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-3">Rules</h2>
            <ol className="space-y-3">
              {community.rules.map((rule, index) => (
                <li
                  key={rule.id}
                  className="rounded-lg border border-border-primary p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-bg-tertiary text-text-secondary text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-text-primary text-[15px]">
                        {rule.title}
                      </h3>
                      <p className="text-[13px] text-text-secondary mt-1">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Contract Address */}
        {community.contractAddress && (
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-2">Contract Address</h2>
            <div className="rounded-lg border border-border-primary bg-bg-secondary p-4">
              <p className="font-mono text-sm text-text-primary break-all select-all">
                {community.contractAddress}
              </p>
            </div>
          </div>
        )}

        {/* Created date & creator */}
        <div className="border-t border-border-primary pt-6">
          <h2 className="text-lg font-bold text-text-primary mb-3">Info</h2>
          <div className="space-y-2 text-[15px]">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Created</span>
              <span className="text-text-primary">{createdDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Created by</span>
              <span className="text-text-primary font-bold">
                {community.creator.name || community.creator.username}
              </span>
              <span className="text-text-secondary">
                @{community.creator.username}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
