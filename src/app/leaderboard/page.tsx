import { connectToDatabase } from "@/lib/mongodb";
import type { Document, Filter } from 'mongodb';
import Link from "next/link";
import React from "react";
import dynamicImport from 'next/dynamic';
const ClientAnomalyButton = dynamicImport(() => import('@/components/ClientAnomalyButton'), { ssr: false });
import Navbar from "@/components/Navbar";
import SearchClient from "./SearchClient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type LeaderboardRow = {
  rank: number;
  walletAddress: string;
  balance: number;
  xUsername: string | null;
  xId?: string | null;
  totalScore: number;
  ruleScores: { r1: number; r2: number; r3: number };
  predominantReason: 'Rule 1' | 'Rule 2' | 'Rule 3' | null;
  flagged: boolean;
};

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

function RankIcon({ rank }: { rank: number }) {
  if (rank <= 0 || rank > 10) return null;
  if (rank === 1) {
    return (
      <svg aria-label="Gold" className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77l-4.78 2.51.91-5.32L4.27 7.62l5.34-.78L12 2z"/>
      </svg>
    );
  }
  if (rank === 2) {
    return (
      <svg aria-label="Silver" className="h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77l-4.78 2.51.91-5.32L4.27 7.62l5.34-.78L12 2z"/>
      </svg>
    );
  }
  if (rank === 3) {
    return (
      <svg aria-label="Bronze" className="h-4 w-4" viewBox="0 0 24 24" fill="#CD7F32">
        <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77l-4.78 2.51.91-5.32L4.27 7.62l5.34-.78L12 2z"/>
      </svg>
    );
  }
  // Ranks 4-10: star icon
  return (
    <svg aria-label="Top 10" className="h-4 w-4 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
    </svg>
  );
}

function getPageItems(current: number, total: number, delta: number = 2): (number | 'ellipsis')[] {
  // If few pages, show all
  if (total <= 1) return [1];
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | 'ellipsis')[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  items.push(1);
  if (left > 2) items.push('ellipsis');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < total - 1) items.push('ellipsis');
  items.push(total);
  return items;
}

