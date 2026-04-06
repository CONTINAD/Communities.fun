"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LinkXButton({ isLinked }: { isLinked: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleLink() {
    setLoading(true);
    await signIn("twitter", { callbackUrl: "/settings" });
  }

  if (isLinked) {
    return (
      <span className="text-[13px] font-medium text-success bg-success/10 rounded-full px-3 py-1">
        Linked
      </span>
    );
  }

  return (
    <button
      onClick={handleLink}
      disabled={loading}
      className="text-[13px] font-bold text-text-primary bg-text-primary/10 hover:bg-text-primary/20 rounded-full px-4 py-1.5 transition-colors disabled:opacity-50"
    >
      {loading ? "Connecting..." : "Link"}
    </button>
  );
}
