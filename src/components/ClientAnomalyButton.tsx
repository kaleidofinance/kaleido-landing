"use client";

import React, { useState } from 'react';
import AnomalyInfo from './AnomalyInfo';

export default function ClientAnomalyButton({ totalScore, ruleScores, predominantReason }: { totalScore: number; ruleScores: { r1: number; r2: number; r3: number }; predominantReason: string | null; }) {
  const [open, setOpen] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // return focus to button after modal closes
    setTimeout(() => {
      if (btnRef.current) btnRef.current.focus();
    }, 0);
  };


  return (
    <>
      <div className="inline-flex items-center gap-2">
        <span className="font-mono">{totalScore}</span>
        <button
          ref={btnRef}
          onClick={handleOpen}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 hover:text-neutral-200"
          aria-label="Open anomaly details"
          aria-expanded={open}
          title="View anomaly score details"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 17v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
      <AnomalyInfo
        open={open}
        onClose={handleClose}
        totalScore={totalScore}
        ruleScores={ruleScores}
        predominantReason={predominantReason}
      />
    </>
  );
}
