import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/auth/SignOutButton";
import LinkXButton from "@/components/auth/LinkXButton";

export default async function SettingsPage() {
  const user = await requireAuth();

  // Check if user has a linked X account
  const xAccount = await prisma.account.findFirst({
    where: { userId: user.id, provider: "twitter" },
  });

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3">
        <Link
          href="/home"
          className="rounded-full p-1.5 transition-colors hover:bg-bg-tertiary"
        >
          <ArrowLeft size={20} className="text-text-primary" />
        </Link>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
      </div>

      <div className="divide-y divide-border-primary">
        {/* Account Section */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Email
              </label>
              <p className="text-[15px] text-text-primary rounded-md border border-border-primary bg-bg-secondary px-3 py-2">
                {user.email}
              </p>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">
                Username
              </label>
              <p className="text-[15px] text-text-primary rounded-md border border-border-primary bg-bg-secondary px-3 py-2">
                @{user.username}
              </p>
            </div>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-text-primary mb-2">Connected Accounts</h2>
          <p className="text-[13px] text-text-secondary mb-4">
            Link your X account to sign in faster and import your profile.
          </p>

          <div className="rounded-lg border border-border-primary bg-bg-secondary overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-tertiary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-medium text-text-primary">X (Twitter)</p>
                  {xAccount ? (
                    <p className="text-[13px] text-success">Connected</p>
                  ) : (
                    <p className="text-[13px] text-text-secondary">Not connected</p>
                  )}
                </div>
              </div>
              <LinkXButton isLinked={!!xAccount} />
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Profile</h2>
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center justify-between rounded-lg border border-border-primary bg-bg-secondary px-4 py-3 transition-colors hover:bg-bg-tertiary"
          >
            <div>
              <p className="text-[15px] font-medium text-text-primary">
                Edit profile
              </p>
              <p className="text-[13px] text-text-secondary">
                Update your name, bio, avatar, and cover image
              </p>
            </div>
            <ChevronRight size={20} className="text-text-secondary" />
          </Link>
        </div>

        {/* Sign Out Section */}
        <div className="px-4 py-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Sign Out
          </h2>
          <p className="text-[13px] text-text-secondary mb-4">
            You will be redirected to the sign in page.
          </p>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
