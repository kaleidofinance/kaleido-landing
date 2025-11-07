"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaServer, FaTimes, FaWallet, FaLink } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useWeb3 } from '@/providers/Web3Provider';
import { webhookService } from '@/services/webhookService';
import { premiumAuthService } from '@/services/premiumAuthService';

interface SupernodeNftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupernodeNftModal: React.FC<SupernodeNftModalProps> = ({ isOpen, onClose }) => {
  const { account } = useWeb3();
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [launchpadWallet, setLaunchpadWallet] = useState('');
  const [error, setError] = useState('');
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
      setIsLinkingWallet(false);
      setLaunchpadWallet('');
      setError('');
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  // Handle claiming with current wallet
  const handleClaimWithCurrentWallet = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use the existing registerWebhook function from webhookService
      const result = await webhookService.registerWebhook(account);
      
      if (result.success) {
        // Store the registered wallet in localStorage
        localStorage.setItem('registered_wallet', account);
        
        // Update the claim status in the database
        const claimResponse = await fetch('/api/premium/claim-supernode-nft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...premiumAuthService.getAuthHeader() // Add authentication header
          },
          body: JSON.stringify({
            walletAddress: account,
            claimType: 'current'
          }),
        });
        
        const claimData = await claimResponse.json();
        
        if (!claimResponse.ok) {
          throw new Error(claimData.message || claimData.error || 'Failed to claim NFT');
        }
        
        toast.success('Successfully claimed Supernode NFT with 4x boost!');
        onClose();
      } else {
        throw new Error(result.error || 'Failed to register wallet');
      }
    } catch (error) {
      console.error('Error claiming NFT:', error);
      setError(error instanceof Error ? error.message : 'Failed to claim NFT');
      toast.error('Failed to claim NFT');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle linking a different wallet
  const handleLinkWallet = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!launchpadWallet || !launchpadWallet.startsWith('0x') || launchpadWallet.length !== 42) {
      setError('Please enter a valid wallet address');
      return;
    }
    
    setIsLinkingWallet(true);
    setError('');
    
    try {
      // Use the existing linkWallets function from webhookService
      const linkResult = await webhookService.linkWallets(account, launchpadWallet);
      
      if (linkResult.success) {
        // Store the linked wallet in localStorage
        localStorage.setItem('linked_launchpad_wallet', launchpadWallet);
        
        // Register the linked wallet for mining
        const registerResult = await webhookService.registerWebhook(launchpadWallet);
        
        if (registerResult.success) {
          // Store the registered wallet in localStorage
          localStorage.setItem('registered_wallet', launchpadWallet);
          
          // Update the claim status in the database
          const claimResponse = await fetch('/api/premium/claim-supernode-nft', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...premiumAuthService.getAuthHeader() // Add authentication header
            },
            body: JSON.stringify({
              walletAddress: account,
              claimType: 'linked',
              linkedWallet: launchpadWallet
            }),
          });
          
          const claimData = await claimResponse.json();
          
          if (!claimResponse.ok) {
            throw new Error(claimData.message || claimData.error || 'Failed to claim NFT');
          }
          
          toast.success('Successfully claimed Supernode NFT with linked wallet!');
          onClose();
        } else {
          throw new Error(registerResult.error || 'Failed to register linked wallet');
        }
      } else {
        throw new Error(linkResult.error || 'Failed to link wallets');
      }
    } catch (error) {
      console.error('Error linking wallet:', error);
      setError(error instanceof Error ? error.message : 'Failed to link wallet');
      toast.error('Failed to link wallet');
    } finally {
      setIsLinkingWallet(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
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
          disabled={isLoading || isLinkingWallet}
        >
          <FaTimes size={20} />
        </button>
        
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-[#00dd72]/20 rounded-full mr-3">
            <FaServer className="text-[#00dd72] text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">Supernode NFT Reward</h2>
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-white mb-2">
              Congratulations! 🎉
            </p>
            <p className="text-gray-300 mb-4">
              You've been gifted a free Supernode NFT for your premium node mining with <span className="text-[#00dd72] font-bold">4x boost</span>.
            </p>
            <p className="text-gray-300 mb-4">
              Mining will begin when the launchpad is released.
            </p>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Claim options */}
          <div className="space-y-4">
            <button
              onClick={handleClaimWithCurrentWallet}
              disabled={isLoading || isLinkingWallet}
              className="w-full py-3 px-4 bg-[#00dd72] hover:bg-[#00c868] text-black font-medium rounded-lg flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : (
                <>
                  <FaWallet className="mr-2" />
                  Claim with current wallet
                </>
              )}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#22242F] text-gray-400">Or link a different wallet</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={launchpadWallet}
                onChange={(e) => setLaunchpadWallet(e.target.value)}
                placeholder="Enter wallet address (0x...)"
                disabled={isLinkingWallet}
                className="flex-1 px-4 py-2 bg-[#1A1B23] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00dd72]/50"
              />
              <button
                onClick={handleLinkWallet}
                disabled={isLinkingWallet || !launchpadWallet}
                className="px-4 py-2 bg-[#323544] hover:bg-[#3E4151] text-white rounded-lg flex items-center justify-center transition-colors"
              >
                {isLinkingWallet ? (
                  <span className="inline-block animate-spin">⟳</span>
                ) : (
                  <FaLink />
                )}
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-400 text-center">
            This offer is exclusive to top 10 leaderboard members.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SupernodeNftModal;
