"use client";

import { Calendar, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatCount } from "@/lib/utils";
import Button from "@/components/ui/Button";
import UserAvatar from "./UserAvatar";
import ProfileEditForm from "./ProfileEditForm";

interface ProfileUser {
  id: string;
  name: string | null;
  username: string;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  joinDate: Date | string;
}

interface ProfileHeaderProps {
  user: ProfileUser;
  postCount: number;
  communityCount: number;
  isOwnProfile: boolean;
}

export default function ProfileHeader({
  user,
  postCount,
  communityCount,
  isOwnProfile,
}: ProfileHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const joinDate = new Date(user.joinDate);
  const joinLabel = joinDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div>
        {/* Cover image */}
        <div className="relative h-[200px] w-full bg-gradient-to-br from-bg-secondary to-bg-tertiary">
          {user.coverImage && (
            <Image
              src={user.coverImage}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Avatar + Edit button row */}
        <div className="flex items-start justify-between px-4">
          <div className="-mt-16">
            <UserAvatar
              src={user.avatar}
              alt={user.name || user.username}
              size="xl"
              className="border-4 border-bg-primary"
            />
          </div>

          {isOwnProfile && (
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                Edit profile
              </Button>
            </div>
          )}
        </div>

        {/* User info */}
        <div className="mt-3 px-4 pb-4">
          <h1 className="text-xl font-bold text-text-primary">
            {user.name || user.username}
          </h1>
          <p className="text-text-secondary">@{user.username}</p>

          {user.bio && (
            <p className="mt-3 whitespace-pre-wrap text-text-primary">
              {user.bio}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {joinLabel}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {formatCount(communityCount)}{" "}
              {communityCount === 1 ? "Community" : "Communities"}
            </span>
          </div>

          <div className="mt-3 flex gap-4 text-sm">
            <span className="text-text-secondary">
              <span className="font-bold text-text-primary">
                {formatCount(postCount)}
              </span>{" "}
              {postCount === 1 ? "Post" : "Posts"}
            </span>
          </div>
        </div>

        {/* Bottom border */}
        <div className="border-b border-border-primary" />
      </div>

      {/* Edit profile modal */}
      {showEditModal && (
        <ProfileEditForm
          user={user}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
