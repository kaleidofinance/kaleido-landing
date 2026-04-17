"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, Trophy, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Point Guard",
    desc: "Capital-gated security ensures only real, staked participants earn non-on-chain rewards. Bot farms don't make the cut.",
    tag: "Anti-Sybil",
    tagColor: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  },
  {
    icon: BarChart3,
    title: "Volume-Weighted",
    desc: "$1 USD of protocol activity = 1 point. The more capital you deploy, the more you earn. No spam clicks, no shortcuts.",
    tag: "$1 = 1 pt",
    tagColor: "text-[#00ff99] bg-[#00ff99]/10 border-[#00ff99]/20",
  },
  {
    icon: Zap,
    title: "Luca Multiplier",
    desc: "Agent-initiated swaps powered by Luca receive a 1.2× point multiplier — rewarding those who use the full Agentic stack.",
    tag: "1.2× Boost",
    tagColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    desc: "Global, real-time rankings updated every 60 seconds. Compete across Swap Volume, Marketplace, Staking, and AI Interactions.",
    tag: "Real-time",
    tagColor: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  },
];

// Mini fake leaderboard data for the visual
const LEADERS = [
  { rank: 1, addr: "0x3f...a9B2", pts: "14,820", medal: "🥇" },
  { rank: 2, addr: "0xc1...7f44", pts: "11,340", medal: "🥈" },
  { rank: 3, addr: "0x88...12cA", pts: "9,105",  medal: "🥉" },
  { rank: 4, addr: "0x02...eF31", pts: "7,660",  medal: null },
  { rank: 5, addr: "0xA4...9d03", pts: "5,920",  medal: null },
];

