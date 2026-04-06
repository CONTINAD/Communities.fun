"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyCA({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const short = address.length > 16
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  return (
    <button
      onClick={handleCopy}
      className="mt-2 flex items-center gap-2 rounded-lg bg-bg-secondary border border-border-primary px-3 py-1.5 text-sm font-mono text-text-secondary hover:border-accent hover:text-accent transition-colors group"
      title="Copy contract address"
    >
      <span className="text-[11px] font-sans font-medium text-text-secondary uppercase tracking-wide">
        CA
      </span>
      <span className="text-text-primary group-hover:text-accent transition-colors">
        {short}
      </span>
      {copied ? (
        <Check size={14} className="text-success" />
      ) : (
        <Copy size={14} className="text-text-secondary group-hover:text-accent transition-colors" />
      )}
    </button>
  );
}
