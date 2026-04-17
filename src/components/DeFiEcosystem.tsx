"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Activity, ChevronDown, ChevronUp } from "lucide-react";
import ComingSoonModal from "./ComingSoonModal";

interface YieldCard {
  id: string;
  title: string;
  description: string;
  apy: string;
  points: string;
  metrics: {
    label: string;
    value: string;
  }[];
  action: string;
  icon?: string;
}

const DeFiEcosystem: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  const openComingSoon = (title: string) => {
    setSelectedProduct(title);
    setModalOpen(true);
  };
  
  const yieldOpportunities: YieldCard[] = [
    {
      id: "featured-pool",
      title: "Featured Pool Lending",
      description: "Lend USDC, USDT, USDe through featured pools with instant liquidity",
      apy: "≈8.0%",
      points: "$1 = 1 pt · Lending",
      metrics: [
        { label: "Total Pool", value: "$500.00K" },
        { label: "Borrowed", value: "$250.00K" },
        { label: "Utilization", value: "50%" },
        { label: "Liquidity", value: "$250.00K" }
      ],
      action: "Lend Now",
      icon: "K"
    },
    {
      id: "vault-yield",
      title: "kfUSD Yield Vault",
      description: "Lock kfUSD to earn yield funded by lending interest and fees",
      apy: "≈5.0%",
      points: "$1 = 1 pt · Vault",
      metrics: [
        { label: "TVL", value: "$1.50M" },
        { label: "kafUSD", value: "1.58M" },
        { label: "Total Yield", value: "$75.00K" },
        { label: "APY", value: "5.0%" }
      ],
      action: "Lock Assets",
      icon: "Y"
    },
    {
      id: "liquidity-pool",
      title: "USDC/USDT Liquidity",
      description: "Provide liquidity to stablecoin trading pairs and earn fees",
      apy: "≈12.5%",
      points: "$1 = 1.2 pt · Luca LP",
      metrics: [
        { label: "Liquidity", value: "$2.75M" },
        { label: "Volume (24h)", value: "$187.50K" },
        { label: "24h Fees", value: "$2.50K" },
        { label: "Pool Share", value: "3.2%" }
      ],
      action: "Add Liquidity",
      icon: "L"
    },
    {
      id: "trading",
      title: "V3 Omni-Pool DEX",
      description: "Swap tokens with concentrated liquidity and best-route execution via Luca AI",
      apy: "0.3%",
      points: "$1 = 1.2 pt · Agent Swap",
      metrics: [
        { label: "24h Volume", value: "$1.25M" },
        { label: "Total Pairs", value: "45+" },
        { label: "24h Fees", value: "$3.75K" },
        { label: "Fee Rate", value: "0.3%" }
      ],
      action: "Trade Now",
      icon: "T"
    },
    {
      id: "kld-staking",
      title: "KLD Liquid Staking",
      description: "Stake KLD to mint stKLD — earn yield while keeping full derivative liquidity",
      apy: "≈15.0%",
      points: "10 pt / KLD staked",
      metrics: [
        { label: "Total Staked", value: "$3.50M" },
        { label: "stKLD Supply", value: "3.25M" },
        { label: "APY", value: "15.0%" },
        { label: "Stakers", value: "1.2K" }
      ],
      action: "Stake Now",
      icon: "S"
    }
  ];

  const getIconElement = (icon?: string) => {
    if (!icon) return null;
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00dd72]/20 to-[#00dd72]/10 border border-[#00dd72]/30">
        <span className="text-lg font-bold text-[#00dd72]">{icon}</span>
      </div>
    );
  };

  return (
    <motion.section
      className="py-20 px-8 sm:px-12 lg:px-16 xl:px-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-[#00ff99]/40" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[#00ff99]">App Preview</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="h-7 w-7 text-[#00ff99]" />
              <h2 className="text-3xl font-bold text-white">
                Inside the <span className="text-[#00ff99]">Kaleido Agentic OS</span>
              </h2>
            </div>
          </div>
          <span className="rounded-full bg-[#00ff99]/10 px-4 py-1 text-sm font-semibold text-[#00ff99] border border-[#00ff99]/25">
            Kaleido Native
          </span>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAll ? yieldOpportunities : yieldOpportunities.slice(0, 3)).map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              className="group relative overflow-hidden rounded-2xl border border-[#00dd72]/20 bg-gradient-to-br from-black/40 via-black/30 to-black/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#00dd72]/40 hover:shadow-lg hover:shadow-[#00dd72]/20 hover:scale-[1.02] hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Animated Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00dd72]/5 via-transparent to-[#00dd72]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              {/* Glowing Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00dd72]/5 to-transparent" />
              </div>
              
              <div className="relative z-10">
                {/* Header with Animation */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3 group/icon">
                    <motion.div
                      className="transition-transform duration-300 group-hover/icon:scale-110 group-hover/icon:rotate-3"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      {getIconElement(opportunity.icon)}
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-[#00dd72]">
                        {opportunity.title}
                      </h3>
                      <p className="text-xs text-gray-400">{opportunity.points}</p>
                    </div>
                  </div>
                </div>

                {/* APY Badge with Pulse Animation */}
                <div className="mb-4 flex items-center gap-2">
                  <motion.span
                    className="rounded-lg bg-gradient-to-r from-[#00dd72]/20 to-[#00dd72]/10 px-3 py-1 text-lg font-bold text-[#00dd72] border border-[#00dd72]/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#00dd72]/50"
                    whileHover={{ scale: 1.05 }}
                  >
                    {opportunity.apy}
                  </motion.span>
                  <span className="text-sm text-gray-400">Current APY</span>
                </div>

                {/* Description */}
                <p className="mb-4 text-sm text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                  {opportunity.description}
                </p>

                {/* Metrics with Subtle Animation */}
                <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg bg-black/30 p-3 transition-all duration-300 group-hover:bg-black/40">
                  {opportunity.metrics.map((metric, idx) => (
                    <motion.div
                      key={idx}
                      className="space-y-1 transition-transform duration-300 group-hover:translate-x-1"
                      whileHover={{ x: 5 }}
                    >
                      <p className="text-xs text-gray-400">{metric.label}</p>
                      <p className="text-sm font-semibold text-white group-hover:text-[#00dd72] transition-colors duration-300">
                        {metric.value}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Action Button with Enhanced Animation */}
                <motion.button
                  className="group/btn flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-[#00dd72]/20 to-[#00dd72]/10 px-4 py-3 text-white transition-all duration-200 hover:from-[#00dd72]/30 hover:to-[#00dd72]/20 border border-[#00dd72]/30 hover:shadow-lg hover:shadow-[#00dd72]/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openComingSoon(opportunity.title)}
                >
                  <span className="font-semibold transition-all duration-200 group-hover/btn:translate-x-1">
                    {opportunity.action}
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-2 group-hover/btn:scale-110" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {yieldOpportunities.length > 3 && (
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={() => setShowAll(!showAll)}
              className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00dd72]/20 to-[#00dd72]/10 border border-[#00dd72]/30 text-[#00dd72] font-semibold transition-all duration-200 hover:from-[#00dd72]/30 hover:to-[#00dd72]/20 hover:shadow-lg hover:shadow-[#00dd72]/30 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{showAll ? "Show Less" : "Show More"}</span>
              {showAll ? (
                <ChevronUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1" />
              ) : (
                <ChevronDown className="w-5 h-5 transition-transform duration-200 group-hover:translate-y-1" />
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Info Banner */}
        <motion.div
          className="rounded-xl border border-[#00ff99]/15 bg-gradient-to-r from-[#00ff99]/5 via-transparent to-[#00ff99]/5 p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00ff99]/10 shrink-0">
              <TrendingUp className="h-5 w-5 text-[#00ff99]" />
            </div>
            <div className="flex-1">
              <h4 className="mb-1 font-semibold text-white">Unified Yield across the Agentic OS Stack</h4>
              <p className="text-sm text-gray-300">
                Every product inside Kaleido Agentic OS feeds our volume-weighted Point Indexer — $1 of activity
                earns 1 point. Agent-powered actions via Luca earn a 1.2× multiplier. All points flow to the
                Global Leaderboard in real time.
              </p>
              <p className="text-xs text-white/25 mt-3 italic">* Figures shown are illustrative previews of the live app interface.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <ComingSoonModal
        open={modalOpen}
        product={selectedProduct}
        onClose={() => setModalOpen(false)}
      />
    </motion.section>
  );
};

export default DeFiEcosystem;

