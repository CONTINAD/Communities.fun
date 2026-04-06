"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;
  const avatar = formData.get("avatar") as string;
  const coverImage = formData.get("coverImage") as string;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name || undefined,
      bio: bio !== null ? bio : undefined,
      avatar: avatar || undefined,
      coverImage: coverImage || undefined,
    },
  });

  revalidatePath(`/profile/${user.username}`);
  return { success: true };
}
