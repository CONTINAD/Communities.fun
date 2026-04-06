import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-8 w-8", text: "text-sm", px: 32 },
  md: { container: "h-10 w-10", text: "text-base", px: 40 },
  lg: { container: "h-12 w-12", text: "text-lg", px: 48 },
  xl: { container: "h-[120px] w-[120px]", text: "text-4xl", px: 120 },
};

export default function UserAvatar({
  src,
  alt,
  size = "md",
  className,
}: UserAvatarProps) {
  const { container, text, px } = sizeMap[size];
  const initial = alt?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={cn(
        "relative flex-shrink-0 overflow-hidden rounded-full bg-bg-secondary",
        container,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center font-bold text-text-secondary",
            text
          )}
        >
          {initial}
        </div>
      )}
    </div>
  );
}
