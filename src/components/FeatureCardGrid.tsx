"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  Cpu,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const MODULES = [
  {
    id: "luca",
    icon: Cpu,
    title: "Luca Engine",
    tag: "Reasoning Layer",
    short: "Autonomous intent execution",
    desc: "The reasoning core of the DeFi-OS. Luca interprets natural language intents, decomposes them into multi-step DeFi actions, and executes across every protocol module — autonomously.",
    features: ["Intent Parser", "Route Optimizer", "Point Indexer", "Risk Monitor"],
    accent: "#00ff99",
  },
  {
    id: "lending",
    icon: ShieldCheck,
    title: "Agentic Lending",
    tag: "P2P Risk Matching",
    short: "AI-powered lending markets",
    desc: "Capital-efficient lending with AI-driven risk matching. Luca monitors your health factor 24/7, adjusts positions, and prevents liquidation — before you even notice.",
    features: ["Health Factor AI", "P2P Matching", "Auto-Rebalance", "Flash Loans"],
    accent: "#00ff99",
  },
  {
    id: "dex",
    icon: TrendingUp,
    title: "V3 Omni-Pool",
    tag: "Concentrated Liquidity",
    short: "Best-route swap execution",
    desc: "Concentrated liquidity DEX with Luca-optimized routing. Every swap finds the tightest spread across all available pools, with MEV protection built in.",
    features: ["Tick Ranges", "Smart Routing", "MEV Shield", "LP Analytics"],
    accent: "#00ff99",
  },
  {
    id: "staking",
    icon: Zap,
    title: "KLD Liquid Staking",
    tag: "Governance & Yield",
    short: "Stake KLD, mint stKLD",
    desc: "Stake KLD to earn yield while maintaining full token utility. Use stKLD as collateral, in LPs, or across the ecosystem — no lock-up required.",
    features: ["stKLD Derivative", "No Lock-up", "Governance Power", "Composable"],
    accent: "#00ff99",
  },
  {
    id: "stable",
    icon: Coins,
    title: "kfUSD Ecosystem",
    tag: "Native Stablecoin",
    short: "Mint, lock, earn yield",
    desc: "The primary liquidity layer of Kaleido DeFi-OS. Deposit multi-collateral assets to mint kfUSD, then lock it in the kafUSD Vault for protocol-native yield.",
    features: ["Multi-Collateral", "1:1 Peg", "kafUSD Vault", "Yield Engine"],
    accent: "#00ff99",
  },
  {
    id: "aegis",
    icon: ShieldCheck,
    title: "Aegis Sentinel",
    tag: "Security Layer",
    short: "Real-time threat protection",
    desc: "The protective layer of the DeFi-OS. Aegis monitors global on-chain patterns and protocol health to detect and intercept exploits before they hit your positions.",
    features: ["Exploit Guard", "Automated Pause", "Liquidity Shield", "Honey-pot Scan"],
    accent: "#00ff99",
  },
];

const FeatureCardGrid = () => {
  const [active, setActive] = useState(0);
  const selected = MODULES[active];

  return (
    <section className="relative bg-[#080b09] py-16 px-6 md:px-10 overflow-hidden w-full">
      {/* Ambient glow */}
      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff99]/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">
        {/* ── Header ── */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="h-px w-6 bg-[#00ff99]/40" />
            <span className="text-[10px] font-semibold tracking-widest uppercase text-[#00ff99]">
              Protocol Modules
            </span>
            <span className="h-px w-6 bg-[#00ff99]/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            The{" "}
            <span className="bg-gradient-to-r from-[#00ff99] to-[#00dd72] bg-clip-text text-transparent">
              Modular Protocol
            </span>{" "}
            Stack
          </h2>
          <p className="max-w-xl mx-auto text-base text-white/45 leading-relaxed">
            Five native primitives, one autonomous layer. Every module is
            orchestrated by Luca AI for intent-based execution.
          </p>
        </motion.div>

        {/* ── Interactive Stack ── */}
        <motion.div
          className="grid lg:grid-cols-[340px_1fr] gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Left: Module selector tabs */}
          <div className="flex flex-col gap-2">
            {MODULES.map((mod, i) => {
              const isActive = i === active;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActive(i)}
                  className={`group relative flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all duration-300 ${
                    isActive
                      ? "bg-[#00ff99]/10 border border-[#00ff99]/25"
                      : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#00ff99]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <div
                    className={`shrink-0 p-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-[#00ff99]/15 border border-[#00ff99]/30"
                        : "bg-white/[0.03] border border-white/[0.06] group-hover:border-white/[0.12]"
                    }`}
                  >
                    <mod.icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive ? "text-[#00ff99]" : "text-white/30 group-hover:text-white/50"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold transition-colors duration-300 ${
                        isActive ? "text-white" : "text-white/50 group-hover:text-white/70"
                      }`}
                    >
                      {mod.title}
                    </p>
                    <p
                      className={`text-xs transition-colors duration-300 ${
                        isActive ? "text-white/40" : "text-white/20"
                      }`}
                    >
                      {mod.short}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-all duration-300 ${
                      isActive
                        ? "text-[#00ff99] translate-x-0 opacity-100"
                        : "text-white/10 -translate-x-1 opacity-0 group-hover:opacity-50 group-hover:translate-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Detail panel */}
          <div className="relative rounded-2xl border border-white/[0.06] bg-[#0a0f0c]/60 backdrop-blur-xl overflow-hidden min-h-[400px]">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }} />

            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 p-8 md:p-10 flex flex-col justify-between h-full"
              >
                <div>
                  {/* Tag */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase bg-[#00ff99]/10 text-[#00ff99] border border-[#00ff99]/20">
                      {selected.tag}
                    </span>
                    {active === 0 && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00ff99]/5 border border-[#00ff99]/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-pulse" />
                        <span className="text-[10px] text-[#00ff99] font-semibold">Active</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/20">
                      <selected.icon className="w-6 h-6 text-[#00ff99]" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      {selected.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-white/45 text-sm leading-relaxed max-w-lg mb-6">
                    {selected.desc}
                  </p>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2">
                    {selected.features.map((f, i) => (
                      <motion.span
                        key={f}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 bg-white/[0.04] border border-white/[0.06]"
                      >
                        {f}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/[0.04]">
                  <a
                    href={selected.id === "aegis" ? "https://aegis.kaleidofi.xyz" : "https://app.kaleido.xyz"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#00ff99] hover:text-[#00ff99]/80 transition-colors group/link"
                  >
                    Try {selected.title} on {selected.id === "aegis" ? "Aegis Sentinel" : "Kaleido DeFi-OS"}
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Corner glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00ff99]/5 rounded-full blur-[60px] pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureCardGrid;