async function fetchLeaderboardPage(page: number, pageSize: number): Promise<{ rows: LeaderboardRow[]; total: number }> {
  const { db } = await connectToDatabase();
  const collection = db.collection("kaleido");
  // Only include documents that have a numeric balance AND a valid xId and structured xProfile
  // with id, name and username (all strings). This ensures we display only verified X profiles.
  const filter: Filter<Document> = {
    $and: [
      { balance: { $type: "number" } },
      { xId: { $exists: true, $type: 'string' } },
      { 'xProfile.id': { $exists: true, $type: 'string' } },
      { 'xProfile.name': { $exists: true, $type: 'string' } },
      { 'xProfile.username': { $exists: true, $type: 'string' } }
    ]
  };

  const total = await collection.countDocuments(filter);

  const cursor = collection
    .find(filter, {
      projection: {
          walletAddress: 1,
          balance: 1,
          xId: 1,
          xUsername: 1,
          "xProfile.id": 1,
          "xProfile.name": 1,
          "xProfile.username": 1,
          // Pull recent mining history (cap to last 200 records for efficiency)
          miningHistory: { $slice: -200 },
          _id: 0,
        },
    })
    .sort({ balance: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  const docs = await cursor.toArray();
  const startRank = (page - 1) * pageSize;
  const rows: LeaderboardRow[] = docs.map((doc: any, index) => {
    // Prefer structured xProfile.username but keep xUsername as fallback (if present)
    const username: string | null = doc?.xProfile?.username || doc?.xUsername || null;
    const xIdValue: string | null = doc?.xId || null;
    const evaluation = evaluateUser(doc);
    return {
      rank: startRank + index + 1,
      walletAddress: doc.walletAddress,
      balance: typeof doc.balance === "number" ? doc.balance : 0,
      xUsername: username,
      // Attach xId for display or internal checks if needed
      // (we don't currently display it in the table but we ensure it's present in the document)
      xId: xIdValue,
      totalScore: evaluation.totalScore,
      ruleScores: evaluation.ruleScores,
      predominantReason: evaluation.predominantReason,
      flagged: evaluation.flagged,
    };
  });

  return { rows, total };
}

function evaluateUser(user: any): { totalScore: number; ruleScores: { r1: number; r2: number; r3: number }; predominantReason: 'Rule 1' | 'Rule 2' | 'Rule 3' | null; flagged: boolean } {
  // Prepare mining history
  const history: Array<{ timestamp?: string; sessionEarnings?: any; newBalance?: any }> = Array.isArray(user.miningHistory) ? [...user.miningHistory] : [];
  history.sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime());

  // Helpers for safe numeric/BigInt comparison
  const canUseNumber = (v: any) => typeof v === 'number' && isFinite(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER;
  const toBigIntOrNull = (v: any): bigint | null => {
    try {
      if (typeof v === 'bigint') return v;
      if (typeof v === 'number' && Number.isInteger(v) && Math.abs(v) <= Number.MAX_SAFE_INTEGER) return BigInt(v);
      if (typeof v === 'string' && /^-?\d+$/.test(v)) return BigInt(v);
    } catch {}
    return null;
  };

  // Rule 2: Sudden Jump Detection using z-score over gain rates (gain per second)
  // We'll compute per-pair gain rates (gain / seconds) when available, convert BigInt/integer strings where possible,
  // then compute mean/stddev and count how many pairs exceed a z-threshold (e.g., z > 3).
  const gainRates: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    const tPrev = prev.timestamp ? new Date(prev.timestamp).getTime() : null;
    const tCurr = curr.timestamp ? new Date(curr.timestamp).getTime() : null;
    if (tPrev === null || tCurr === null) continue;
    const diffSec = Math.max(1, Math.floor((tCurr - tPrev) / 1000)); // avoid zero division

    const nbPrev = prev.newBalance;
    const nbCurr = curr.newBalance;

    let gainNumber: number | null = null;
    if (canUseNumber(nbPrev) && canUseNumber(nbCurr)) {
      gainNumber = Number(nbCurr) - Number(nbPrev);
    } else {
      const biPrev = toBigIntOrNull(nbPrev);
      const biCurr = toBigIntOrNull(nbCurr);
      if (biPrev !== null && biCurr !== null) {
        // convert BigInt difference to number if safe, otherwise skip
        const diffBI = biCurr - biPrev;
        const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
        if (diffBI <= maxSafe && diffBI >= -maxSafe) {
          gainNumber = Number(diffBI);
        } else {
          // too large to represent as number — skip this pair
          gainNumber = null;
        }
      }
    }

    if (gainNumber === null) continue;
    const rate = gainNumber / diffSec; // units per second
    if (!Number.isFinite(rate)) continue;
    gainRates.push(rate);
  }

  // Compute z-score statistics
  let r2Norm = 0;
  if (gainRates.length > 0) {
    const mean = gainRates.reduce((s, v) => s + v, 0) / gainRates.length;
    const variance = gainRates.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / gainRates.length;
    const std = Math.sqrt(variance);
    // z-threshold for anomaly detection; pairs with z > 3 are considered anomalous
    const zThreshold = 3;
    const anomalous = gainRates.filter((r) => std > 0 ? (r - mean) / std > zThreshold : false).length;
    // Map anomalous count to 0..100, cap at 10 for stability
    const cap = 10;
    r2Norm = Math.round((Math.min(anomalous, cap) / cap) * 100);
  }

  // Rule 3: Repeated Earnings Detection (last 30 entries), normalize to 0..100
  const tail = history.slice(-30);
  let repeatCount = 0;
  let repeatEvents = 0;
  for (let i = 1; i < tail.length; i++) {
    const prev = tail[i - 1]?.sessionEarnings;
    const curr = tail[i]?.sessionEarnings;
    if (prev === undefined || curr === undefined) continue;
    if (String(curr) === String(prev)) {
      repeatCount += 1; // count consecutive repeats
      repeatEvents += 1; // one repeat event
    } else {
      repeatCount = 0;
    }
  }

  // Rule 1 normalized: threshold only → 0 or 100
  const r1Norm = typeof user.balance === 'number' && user.balance > 55_000_000 ? 100 : 0;

  // Rule 3 normalized: repeats over last 30 entries; max possible repeats is tail.length - 1
  const r3MaxRepeats = Math.max(0, tail.length - 1);
  const r3Norm = r3MaxRepeats > 0 ? Math.round(Math.min(1, repeatEvents / r3MaxRepeats) * 100) : 0;

  const ruleScores = { r1: r1Norm, r2: r2Norm, r3: r3Norm };
  // Weighting: updated weights -> Rule1=0.5, Rule2=0.3, Rule3=0.2
  const weights = { r1: 0.5, r2: 0.3, r3: 0.2 } as const;
  const totalScore = Math.round(r1Norm * weights.r1 + r3Norm * weights.r3 + r2Norm * weights.r2);
  const flagged = totalScore >= 50;
  // Predominant reason based on weighted contribution
  const contributions = {
    'Rule 1': r1Norm * weights.r1,
    'Rule 2': r2Norm * weights.r2,
    'Rule 3': r3Norm * weights.r3,
  } as const;
  const maxContribution = Math.max(contributions['Rule 1'], contributions['Rule 2'], contributions['Rule 3']);
  const predominantReason = maxContribution === 0 ? null : (maxContribution === contributions['Rule 1'] ? 'Rule 1' : maxContribution === contributions['Rule 2'] ? 'Rule 2' : 'Rule 3');

  return { totalScore, ruleScores, predominantReason, flagged };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: { page?: string; pageSize?: string; username?: string };
}) {
  const VERIFICATION_THRESHOLD = 55_000_000; // 55 million
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const pageSize = [25, 50, 100].includes(Number(searchParams?.pageSize))
    ? Number(searchParams?.pageSize)
    : 25;

  const effectivePage = page;
  // highlight username if provided in search params
  const highlightUsernameLower: string | null = searchParams?.username ? String(searchParams.username).toLowerCase() : null;

  const { rows, total } = await fetchLeaderboardPage(effectivePage, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageSizes = [25, 50, 100];

  return (
    <div className="w-full overflow-hidden bg-black relative">
      {/* Header / Navbar */}
      <div className="border-b border-[#808080]">
        <div className="md:max-w-[94%] m-auto">
          <div className="px-6 flex justify-center items-center">
            <div className="xl:max-w-[1440px] w-full">
              <Navbar />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Leaderboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Client-side search with modal result */}
          <SearchClient initial="" pageSize={pageSize} />
          <span className="text-xs text-neutral-400">Rows per page:</span>
          <div className="inline-flex overflow-hidden rounded-md border border-neutral-800">
            {pageSizes.map((size) => (
              <Link
                key={size}
                href={{ pathname: "/leaderboard", query: { page: 1, pageSize: size } }}
                className={`px-3 py-1.5 text-xs ${
                  pageSize === size ? "bg-neutral-800 text-neutral-100" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {size}
              </Link>
            ))}
          </div>
        </div>
        </div>

        {/* Modal placeholder rendered on client by SearchBar via portal */}

        <div className="overflow-x-auto rounded-lg border border-neutral-800 shadow-sm">
          <table className="min-w-full divide-y divide-neutral-800">
            <thead className="bg-neutral-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">Wallet</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">X Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">X Verified</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">Verification Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-400">Anomaly Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {rows.map((row) => {
                const isHighlight = highlightUsernameLower && row.xUsername && row.xUsername.toLowerCase() === highlightUsernameLower;
                return (
                <tr key={row.rank} className={`hover:bg-neutral-900/40 ${isHighlight ? 'bg-neutral-900/60 ring-1 ring-[#00dd72]/30' : ''}`}>
                  <td className="px-4 py-3 text-sm text-neutral-100">
                    <span className="inline-flex items-center gap-2">
                      <RankIcon rank={row.rank} />
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-200 font-mono">{maskWallet(row.walletAddress)}</td>
                  <td className="px-4 py-3 text-sm text-neutral-200" title={row.balance.toLocaleString()}>
                    {row.rank <= 4 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#00dd72]/30 bg-[#00dd72]/15 px-2 py-0.5 text-xs font-medium text-[#00dd72]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00dd72]" />
                        To be Verified — Balance too large
                      </span>
                    ) : (
                      formatPoints(row.balance)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-300">{row.xUsername ?? "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {row.xUsername ? (
                      <a
                        href={`https://x.com/${row.xUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-[#00dd72]/30 bg-[#00dd72]/15 px-2 py-0.5 text-xs font-medium text-[#00dd72] hover:bg-[#00dd72]/25"
                        title={`View @${row.xUsername} on X`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00dd72]" />
                        Verified
                      </a>
                    ) : (
                      <span className="text-neutral-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {row.rank <= 4 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        Disqualified
                      </span>
                    ) : row.flagged ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                        {`Pending${row.predominantReason ? ` (${row.predominantReason})` : ''}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#00dd72]/30 bg-[#00dd72]/15 px-2 py-0.5 text-xs font-medium text-[#00dd72]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00dd72]" />
                        Verified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-200">
                    <ClientAnomalyButton
                      totalScore={row.totalScore}
                      ruleScores={row.ruleScores}
                      predominantReason={row.predominantReason}
                    />
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-neutral-400">
            Page {page} of {totalPages} • {total.toLocaleString()} users
          </p>
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
            <div className="inline-flex overflow-hidden rounded-md border border-neutral-800">
              <Link
                href={{ pathname: "/leaderboard", query: { page: 1, pageSize } }}
                className={`px-3 py-1.5 text-sm ${
                  page === 1 ? "cursor-not-allowed bg-neutral-900 text-neutral-600" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
                aria-disabled={page === 1}
              >
                First
              </Link>
              <Link
                href={{ pathname: "/leaderboard", query: { page: Math.max(1, effectivePage - 1), pageSize } }}
                className={`px-3 py-1.5 text-sm border-l border-neutral-800 ${
                  effectivePage <= 1 ? "cursor-not-allowed bg-neutral-900 text-neutral-600" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
                aria-disabled={effectivePage <= 1}
              >
                Previous
              </Link>
              {getPageItems(page, totalPages).map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-3 py-1.5 text-sm border-l border-neutral-800 bg-neutral-900 text-neutral-600 select-none">
                    …
                  </span>
                ) : (
                  <Link
                    key={item}
                    href={{ pathname: "/leaderboard", query: { page: item, pageSize } }}
                    className={`px-3 py-1.5 text-sm border-l border-neutral-800 ${
                      effectivePage === item ? "bg-neutral-800 text-neutral-100" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                    }`}
                    aria-current={effectivePage === item ? 'page' : undefined}
                  >
                    {item}
                  </Link>
                )
              )}
              <Link
                href={{ pathname: "/leaderboard", query: { page: Math.min(totalPages, effectivePage + 1), pageSize } }}
                className={`px-3 py-1.5 text-sm border-l border-neutral-800 ${
                  effectivePage >= totalPages ? "cursor-not-allowed bg-neutral-900 text-neutral-600" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
                aria-disabled={effectivePage >= totalPages}
              >
                Next
              </Link>
              <Link
                href={{ pathname: "/leaderboard", query: { page: totalPages, pageSize } }}
                className={`px-3 py-1.5 text-sm border-l border-neutral-800 ${
                  effectivePage === totalPages ? "cursor-not-allowed bg-neutral-900 text-neutral-600" : "bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                }`}
                aria-disabled={effectivePage === totalPages}
              >
                Last
              </Link>
            </div>
            <form method="get" action="/leaderboard" className="flex items-center gap-2">
              <input
                type="number"
                name="page"
                min={1}
                max={totalPages}
                defaultValue={effectivePage}
                className="w-20 rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-neutral-200 outline-none focus:border-neutral-700"
                aria-label="Go to page"
              />
              <input type="hidden" name="pageSize" value={pageSize} />
              <button
                type="submit"
                className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

