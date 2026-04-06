"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut({ callbackUrl: "/sign-in" });
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-full bg-danger px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
    >
      <LogOut size={18} />
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
