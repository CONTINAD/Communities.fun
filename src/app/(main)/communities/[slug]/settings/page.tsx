import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import CommunitySettingsForm from "@/components/community/CommunitySettingsForm";
import RulesManager from "@/components/community/RulesManager";
import MemberManager from "@/components/community/MemberManager";

interface Props {
  params: { slug: string };
}

export default async function CommunitySettingsPage({ params }: Props) {
  const { slug } = params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const community = await prisma.community.findUnique({
    where: { slug },
    include: {
      rules: {
        orderBy: { order: "asc" },
      },
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
      },
    },
  });

  if (!community) notFound();

  const currentMember = community.members.find((m) => m.userId === user.id);
  if (!currentMember || currentMember.role !== "ADMIN") {
    redirect(`/communities/${slug}`);
  }

  const adminCount = community.members.filter(
    (m) => m.role === "ADMIN"
  ).length;

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-border-primary bg-bg-primary/80 px-4 py-3 backdrop-blur-md">
        <Link
          href={`/communities/${slug}`}
          className="rounded-full p-1.5 transition-colors hover:bg-bg-tertiary"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
      </div>

      {/* Community Info Section */}
      <section className="border-b border-border-primary px-4 py-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Community Info
        </h2>
        <CommunitySettingsForm
          community={{
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            avatar: community.avatar,
            coverImage: community.coverImage,
            contractAddress: community.contractAddress,
            website: community.website,
            twitter: community.twitter,
            telegram: community.telegram,
            dexscreener: community.dexscreener,
          }}
        />
      </section>

      {/* Rules Section */}
      <section className="border-b border-border-primary px-4 py-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">Rules</h2>
        <RulesManager
          communityId={community.id}
          initialRules={community.rules.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            order: r.order,
          }))}
        />
      </section>

      {/* Members Section */}
      <section className="border-b border-border-primary px-4 py-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">Members</h2>
        <MemberManager
          communityId={community.id}
          currentUserId={user.id}
          adminCount={adminCount}
          initialMembers={community.members.map((m) => ({
            userId: m.user.id,
            name: m.user.name,
            username: m.user.username,
            avatar: m.user.avatar,
            role: m.role,
          }))}
        />
      </section>

      {/* Danger Zone */}
      <section className="px-4 py-6">
        <div className="rounded-lg border border-danger/40 p-4">
          <h2 className="text-lg font-bold text-danger mb-2">Danger Zone</h2>
          <p className="text-sm text-text-secondary mb-4">
            These actions are irreversible. Proceed with caution.
          </p>
          <div className="flex flex-col gap-3">
            <button
              disabled
              className="w-fit rounded-lg border border-danger/40 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Community (coming soon)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
