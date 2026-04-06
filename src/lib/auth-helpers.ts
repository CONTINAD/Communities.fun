import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  // Try by ID first (works for OAuth users), fall back to email
  const userId = (session.user as Record<string, unknown>).id as string;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }

  if (session.user.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) return user;
  }

  return null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}
