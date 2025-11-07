"use client";

import React, { useState } from "react";

export default function SearchBar({
  initial,
  pageSize,
  onResult,
}: {
  initial: string;
  pageSize: number;
  onResult: (res: { walletAddress: string; xUsername: string | null; balance: number; rank: number } | null) => void;
}) {
  const [value, setValue] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ username: value.trim() });
      const res = await fetch(`/api/leaderboard/search?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Not found');
        onResult(null);
      } else {
        const data = await res.json();
        onResult(data.user);
      }
    } catch (err) {
      setError('Something went wrong');
      onResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <input
        type="text"
        name="username"
        placeholder="Search X username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-44 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-neutral-700"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-60"
      >
        {loading ? 'Searching…' : 'Find'}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </form>
  );
}

