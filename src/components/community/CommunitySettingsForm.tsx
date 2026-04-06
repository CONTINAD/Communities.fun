"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCommunity } from "@/actions/community";
import { Loader2, Check } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface CommunitySettingsFormProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatar: string | null;
    coverImage: string | null;
    contractAddress: string | null;
    website: string | null;
    twitter: string | null;
    telegram: string | null;
    dexscreener: string | null;
  };
}

export default function CommunitySettingsForm({
  community,
}: CommunitySettingsFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await updateCommunity(community.id, formData);

      if ("error" in result && result.error) {
        setError(result.error);
        setIsPending(false);
        return;
      }

      setSuccess(true);
      setIsPending(false);
      router.refresh();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-500">
          <Check size={16} />
          Changes saved successfully.
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="settings-name"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          id="settings-name"
          name="name"
          required
          minLength={2}
          maxLength={50}
          defaultValue={community.name}
          placeholder="Community name"
          className="w-full rounded-lg border border-border-primary bg-bg-primary px-4 py-3 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="settings-description"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Description
        </label>
        <textarea
          id="settings-description"
          name="description"
          rows={3}
          maxLength={280}
          defaultValue={community.description || ""}
          placeholder="What is this community about?"
          className="w-full resize-none rounded-lg border border-border-primary bg-bg-primary px-4 py-3 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
        />
      </div>

      {/* Contract Address */}
      <div>
        <label
          htmlFor="settings-ca"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Contract Address (CA)
        </label>
        <input
          type="text"
          id="settings-ca"
          name="contractAddress"
          defaultValue={community.contractAddress || ""}
          placeholder="0x... or paste your contract address"
          maxLength={100}
          className="w-full rounded-lg border border-border-primary bg-bg-primary px-4 py-3 font-mono text-sm text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
        />
        <p className="mt-1.5 text-xs text-text-secondary">
          Token or project contract address. Displayed on your community page.
        </p>
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Links
        </label>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-secondary border border-border-primary text-text-secondary shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </div>
          <input
            type="text"
            name="twitter"
            defaultValue={community.twitter || ""}
            placeholder="X username or full URL"
            className="flex-1 rounded-lg border border-border-primary bg-bg-primary px-4 py-2.5 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-secondary border border-border-primary text-text-secondary shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
          </div>
          <input
            type="text"
            name="telegram"
            defaultValue={community.telegram || ""}
            placeholder="Telegram group or username"
            className="flex-1 rounded-lg border border-border-primary bg-bg-primary px-4 py-2.5 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-secondary border border-border-primary text-text-secondary shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <input
            type="text"
            name="website"
            defaultValue={community.website || ""}
            placeholder="Website URL"
            className="flex-1 rounded-lg border border-border-primary bg-bg-primary px-4 py-2.5 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-bg-secondary border border-border-primary text-[#4ADE80] shrink-0">
            <svg width="14" height="14" viewBox="0 0 252 300" fill="currentColor"><path d="M151.818 106.866c9.177-4.576 20.854-11.312 32.545-20.541 2.465 5.119 2.735 9.586 1.465 13.193-.9 2.542-2.596 4.753-4.826 6.512-2.415 1.901-5.431 3.285-8.765 4.033-6.326 1.425-13.712.593-20.419-3.197m1.591 46.886l12.148 7.017c-24.804 13.902-31.547 39.716-39.557 64.859-8.009-25.143-14.753-50.957-39.556-64.859l12.148-7.017a5.95 5.95 0 003.84-5.845c-1.113-23.547 5.245-33.96 13.821-40.249 3.898-2.861 7.924-4.75 11.747-5.856 3.823 1.106 7.849 2.995 11.747 5.856 8.577 6.289 14.934 16.702 13.821 40.249a5.95 5.95 0 003.841 5.845zM126 0c14.042.377 28.119 3.103 40.336 8.406 8.46 3.677 16.354 8.534 22.545 14.832 6.191 6.298 10.706 13.976 11.862 23.0 1.193 9.273-1.313 17.01-5.553 23.036-4.241 6.025-10.142 10.414-16.289 13.678-12.194 6.465-25.757 9.263-34.202 10.665 5.89 3.805 11.854 9.479 15.785 19.085 3.93 9.606 5.812 23.052 3.669 42.04L152 165.707l-7.263-4.194c-22.7 12.63-29.883 34.94-37.49 57.633-.053.16-.108.32-.162.481a.554.554 0 01-1.09-.012L69.263 161.513 57.847 155.66c-2.143-18.988-.261-32.434 3.669-42.04 3.931-9.606 9.895-15.28 15.785-19.085-8.445-1.402-22.008-4.2-34.202-10.665-6.147-3.264-12.048-7.653-16.289-13.678C22.57 64.167 20.064 56.43 21.257 47.157c1.156-9.024 5.671-16.702 11.862-23 6.191-6.298 14.085-11.155 22.545-14.832C67.881 3.48 81.958.754 96 .377a253 253 0 0130 0z"/></svg>
          </div>
          <input
            type="text"
            name="dexscreener"
            defaultValue={community.dexscreener || ""}
            placeholder="DexScreener URL or pair address"
            className="flex-1 rounded-lg border border-border-primary bg-bg-primary px-4 py-2.5 text-[15px] text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Images */}
      <div className="flex gap-6">
        <ImageUpload
          name="avatar"
          label="Avatar"
          shape="circle"
          currentImage={community.avatar}
        />
        <ImageUpload
          name="coverImage"
          label="Cover Image"
          shape="banner"
          currentImage={community.coverImage}
          className="flex-1"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-accent px-6 py-2.5 text-[15px] font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </span>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
