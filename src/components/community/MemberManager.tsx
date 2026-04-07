"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  updateMemberRole,
  removeMember,
  banMember,
  unbanMember,
} from "@/actions/community";
import { X, ChevronDown, Loader2, Shield, ShieldCheck, User, Ban } from "lucide-react";

interface Member {
  userId: string;
  name: string | null;
  username: string;
  avatar: string | null;
  role: string;
}

interface BannedUser {
  userId: string;
  username: string;
  name: string | null;
  reason: string | null;
}

interface MemberManagerProps {
  communityId: string;
  currentUserId: string;
  adminCount: number;
  initialMembers: Member[];
  initialBanned?: BannedUser[];
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin", icon: ShieldCheck },
  { value: "MODERATOR", label: "Moderator", icon: Shield },
  { value: "MEMBER", label: "Member", icon: User },
] as const;

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
  return (
    <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary">
      Member
    </span>
  );
}

export default function MemberManager({
  communityId,
  currentUserId,
  adminCount: initialAdminCount,
  initialMembers,
  initialBanned = [],
}: MemberManagerProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [banned, setBanned] = useState<BannedUser[]>(initialBanned);
  const [adminCount, setAdminCount] = useState(initialAdminCount);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRoleChange(targetUserId: string, newRole: string) {
    const member = members.find((m) => m.userId === targetUserId);
    if (!member) return;

    // Prevent demoting the last admin
    if (member.role === "ADMIN" && newRole !== "ADMIN" && adminCount <= 1) {
      setError("Cannot demote the last admin. Promote another member first.");
      setOpenDropdown(null);
      return;
    }

    setUpdatingId(targetUserId);
    setError(null);
    setOpenDropdown(null);

    try {
      const result = await updateMemberRole(communityId, targetUserId, newRole);

      if ("error" in result && result.error) {
        setError(result.error);
        setUpdatingId(null);
        return;
      }

      // Update local state
      const oldRole = member.role;
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === targetUserId ? { ...m, role: newRole } : m
        )
      );

      // Update admin count
      let newAdminCount = adminCount;
      if (oldRole === "ADMIN" && newRole !== "ADMIN") newAdminCount--;
      if (oldRole !== "ADMIN" && newRole === "ADMIN") newAdminCount++;
      setAdminCount(newAdminCount);

      setUpdatingId(null);
      router.refresh();
    } catch {
      setError("Failed to update role.");
      setUpdatingId(null);
    }
  }

  async function handleRemove(targetUserId: string) {
    if (targetUserId === currentUserId) return;

    const member = members.find((m) => m.userId === targetUserId);
    if (!member) return;

    // Prevent removing the last admin
    if (member.role === "ADMIN" && adminCount <= 1) {
      setError("Cannot remove the last admin.");
      return;
    }

    setRemovingId(targetUserId);
    setError(null);

    try {
      const result = await removeMember(communityId, targetUserId);

      if ("error" in result && result.error) {
        setError(result.error);
        setRemovingId(null);
        return;
      }

      if (member.role === "ADMIN") {
        setAdminCount((prev) => prev - 1);
      }

      setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
      setRemovingId(null);
      router.refresh();
    } catch {
      setError("Failed to remove member.");
      setRemovingId(null);
    }
  }

  async function handleBan(targetUserId: string, targetName: string) {
    if (targetUserId === currentUserId) return;
    const confirmBan = confirm(`Ban ${targetName}? They won't be able to rejoin.`);
    if (!confirmBan) return;

    setBanningId(targetUserId);
    setError(null);

    try {
      const result = await banMember(communityId, targetUserId, "Banned by admin");
      if ("error" in result && result.error) {
        setError(result.error);
        setBanningId(null);
        return;
      }

      const member = members.find((m) => m.userId === targetUserId);
      if (member) {
        setBanned((prev) => [...prev, { userId: member.userId, username: member.username, name: member.name, reason: "Banned by admin" }]);
        if (member.role === "ADMIN") setAdminCount((prev) => prev - 1);
      }
      setMembers((prev) => prev.filter((m) => m.userId !== targetUserId));
      setBanningId(null);
      router.refresh();
    } catch {
      setError("Failed to ban member.");
      setBanningId(null);
    }
  }

  async function handleUnban(targetUserId: string) {
    setError(null);
    try {
      const result = await unbanMember(communityId, targetUserId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setBanned((prev) => prev.filter((b) => b.userId !== targetUserId));
      router.refresh();
    } catch {
      setError("Failed to unban.");
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <p className="text-sm text-text-secondary">
        {members.length} {members.length === 1 ? "member" : "members"}
      </p>

      <div className="divide-y divide-border-primary rounded-lg border border-border-primary">
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const isLastAdmin = member.role === "ADMIN" && adminCount <= 1;

          return (
            <div
              key={member.userId}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Avatar */}
              {member.avatar ? (
                <Image
                  src={member.avatar}
                  alt={member.name || member.username}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-text-secondary font-bold">
                  {(member.name || member.username).charAt(0).toUpperCase()}
                </div>
              )}

              {/* User info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-bold text-text-primary">
                    {member.name || member.username}
                  </span>
                  <RoleBadge role={member.role} />
                  {isSelf && (
                    <span className="text-xs text-text-secondary">(you)</span>
                  )}
                </div>
                <span className="text-[13px] text-text-secondary">
                  @{member.username}
                </span>
              </div>

              {/* Actions */}
              {!isSelf && (
                <div className="flex items-center gap-2">
                  {/* Role dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === member.userId
                            ? null
                            : member.userId
                        )
                      }
                      disabled={updatingId === member.userId}
                      className="flex items-center gap-1 rounded-lg border border-border-primary px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-text-primary disabled:opacity-50"
                    >
                      {updatingId === member.userId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          Role
                          <ChevronDown size={12} />
                        </>
                      )}
                    </button>

                    {/* Dropdown menu */}
                    {openDropdown === member.userId && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdown(null)}
                        />
                        <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border-primary bg-bg-secondary shadow-lg">
                          {ROLE_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isActive = member.role === option.value;
                            const isDisabled =
                              option.value !== "ADMIN" &&
                              member.role === "ADMIN" &&
                              isLastAdmin;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                disabled={isActive || isDisabled}
                                onClick={() =>
                                  handleRoleChange(
                                    member.userId,
                                    option.value
                                  )
                                }
                                className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                                  isActive
                                    ? "bg-accent/10 text-accent"
                                    : isDisabled
                                    ? "cursor-not-allowed text-text-secondary/40"
                                    : "text-text-primary hover:bg-bg-tertiary"
                                }`}
                              >
                                <Icon size={14} />
                                <span>{option.label}</span>
                                {isActive && (
                                  <span className="ml-auto text-[10px] text-accent">
                                    current
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Kick button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(member.userId)}
                    disabled={removingId === member.userId || isLastAdmin}
                    title="Kick"
                    className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-yellow-500/10 hover:text-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {removingId === member.userId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                  </button>

                  {/* Ban button */}
                  <button
                    type="button"
                    onClick={() => handleBan(member.userId, member.name || member.username)}
                    disabled={banningId === member.userId || isLastAdmin}
                    title="Ban"
                    className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {banningId === member.userId ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Ban size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Banned Users */}
      {banned.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-danger mb-2 flex items-center gap-1.5">
            <Ban size={14} />
            Banned ({banned.length})
          </h3>
          <div className="divide-y divide-border-primary rounded-lg border border-danger/20">
            {banned.map((b) => (
              <div key={b.userId} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <span className="text-[15px] font-medium text-text-primary">
                    {b.name || b.username}
                  </span>
                  <span className="text-[13px] text-text-secondary ml-2">@{b.username}</span>
                  {b.reason && (
                    <p className="text-[12px] text-text-secondary mt-0.5">{b.reason}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleUnban(b.userId)}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Unban
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
