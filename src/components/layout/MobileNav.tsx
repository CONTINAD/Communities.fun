"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Compass, Users, Bell, User } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const username = (session?.user as Record<string, string>)?.username || "user";

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/communities", icon: Users, label: "Communities" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: `/profile/${username}`, icon: User, label: "Profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home" || pathname === "/";
    if (href.startsWith("/profile")) return pathname.startsWith("/profile");
    return pathname.startsWith(href);
  };

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-bg-primary border-t border-border-primary z-50">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-center flex-1 h-full transition-colors"
              aria-label={item.label}
            >
              <Icon
                size={26}
                strokeWidth={active ? 2.5 : 1.75}
                className={active ? "text-text-primary" : "text-text-secondary"}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
