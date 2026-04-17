"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, LayoutDashboard, DollarSign, Coins, ArrowLeftRight, Zap } from "lucide-react";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DemoScreen {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  imagePath?: string; // Path to screenshot/GIF
  fallbackContent?: React.ReactNode; // Fallback if image not found
}

const DemoModal: React.FC<DemoModalProps> = ({ open, onOpenChange }) => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const demoScreens: DemoScreen[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: "Overview of your portfolio and activity",
      imagePath: "/demo-screens/dashboard.png",
      fallbackContent: (
        <div className="space-y-4">
          {/* Dashboard Header */}
          <div className="bg-gradient-to-r from-black/60 to-black/40 rounded-lg p-4 border border-[#00dd72]/20">
            <h3 className="text-xl font-bold text-white mb-2">Welcome, User</h3>
            <p className="text-sm text-gray-400">Your DeFi portfolio at a glance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <p className="text-xs text-gray-400 mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-[#00dd72]">$12,450.50</p>
            </div>
            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <p className="text-xs text-gray-400 mb-1">Active Loans</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <p className="text-xs text-gray-400 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-[#00dd72]">$1,234.56</p>
            </div>
            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <p className="text-xs text-gray-400 mb-1">Health Factor</p>
              <p className="text-2xl font-bold text-green-400">1.85</p>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
            <h4 className="text-lg font-semibold text-white mb-3">Recent Activity</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                <div>
                  <p className="text-sm text-white">Lent 1,000 USDC</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
                <span className="text-sm text-[#00dd72]">+$45.20</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                <div>
                  <p className="text-sm text-white">Minted 500 kfUSD</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
                <span className="text-sm text-[#00dd72]">+$500.00</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "marketplace",
      title: "Marketplace",
      icon: <DollarSign className="w-5 h-5" />,
      description: "Browse and create lending/borrowing opportunities",
      imagePath: "/demo-screens/marketplace.png",
      fallbackContent: (
        <div className="space-y-4">
          {/* Marketplace Header */}
          <div className="bg-gradient-to-r from-black/60 to-black/40 rounded-lg p-4 border border-[#00dd72]/20">
            <h3 className="text-xl font-bold text-white mb-2">Lending Marketplace</h3>
            <p className="text-sm text-gray-400">Find the best rates for lending and borrowing</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-black/60 rounded-lg p-3 border border-[#00dd72]/20 flex gap-2">
            <button className="px-4 py-2 bg-[#00dd72]/20 text-[#00dd72] rounded-lg text-sm font-semibold">All</button>
            <button className="px-4 py-2 text-gray-400 rounded-lg text-sm">Lend</button>
            <button className="px-4 py-2 text-gray-400 rounded-lg text-sm">Borrow</button>
          </div>

          {/* Loan Listings */}
          <div className="space-y-3">
            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00dd72]/20 flex items-center justify-center">
                    <span className="text-[#00dd72] font-bold">USDC</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Lend USDC</p>
                    <p className="text-xs text-gray-400">Amount: 5,000 USDC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00dd72] font-bold">8.5% APY</p>
                  <p className="text-xs text-gray-400">30 days</p>
                </div>
              </div>
              <button className="w-full bg-[#00dd72]/20 hover:bg-[#00dd72]/30 text-[#00dd72] py-2 rounded-lg text-sm font-semibold transition-colors">
                Lend Now
              </button>
            </div>

            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00dd72]/20 flex items-center justify-center">
                    <span className="text-[#00dd72] font-bold">USDT</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Borrow USDT</p>
                    <p className="text-xs text-gray-400">Amount: 2,000 USDT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#00dd72] font-bold">10.2% APR</p>
                  <p className="text-xs text-gray-400">60 days</p>
                </div>
              </div>
              <button className="w-full bg-[#00dd72]/20 hover:bg-[#00dd72]/30 text-[#00dd72] py-2 rounded-lg text-sm font-semibold transition-colors">
                Borrow Now
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "stablecoin",
      title: "Stablecoin",
      icon: <Coins className="w-5 h-5" />,
      description: "Mint, redeem, and earn yield with kfUSD",
      imagePath: "/demo-screens/stablecoin.png",
      fallbackContent: (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/60 rounded-lg p-3 border border-[#00dd72]/20 text-center">
              <p className="text-xs text-gray-400 mb-1">TVL</p>
              <p className="text-lg font-bold text-[#00dd72]">$2.5M</p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 border border-[#00dd72]/20 text-center">
              <p className="text-xs text-gray-400 mb-1">Supply</p>
              <p className="text-lg font-bold text-white">2.3M</p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 border border-[#00dd72]/20 text-center">
              <p className="text-xs text-gray-400 mb-1">APY</p>
              <p className="text-lg font-bold text-[#00dd72]">5.0%</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-700/50">
            <button className="px-4 py-2 border-b-2 border-[#00dd72] text-[#00dd72] font-semibold">Mint</button>
            <button className="px-4 py-2 text-gray-400">Redeem</button>
            <button className="px-4 py-2 text-gray-400">Lock</button>
            <button className="px-4 py-2 text-gray-400">Withdraw</button>
          </div>

          {/* Mint Interface */}
          <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Amount</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value="1,000"
                  readOnly
                  className="flex-1 bg-black/40 border border-[#00dd72]/30 rounded-lg px-4 py-3 text-white text-xl font-semibold"
                />
                <button className="px-4 py-2 bg-[#00dd72]/20 text-[#00dd72] rounded-lg font-semibold">
                  USDC
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">You'll receive</label>
              <div className="bg-black/40 border border-[#00dd72]/30 rounded-lg px-4 py-3">
                <p className="text-white text-xl font-semibold">997 kfUSD</p>
                <p className="text-xs text-gray-400">Fee: 0.3%</p>
              </div>
            </div>
            <button className="w-full bg-[#00dd72] hover:bg-[#00dd72]/90 text-black py-3 rounded-lg font-bold transition-colors">
              Mint kfUSD
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "swap",
      title: "Swap",
      icon: <ArrowLeftRight className="w-5 h-5" />,
      description: "Trade tokens instantly on our DEX",
      imagePath: "/demo-screens/swap.png",
      fallbackContent: (
        <div className="space-y-4">
          {/* Swap Header */}
          <div className="bg-gradient-to-r from-black/60 to-black/40 rounded-lg p-4 border border-[#00dd72]/20">
            <h3 className="text-xl font-bold text-white mb-2">Swap Tokens</h3>
            <p className="text-sm text-gray-400">Low slippage, instant swaps</p>
          </div>

          {/* Swap Interface */}
          <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
            {/* From */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">From</label>
              <div className="bg-black/40 border border-[#00dd72]/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value="100"
                    readOnly
                    className="bg-transparent text-white text-2xl font-semibold w-full"
                  />
                  <button className="flex items-center gap-2 px-3 py-1 bg-[#00dd72]/20 text-[#00dd72] rounded-lg font-semibold">
                    <span>USDC</span>
                  </button>
                </div>
                <p className="text-xs text-gray-400">Balance: 1,234.56 USDC</p>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center -my-2">
              <div className="bg-black/80 border border-[#00dd72]/30 rounded-full p-2">
                <ArrowLeftRight className="w-5 h-5 text-[#00dd72]" />
              </div>
            </div>

            {/* To */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">To</label>
              <div className="bg-black/40 border border-[#00dd72]/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value="99.7"
                    readOnly
                    className="bg-transparent text-white text-2xl font-semibold w-full"
                  />
                  <button className="flex items-center gap-2 px-3 py-1 bg-[#00dd72]/20 text-[#00dd72] rounded-lg font-semibold">
                    <span>USDT</span>
                  </button>
                </div>
                <p className="text-xs text-gray-400">Balance: 0 USDT</p>
              </div>
            </div>

            {/* Swap Button */}
            <button className="w-full bg-[#00dd72] hover:bg-[#00dd72]/90 text-black py-3 rounded-lg font-bold transition-colors">
              Swap
            </button>
          </div>

          {/* Price Info */}
          <div className="bg-black/60 rounded-lg p-3 border border-[#00dd72]/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Price Impact</span>
              <span className="text-white">0.1%</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-400">Fee</span>
              <span className="text-white">0.3%</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "stake",
      title: "Staking",
      icon: <Zap className="w-5 h-5" />,
      description: "Stake KLD tokens to earn rewards",
      imagePath: "/demo-screens/staking.png",
      fallbackContent: (
        <div className="space-y-4">
          {/* Staking Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <p className="text-xs text-gray-400 mb-2">Total Staked</p>
              <p className="text-2xl font-bold text-[#00dd72]">$3.5M</p>
            </div>
            <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
              <p className="text-xs text-gray-400 mb-2">APY</p>
              <p className="text-2xl font-bold text-[#00dd72]">15.0%</p>
            </div>
          </div>

          {/* Staking Interface */}
          <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
            <h4 className="text-lg font-semibold text-white mb-4">Stake KLD</h4>
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Amount</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value="1,000"
                  readOnly
                  className="flex-1 bg-black/40 border border-[#00dd72]/30 rounded-lg px-4 py-3 text-white text-xl font-semibold"
                />
                <button className="px-4 py-2 bg-[#00dd72]/20 text-[#00dd72] rounded-lg font-semibold">
                  KLD
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Balance: 5,000 KLD</p>
            </div>
            <div className="mb-4 bg-black/40 border border-[#00dd72]/30 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">You'll receive</p>
              <p className="text-xl font-bold text-white">1,000 stKLD</p>
              <p className="text-xs text-gray-400 mt-1">Earn rewards while maintaining liquidity</p>
            </div>
            <button className="w-full bg-[#00dd72] hover:bg-[#00dd72]/90 text-black py-3 rounded-lg font-bold transition-colors">
              Stake KLD
            </button>
          </div>

          {/* Your Staking */}
          <div className="bg-black/60 rounded-lg p-4 border border-[#00dd72]/20">
            <h4 className="text-lg font-semibold text-white mb-3">Your Staking</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Staked</span>
                <span className="text-white font-semibold">2,500 stKLD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Earned</span>
                <span className="text-[#00dd72] font-semibold">+$125.50</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextScreen = () => {
    setCurrentScreen((prev) => (prev + 1) % demoScreens.length);
  };

  const prevScreen = () => {
    setCurrentScreen((prev) => (prev - 1 + demoScreens.length) % demoScreens.length);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Backdrop */}
      <div
        onClick={() => onOpenChange(false)}
        className="absolute inset-0"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl h-[90vh] max-h-[800px] mx-4 bg-[#111714] border border-[#00dd72]/30 rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#00dd72]/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00dd72]/20 rounded-lg">
                  <Play className="w-5 h-5 text-[#00dd72]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Kaleido DeFi-OS Demo</h2>
                  <p className="text-sm text-gray-400">Interactive UI Preview</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-black/40 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

          {/* Screen Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[#00dd72]/20 bg-black/20 overflow-x-auto">
            {demoScreens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreen(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  currentScreen === index
                    ? "bg-[#00dd72]/20 text-[#00dd72] border border-[#00dd72]/30"
                    : "text-gray-400 hover:text-white hover:bg-black/40"
                }`}
              >
                {screen.icon}
                <span className="font-semibold">{screen.title}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-black/40 to-black/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {demoScreens[currentScreen].title}
                  </h3>
                  <p className="text-gray-400">{demoScreens[currentScreen].description}</p>
                </div>
                <div className="bg-black/60 rounded-xl border border-[#00dd72]/20 min-h-[500px] overflow-hidden relative flex items-center justify-center">
                  {demoScreens[currentScreen].imagePath ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={demoScreens[currentScreen].imagePath}
                        alt={`${demoScreens[currentScreen].title} Preview`}
                        className="w-full h-full object-contain max-h-[600px]"
                        onError={(e) => {
                          // Hide image if it fails to load, fallback will show
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const fallback = img.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      {demoScreens[currentScreen].fallbackContent && (
                        <div className="hidden p-6 w-full" style={{ display: 'none' }}>
                          {demoScreens[currentScreen].fallbackContent}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 w-full">
                      {demoScreens[currentScreen].fallbackContent}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[#00dd72]/20 bg-black/20">
            <button
              onClick={prevScreen}
              disabled={currentScreen === 0}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {demoScreens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentScreen(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentScreen === index
                      ? "bg-[#00dd72] w-8"
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextScreen}
              disabled={currentScreen === demoScreens.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-[#00dd72]/20 hover:bg-[#00dd72]/30 text-[#00dd72] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* CTA Footer */}
          <div className="p-6 border-t border-[#00dd72]/20 bg-gradient-to-r from-[#00dd72]/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Ready to explore?</p>
                <p className="text-sm text-gray-400">Try the full experience on our platform</p>
              </div>
              <button
                onClick={() => {
                  window.open('https://app.kaleido.xyz', '_blank');
                  onOpenChange(false);
                }}
                className="px-6 py-3 bg-[#00dd72] hover:bg-[#00dd72]/90 text-black font-bold rounded-lg transition-colors"
              >
                Open DApp
              </button>
            </div>
          </div>
        </motion.div>
    </div>
  );
};

export default DemoModal;

