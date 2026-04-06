import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";
import { Heart, MessageCircle, UserPlus, Repeat2, Bell } from "lucide-react";
import MarkAllReadButton from "./MarkAllReadButton";
import { markRead } from "@/actions/notification";

const typeIcons: Record<string, typeof Heart> = {
  like: Heart,
  reply: MessageCircle,
  member_join: UserPlus,
  follow: UserPlus,
  repost: Repeat2,
};

const typeBadgeColors: Record<string, string> = {
  like: "bg-pink-500",
  reply: "bg-blue-500",
  member_join: "bg-green-500",
  follow: "bg-blue-500",
  repost: "bg-green-500",
};

function ActorAvatar({
  avatar,
  name,
  type,
}: {
  avatar: string | null;
  name: string | null;
  type: string;
}) {
  const Icon = typeIcons[type] || Bell;
  const badgeColor = typeBadgeColors[type] || "bg-gray-500";

  return (
    <div className="relative flex-shrink-0">
      {avatar ? (
        <Image
          src={avatar}
          alt={name || ""}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary font-bold text-sm">
          {(name || "?")[0]?.toUpperCase()}
        </div>
      )}
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full ${badgeColor} flex items-center justify-center ring-2 ring-bg-primary`}
      >
        <Icon size={10} className="text-white" />
      </div>
    </div>
  );
}

export default async function NotificationsPage() {
  const user = await requireAuth();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
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
            When someone interacts with your posts or communities, you&apos;ll
            see it here.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notif) => {
            const actorName = notif.actorName || null;
            const actorAvatar = notif.actorAvatar || null;

            // Parse message to bold the actor name
            let messageContent;
            if (actorName && notif.message.startsWith(actorName)) {
              const rest = notif.message.slice(actorName.length);
              messageContent = (
                <span className="text-[15px] leading-snug">
                  <span className="font-bold text-text-primary">
                    {actorName}
                  </span>
                  <span className="text-text-secondary">{rest}</span>
                </span>
              );
            } else {
              messageContent = (
                <span className="text-text-primary text-[15px] leading-snug">
                  {notif.message}
                </span>
              );
            }

            const inner = (
              <div
                className={`flex items-center gap-3 px-4 py-3 border-b border-border-primary transition-colors hover:bg-bg-tertiary ${
                  !notif.read
                    ? "bg-accent/5 border-l-2 border-l-accent"
                    : "border-l-2 border-l-transparent"
                }`}
              >
                <ActorAvatar
                  avatar={actorAvatar}
                  name={actorName}
                  type={notif.type}
                />
                <div className="flex-1 min-w-0">
                  {messageContent}
                </div>
                <span className="text-text-secondary text-[13px] flex-shrink-0">
                  {formatDate(notif.createdAt)}
                </span>
              </div>
            );

            if (notif.link) {
              return (
                <form
                  key={notif.id}
                  action={async () => {
                    "use server";
                    if (!notif.read) {
                      await markRead(notif.id);
                    }
                  }}
                >
                  <Link href={notif.link} className="block">
                    <button type="submit" className="w-full text-left">
                      {inner}
                    </button>
                  </Link>
                </form>
              );
            }

            return <div key={notif.id}>{inner}</div>;
          })}
        </div>
      )}
    </div>
  );
}
