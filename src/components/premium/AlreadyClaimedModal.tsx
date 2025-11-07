"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaServer, FaCheckCircle } from 'react-icons/fa';

interface AlreadyClaimedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlreadyClaimedModal: React.FC<AlreadyClaimedModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md p-6 mx-4 bg-[#22242F] rounded-2xl border border-white/5 shadow-xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <FaTimes size={20} />
        </button>
        
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-blue-500/20 rounded-full mr-3">
            <FaCheckCircle className="text-blue-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-white">NFT Already Claimed</h2>
        </div>
        
        {/* Content */}
        <div className="space-y-4 text-center">
          <p className="text-gray-300 text-sm">
            You have already claimed your Supernode CPU NFT with <span className="text-[#00dd72] font-bold">4x mining boost</span>.
          </p>
          
          <div className="bg-[#131317] p-4 rounded-lg border border-white/5">
            <p className="text-gray-300 text-sm">
              Your NFT is ready to use!
            </p>
          </div>
          
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
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-transparent hover:bg-white/5 text-white text-sm font-medium rounded-lg border border-white/20 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AlreadyClaimedModal;
