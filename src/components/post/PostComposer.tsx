"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { createPost } from "@/actions/post";

interface PostComposerProps {
  communityId: string;
  userAvatar?: string | null;
  userName?: string | null;
}

const MAX_CHARS = 280;

export default function PostComposer({
  communityId,
  userAvatar,
  userName,
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charsRemaining = MAX_CHARS - content.length;
  const isOverLimit = charsRemaining < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !isPosting && !uploading;

  function autoResize() {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        setImagePreview(null);
        setImageUrl(null);
      }
    } catch {
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit() {
    if (!canPost) return;
    setIsPosting(true);

    const formData = new FormData();
    formData.set("content", content.trim());
    formData.set("communityId", communityId);
    if (imageUrl) {
      formData.set("image", imageUrl);
    }

    try {
      const result = await createPost(formData);
      if (result.success) {
        setContent("");
        setImagePreview(null);
        setImageUrl(null);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } finally {
      setIsPosting(false);
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
                alt={userName || ""}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm font-bold">
                {(userName || "?")[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              autoResize();
            }}
            placeholder="What's happening?"
            className="w-full bg-transparent text-text-primary text-xl placeholder:text-text-secondary outline-none resize-none min-h-[52px] leading-normal"
            rows={1}
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-3 rounded-xl overflow-hidden border border-border-primary">
              <Image
                src={imagePreview}
                alt="Upload preview"
                width={600}
                height={400}
                className="w-full max-h-[300px] object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-bg-primary/60 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-accent" />
                </div>
              )}
              {!uploading && (
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-bg-primary/75 backdrop-blur-sm rounded-full p-1.5 text-text-primary hover:bg-bg-primary transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {/* Bottom bar */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-primary">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-full p-2 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span
                  className={`text-sm ${
                    isOverLimit
                      ? "text-danger"
                      : charsRemaining <= 20
                      ? "text-yellow-500"
                      : "text-text-secondary"
                  }`}
                >
                  {charsRemaining}
                </span>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canPost}
                className="bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-5 py-1.5 text-[15px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
