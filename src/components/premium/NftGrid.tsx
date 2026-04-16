"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaStar, FaLock, FaServer, FaQuestionCircle } from 'react-icons/fa';
import ComingSoonModal from './ComingSoonModal';
import AlreadyClaimedModal from './AlreadyClaimedModal';

interface MiningStatus {
  isActive: boolean;
  address: string;
  startTime: string;
  cpuCount: number;
  miningRate: string;
  totalPoints: number;
  linkedWallet?: string;
}

interface NftGridProps {
  onShowNftModal: () => void;
  isNftEligible?: boolean;
  hasClaimedNft?: boolean;
  account?: string | null;
  miningStatus?: MiningStatus | null;
  supernodeClaimed?: boolean;
}

const NftGrid: React.FC<NftGridProps> = ({ onShowNftModal, isNftEligible = false, hasClaimedNft = false, account = null, miningStatus = null, supernodeClaimed = false }) => {
  // If supernode is claimed, ensure at least 1 CPU is shown as unlocked
  const cpuCount = supernodeClaimed ? Math.max(1, miningStatus?.cpuCount || 0) : (miningStatus?.cpuCount || 0);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showAlreadyClaimedModal, setShowAlreadyClaimedModal] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex flex-col space-y-6">
        {/* NFT Collection Header */}
        
        
        {/* NFT Grid - 2 rows x 5 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {/* First NFT - Supernode CPU */}
          <div className="bg-[#131317] rounded-xl overflow-hidden border border-[#00dd72]/20 shadow-lg shadow-[#00dd72]/10 relative group">
            {/* Locked Overlay for users with no CPUs */}
            {!account || cpuCount < 1 ? (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 cursor-pointer"
                onClick={() => setShowComingSoonModal(true)}
              >
                <FaLock className="text-white/70 text-3xl" />
              </div>
            ) : null}
            
            {/* 4x Boost Badge */}
            <div className="absolute top-3 right-3 z-10 bg-[#00dd72] text-black font-bold py-1 px-3 rounded-full flex items-center shadow-lg transform rotate-12 border-2 border-black/10 text-xs">
              <FaStar className="mr-1 text-yellow-300" />
              <span>4x BOOST</span>
            </div>
            
            {/* Active Badge for CPU owners */}
            {cpuCount >= 1 && (
              <div className="absolute top-3 left-3 z-10 bg-blue-500 text-white font-bold py-1 px-3 rounded-full flex items-center shadow-lg text-xs">
                <FaServer className="mr-1" />
                <span>ACTIVE</span>
              </div>
            )}
            
            {/* NFT Image */}
            <div className="relative w-full h-48 overflow-hidden">
              <Image 
                src="/nft.gif" 
                alt="Kaleido Supernode CPU" 
                fill 
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                className={`scale-110 ${!account || cpuCount < 1 ? 'opacity-50' : ''}`}
                unoptimized
              />
            </div>
            
            {/* NFT Info */}
            <div className="p-4">
              <h3 className="text-white font-bold text-lg mb-1">Supernode CPU</h3>
              <p className="text-gray-400 text-sm mb-3">Premium Node Mining</p>
              
              {!account ? (
                <button 
                  onClick={() => setShowComingSoonModal(true)}
                  className="w-full py-2 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Connect Wallet
                </button>
              ) : cpuCount < 1 ? (
                <button 
                  onClick={() => setShowComingSoonModal(true)}
                  className="w-full py-2 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Not Available
                </button>
              ) : (
                <button 
                  onClick={() => setShowAlreadyClaimedModal(true)}
                  className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
          
          {/* More Supernode CPU NFTs */}
          {Array.from({ length: 9 }).map((_, index) => {
            const cpuNumber = index + 2;
            const isUnlocked = cpuCount >= cpuNumber;
            
            return (
              <div key={index} className={`bg-[#131317] rounded-xl overflow-hidden ${isUnlocked ? 'border border-[#00dd72]/20 shadow-lg shadow-[#00dd72]/10' : 'border border-white/5'} relative group`}>
                {/* Locked Overlay for locked CPUs */}
                {!isUnlocked && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 cursor-pointer"
                    onClick={() => setShowComingSoonModal(true)}
                  >
                    <FaLock className="text-white/70 text-3xl" />
                  </div>
                )}
                
                {/* 4x Boost Badge */}
                <div className={`absolute top-3 right-3 z-20 bg-[#00dd72] text-black font-bold py-1 px-3 rounded-full flex items-center shadow-lg transform rotate-12 border-2 border-black/10 text-xs ${isUnlocked ? '' : 'opacity-60'}`}>
                  <FaStar className="mr-1 text-yellow-300" />
                  <span>4x BOOST</span>
                </div>
                
                {/* Active Badge for unlocked CPUs */}
                {isUnlocked && (
                  <div className="absolute top-3 left-3 z-10 bg-blue-500 text-white font-bold py-1 px-3 rounded-full flex items-center shadow-lg text-xs">
                    <FaServer className="mr-1" />
                    <span>ACTIVE</span>
                  </div>
                )}
                
                {/* NFT Image */}
                <div className="relative w-full h-48 overflow-hidden">
                  <Image 
                    src="/nft.gif" 
                    alt={`Kaleido Supernode CPU ${cpuNumber}`} 
                    fill 
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    className={`scale-110 ${isUnlocked ? '' : 'opacity-50'}`}
                    unoptimized
                  />
                </div>
                
                {/* NFT Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">Supernode CPU {cpuNumber}</h3>
                  <p className={`${isUnlocked ? 'text-gray-400' : 'text-gray-500'} text-sm mb-3`}>
                    {isUnlocked ? 'Premium Node Mining' : 'Coming Soon on Kaleido Agentic OS'}
                  </p>
                  
                  {isUnlocked ? (
                    <button 
                      onClick={() => setShowAlreadyClaimedModal(true)}
                      className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowComingSoonModal(true)}
                      className="w-full py-2 bg-gray-800/70 hover:bg-gray-700/70 text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      Live Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        </div>
        
        {/* Information Section */}
        <div className="mt-8 bg-[#131317] p-6 rounded-xl border border-white/5">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center">
            <FaQuestionCircle className="text-[#00dd72] mr-2" />
            About Kaleido SuperNode CPU
          </h3>
          <p className="text-gray-400">
            Kaleido SuperNode CPU provide exclusive benefits including mining boosts, premium node mining, and special access to upcoming platform features.
            Building strong on Kaleido Agentic OS.
          </p>
        </div>
      </div>
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoonModal} 
        onClose={() => setShowComingSoonModal(false)} 
      />
      
      {/* Already Claimed Modal */}
      <AlreadyClaimedModal 
        isOpen={showAlreadyClaimedModal} 
        onClose={() => setShowAlreadyClaimedModal(false)} 
      />
    </motion.div>
  );
};

export default NftGrid;
