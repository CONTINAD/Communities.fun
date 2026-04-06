"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export default function NotificationBell() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const active = pathname.startsWith("/notifications");

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/count");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return (
    <Link
      href="/notifications"
      className={`flex items-center gap-5 py-3 px-4 rounded-full transition-colors text-xl hover:bg-bg-tertiary xl:justify-start justify-center relative ${
        active
          ? "font-bold text-text-primary"
          : "text-text-primary font-normal"
      }`}
    >
      <div className="relative">
        <Bell
          size={26}
          strokeWidth={active ? 2.5 : 1.75}
        />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-white text-[11px] font-bold px-1">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </div>
      <span className="hidden xl:inline">Notifications</span>
    </Link>
  );
}
