"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { createNotification } from "@/actions/notification";

export async function toggleFollow(targetUserId: string) {
  const user = await requireAuth();

  if (user.id === targetUserId) {
    return { error: "Cannot follow yourself" };
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId: user.id, followingId: targetUserId } },
    });
    return { success: true, following: false };
  }

  await prisma.follow.create({
    data: { followerId: user.id, followingId: targetUserId },
  });

  // Notify the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true },
  });

  await createNotification(
    targetUserId,
    "follow",
    `${user.name || user.username} followed you`,
    `/profile/${user.username}`,
    { id: user.id, name: user.name || user.username, avatar: user.avatar || user.image }
  );

  revalidatePath(`/profile/${targetUser?.username}`);
  return { success: true, following: true };
}
