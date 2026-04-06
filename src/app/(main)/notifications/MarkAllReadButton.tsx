"use client";

import { useState } from "react";
import { markAllRead } from "@/actions/notification";

export default function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await markAllRead();
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-accent hover:text-accent-hover text-[15px] font-bold transition-colors disabled:opacity-50"
    >
      {loading ? "Marking..." : "Mark all read"}
    </button>
  );
}
