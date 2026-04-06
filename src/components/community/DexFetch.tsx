"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Check, AlertCircle, Zap, BadgeCheck } from "lucide-react";

interface DexData {
  name: string | null;
  symbol: string | null;
  imageUrl: string | null;
  headerUrl: string | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
  dexscreenerUrl: string | null;
  description: string | null;
  priceUsd: string | null;
  marketCap: number | null;
  fdv: number | null;
  liquidity: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  boostAmount: number;
  isBoosted: boolean;
  dexPaid: boolean;
}

interface DexFetchProps {
  onApply: (data: {
    name?: string;
    description?: string;
    avatar?: string;
    coverImage?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    dexscreener?: string;
  }) => void;
  contractAddress: string;
}

function formatNumber(n: number | null): string {
  if (!n) return "-";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function DexFetch({ onApply, contractAddress }: DexFetchProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DexData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleFetch() {
    if (!contractAddress.trim()) {
      setError("Enter a contract address first");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setApplied(false);

    try {
      const res = await fetch(`/api/dex?ca=${encodeURIComponent(contractAddress.trim())}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to fetch");
        setLoading(false);
        return;
      }

      setData(result);
    } catch {
      setError("Failed to connect to DexScreener");
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (!data) return;

    onApply({
      name: data.name && data.symbol ? `${data.name} (${data.symbol})` : data.name || undefined,
      description: data.description || undefined,
      avatar: data.imageUrl || undefined,
      coverImage: data.headerUrl || undefined,
      website: data.website || undefined,
      twitter: data.twitter || undefined,
      telegram: data.telegram || undefined,
      dexscreener: data.dexscreenerUrl || undefined,
    });

    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Fetch button */}
      <button
        type="button"
        onClick={handleFetch}
        disabled={loading || !contractAddress.trim()}
        className="flex items-center gap-2 rounded-lg border border-[#4ADE80]/30 bg-[#4ADE80]/5 px-4 py-2.5 text-sm font-medium text-[#4ADE80] transition-colors hover:bg-[#4ADE80]/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 252 300" fill="currentColor">
            <path d="M151.818 106.866c9.177-4.576 20.854-11.312 32.545-20.541 2.465 5.119 2.735 9.586 1.465 13.193-.9 2.542-2.596 4.753-4.826 6.512-2.415 1.901-5.431 3.285-8.765 4.033-6.326 1.425-13.712.593-20.419-3.197m1.591 46.886l12.148 7.017c-24.804 13.902-31.547 39.716-39.557 64.859-8.009-25.143-14.753-50.957-39.556-64.859l12.148-7.017a5.95 5.95 0 003.84-5.845c-1.113-23.547 5.245-33.96 13.821-40.249 3.898-2.861 7.924-4.75 11.747-5.856 3.823 1.106 7.849 2.995 11.747 5.856 8.577 6.289 14.934 16.702 13.821 40.249a5.95 5.95 0 003.841 5.845zM126 0c14.042.377 28.119 3.103 40.336 8.406 8.46 3.677 16.354 8.534 22.545 14.832 6.191 6.298 10.706 13.976 11.862 23.0 1.193 9.273-1.313 17.01-5.553 23.036-4.241 6.025-10.142 10.414-16.289 13.678-12.194 6.465-25.757 9.263-34.202 10.665 5.89 3.805 11.854 9.479 15.785 19.085 3.93 9.606 5.812 23.052 3.669 42.04L152 165.707l-7.263-4.194c-22.7 12.63-29.883 34.94-37.49 57.633-.053.16-.108.32-.162.481a.554.554 0 01-1.09-.012L69.263 161.513 57.847 155.66c-2.143-18.988-.261-32.434 3.669-42.04 3.931-9.606 9.895-15.28 15.785-19.085-8.445-1.402-22.008-4.2-34.202-10.665-6.147-3.264-12.048-7.653-16.289-13.678C22.57 64.167 20.064 56.43 21.257 47.157c1.156-9.024 5.671-16.702 11.862-23 6.191-6.298 14.085-11.155 22.545-14.832C67.881 3.48 81.958.754 96 .377a253 253 0 0130 0z" />
          </svg>
        )}
        {loading ? "Fetching from DexScreener..." : "Pull from DexScreener"}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-sm text-danger">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Preview card */}
      {data && (
        <div className="rounded-xl border border-border-primary bg-bg-secondary overflow-hidden">
          {/* Header image */}
          {data.headerUrl && (
            <div className="relative h-24 w-full">
              <Image src={data.headerUrl} alt="Banner" fill className="object-cover" />
            </div>
          )}

          <div className="p-4 space-y-3">
            {/* Token info row */}
            <div className="flex items-center gap-3">
              {data.imageUrl && (
                <Image
                  src={data.imageUrl}
                  alt={data.name || "Token"}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary text-lg truncate">
                    {data.name || "Unknown"}
                  </span>
                  {data.symbol && (
                    <span className="text-text-secondary text-sm">${data.symbol}</span>
                  )}
                </div>
                {data.priceUsd && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-text-primary font-mono">${data.priceUsd}</span>
                    {data.priceChange24h !== null && (
                      <span className={data.priceChange24h >= 0 ? "text-success" : "text-danger"}>
                        {data.priceChange24h >= 0 ? "+" : ""}
                        {data.priceChange24h.toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-bg-tertiary px-3 py-2">
                <p className="text-[11px] text-text-secondary uppercase tracking-wider">MCap</p>
                <p className="text-sm font-bold text-text-primary">{formatNumber(data.marketCap)}</p>
              </div>
              <div className="rounded-lg bg-bg-tertiary px-3 py-2">
                <p className="text-[11px] text-text-secondary uppercase tracking-wider">Liq</p>
                <p className="text-sm font-bold text-text-primary">{formatNumber(data.liquidity)}</p>
              </div>
              <div className="rounded-lg bg-bg-tertiary px-3 py-2">
                <p className="text-[11px] text-text-secondary uppercase tracking-wider">24h Vol</p>
                <p className="text-sm font-bold text-text-primary">{formatNumber(data.volume24h)}</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {data.dexPaid && (
                <span className="flex items-center gap-1 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-2.5 py-1 text-[12px] font-medium text-[#4ADE80]">
                  <BadgeCheck size={12} />
                  DEX Paid
                </span>
              )}
              {data.isBoosted && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 text-[12px] font-medium text-yellow-500">
                  <Zap size={12} />
                  {data.boostAmount} Boosts
                </span>
              )}
              {data.website && (
                <span className="rounded-full bg-bg-tertiary px-2.5 py-1 text-[12px] text-text-secondary">
                  Website
                </span>
              )}
              {data.twitter && (
                <span className="rounded-full bg-bg-tertiary px-2.5 py-1 text-[12px] text-text-secondary">
                  X/Twitter
                </span>
              )}
              {data.telegram && (
                <span className="rounded-full bg-bg-tertiary px-2.5 py-1 text-[12px] text-text-secondary">
                  Telegram
                </span>
              )}
            </div>

            {/* Apply button */}
            <button
              type="button"
              onClick={handleApply}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#4ADE80] hover:bg-[#4ADE80]/90 text-black font-bold py-2.5 text-sm transition-colors"
            >
              {applied ? (
                <>
                  <Check size={16} />
                  Applied!
                </>
              ) : (
                "Apply all to community"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
