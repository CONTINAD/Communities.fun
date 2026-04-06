import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth-helpers";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function SettingsPage() {
  const user = await requireAuth();

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
