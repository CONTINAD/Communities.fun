"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function togglePinPost(postId: string) {
  const user = await requireAuth();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { community: true },
  });

  if (!post) return { error: "Post not found" };

  // Only community admins can pin
  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId: post.communityId } },
  });

  if (!membership || membership.role !== "ADMIN") {
    return { error: "Only admins can pin posts" };
  }

  // If pinning, unpin any other pinned post in this community first
  if (!post.pinned) {
    await prisma.post.updateMany({
      where: { communityId: post.communityId, pinned: true },
      data: { pinned: false },
    });
  }

  await prisma.post.update({
    where: { id: postId },
    data: { pinned: !post.pinned },
  });

  revalidatePath(`/communities/${post.community.slug}`);
  return { success: true, pinned: !post.pinned };
}
