"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function toggleBookmark(postId: string) {
  const user = await requireAuth();

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_postId: { userId: user.id, postId } },
    });
    return { success: true, bookmarked: false };
  }

  await prisma.bookmark.create({
    data: { userId: user.id, postId },
  });

  return { success: true, bookmarked: true };
}
