"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createReply } from "@/actions/post";

interface ReplyThreadProps {
  postId: string;
  userAvatar?: string | null;
}

export default function ReplyThread({ postId, userAvatar }: ReplyThreadProps) {
  const [content, setContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canReply = content.trim().length > 0 && !isReplying;

  function autoResize() {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  async function handleSubmit() {
    if (!canReply) return;
    setIsReplying(true);

    const formData = new FormData();
    formData.set("content", content.trim());
    formData.set("parentId", postId);

    try {
      const result = await createReply(formData);
      if (result.success) {
        setContent("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } finally {
      setIsReplying(false);
    }
  }

  return (
    <div className="border-b border-border-primary px-4 py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-tertiary">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt="Your avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm font-bold">
                ?
              </div>
            )}
          </div>
        </div>

        {/* Reply area */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              autoResize();
            }}
            placeholder="Post your reply"
            className="w-full bg-transparent text-text-primary text-xl placeholder:text-text-secondary outline-none resize-none min-h-[52px] leading-normal"
            rows={1}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={!canReply}
              className="bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-5 py-1.5 text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReplying ? "Replying..." : "Reply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
