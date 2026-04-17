import React from 'react';
import Link from "next/link";
import 'remixicon/fonts/remixicon.css';

const Footer = () => {
  return (
    <footer className="bg-[#080b09] text-white pt-16 pb-8 px-6 md:px-10">
      {/* Top separator */}
      <div className="max-w-[1440px] mx-auto">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Logo + Socials — 3 cols */}
          <div className="col-span-2 md:col-span-3 text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-5 hover:opacity-80 transition-opacity group">
               <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.1] flex items-center justify-center p-1.5 overflow-hidden">
                <img src="/newklogo.png" alt="K" className="w-full h-full object-cover" />
               </div>
               <span className="text-lg font-bold tracking-tight text-white transition-colors">
                  Kaleido <span className="text-white/30 font-normal ml-0.5">OS</span>
                </span>
            </Link>
            <p className="text-xs text-white/25 leading-relaxed mb-6 max-w-[200px]">
              The autonomous financial layer powered by Luca AI.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://x.com/kaleido_finance" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-[#00ff99]/10 hover:border-[#00ff99]/20 transition-all">
                <i className="ri-twitter-x-line text-sm text-white/40 hover:text-[#00ff99]"></i>
              </a>
              <a href="https://discord.gg/VcegZwwbcC" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-[#00ff99]/10 hover:border-[#00ff99]/20 transition-all">
                <i className="ri-discord-fill text-sm text-white/40 hover:text-[#00ff99]"></i>
              </a>
              <a href="https://www.linkedin.com/company/kaleido-finance/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-[#00ff99]/10 hover:border-[#00ff99]/20 transition-all">
                <i className="ri-linkedin-fill text-sm text-white/40 hover:text-[#00ff99]"></i>
              </a>
            </div>
          </div>
 
          {/* Protocol */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-4">Protocol</h4>
            <ul className="space-y-2.5">
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Lending</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Omni-Pool DEX</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">KLD Staking</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">kfUSD Vault</a></li>
            </ul>
          </div>
 
          {/* Ecosystem */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-4">Ecosystem</h4>
            <ul className="space-y-2.5">
              <li><a href="/roadmap" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Roadmap</a></li>
              <li><a href="/leaderboard" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Leaderboard</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Launch App</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Docs</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Documentation</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Audits</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Tokenomics</a></li>
            </ul>
          </div>

          {/* Developers */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-4">Developers</h4>
            <ul className="space-y-2.5">
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">API / SDK</a></li>
              <li><a href="https://github.com/kaleidofinance" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">GitHub</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-[#00ff99] transition-colors">Smart Contracts</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-white/20">© 2026 Kaleido Agentic OS. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-xs text-white/20 hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="text-xs text-white/20 hover:text-white/40 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;