"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Settings } from "lucide-react";
import JoinButton from "./JoinButton";
import SocialLinks from "./SocialLinks";

interface CommunityHeaderProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatar: string | null;
    coverImage: string | null;
    contractAddress?: string | null;
    website?: string | null;
    twitter?: string | null;
    telegram?: string | null;
    dexscreener?: string | null;
    _count: {
      members: number;
    };
  };
  isMember: boolean;
  isAdmin?: boolean;
}

export default function CommunityHeader({
  community,
  isMember,
  isAdmin = false,
}: CommunityHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Posts", href: `/communities/${community.slug}` },
    { label: "About", href: `/communities/${community.slug}/about` },
    { label: "Members", href: `/communities/${community.slug}/members` },
  ];

  function isTabActive(tab: { label: string; href: string }) {
    if (tab.label === "Posts") {
      return pathname === `/communities/${community.slug}`;
    }
    if (tab.label === "About") {
      return pathname.includes("/about");
    }
    if (tab.label === "Members") {
      return pathname.includes("/members");
    }
    return false;
  }

  return (
    <div className="border-b border-border-primary">
      {/* Cover image */}
      <div className="relative h-[200px] w-full">
        {community.coverImage ? (
          <Image
            src={community.coverImage}
            alt={`${community.name} cover`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-accent/30 via-accent/15 to-bg-secondary" />
        )}
      </div>

      {/* Profile section */}
      <div className="relative px-4 pb-3">
        {/* Avatar + Join button row */}
        <div className="flex items-start justify-between">
          {/* Avatar overlapping cover */}
          <div className="-mt-10">
            {community.avatar ? (
              <Image
                src={community.avatar}
                alt={community.name}
                width={80}
                height={80}
                className="rounded-full border-4 border-bg-primary object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-bg-primary bg-accent text-white font-bold text-3xl">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Join/Leave button + Settings */}
          <div className="mt-3 flex items-center gap-2">
            {isAdmin && (
              <Link
                href={`/communities/${community.slug}/settings`}
                className="flex items-center justify-center rounded-full border border-border-primary p-2 text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                title="Community Settings"
              >
                <Settings size={18} />
              </Link>
            )}
            <JoinButton communityId={community.id} isMember={isMember} />
          </div>
        </div>

        {/* Name */}
        <h1 className="mt-2 text-xl font-bold text-text-primary">
          {community.name}
        </h1>

        {/* Description */}
        {community.description && (
          <p className="mt-1 text-[15px] text-text-secondary">
            {community.description}
          </p>
        )}

        {/* Social links / CA — DexScreener style */}
        <SocialLinks
          contractAddress={community.contractAddress}
          website={community.website}
          twitter={community.twitter}
          telegram={community.telegram}
          dexscreener={community.dexscreener}
        />

        {/* Member count */}
        <div className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
          <Users size={16} />
          <span>
            <span className="font-bold text-text-primary">
              {community._count.members.toLocaleString()}
            </span>{" "}
            {community._count.members === 1 ? "member" : "members"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex border-t border-border-primary">
        {tabs.map((tab) => {
          const active = isTabActive(tab);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`relative flex-1 py-4 text-center text-[15px] transition-colors hover:bg-bg-hover ${
                active
                  ? "text-text-primary font-bold"
                  : "text-text-secondary font-medium"
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-14 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
