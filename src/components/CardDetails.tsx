"use client";
import React from 'react';
import { Shield, Zap, Bot, Layers } from 'lucide-react';
import { GlassCard } from './GlassCard';

const CardDetails = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-white">Secure Your Assets and Expand Your Portfolio</h2>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Built with modular architecture, multi-chain support, and AI-powered safety across all DeFi products
        </p>
        
        <GlassCard className="max-w-4xl mx-auto p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00dd72] to-[#00ff22] rounded-full flex items-center justify-center border-2 border-black">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Enterprise Security</h3>
              <p className="text-gray-300 text-sm">Audited contracts with comprehensive protection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00dd72] to-[#00ff22] rounded-full flex items-center justify-center border-2 border-black">
                <Layers className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Multi-Chain</h3>
              <p className="text-gray-300 text-sm">Abstract, Arbitrum, Polygon, Base & Ethereum</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00dd72] to-[#00ff22] rounded-full flex items-center justify-center border-2 border-black">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Modular Architecture</h3>
              <p className="text-gray-300 text-sm">Diamond Standard for seamless upgrades</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#00dd72] to-[#00ff22] rounded-full flex items-center justify-center border-2 border-black">
                <Bot className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">AI Safety Checks</h3>
              <p className="text-gray-300 text-sm">Intelligent monitoring and risk assessment</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default CardDetails;


