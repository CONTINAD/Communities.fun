import Image from "next/image";
import Link from "next/link";

interface Member {
  user: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  role: string;
}

interface MemberListProps {
  members: Member[];
}

function RoleBadge({ role }: { role: string }) {
  if (role === "ADMIN") {
    return (
      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
        Admin
      </span>
    );
  }

  if (role === "MODERATOR") {
    return (
      <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-500">
        Mod
      </span>
    );
  }

  return null;
}

export default function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="py-8 text-center text-text-secondary text-[15px]">
        No members yet.
      </div>
    );
  }

  return (
    <div>
      {members.map((member) => (
        <Link
          key={member.user.id}
          href={`/profile/${member.user.username}`}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bg-hover"
        >
          {/* Avatar */}
          {member.user.image ? (
            <Image
              src={member.user.image}
              alt={member.user.name || member.user.username}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-text-secondary font-bold">
              {(member.user.name || member.user.username)
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          {/* User info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[15px] font-bold text-text-primary">
                {member.user.name || member.user.username}
              </span>
              <RoleBadge role={member.role} />
            </div>
            <span className="text-[13px] text-text-secondary">
              @{member.user.username}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
