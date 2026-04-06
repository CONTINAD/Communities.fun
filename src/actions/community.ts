"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";
import { createNotification } from "@/actions/notification";

export async function createCommunity(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const avatar = formData.get("avatar") as string;
  const coverImage = formData.get("coverImage") as string;
  const contractAddress = formData.get("contractAddress") as string;
  const website = formData.get("website") as string;
  const twitter = formData.get("twitter") as string;
  const telegram = formData.get("telegram") as string;
  const dexscreener = formData.get("dexscreener") as string;

  if (!name || name.length < 2) {
    return { error: "Community name must be at least 2 characters" };
  }

  let slug = slugify(name);

  const existing = await prisma.community.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const community = await prisma.community.create({
    data: {
      name,
      slug,
      description: description || null,
      avatar: avatar || null,
      coverImage: coverImage || null,
      contractAddress: contractAddress || null,
      website: website || null,
      twitter: twitter || null,
      telegram: telegram || null,
      dexscreener: dexscreener || null,
      creatorId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/communities");
  revalidatePath("/explore");

  return { success: true, slug: community.slug };
}

export async function updateCommunity(communityId: string, formData: FormData) {
  const user = await requireAuth();

  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!member || member.role !== "ADMIN") {
    return { error: "Only admins can edit community settings" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const avatar = formData.get("avatar") as string;
  const coverImage = formData.get("coverImage") as string;
  const contractAddress = formData.get("contractAddress") as string;
  const website = formData.get("website") as string;
  const twitter = formData.get("twitter") as string;
  const telegram = formData.get("telegram") as string;
  const dexscreener = formData.get("dexscreener") as string;

  const community = await prisma.community.update({
    where: { id: communityId },
    data: {
      name: name || undefined,
      description: description !== null ? description : undefined,
      avatar: avatar || undefined,
      coverImage: coverImage || undefined,
      contractAddress: contractAddress !== null ? contractAddress : undefined,
      website: website !== null ? website : undefined,
      twitter: twitter !== null ? twitter : undefined,
      telegram: telegram !== null ? telegram : undefined,
      dexscreener: dexscreener !== null ? dexscreener : undefined,
    },
  });

  revalidatePath(`/communities/${community.slug}`);
  revalidatePath(`/communities/${community.slug}/about`);
  revalidatePath(`/communities/${community.slug}/settings`);
  return { success: true };
}

export async function joinCommunity(communityId: string) {
  const user = await requireAuth();

  const existing = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (existing) {
    return { error: "Already a member" };
  }

  await prisma.communityMember.create({
    data: {
      userId: user.id,
      communityId,
      role: "MEMBER",
    },
  });

  // Notify community creator about the new member
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { creatorId: true, slug: true, name: true },
  });
  if (community && community.creatorId !== user.id) {
    await createNotification(
      community.creatorId,
      "member_join",
      `${user.name || user.username} joined ${community.name}`,
      `/communities/${community.slug}`
    );
  }

  revalidatePath("/communities");
  revalidatePath("/explore");
  return { success: true };
}

export async function leaveCommunity(communityId: string) {
  const user = await requireAuth();

  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!member) {
    return { error: "Not a member" };
  }

  if (member.role === "ADMIN") {
    const adminCount = await prisma.communityMember.count({
      where: { communityId, role: "ADMIN" },
    });
    if (adminCount <= 1) {
      return { error: "Cannot leave - you are the only admin. Transfer ownership first." };
    }
  }

  await prisma.communityMember.delete({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  revalidatePath("/communities");
  revalidatePath("/explore");
  return { success: true };
}

export async function updateMemberRole(
  communityId: string,
  targetUserId: string,
  newRole: string
) {
  const user = await requireAuth();

  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!member || member.role !== "ADMIN") {
    return { error: "Only admins can change roles" };
  }

  await prisma.communityMember.update({
    where: { userId_communityId: { userId: targetUserId, communityId } },
    data: { role: newRole },
  });

  revalidatePath(`/communities`);
  return { success: true };
}

export async function addRule(communityId: string, title: string, description: string) {
  const user = await requireAuth();

  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!member || member.role !== "ADMIN") {
    return { error: "Only admins can manage rules" };
  }

  const maxOrder = await prisma.communityRule.findFirst({
    where: { communityId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.communityRule.create({
    data: {
      communityId,
      title,
      description,
      order: (maxOrder?.order ?? 0) + 1,
    },
  });

  revalidatePath(`/communities`);
  return { success: true };
}

export async function deleteRule(ruleId: string, communityId: string) {
  const user = await requireAuth();

  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!member || member.role !== "ADMIN") {
    return { error: "Only admins can manage rules" };
  }

  await prisma.communityRule.delete({ where: { id: ruleId } });

  revalidatePath(`/communities`);
  return { success: true };
}

export async function removeMember(communityId: string, targetUserId: string) {
  const user = await requireAuth();

  const member = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!member || (member.role !== "ADMIN" && member.role !== "MODERATOR")) {
    return { error: "Insufficient permissions" };
  }

  await prisma.communityMember.delete({
    where: { userId_communityId: { userId: targetUserId, communityId } },
  });

  revalidatePath(`/communities`);
  return { success: true };
}
