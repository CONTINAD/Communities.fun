"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

// Custom SVG icons matching DexScreener style
function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function DexScreenerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 252 300" fill="currentColor">
      <path d="M151.818 106.866c9.177-4.576 20.854-11.312 32.545-20.541 2.465 5.119 2.735 9.586 1.465 13.193-.9 2.542-2.596 4.753-4.826 6.512-2.415 1.901-5.431 3.285-8.765 4.033-6.326 1.425-13.712.593-20.419-3.197m1.591 46.886l12.148 7.017c-24.804 13.902-31.547 39.716-39.557 64.859-8.009-25.143-14.753-50.957-39.556-64.859l12.148-7.017a5.95 5.95 0 003.84-5.845c-1.113-23.547 5.245-33.96 13.821-40.249 3.898-2.861 7.924-4.75 11.747-5.856 3.823 1.106 7.849 2.995 11.747 5.856 8.577 6.289 14.934 16.702 13.821 40.249a5.95 5.95 0 003.841 5.845zM126 0c14.042.377 28.119 3.103 40.336 8.406 8.46 3.677 16.354 8.534 22.545 14.832 6.191 6.298 10.706 13.976 11.862 23.0 1.193 9.273-1.313 17.01-5.553 23.036-4.241 6.025-10.142 10.414-16.289 13.678-12.194 6.465-25.757 9.263-34.202 10.665 5.89 3.805 11.854 9.479 15.785 19.085 3.93 9.606 5.812 23.052 3.669 42.04L152 165.707l-7.263-4.194c-22.7 12.63-29.883 34.94-37.49 57.633-.053.16-.108.32-.162.481a.554.554 0 01-1.09-.012L69.263 161.513 57.847 155.66c-2.143-18.988-.261-32.434 3.669-42.04 3.931-9.606 9.895-15.28 15.785-19.085-8.445-1.402-22.008-4.2-34.202-10.665-6.147-3.264-12.048-7.653-16.289-13.678C22.57 64.167 20.064 56.43 21.257 47.157c1.156-9.024 5.671-16.702 11.862-23 6.191-6.298 14.085-11.155 22.545-14.832C67.881 3.48 81.958.754 96 .377a253 253 0 0130 0z" />
    </svg>
  );
}

interface SocialLinksProps {
  contractAddress?: string | null;
  website?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  dexscreener?: string | null;
}

export default function SocialLinks({
  contractAddress,
  website,
  twitter,
  telegram,
  dexscreener,
}: SocialLinksProps) {
  const [copied, setCopied] = useState(false);

  const hasAnyLink = contractAddress || website || twitter || telegram || dexscreener;
  if (!hasAnyLink) return null;

  async function handleCopyCA() {
    if (!contractAddress) return;
    await navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shortCA = contractAddress
    ? contractAddress.length > 12
      ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`
      : contractAddress
    : null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {/* CA badge */}
      {contractAddress && (
        <button
          onClick={handleCopyCA}
          className="flex items-center gap-1.5 rounded-lg bg-bg-secondary border border-border-primary px-2.5 py-1.5 text-[13px] font-mono text-text-secondary hover:border-accent hover:text-accent transition-colors group"
          title="Copy contract address"
        >
          <span className="text-[10px] font-sans font-bold text-text-secondary/60 uppercase tracking-wider">CA</span>
          <span className="text-text-primary group-hover:text-accent transition-colors">{shortCA}</span>
          {copied ? (
            <Check size={12} className="text-success" />
          ) : (
            <Copy size={12} />
          )}
        </button>
      )}

      {/* Social icon buttons */}
      {website && (
        <a
          href={website.startsWith("http") ? website : `https://${website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg bg-bg-secondary border border-border-primary w-8 h-8 text-text-secondary hover:border-accent hover:text-accent transition-colors"
          title="Website"
        >
          <GlobeIcon size={15} />
        </a>
      )}

      {twitter && (
        <a
          href={
            twitter.startsWith("http")
              ? twitter
              : `https://x.com/${twitter.replace("@", "")}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg bg-bg-secondary border border-border-primary w-8 h-8 text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors"
          title="X (Twitter)"
        >
          <XIcon size={14} />
        </a>
      )}

      {telegram && (
        <a
          href={
            telegram.startsWith("http")
              ? telegram
              : `https://t.me/${telegram.replace("@", "")}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg bg-bg-secondary border border-border-primary w-8 h-8 text-text-secondary hover:border-[#229ED9] hover:text-[#229ED9] transition-colors"
          title="Telegram"
        >
          <TelegramIcon size={16} />
        </a>
      )}

      {dexscreener && (
        <a
          href={
            dexscreener.startsWith("http")
              ? dexscreener
              : `https://dexscreener.com/${dexscreener}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center rounded-lg bg-bg-secondary border border-border-primary w-8 h-8 text-text-secondary hover:border-[#4ADE80] hover:text-[#4ADE80] transition-colors"
          title="DexScreener"
        >
          <DexScreenerIcon size={16} />
        </a>
      )}
    </div>
  );
}
