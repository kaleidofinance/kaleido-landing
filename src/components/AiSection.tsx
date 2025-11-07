"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Brain, 
  Search, 
  BarChart3, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Coins,
  Rocket
} from 'lucide-react';
import { GlowButton } from './GlowButton';

const AiSection = () => {
  return (
    <section className="py-20 px-8 sm:px-12 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* AI Illustration */}
          <div className="text-center lg:text-left">
            <div className="relative inline-block">
              <div className="w-48 h-48 mx-auto lg:mx-0 relative">
                {/* Outer glow layers */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#00dd72] via-[#00ff22] to-[#00dd72] rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[#00dd72]/20 via-[#00dd72]/20 to-[#00ff22]/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Main Bot Circle */}
                <motion.div
                  className="absolute inset-4 bg-gradient-to-br from-[#00dd72] to-[#00ff22] rounded-full flex items-center justify-center border-4 border-black relative z-10"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(0, 221, 114, 0.5), 0 0 40px rgba(0, 221, 114, 0.3)',
                      '0 0 30px rgba(0, 221, 114, 0.7), 0 0 60px rgba(0, 221, 114, 0.4)',
                      '0 0 20px rgba(0, 221, 114, 0.5), 0 0 40px rgba(0, 221, 114, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Inner glow on bot circle */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 blur-sm"></div>
                  <Bot className="w-20 h-20 text-black relative z-10" />
                </motion.div>
                
                {/* Small Brain Circle with enhanced glow */}
                <motion.div
                  className="absolute -top-4 -right-4 w-12 h-12 bg-[#00dd72] rounded-full flex items-center justify-center border-2 border-black relative z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 15px rgba(0, 221, 114, 0.6), 0 0 30px rgba(0, 221, 114, 0.4)',
                      '0 0 25px rgba(0, 221, 114, 0.8), 0 0 50px rgba(0, 221, 114, 0.5)',
                      '0 0 15px rgba(0, 221, 114, 0.6), 0 0 30px rgba(0, 221, 114, 0.4)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Outer glow for brain circle */}
                  <motion.div
                    className="absolute inset-0 bg-[#00dd72] rounded-full blur-lg -z-10"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <Brain className="w-6 h-6 text-black relative z-10" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-[#00dd72]/20 border border-[#00dd72]/30 text-[#00dd72] text-sm font-semibold mb-4">
                FREE for All Users
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-6 text-white">
              Meet <span className="text-[#00dd72]">Luca AI</span> — Your Intelligent DeFi Companion
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Luca AI is the smart brain behind Kaleido's seamless DeFi experience. 
              Get personalized guidance across <strong className="text-white">all products</strong> — from lending and trading 
              to staking, stablecoins, and launchpad opportunities. Navigate the entire Kaleido ecosystem with confidence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-[#00dd72]/20 border border-[#00dd72]/30">
                  <Search className="w-5 h-5 text-[#00dd72]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Smart Matching</h4>
                  <p className="text-sm text-gray-300">Finds optimal opportunities across all DeFi products</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-[#00dd72]/20 border border-[#00dd72]/30">
                  <BarChart3 className="w-5 h-5 text-[#00dd72]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Risk Assessment</h4>
                  <p className="text-sm text-gray-300">Analyzes positions across lending, trading, and staking</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-[#00dd72]/20 border border-[#00dd72]/30">
                  <TrendingUp className="w-5 h-5 text-[#00dd72]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Yield Optimization</h4>
                  <p className="text-sm text-gray-300">Finds best yields across pools, farms, and staking</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-[#00dd72]/20 border border-[#00dd72]/30">
                  <Zap className="w-5 h-5 text-[#00dd72]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Multi-Product Support</h4>
                  <p className="text-sm text-gray-300">Works across lending, DEX, staking, stablecoins & launchpad</p>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-black/60 border border-[#00dd72]/30">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Available everywhere:</strong> Luca AI is integrated throughout 
                the Kaleido platform — ask questions, get recommendations, and receive guidance on any product or feature.
              </p>
            </div>

            <GlowButton 
              className="group flex items-center"
              onClick={() => window.open('https://app.kaleidofinance.xyz/', '_blank')}
            >
              <Bot className="w-5 h-5 mr-2" />
              Try Luca AI Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </GlowButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiSection;
