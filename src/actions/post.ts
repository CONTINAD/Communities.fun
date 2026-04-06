"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { createNotification } from "@/actions/notification";

export async function createPost(formData: FormData) {
  const user = await requireAuth();

  const content = formData.get("content") as string;
  const communityId = formData.get("communityId") as string;
  const image = formData.get("image") as string;

  if (!content?.trim()) {
    return { error: "Post content is required" };
  }

  if (!communityId) {
    return { error: "Community is required" };
  }

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!membership) {
    return { error: "You must be a member to post" };
  }

  const community = await prisma.community.findUnique({
    where: { id: communityId },
  });

  const post = await prisma.post.create({
    data: {
      content: content.trim(),
      image: image || null,
      authorId: user.id,
      communityId,
    },
  });

  if (community) {
    revalidatePath(`/communities/${community.slug}`);
  }
  revalidatePath("/home");
  return { success: true, postId: post.id };
}

export async function deletePost(postId: string) {
  const user = await requireAuth();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { community: true },
  });

  if (!post) return { error: "Post not found" };

  const isAuthor = post.authorId === user.id;
  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId: post.communityId } },
  });
  const isMod = membership?.role === "ADMIN" || membership?.role === "MODERATOR";

  if (!isAuthor && !isMod) {
    return { error: "Insufficient permissions" };
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath(`/communities/${post.community.slug}`);
  revalidatePath("/home");
  return { success: true };
}

export async function likePost(postId: string) {
  const user = await requireAuth();

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { userId_postId: { userId: user.id, postId } },
    });
  } else {
    await prisma.like.create({
      data: { userId: user.id, postId },
    });

    // Notify post author about the like
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { community: { select: { slug: true } } },
    });
    if (post && post.authorId !== user.id) {
      await createNotification(
        post.authorId,
        "like",
        `${user.name || user.username} liked your post`,
        `/post/${postId}`
      );
    }
  }

  revalidatePath("/");
  return { success: true, liked: !existing };
}

export async function createReply(formData: FormData) {
  const user = await requireAuth();

  const content = formData.get("content") as string;
  const parentId = formData.get("parentId") as string;

  if (!content?.trim()) {
    return { error: "Reply content is required" };
  }

  const parent = await prisma.post.findUnique({
    where: { id: parentId },
    include: { community: true },
  });

  if (!parent) return { error: "Post not found" };

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId: parent.communityId } },
  });

  if (!membership) {
    return { error: "You must be a member to reply" };
  }

  await prisma.post.create({
    data: {
      content: content.trim(),
      authorId: user.id,
      communityId: parent.communityId,
      parentId,
    },
  });

  // Notify parent post author about the reply
  if (parent.authorId !== user.id) {
    await createNotification(
      parent.authorId,
      "reply",
      `${user.name || user.username} replied to your post`,
      `/post/${parentId}`
    );
  }

  revalidatePath(`/post/${parentId}`);
  revalidatePath(`/communities/${parent.community.slug}`);
  return { success: true };
}

export async function repost(postId: string, communityId: string) {
  const user = await requireAuth();

  const membership = await prisma.communityMember.findUnique({
    where: { userId_communityId: { userId: user.id, communityId } },
  });

  if (!membership) {
    return { error: "You must be a member to repost" };
  }

  const existing = await prisma.post.findFirst({
    where: { authorId: user.id, repostOfId: postId },
  });

  if (existing) {
    await prisma.post.delete({ where: { id: existing.id } });
    revalidatePath("/");
    return { success: true, reposted: false };
  }

  await prisma.post.create({
    data: {
      content: "",
      authorId: user.id,
      communityId,
      repostOfId: postId,
    },
  });

  // Notify original post author about the repost
  const originalPost = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (originalPost && originalPost.authorId !== user.id) {
    await createNotification(
      originalPost.authorId,
      "repost",
      `${user.name || user.username} reposted your post`,
      `/post/${postId}`
    );
  }

  revalidatePath("/");
  return { success: true, reposted: true };
}
