import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ count: 0 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  if (!userId) {
    return NextResponse.json({ count: 0 });
  }

  const count = await prisma.notification.count({
    where: { userId, read: false },
  });

  return NextResponse.json({ count });
}
