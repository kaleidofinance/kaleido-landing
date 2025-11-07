"use client";

import React, { useState, useCallback } from "react";
import SearchBar from "./SearchBar";
import SearchResultModal from "./SearchResultModal";

export default function SearchClient({ initial, pageSize }: { initial: string; pageSize: number }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{
    walletAddress: string;
    xUsername: string | null;
    balance: number;
    rank: number;
  } | null>(null);

  const handleResult = useCallback((res: any) => {
    setResult(res || null);
    setOpen(true);
  }, []);

  return (
    <>
      <SearchBar initial={initial} pageSize={pageSize} onResult={handleResult} />
      <SearchResultModal open={open} onClose={() => setOpen(false)} result={result} pageSize={pageSize} />
    </>
  );
}

