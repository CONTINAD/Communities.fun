import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as unknown as Record<string, string>).id;

  // Get the user's Twitter access token
  const account = await prisma.account.findFirst({
    where: { userId, provider: "twitter" },
  });

  if (!account?.access_token) {
    return NextResponse.json({ error: "No X account linked" }, { status: 400 });
  }

  const { text } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Tweet text required" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Twitter API error:", err);
      return NextResponse.json(
        { error: "Failed to post to X. You may need to re-link your account." },
        { status: 400 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, tweetId: data.data?.id });
  } catch {
    return NextResponse.json({ error: "Failed to post to X" }, { status: 500 });
  }
}
