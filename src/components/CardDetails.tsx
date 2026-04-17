"use client";
import React from 'react';
import { ShieldAlert, Zap, Cpu, ScanSearch } from 'lucide-react';
import { GlassCard } from './GlassCard';

const CardDetails = () => {
  return (
    <section className="bg-[#080b09] py-24 px-6 md:px-10 w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="h-px w-8 bg-[#00ff99]/40" />
          <span className="text-xs font-semibold tracking-widest uppercase text-[#00ff99]">System Security</span>
          <span className="h-px w-8 bg-[#00ff99]/40" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">Engineered for <span className="bg-gradient-to-r from-[#00ff99] to-[#00dd72] bg-clip-text text-transparent">Autonomous Finance</span></h2>
        <p className="max-w-3xl mx-auto text-lg text-white/50 leading-relaxed mb-16">
          The Kaleido Agentic OS is built on a high-security, upgradeable diamond-modular core, designed for continuous autonomous execution.
        </p>
        
        <GlassCard className="max-w-6xl mx-auto p-12 hover:border-[#00ff99]/20 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#00ff99] to-[#00dd72] rounded-2xl flex items-center justify-center border-2 border-black/20 group-hover:scale-110 transition-transform duration-300">
                <ShieldAlert className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Point Guard</h3>
              <p className="text-white/40 text-sm leading-relaxed">Sybil-resistant & capital-gated network security</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#00ff99] to-[#00dd72] rounded-2xl flex items-center justify-center border-2 border-black/20 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Agentic Execution</h3>
              <p className="text-white/40 text-sm leading-relaxed">Luca-driven reasoning and intent-based routing</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#00ff99] to-[#00dd72] rounded-2xl flex items-center justify-center border-2 border-black/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Modular Core</h3>
              <p className="text-white/40 text-sm leading-relaxed">Diamond Standard (EIP-2535) modular architecture</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#00ff99] to-[#00dd72] rounded-2xl flex items-center justify-center border-2 border-black/20 group-hover:scale-110 transition-transform duration-300">
                <ScanSearch className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Real-time Verify</h3>
              <p className="text-white/40 text-sm leading-relaxed">Continuous protocol monitoring and risk assessment</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default CardDetails;
