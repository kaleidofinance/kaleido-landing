import React from 'react';
import 'remixicon/fonts/remixicon.css';

const Footer = () => {
  return (
    <footer className="bg-[#111714] text-white pt-16 pb-8 px-4 border-t border-[#808080]/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-12">
        {/* Logo and Socials */}
        <div className="flex flex-col items-center gap-8 md:w-1/5">
          <div className="flex items-center">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <img src="/white-word.png" alt="Kaleido Finance Logo" className="w-30 h-10" />
            </a>
          </div>
          <div className="flex space-x-4 text-2xl">
            <a href="https://x.com/kaleido_finance" target='_blank' aria-label="X" className="hover:text-[#00dd72]"><i className="ri-twitter-x-line"></i></a>
            <a href="https://discord.gg/VcegZwwbcC" aria-label="Discord" target='_blank' className="hover:text-[#00dd72]"><i className="ri-discord-fill"></i></a>
            <a href="https://www.linkedin.com/company/kaleido-finance/" aria-label="LinkedIn" target='_blank' className="hover:text-[#00dd72]"><i className="ri-linkedin-fill"></i></a>
          </div>
        </div>
        {/* Navigation Columns */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-3">Products</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Lending & Borrowing</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">AMM DEX & Farming</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Liquid Staking</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Stablecoin</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Company</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/roadmap" className="hover:text-[#00dd72] transition-colors">Roadmap</a></li>
              <li><a href="/testnet" className="hover:text-[#00dd72] transition-colors">Testnet</a></li>
              <li><a href="/premium" className="hover:text-[#00dd72] transition-colors">Premium</a></li>
              <li><a href="https://app.kaleidofinance.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Open dApp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Resources</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Documentation</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">FAQ</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Audits</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Tokenomics</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Developers</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">API/SDK</a></li>
              <li><a href="https://github.com/kaleidofinance" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">GitHub</a></li>
              <li><a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Smart Contracts</a></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 flex flex-col items-center border-t border-[#808080]/20 pt-6">
        <div className="flex items-center space-x-6 mb-4">
          <span className="text-gray-400 text-sm">Copyright ©Kaleido Finance 2025</span>
        </div>
        <div className="flex space-x-8 text-sm text-gray-400">
          <a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Privacy Policy</a>
          <a href="https://kaleidos-finance.gitbook.io/kaleido/" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dd72] transition-colors">Terms and Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 