const PointEconomy = () => {
  return (
    <section className="relative py-16 px-6 md:px-10 overflow-hidden">
      {/* Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff99]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto">
        {/* Section label */}
        <motion.div
          className="flex items-center gap-2 mb-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="h-px w-6 bg-[#00ff99]/40" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#00ff99]">
            Point Economy
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* ── Left: Heading + 2×2 Metric Grid ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Rewards that are{" "}
              <span className="bg-gradient-to-r from-[#00ff99] to-[#00dd72] bg-clip-text text-transparent">
                actually fair
              </span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8 max-w-sm">
              A sybil-resistant Point Economy designed to reward genuine capital commitment
              — not click farms, not wallet spammers. Just real DeFi.
            </p>

            {/* 2×2 Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Point Guard */}
              <motion.div
                className="relative rounded-2xl border border-white/[0.06] bg-[#0a0f0c]/60 p-5 overflow-hidden group hover:border-orange-400/20 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0, duration: 0.5 }}
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-400/60 to-transparent" />
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <span className="text-[9px] font-bold tracking-widest uppercase text-orange-400">Anti-Sybil</span>
                </div>
                <p className="text-2xl font-black text-white mb-1">Point Guard</p>
                <p className="text-xs text-white/35 leading-relaxed">Capital-gated. Only real staked participants earn rewards.</p>
              </motion.div>

              {/* Volume-Weighted */}
              <motion.div
                className="relative rounded-2xl border border-white/[0.06] bg-[#0a0f0c]/60 p-5 overflow-hidden group hover:border-[#00ff99]/20 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08, duration: 0.5 }}
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00ff99]/60 to-transparent" />
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-[#00ff99]" />
                  <span className="text-[9px] font-bold tracking-widest uppercase text-[#00ff99]">Volume Index</span>
                </div>
                <p className="text-2xl font-black text-white mb-1">$1 <span className="text-[#00ff99]">=</span> 1 pt</p>
                <p className="text-xs text-white/35 leading-relaxed">Deploy more capital, earn more points. No spam, no shortcuts.</p>
              </motion.div>

              {/* Luca Multiplier */}
              <motion.div
                className="relative rounded-2xl border border-white/[0.06] bg-[#0a0f0c]/60 p-5 overflow-hidden group hover:border-purple-400/20 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.16, duration: 0.5 }}
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-400/60 to-transparent" />
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-[9px] font-bold tracking-widest uppercase text-purple-400">Agent Boost</span>
                </div>
                <p className="text-2xl font-black text-white mb-1">1.2<span className="text-purple-400">×</span></p>
                <p className="text-xs text-white/35 leading-relaxed">Luca-initiated swaps earn a multiplier on every point.</p>
              </motion.div>

              {/* Live Leaderboard */}
              <motion.div
                className="relative rounded-2xl border border-white/[0.06] bg-[#0a0f0c]/60 p-5 overflow-hidden group hover:border-yellow-400/20 transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.24, duration: 0.5 }}
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-400/60 to-transparent" />
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-[9px] font-bold tracking-widest uppercase text-yellow-400">Real-time</span>
                </div>
                <p className="text-2xl font-black text-white mb-1">60s <span className="text-yellow-400">↻</span></p>
                <p className="text-xs text-white/35 leading-relaxed">Global rankings refreshed every minute across all modules.</p>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Right: Live Leaderboard Visual ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-[#00ff99]/15 bg-[#0a0f0c]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_50px_rgba(0,255,153,0.06)]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">Global Leaderboard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-pulse" />
                  <span className="text-[10px] text-[#00ff99]">Live</span>
                </div>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-12 px-5 py-2 text-[10px] text-white/25 uppercase tracking-wider border-b border-white/5">
                <span className="col-span-2">Rank</span>
                <span className="col-span-6">Wallet</span>
                <span className="col-span-4 text-right">Points</span>
              </div>

              {/* Leaderboard rows */}
              <div>
                {LEADERS.map((l, i) => {
                  const maxPts = 14820;
                  const pct = (parseInt(l.pts.replace(",", "")) / maxPts) * 100;
                  return (
                    <motion.div
                      key={l.rank}
                      className={`grid grid-cols-12 items-center px-5 py-3.5 border-b border-white/5 transition-colors hover:bg-white/2 ${i === 0 ? "bg-yellow-400/3" : ""}`}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                    >
                      <div className="col-span-2 text-sm">
                        {l.medal ? (
                          <span>{l.medal}</span>
                        ) : (
                          <span className="text-white/30">#{l.rank}</span>
                        )}
                      </div>
                      <div className="col-span-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00ff99]/20 to-[#00ff99]/5 border border-[#00ff99]/10 flex items-center justify-center text-[9px] text-[#00ff99] font-bold shrink-0">
                            {l.addr.slice(2, 4).toUpperCase()}
                          </div>
                          <span className="text-xs font-mono text-white/60">{l.addr}</span>
                        </div>
                        <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-white/60" : i === 2 ? "bg-orange-400" : "bg-[#00ff99]/60"}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.7 }}
                          />
                        </div>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className={`text-sm font-bold tabular-nums ${i === 0 ? "text-yellow-400" : "text-white/70"}`}>
                          {l.pts}
                        </span>
                        <span className="text-[10px] text-white/25 ml-1">pts</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer CTA */}
              <div className="px-5 py-4 bg-black/20">
                <a
                  href="https://app.kaleidofinance.xyz/leaderboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#00ff99]/20 bg-[#00ff99]/5 text-[#00ff99] text-xs font-semibold hover:bg-[#00ff99]/10 transition-all duration-200"
                >
                  View Full Leaderboard
                  <Trophy className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* How to earn pill */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Swap Volume", val: "$1 = 1pt" },
                { label: "Agent Swap", val: "$1 = 1.2pt" },
                { label: "Staking KLD", val: "10pt / KLD" },
              ].map((item) => (
                <div key={item.label} className="px-3 py-2.5 rounded-xl border border-white/5 bg-white/2 text-center">
                  <p className="text-[10px] text-white/30 mb-0.5">{item.label}</p>
                  <p className="text-xs font-bold text-[#00ff99]">{item.val}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PointEconomy;
