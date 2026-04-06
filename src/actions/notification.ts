"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const user = await requireAuth();
  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function getUnreadCount() {
  const user = await requireAuth();
  return prisma.notification.count({
    where: { userId: user.id, read: false },
  });
}

export async function markAllRead() {
  const user = await requireAuth();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/notifications");
  return { success: true };
}

export async function markRead(id: string) {
  const user = await requireAuth();
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (notif?.userId !== user.id) return { error: "Not found" };
  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  return { success: true };
}

// Helper to create notifications (called from other actions)
export async function createNotification(
  userId: string,
  type: string,
  message: string,
  link?: string
) {
  await prisma.notification.create({
    data: { userId, type, message, link },
  });
}
