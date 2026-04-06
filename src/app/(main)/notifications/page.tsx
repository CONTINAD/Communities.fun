import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, UserPlus, Repeat2, Bell } from "lucide-react";
import MarkAllReadButton from "./MarkAllReadButton";

const typeIcons: Record<string, typeof Heart> = {
  like: Heart,
  reply: MessageCircle,
  member_join: UserPlus,
  repost: Repeat2,
};

const typeColors: Record<string, string> = {
  like: "text-danger",
  reply: "text-accent",
  member_join: "text-green-500",
  repost: "text-green-500",
};

export default async function NotificationsPage() {
  const user = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg-primary/80 backdrop-blur-md border-b border-border-primary px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Bell size={48} className="text-text-secondary mb-4" />
          <h3 className="text-text-primary text-xl font-bold mb-2">
            No notifications yet
          </h3>
          <p className="text-text-secondary text-[15px] text-center max-w-sm">
            When someone interacts with your posts or communities, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notif) => {
            const Icon = typeIcons[notif.type] || Bell;
            const iconColor = typeColors[notif.type] || "text-text-secondary";

            const content = (
              <div
                className={`flex items-start gap-3 px-4 py-3 border-b border-border-primary transition-colors hover:bg-bg-tertiary ${
                  !notif.read ? "bg-bg-secondary" : ""
                }`}
              >
                <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-text-primary text-[15px] leading-snug">
                      {notif.message}
                    </p>
                    {!notif.read && (
                      <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <p className="text-text-secondary text-[13px] mt-0.5">
                    {formatDate(notif.createdAt)}
                  </p>
                </div>
              </div>
            );

            if (notif.link) {
              return (
                <Link key={notif.id} href={notif.link} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={notif.id}>{content}</div>;
          })}
        </div>
      )}
    </div>
  );
}
