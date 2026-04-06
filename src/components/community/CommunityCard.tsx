import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

interface CommunityCardProps {
  community: {
    name: string;
    slug: string;
    description: string | null;
    avatar: string | null;
    coverImage: string | null;
    _count: {
      members: number;
    };
  };
}

export default function CommunityCard({ community }: CommunityCardProps) {
  return (
    <Link href={`/communities/${community.slug}`}>
      <div className="group overflow-hidden rounded-xl border border-border-primary bg-bg-secondary transition-all duration-200 hover:brightness-110 hover:scale-[1.02]">
        {/* Cover image */}
        <div className="relative h-24 w-full">
          {community.coverImage ? (
            <Image
              src={community.coverImage}
              alt={`${community.name} cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-accent/40 to-accent/10" />
          )}
        </div>

        {/* Content area */}
        <div className="relative px-4 pb-4 pt-8">
          {/* Avatar overlapping cover */}
          <div className="absolute -top-6 left-4">
            {community.avatar ? (
              <Image
                src={community.avatar}
                alt={community.name}
                width={48}
                height={48}
                className="rounded-full border-2 border-bg-primary object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-bg-primary bg-accent text-white font-bold text-lg">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Community info */}
          <h3 className="text-lg font-bold text-text-primary truncate">
            {community.name}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-text-secondary text-sm">
            <Users size={14} />
            <span>{community._count.members.toLocaleString()} {community._count.members === 1 ? "member" : "members"}</span>
          </div>

          {community.description && (
            <p className="mt-2 text-sm text-text-secondary line-clamp-2">
              {community.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
