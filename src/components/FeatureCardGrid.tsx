"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  Unlock, 
  TrendingUp,
  Zap,
  Coins, 
  Brain,
  Rocket,
  ArrowRight
} from "lucide-react";
import { GlassCard } from "./GlassCard";
import { GlowButton } from "./GlowButton";

const FeatureCardGrid = () => {
  return (
    <motion.section
      className="py-20 px-8 sm:px-12 lg:px-16 xl:px-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            <span className="text-[#00dd72]">All-in-One</span> DeFi Platform
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-2">
            Access Every Major DeFi Primitive in One Place
          </p>
          <p className="text-[#00dd72] font-semibold">
            Powered by AI Intelligence & Modular Architecture
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Lending & Borrowing */}
          <GlassCard className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#00dd72]/20 mr-4 border border-[#00dd72]/30">
                <DollarSign className="w-6 h-6 text-[#00dd72]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Lending & Borrowing</h3>
                <p className="text-gray-400 text-sm">P2P Marketplace</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Earn passive returns or access liquidity instantly with AI-powered risk matching and optimal terms.
            </p>
          </GlassCard>

          {/* 2. AMM DEX & Farm */}
          <GlassCard className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#00dd72]/20 mr-4 border border-[#00dd72]/30">
                <TrendingUp className="w-6 h-6 text-[#00dd72]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AMM DEX & Farm</h3>
                <p className="text-gray-400 text-sm">Trading & Yield Farming</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Instant token swaps with low slippage, liquidity pools with competitive APRs, and yield farming with multipliers.
            </p>
          </GlassCard>

          {/* 3. Liquid Staking */}
          <GlassCard className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#00dd72]/20 mr-4 border border-[#00dd72]/30">
                <Zap className="w-6 h-6 text-[#00dd72]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Liquid Staking</h3>
                <p className="text-gray-400 text-sm">Stake KLD → Earn stKLD</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Stake KLD tokens to earn stKLD rewards while maintaining liquidity. No lock-up periods, real-time rewards tracking.
            </p>
          </GlassCard>

          {/* 4. Stablecoin (kfUSD) */}
          <GlassCard className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#00dd72]/20 mr-4 border border-[#00dd72]/30">
                <Coins className="w-6 h-6 text-[#00dd72]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Stablecoin</h3>
                <p className="text-gray-400 text-sm">kfUSD + kafUSD Yield Vault</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Multi-collateral stablecoin (USDC, USDT, USDe). Lock kfUSD to earn yield in kafUSD with 1:1 conversion.
            </p>
          </GlassCard>

          {/* 5. Luca AI */}
          <GlassCard className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#00dd72]/20 mr-4 border border-[#00dd72]/30">
                <Brain className="w-6 h-6 text-[#00dd72]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Luca AI</h3>
                <p className="text-gray-400 text-sm">FREE AI Assistant</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Personalized guidance across all DeFi operations. Yield optimization, risk assessment, and smart recommendations.
            </p>
          </GlassCard>

          {/* 6. IDO Launchpad */}
          <GlassCard className="p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-[#00dd72]/20 mr-4 border border-[#00dd72]/30">
                <Rocket className="w-6 h-6 text-[#00dd72]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">IDO Launchpad</h3>
                <p className="text-gray-400 text-sm">Fundraising Platform</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Fundraise directly on Kaleido across chains. List tokens and create pools on any network with multi-chain exposure.
            </p>
          </GlassCard>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <GlowButton
            size="lg"
            className="group flex items-center justify-center mx-auto"
            onClick={() => window.open('https://app.kaleidofinance.xyz', '_blank')}
          >
            Explore All Products
            <ArrowRight className="w-5 h-5 ml-2" />
          </GlowButton>
        </div>
      </div>
    </motion.section>
  );
};

export default FeatureCardGrid;
