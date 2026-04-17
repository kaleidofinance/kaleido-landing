"use client";

import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";

const STATS = [
  { value: "6", label: "Core Products", sublabel: "Unified in one OS" },
  { value: "V3", label: "Concentrated DEX", sublabel: "Capital-efficient liquidity" },
  { value: "Luca", label: "AI Co-Pilot", sublabel: "Intent-based execution" },
];

// Animated terminal lines for flavour
const TERMINAL_LINES = [
  { prefix: "luca>", text: "swap 500 USDC → KLD, best route", delay: 0.8 },
  { prefix: "sys >", text: "indexing volume... $500 = 500 pts", delay: 1.4 },
  { prefix: "luca>", text: "LP position opened on KLD/ETH pool", delay: 2.0 },
  { prefix: "sys >", text: "point guard: capital gate ✓ verified", delay: 2.6 },
];

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 md:px-10 overflow-hidden"
    >
      {/* ── Background grid ── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00ff99 1px, transparent 1px), linear-gradient(to right, #00ff99 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Glowing orbs ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#00ff99]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00ff99]/4 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left Column: Copy ── */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#00ff99]/20 bg-[#00ff99]/5 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#00ff99] animate-pulse" />
              <span className="text-xs font-semibold text-[#00ff99] tracking-widest uppercase">
                Agentic Era · Now Live
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white mb-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              The{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#00ff99] via-[#00dd72] to-[#00ff99] bg-clip-text text-transparent">
                  Autonomous
                </span>
                {/* underline glow */}
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00ff99]/0 via-[#00ff99] to-[#00ff99]/0 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
              <br />
              Financial Layer
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-base md:text-lg text-white/50 leading-relaxed max-w-md mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Deploy, Stake, and Reason. Where{" "}
              <span className="text-[#00ff99] font-medium">Luca AI</span> meets
              deep DeFi liquidity — designed for humans and autonomous agents alike.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <a
                href="https://app.kaleido.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#00ff99] text-black font-bold text-sm hover:bg-[#00ff99]/90 transition-all duration-200 shadow-[0_0_25px_rgba(0,255,153,0.4)] hover:shadow-[0_0_40px_rgba(0,255,153,0.6)]"
              >
                Launch the OS
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="https://kaleidos-finance.gitbook.io/kaleido/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:border-[#00ff99]/30 hover:bg-[#00ff99]/5 transition-all duration-200"
              >
                Read Docs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {STATS.map((s, i) => (
                <div key={i} className="border-l border-[#00ff99]/20 pl-3">
                  <p className="text-xl font-bold text-[#00ff99]">{s.value}</p>
                  <p className="text-xs font-semibold text-white/70 mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{s.sublabel}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right Column: Terminal Visual ── */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative rounded-2xl border border-[#00ff99]/20 bg-[#0a0f0c]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_rgba(0,255,153,0.08)]">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/20">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <span className="w-3 h-3 rounded-full bg-[#00ff99]/60" />
                </div>
                <span className="ml-2 text-xs text-white/30 font-mono">luca@kaleido-defi-os ~ agentic-session</span>
              </div>

              {/* Terminal body */}
              <div className="p-5 font-mono text-sm space-y-3 min-h-[260px]">
                {TERMINAL_LINES.map((line, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: line.delay, duration: 0.4 }}
                  >
                    <span className={`text-[#00ff99]/50 shrink-0 ${line.prefix === "sys >" ? "text-white/30" : ""}`}>
                      {line.prefix}
                    </span>
                    <span className="text-white/70">{line.text}</span>
                  </motion.div>
                ))}

                {/* Blinking cursor */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.2 }}
                >
                  <span className="text-[#00ff99]/50">luca&gt;</span>
                  <motion.span
                    className="inline-block w-2 h-4 bg-[#00ff99] rounded-sm"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              {/* Glow at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#00ff99]/5 to-transparent pointer-events-none" />
            </div>

            {/* Floating stat badge */}
            <motion.div
              className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-xl border border-[#00ff99]/20 bg-[#0a0f0c]/90 backdrop-blur-xl flex items-center gap-3 shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.5, type: "spring" }}
            >
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-xs font-bold text-white">Leaderboard Live</p>
                <p className="text-[10px] text-white/40">Volume-weighted rewards</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
