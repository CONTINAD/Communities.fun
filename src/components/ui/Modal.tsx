"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode, useCallback, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/20 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-bg-primary shadow-xl",
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-bg-secondary"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-text-primary" />
            </button>
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
