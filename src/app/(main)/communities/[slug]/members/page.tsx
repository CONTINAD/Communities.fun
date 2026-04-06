import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import CommunityHeader from "@/components/community/CommunityHeader";
import MemberList from "@/components/community/MemberList";

interface CommunityMembersPageProps {
  params: { slug: string };
}

export default async function CommunityMembersPage({
  params,
}: CommunityMembersPageProps) {
  const community = await prisma.community.findUnique({
    where: { slug: params.slug },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
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
    const membership = community.members.find(
      (m) => m.user.id === currentUser.id
    );
    isMember = !!membership;
    isAdmin = membership?.role === "ADMIN";
  }

  // Map members to the shape MemberList expects (image instead of avatar)
  const membersForList = community.members.map((m) => ({
    ...m,
    user: {
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      image: m.user.avatar,
    },
  }));

  return (
    <div>
      <CommunityHeader community={community} isMember={isMember} isAdmin={isAdmin} />
      <MemberList members={membersForList} />
    </div>
  );
}
