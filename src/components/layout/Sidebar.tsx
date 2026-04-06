"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  Compass,
  Users,
  User,
  Bell,
  Plus,
  LogOut,
  MoreHorizontal,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Communities", href: "/communities", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const username = (session?.user as Record<string, string>)?.username || "user";
  const displayName = session?.user?.name || "User";
  const avatar = session?.user?.image;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/notifications/count")
      .then(r => r.json())
      .then(d => setUnreadCount(d.count || 0))
      .catch(() => {});

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetch("/api/notifications/count")
        .then(r => r.json())
        .then(d => setUnreadCount(d.count || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const profileHref = `/profile/${username}`;

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home" || pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden sm:flex fixed top-0 left-0 h-full border-r border-border-primary bg-bg-primary z-40 flex-col justify-between xl:w-[275px] w-[72px]">
      {/* Top section */}
      <div className="flex flex-col">
        {/* Logo */}
        <Link
          href="/home"
          className="flex items-center px-4 py-4 xl:px-6"
        >
          <span className="text-accent font-bold text-2xl xl:block hidden tracking-tight">
            Communities<span className="text-text-primary">.fun</span>
          </span>
          <span className="text-accent font-bold text-2xl xl:hidden">
            C<span className="text-text-primary">.</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 mt-2 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-5 py-3 px-4 rounded-full transition-colors text-xl hover:bg-bg-tertiary xl:justify-start justify-center ${
                  active
                    ? "font-bold text-text-primary"
                    : "text-text-primary font-normal"
                }`}
              >
                <Icon
                  size={26}
                  strokeWidth={active ? 2.5 : 1.75}
                />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* Notifications link */}
          <Link
            href="/notifications"
            className={`flex items-center gap-5 py-3 px-4 rounded-full transition-colors text-xl hover:bg-bg-tertiary xl:justify-start justify-center ${
              pathname.startsWith("/notifications")
                ? "font-bold text-text-primary"
                : "text-text-primary font-normal"
            }`}
          >
            <div className="relative">
              <Bell
                size={26}
                strokeWidth={pathname.startsWith("/notifications") ? 2.5 : 1.75}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span className="hidden xl:inline">Notifications</span>
          </Link>

          {/* Profile link */}
          <Link
            href={profileHref}
            className={`flex items-center gap-5 py-3 px-4 rounded-full transition-colors text-xl hover:bg-bg-tertiary xl:justify-start justify-center ${
              pathname.startsWith("/profile")
                ? "font-bold text-text-primary"
                : "text-text-primary font-normal"
            }`}
          >
            <User
              size={26}
              strokeWidth={pathname.startsWith("/profile") ? 2.5 : 1.75}
            />
            <span className="hidden xl:inline">Profile</span>
          </Link>

          {/* Settings link */}
          <Link
            href="/settings"
            className={`flex items-center gap-5 py-3 px-4 rounded-full transition-colors text-xl hover:bg-bg-tertiary xl:justify-start justify-center ${
              pathname.startsWith("/settings")
                ? "font-bold text-text-primary"
                : "text-text-primary font-normal"
            }`}
          >
            <Settings
              size={26}
              strokeWidth={pathname.startsWith("/settings") ? 2.5 : 1.75}
            />
            <span className="hidden xl:inline">Settings</span>
          </Link>
        </nav>

        {/* Create Community Button */}
        <div className="px-3 mt-6">
          <Link
            href="/communities/create"
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-full transition-colors xl:py-3 xl:px-6 py-3 px-3 text-lg"
          >
            <Plus size={22} className="xl:hidden" />
            <span className="hidden xl:inline">Create Community</span>
          </Link>
        </div>
      </div>

      {/* Bottom: User info */}
      {session?.user && (
        <div className="relative px-3 pb-4" ref={menuRef}>
          {/* User menu popover */}
          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-bg-primary rounded-2xl border border-border-primary shadow-[0_0_15px_rgba(255,255,255,0.05)] py-2 min-w-[200px]">
              <Link
                href={profileHref}
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary hover:bg-bg-tertiary transition-colors text-[15px]"
              >
                <User size={18} />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary hover:bg-bg-tertiary transition-colors text-[15px]"
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
              <div className="my-1 border-t border-border-primary" />
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary hover:bg-bg-tertiary hover:text-danger transition-colors text-[15px]"
              >
                <LogOut size={18} />
                <span>Log out @{username}</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 w-full p-3 rounded-full hover:bg-bg-tertiary transition-colors xl:justify-between justify-center"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-bg-secondary flex-shrink-0 overflow-hidden">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and username */}
              <div className="hidden xl:flex flex-col items-start leading-tight">
                <span className="text-text-primary font-bold text-[15px] truncate max-w-[120px]">
                  {displayName}
                </span>
                <span className="text-text-secondary text-[13px] truncate max-w-[120px]">
                  @{username}
                </span>
              </div>
            </div>

            <MoreHorizontal
              size={18}
              className="text-text-secondary hidden xl:block flex-shrink-0"
            />
          </button>
        </div>
      )}
    </aside>
  );
}
