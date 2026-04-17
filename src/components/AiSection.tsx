"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Send, Cpu, Zap, Shield, TrendingUp } from "lucide-react";

// ── Luca capabilities shown in the left panel ──────────────────────────
const CAPABILITIES = [
  {
    icon: Zap,
    title: "Intent-Based Swaps",
    desc: "Say what you want. Luca finds the best route and executes it.",
  },
  {
    icon: TrendingUp,
    title: "LP Position Management",
    desc: "Get real-time insights on your concentrated liquidity performance.",
  },
  {
    icon: Shield,
    title: "Portfolio Risk Scoring",
    desc: "Health factor monitoring across lending, staking, and DEX positions.",
  },
  {
    icon: Cpu,
    title: "Autonomous Execution",
    desc: "Luca doesn't just advise — it acts, on your behalf, with precision.",
  },
];

// ── Pre-scripted demo conversation ─────────────────────────────────────
const DEMO_CONVERSATION = [
  {
    role: "user",
    text: "swap 500 USDC to KLD and put it in the best yield pool",
  },
  {
    role: "luca",
    text: "On it. Routing 500 USDC → KLD via the V3 Omni-Pool (best price: 0.98% slippage). Once confirmed, I'll deploy it into the KLD/ETH 0.3% concentrated pool at the current optimal tick range.",
    typing: true,
  },
  {
    role: "luca",
    text: "✓ Swap executed. 512.4 KLD received.\n✓ LP Position opened: KLD/ETH · Tick [−887, +887]\n✓ Point Guard: +512 pts logged to your account.",
    typing: false,
  },
  {
    role: "user",
    text: "what's my health factor right now?",
  },
  {
    role: "luca",
    text: "Your portfolio health is **1.84** — Safe zone. You have $3,200 collateral against $1,100 borrowed. You can safely borrow up to $880 more before approaching the warning threshold.",
    typing: true,
  },
];

// Typing dots animation
const TypingDots = () => (
  <div className="flex items-center gap-1 py-1 px-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-[#00ff99]/60"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
      />
    ))}
  </div>
);

const AiSection = () => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Run the demo when user clicks "See it in action"
  useEffect(() => {
    if (!started) return;

    let i = 0;
    const schedule = (msgs: typeof DEMO_CONVERSATION) => {
      if (i >= msgs.length) return;
      const msg = msgs[i];
      const delay = i === 0 ? 400 : 1600;

      setTimeout(() => {
        if (msg.role === "luca" && msg.typing) {
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            setVisibleCount((c) => c + 1);
            i++;
            schedule(msgs);
          }, 1400);
        } else {
          setVisibleCount((c) => c + 1);
          i++;
          schedule(msgs);
        }
      }, delay);
    };

    schedule(DEMO_CONVERSATION);
  }, [started]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, showTyping]);

  const displayed = DEMO_CONVERSATION.slice(0, visibleCount);

  return (
    <section className="relative bg-[#080b09] py-16 px-6 md:px-10 overflow-hidden w-full">
      {/* Background glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff99]/4 rounded-full blur-[100px] pointer-events-none" />

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
            Agentic Core
          </span>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* ── Left: Copy + Capabilities ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Meet{" "}
              <span className="bg-gradient-to-r from-[#00ff99] to-[#00dd72] bg-clip-text text-transparent">
                Luca
              </span>
              <br />
              <span className="text-white/60 text-2xl font-normal">
                Your Agentic Co-Pilot
              </span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-8 max-w-sm">
              Luca isn't a chatbot — it's the reasoning engine of Kaleido Agentic OS. It
              interprets your intent and executes DeFi actions autonomously across the entire
              protocol stack.
            </p>

            <div className="space-y-5">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  className="flex items-start gap-4 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="shrink-0 p-2.5 rounded-lg border border-[#00ff99]/20 bg-[#00ff99]/5 group-hover:border-[#00ff99]/40 group-hover:bg-[#00ff99]/10 transition-all duration-200">
                    <cap.icon className="w-4 h-4 text-[#00ff99]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{cap.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{cap.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="https://app.kaleidofinance.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ff99] text-black text-sm font-bold hover:bg-[#00ff99]/90 transition-all duration-200 shadow-[0_0_20px_rgba(0,255,153,0.3)] hover:shadow-[0_0_35px_rgba(0,255,153,0.5)] group"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Talk to Luca
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </motion.div>

          {/* ── Right: Interactive Chat Demo ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl border border-[#00ff99]/15 bg-[#0a0f0c]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_50px_rgba(0,255,153,0.06)]">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-black/20">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ff99] to-[#00dd72] flex items-center justify-center text-black font-black text-xs">
                    L
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00ff99] border-2 border-[#0a0f0c]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Luca</p>
                  <p className="text-[10px] text-[#00ff99]">● Online · Agentic Mode</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[320px] max-h-[380px] overflow-y-auto scrollbar-none">
                {/* Initial greeting */}
                <motion.div
                  className="flex gap-2.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00ff99] to-[#00dd72] flex items-center justify-center text-black font-black text-[9px] shrink-0 mt-1">
                    L
                  </div>
                  <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%]">
                    <p className="text-xs text-white/70 leading-relaxed">
                      Hey 👋 I'm Luca. Tell me what you want to do — I'll handle the rest across
                      the entire Kaleido stack.
                    </p>
                  </div>
                </motion.div>

                {/* Demo messages */}
                <AnimatePresence>
                  {displayed.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                      {msg.role === "luca" && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00ff99] to-[#00dd72] flex items-center justify-center text-black font-black text-[9px] shrink-0 mt-1">
                          L
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === "user"
                            ? "bg-[#00ff99]/10 border border-[#00ff99]/20 text-white rounded-tr-none"
                            : "bg-white/5 border border-white/8 text-white/70 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {showTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00ff99] to-[#00dd72] flex items-center justify-center text-black font-black text-[9px] shrink-0">
                        L
                      </div>
                      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-none px-4 py-2.5">
                        <TypingDots />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="px-4 py-3 border-t border-white/5 bg-black/20">
                {!started ? (
                  <button
                    onClick={() => setStarted(true)}
                    className="w-full py-2.5 rounded-xl bg-[#00ff99]/10 border border-[#00ff99]/25 text-[#00ff99] text-xs font-semibold hover:bg-[#00ff99]/15 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span className="animate-pulse">▶</span> See Luca in action
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Ask Luca anything..."
                      className="flex-1 bg-transparent text-xs text-white/60 placeholder-white/20 outline-none"
                    />
                    <button className="p-1.5 rounded-lg bg-[#00ff99]/10 border border-[#00ff99]/20 text-[#00ff99] hover:bg-[#00ff99]/20 transition-all">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute -top-4 -right-4 px-3 py-2 rounded-xl border border-[#00ff99]/20 bg-[#0a0f0c]/90 backdrop-blur-xl text-[10px] font-bold text-[#00ff99] shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, type: "spring" }}
            >
              +1.2x pts on Agent Swaps
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AiSection;
