"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';

function RuleAccordion({ id, title, shortDesc, value, isOpen, onToggle }: { id: string; title: string; shortDesc: string; value: number; isOpen: boolean; onToggle: (id: string) => void }) {
  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950/20">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-3 text-left"
        aria-expanded={isOpen}
        aria-controls={`panel-${id}`}
      >
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-neutral-400">{shortDesc}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 text-right font-mono">{value}</div>
          <svg className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`panel-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="px-3 pb-3"
          >
            <div className="text-xs text-neutral-400">
              {id === 'r2' ? (
                <>
                  <p>We compute per-pair gain rates (points per second) and calculate z-scores. A pair is considered anomalous if z &gt; 3. Z-score formula: z = (x - μ) / σ where μ is mean and σ is standard deviation.</p>
                  <p className="mt-2">Example: if most rates are ~10/s but a pair shows 1000/s, it will have a high z and increase the rule score.</p>
                </>
              ) : id === 'r1' ? (
                <>
                  <p>Rule 1 simply checks the maximum recorded balance. If the max balance &gt; 55,000,000 the rule contributes fully (100).</p>
                  <p className="mt-2">This is intended to flag very large accounts for manual review.</p>
                </>
              ) : (
                <>
                  <p>Rule 3 inspects the last 30 session earnings and looks for repeated identical values which may indicate automation.</p>
                  <p className="mt-2">Even a few repeated events increase the score; repeated sequences are more indicative than single repeats.</p>
                </>
              )}
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-neutral-800">
              <div className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-red-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  totalScore: number;
  ruleScores: { r1: number; r2: number; r3: number };
  predominantReason: string | null;
};

export default function AnomalyInfo({ open, onClose, totalScore, ruleScores, predominantReason }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  function handleToggle(id: string) {
    setOpenId((cur) => (cur === id ? null : id));
  }
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement as HTMLElement | null;

    // Move focus to the close button when modal opens
    const timer = setTimeout(() => {
      if (closeBtnRef.current) closeBtnRef.current.focus();
      else if (dialogRef.current) dialogRef.current.focus();
    }, 10);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        // Basic focus trap: keep focus inside the dialog
        const el = dialogRef.current;
        if (!el) return;
        const focusable = Array.from(el.querySelectorAll<HTMLElement>(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter((n) => n.offsetParent !== null);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      if (previousActive) previousActive.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="anomaly-info-title"
            aria-describedby="anomaly-info-desc"
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div ref={dialogRef} className="relative z-10 max-w-xl w-full rounded-lg bg-neutral-900 p-6 text-neutral-100 shadow-lg" tabIndex={-1}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 id="anomaly-info-title" className="text-lg font-semibold">Anomaly Score Details</h3>
                  <p id="anomaly-info-desc" className="mt-2 text-sm text-neutral-400">This score helps detect unusual mining patterns. It is computed from three rule checks and combined into a single score (0-100) to help moderation and review.</p>
                </div>
                <button ref={closeBtnRef} onClick={onClose} className="rounded bg-neutral-800 px-3 py-1 text-sm hover:bg-neutral-700">Close</button>
              </div>

              {/* Fixed-height scrollable content area */}
              {/* Use flex layout: the outer box constrains height, inner box is flex-1 with min-h-0 so it can overflow/scroll correctly */}
              <div className="mt-4 space-y-3 text-sm flex flex-col" style={{ maxHeight: '60vh', minHeight: '320px', overflow: 'hidden' }}>
                <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <strong>Total anomaly score:</strong> <span className="ml-2 font-mono">{totalScore}</span>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-3">
                  {[
                    { key: 'r1', title: 'Rule 1 — High Balance Threshold', desc: 'Max balance exceeds 55,000,000.', value: ruleScores.r1 },
                    { key: 'r2', title: 'Rule 2 — Sudden Jump Detection', desc: 'Detects statistical outliers in gain rates (z-score).', value: ruleScores.r2 },
                    { key: 'r3', title: 'Rule 3 — Repeated Earnings', desc: 'Repeated identical session earnings in recent history.', value: ruleScores.r3 },
                  ].map((rule) => (
                    <RuleAccordion key={rule.key} id={rule.key} title={rule.title} shortDesc={rule.desc} value={rule.value} isOpen={openId === rule.key} onToggle={handleToggle} />
                  ))}
                </div>

                <div className="mt-2">
                  <h4 className="text-sm font-medium">Predominant reason</h4>
                  <p className="text-xs text-neutral-400">The reason with the highest contribution is: <strong>{predominantReason ?? 'None'}</strong>.</p>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-medium">Interpreting the score</h4>
                  <ul className="list-inside list-disc text-xs text-neutral-400">
                    <li>0–20: Normal activity — unlikely to be automated or abusive.</li>
                    <li>21–50: Suspicious — warrants automated follow-ups or light human review.</li>
                    <li>51–75: Likely anomalous — manual moderation recommended.</li>
                    <li>76–100: Highly anomalous — immediate human review and possible temporary hold.</li>
                  </ul>
                </div>

                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
