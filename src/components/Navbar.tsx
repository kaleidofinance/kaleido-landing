"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Docs", href: "https://kaleidos-finance.gitbook.io/kaleido/", external: true },
  { label: "Ecosystem", href: "https://kaleidos-finance.gitbook.io/kaleido/", external: true },
  { label: "Governance", href: "https://kaleidos-finance.gitbook.io/kaleido/", external: true },
  { label: "Aegis", href: "https://aegis.kaleidofi.xyz", external: true, isNew: true },
  { label: "Roadmap", href: "/roadmap", external: false },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#080b09]/80 backdrop-blur-xl border-b border-white/[0.05] py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo - Clean Text Branding */}
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff99]/10 to-[#00dd72]/10 flex items-center justify-center overflow-hidden border border-white/[0.1] shadow-2xl">
              <img src="/newklogo.png" alt="K" className="w-full h-full object-cover" />
              <motion.div 
                className="absolute inset-0 rounded-xl border border-[#00ff99]/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#00ff99] transition-colors">
              Kaleido <span className="text-white/30 font-normal ml-0.5">DeFi-OS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 p-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                rel={link.external ? "noopener noreferrer" : ""}
                className="relative px-3.5 py-1.5 text-[13px] font-semibold text-white/50 hover:text-white transition-all duration-200 rounded-full hover:bg-white/[0.05]"
              >
                {link.label}
                {link.isNew && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff99] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff99]"></span>
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* CTA Group */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://aegis.kaleidofi.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-white/70 font-semibold text-xs tracking-wider hover:bg-white/[0.06] hover:text-white transition-all duration-300"
            >
              Aegis Sentinel
            </a>
            <a
              href="https://app.kaleido.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#00ff99] to-[#00dd72] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,153,0.2)] hover:shadow-[0_0_30px_rgba(0,255,153,0.4)]"
            >
              Launch App
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pt-20 bg-[#0a0f0c]/98 backdrop-blur-2xl flex flex-col px-6 gap-6 md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : "_self"}
                rel={link.external ? "noopener noreferrer" : ""}
                onClick={() => setMobileOpen(false)}
                className="text-xl font-semibold text-white/70 hover:text-[#00ff99] transition-colors py-2 border-b border-white/5 flex items-center justify-between"
              >
                <span>{link.label}</span>
                {link.isNew && (
                  <span className="text-[10px] font-bold text-black bg-[#00ff99] px-1.5 py-0.5 rounded-full">NEW</span>
                )}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <a
                href="https://aegis.kaleidofi.xyz"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 text-sm font-semibold text-white/70 bg-white/5 border border-white/10 rounded-xl"
              >
                Aegis Sentinel
              </a>
              <a
                href="https://app.kaleido.xyz"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-black bg-[#00ff99] rounded-xl shadow-[0_0_20px_rgba(0,255,153,0.3)]"
              >
                Launch App <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
