"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaServer, FaBolt, FaStar } from 'react-icons/fa';
import Image from 'next/image';

interface SupernodeCpuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupernodeCpuModal: React.FC<SupernodeCpuModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-3xl mx-4 bg-[#22242F] rounded-2xl border border-white/5 shadow-xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <FaTimes size={20} />
        </button>
        
        {/* Content - Side by side layout */}
        <div className="flex flex-col md:flex-row">
          {/* Left side - GIF */}
          <div className="relative w-full md:w-1/2 h-60 md:h-auto overflow-hidden bg-[#131317] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00dd72]/10 to-transparent z-0"></div>
            <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-[#00dd72]/20 shadow-[0_0_15px_rgba(0,221,114,0.2)] z-10">
              {/* 4x Boost Badge */}
              <div className="absolute top-3 right-3 z-20 bg-[#00dd72] text-black font-bold py-1 px-3 rounded-full flex items-center shadow-lg transform rotate-12 border-2 border-black/10">
                <FaStar className="mr-1 text-yellow-300" />
                <span>4x BOOST</span>
              </div>
              
              <Image 
                src="/nft.gif" 
                alt="Kaleido Supernode CPU" 
                fill 
                style={{ 
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                priority
                className="z-0 scale-[1.15]"
                unoptimized
              />
            </div>
          </div>
          
          {/* Right side - Text content */}
          <div className="w-full md:w-1/2 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center mb-6">
              <div className="p-3 bg-[#00dd72]/20 rounded-full mr-3 flex-shrink-0">
                <FaServer className="text-[#00dd72] text-xl" />
              </div>
              <h2 className="text-xl font-bold text-white">Kaleido Supernode CPU</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#131317] p-4 rounded-lg border border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <FaBolt className="text-[#00dd72] mr-2 text-base" />
                  Live now
                </h3>
                <div className="mt-2 flex items-center">
                  <span className="bg-[#00dd72]/20 text-[#00dd72] text-xs font-medium px-2 py-1 rounded flex items-center">
                    <FaStar className="mr-1 text-xs" />
                    Limited mining period with 4x mining boost 
                  </span>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm">
                The Kaleido Supernode CPU will power the next generation of decentralized lending.
              </p>
              
              <div className="pt-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://launchpad.kaleidofinance.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-[#00dd72] hover:bg-[#00c868] text-black text-sm font-medium rounded-lg text-center transition-colors"
                  >
                    Visit Launchpad
                  </a>
                  <button
                    onClick={() => {
                      localStorage.setItem('hideSupernodeCpuModal', 'true');
                      onClose();
                    }}
                    className="flex-1 py-3 px-4 bg-transparent hover:bg-white/5 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
                  >
                    Don't show again
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Start your mining journey today with 4x boost!
                </p>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default SupernodeCpuModal;
