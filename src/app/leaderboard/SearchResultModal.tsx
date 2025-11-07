"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

function maskWallet(walletAddress: string): string {
  if (!walletAddress || walletAddress.length < 12) return walletAddress;
  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}

function trimTrailingZeros(input: string): string {
  return input.replace(/\.00$/, '').replace(/\.(\d)0$/, '.$1');
}

function formatPoints(value: number): string {
  if (typeof value !== 'number' || !isFinite(value)) return '-';
  if (value >= 1_000_000_000) {
    return `${trimTrailingZeros((value / 1_000_000_000).toFixed(2))}B`;
  }
  if (value >= 1_000_000) {
    return `${trimTrailingZeros((value / 1_000_000).toFixed(2))}M`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function SearchResultModal({
  open,
  onClose,
  result,
  pageSize,
}: {
  open: boolean;
  onClose: () => void;
  result: { walletAddress: string; xUsername: string | null; balance: number; rank: number } | null;
  pageSize: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div ref={ref} className="relative z-10 w-full max-w-md rounded-xl border border-neutral-800 bg-[#0F1014] p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">Search result</h2>
          <button onClick={onClose} className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800">Close</button>
        </div>
        {result ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">X Username</span>
              <span className="text-neutral-200">{result.xUsername ? `@${result.xUsername}` : '-'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Wallet</span>
              <span className="font-mono text-neutral-200">{maskWallet(result.walletAddress)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Rank</span>
              <span className="text-neutral-100 font-medium">#{result.rank}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-400">Balance</span>
              <span className="text-neutral-200">{formatPoints(result.balance)}</span>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <Link
                href={`/leaderboard?page=${Math.floor((result.rank - 1) / pageSize) + 1}&pageSize=${pageSize}`}
                className="rounded-md border border-[#00dd72]/30 bg-[#00dd72]/15 px-3 py-1.5 text-sm font-medium text-[#00dd72] hover:bg-[#00dd72]/25"
                onClick={onClose}
              >
                Jump to page
              </Link>
              {result.xUsername && (
                <a
                  href={`https://x.com/${result.xUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
                >
                  Open X Profile
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">No result</div>
        )}
      </div>
    </div>
  );
}

