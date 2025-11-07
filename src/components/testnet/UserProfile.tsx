"use client";

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/providers/Web3Provider';
import { RegistrationData } from '@/types/registration';
import toast from 'react-hot-toast';
import { API_RETRY } from '@/constants/polling';
import { taskCache, TaskType } from '@/utils/taskCache';
import { get } from 'lodash';

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to verify claim with retries
async function verifyClaimWithRetries(
  walletAddress: string, 
  verifyField: TaskType,
  maxRetries = API_RETRY.MAX_RETRIES
): Promise<boolean> {
  // First check the cache
  if (taskCache.isTaskComplete(walletAddress, verifyField)) {
    return true;
  }

  let currentDelay = API_RETRY.RETRY_DELAY;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add a small delay before verification to allow database to update
      await delay(currentDelay);
      
      const response = await fetch(`/api/testnet/user?walletAddress=${walletAddress}`);
      const data = await response.json();
      
      if (response.ok && data.registration && data.registration[verifyField]) {
        // Cache the successful result
        taskCache.setTaskComplete(walletAddress, verifyField);
        return true;
      }
      
      // Increase delay for next attempt
      currentDelay *= API_RETRY.BACKOFF_FACTOR;
      
    } catch (error) {
      console.error(`Verification attempt ${attempt + 1} failed:`, error);
      // Continue to next retry
    }
  }
  
  return false;
}

interface UserProfileProps {
  registrationData: RegistrationData;
  onLogout: () => void;
}

export default function UserProfile({ registrationData, onLogout }: UserProfileProps): JSX.Element {
  const { account } = useWeb3();
  const [isClaimingPoints, setIsClaimingPoints] = useState(false);
  const [isClaimingCommentPoints, setIsClaimingCommentPoints] = useState(false);
  const [isClaimingCommentBackPoints, setIsClaimingCommentBackPoints] = useState(false);
  const [isClaimingScreenshotPoints, setIsClaimingScreenshotPoints] = useState(false);
  const [localRegistrationData, setLocalRegistrationData] = useState(registrationData);
  const [loadingStates, setLoadingStates] = useState({
    twitter: false,
    twitterComment: false,
    twitterCommentBack: false,
    twitterScreenshot: false,
    twitterAbstract: false,
    twitterPartnership: false,
    twitterFounder: false,
    twitterThread: false,
    twitterThreadComment: false,
    twitterMubeenPost: false,
    twitterMubeenFollow: false,
    twitterDiscordMilestone: false,
    twitterXUpdate: false,
    twitterKaleidoNft: false,
    twitterMubeenNft: false,
    twitterSecurityPartnership: false,
    faithful: false,
    easter: false,
    awakened: false,
    bullish: false,
    invite: false,
    mining: false,
    founder: false,
    mises: false,
    newmises: false,
    locked: false,
    super: false,
    new: false,
    testnet: false,
    getready: false,
    
  });

  // Fetch latest registration data from the database
  const fetchLatestRegistrationData = async () => {
    if (!account) return;

    try {
      const response = await fetch(`/api/testnet/user?walletAddress=${account}`);
      const data = await response.json();

      if (response.ok && data.registration) {
        setLocalRegistrationData(data.registration);
        // Dispatch event to update other components
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('registration-updated', {
            detail: data.registration
          });
          window.dispatchEvent(event);
        }
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
    }
  };

  // Fetch latest data on mount and when account changes
  useEffect(() => {
    fetchLatestRegistrationData();
  }, [account]);

  const handleCopyReferralLink = async () => {
    if (!localRegistrationData.referralCode) return;
    
    const referralLink = `${window.location.origin}/testnet?ref=${localRegistrationData.referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Referral link copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy referral link');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClaimPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitter: true }));

      // Open Twitter post in new tab
      window.open('https://x.com/kaleido_finance/status/1887360760583713153', '_blank');

      const response = await fetch('/api/testnet/claim-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 100 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitter: false }));
      }, 5000);
    }
  };

  const handleClaimAbstractPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterAbstract: true }));

      // Open Twitter post in new tab
      window.open('https://x.com/kaleido_finance/status/1887360760583713153', '_blank');

      const response = await fetch('/api/testnet/claim-abstract-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterAbstractTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 200 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterAbstract: false }));
      }, 5000);
    }
  };

  const handleClaimCommentPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterComment: true }));

      // Open Twitter post in new tab
      window.open('https://x.com/kaleido_finance/status/1887769965631033474', '_blank');

      const response = await fetch('/api/testnet/claim-comment-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterCommentTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 200 points!', { id: toastId });
      
    } catch (error) {
      console.error('Error claiming points:', error);
      toast.error('Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterComment: false }));
      }, 5000);
    }
  };

  const handleClaimCommentBackPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterCommentBack: true }));

      // Open Twitter post in new tab
      window.open('https://x.com/kaleido_finance/status/1891514172506050951', '_blank');

      const response = await fetch('/api/testnet/claim-comment-back-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400 && data.error === 'Points already claimed') {
          toast.error('You have already claimed these points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterCommentBackTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 200 points!', { id: toastId });
      
    } catch (error) {
      console.error('Error claiming points:', error);
      toast.error('Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterCommentBack: false }));
      }, 5000);
    }
  };

  const handleClaimScreenshotPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterScreenshot: true }));

      // Open Twitter post in new tab
      window.open('https://x.com/kaleido_finance/status/1891514172506050951', '_blank');

      const response = await fetch('/api/testnet/claim-screenshot-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400 && data.error === 'Points already claimed') {
          toast.error('You have already claimed these points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterScreenshotTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 300 points!', { id: toastId });
      
    } catch (error) {
      console.error('Error claiming points:', error);
      toast.error('Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterScreenshot: false }));
      }, 5000);
    }
  };

  const handleClaimPartnershipPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterPartnership: true }));

      // Open Twitter post in new tab
      window.open('https://x.com/kaleido_finance/status/1893939552756109515', '_blank');

      const response = await fetch('/api/testnet/claim-partnership-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterPartnershipTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterPartnership: false }));
      }, 5000);
    }
  };

  const handleClaimFounderPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterFounder: true }));

      // Open Twitter profile in new tab
      window.open('https://x.com/0xmacking', '_blank');

      const response = await fetch('/api/testnet/claim-founder-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterFounderTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 800 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterFounder: false }));
      }, 5000);
    }
  };

  const handleClaimThreadPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterThread: true }));

      // Open Twitter thread in new tab
      window.open('https://x.com/kaleido_finance/status/1899941179820523743', '_blank');

      const response = await fetch('/api/testnet/claim-thread-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterThreadTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 1000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterThread: false }));
      }, 5000);
    }
  };

  const handleClaimThreadCommentPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterThreadComment: true }));

      // Open Twitter thread in new tab
      window.open('https://x.com/kaleido_finance/status/1899941179820523743', '_blank');

      const response = await fetch('/api/testnet/claim-thread-comment-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterThreadCommentTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 1000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterThreadComment: false }));
      }, 5000);
    }
  };

  const handleClaimMubeenPostPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterMubeenPost: true }));

      // Open Twitter post in new tab
      window.open('https://x.com/kaleido_finance/status/1907326632764846181', '_blank');

      const response = await fetch('/api/testnet/claim-mubeen-post-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterMubeenPostTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 5000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterMubeenPost: false }));
      }, 5000);
    }
  };

  const handleClaimMubeenFollowPoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      // Set loading state
      setLoadingStates(prev => ({ ...prev, twitterMubeenFollow: true }));

      // Open Twitter profile in new tab
      window.open('https://x.com/MubeenKaido', '_blank');

      const response = await fetch('/api/testnet/claim-mubeen-follow-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      // Verify the claim was successful with retries
      const verified = await verifyClaimWithRetries(account, 'twitterMubeenFollowTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      // Fetch latest data after successful verification
      await fetchLatestRegistrationData();

      toast.success('Successfully claimed 5000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      // Clear loading state
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterMubeenFollow: false }));
      }, 5000);
    }
  };

  const handleClaimDiscordMilestonePoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, twitterDiscordMilestone: true }));
      window.open('https://x.com/kaleido_finance/status/1907326632764846181', '_blank');

      const response = await fetch('/api/testnet/claim-discord-milestone-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'twitterDiscordMilestoneTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterDiscordMilestone: false }));
      }, 5000);
    }
  };

  const handleClaimXUpdatePoints = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, twitterXUpdate: true }));
      window.open('https://x.com/kaleido_finance/status/1907842909132534029', '_blank');

      const response = await fetch('/api/testnet/claim-x-update-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'twitterXUpdateTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterXUpdate: false }));
      }, 5000);
    }
  };

  const handleClaimKaleidoNft = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, twitterKaleidoNft: true }));
      window.open('https://x.com/kaleido_finance/status/1911073914974851100', '_blank');

      const response = await fetch('/api/testnet/claim-kaleido-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'twitterKaleidoNftTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterKaleidoNft: false }));
      }, 5000);
    }
  };

  const handleClaimMubeenNft = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, twitterMubeenNft: true }));
      window.open('https://x.com/MubeenKaido/status/1910779635421376640', '_blank');

      const response = await fetch('/api/testnet/claim-mubeen-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'twitterMubeenNftTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterMubeenNft: false }));
      }, 5000);
    }
  };

  const handleClaimSecurityPartnership = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, twitterSecurityPartnership: true }));
      window.open('https://x.com/VB_Audit/status/1912159314799718417', '_blank');

      const response = await fetch('/api/testnet/claim-security-partnership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'twitterSecurityPartnershipClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, twitterSecurityPartnership: false }));
      }, 5000);
    }
  };

  const handleClaimFaithful = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, faithful: true }));
      window.open('https://x.com/MubeenKaido/status/1913235290874851537', '_blank');

      const response = await fetch('/api/testnet/faithful-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'faithfulTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, faithful: false }));
      }, 5000);
    }
  };

  const handleClaimEaster = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, easter: true }));
      window.open('https://x.com/kaleido_finance/status/1914030478266401198', '_blank');

      const response = await fetch('/api/testnet/easter-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'easterTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, easter: false }));
      }, 5000);
    }
  };

  const handleClaimAwakened = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, awakened: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1916803589558726945', '_blank');

      const response = await fetch('/api/testnet/awakened-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'awakenedTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, awakened: false }));
      }, 5000);
    }
  };

  const handleClaimBullish = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, bullish: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1916800725234913635', '_blank');

      const response = await fetch('/api/testnet/bullish-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'bullishTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, bullish: false }));
      }, 5000);
    }
  };

  const handleClaimInvite = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, invite: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1916934064843485510', '_blank');

      const response = await fetch('/api/testnet/invite-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'bullishTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, invite: false }));
      }, 5000);
    }
  };

  const handleClaimMining = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, mining: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1920396384437518628', '_blank');

      const response = await fetch('/api/testnet/mining-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'miningTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, mining: false }));
      }, 5000);
    }
  };

  const handleClaimFounder = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, founder: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1921549161305952400', '_blank');

      const response = await fetch('/api/testnet/founder-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'founderTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, founder: false }));
      }, 5000);
    }
  };

  

  const handleClaimnewMises = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, newmises: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1923068187618443477', '_blank');

      const response = await fetch('/api/testnet/newmises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'newmisesTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, newmises: false }));
      }, 5000);
    }
  };


  const handleClaimLocked = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, locked: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1924782484023074816', '_blank');

      const response = await fetch('/api/testnet/locked-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'lockedTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, locked: false }));
      }, 5000);
    }
  };
  

  const handleClaimSuper = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, super: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1924877949938917862', '_blank');

      const response = await fetch('/api/testnet/super-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'superTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, super: false }));
      }, 5000);
    }
  };

  const handleClaimNew = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, new: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1926736944072937655', '_blank');

      const response = await fetch('/api/testnet/new-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'newTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, new: false }));
      }, 5000);
    }
  };

  const handleClaimTestnet = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, testnet: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1932059214723047842', '_blank');

      const response = await fetch('/api/testnet/testnet-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'testnetTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, testnet: false }));
      }, 5000);
    }
  };
  
  const handleClaimGetready = async () => {
    if (!account) return;
    let toastId = toast.loading('Claiming points...');
    
    try {
      setLoadingStates(prev => ({ ...prev, getready: true }));
      window.open('https://x.com/intent/retweet?tweet_id=1935459845496512677', '_blank');

      const response = await fetch('/api/testnet/getready-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: account
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 400) {
          toast.error(data.message || 'Failed to claim points', { id: toastId });
        } else {
          throw new Error(data.error || 'Failed to claim points');
        }
        return;
      }

      const verified = await verifyClaimWithRetries(account, 'getreadyTaskClaimed');
      
      if (!verified) {
        throw new Error('Failed to verify points claim after multiple attempts');
      }

      await fetchLatestRegistrationData();
      toast.success('Successfully claimed 2000 points!', { id: toastId });
      
    } catch (error: any) {
      console.error('Error claiming points:', error);
      toast.error(error?.message || 'Failed to claim points. Please try again.', { id: toastId });
    } finally {
      setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, getready: false }));
      }, 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#1A1B23] rounded-2xl p-6 sm:p-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">User Profile</h2>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-[#282A37] text-white rounded-lg hover:bg-[#323544] transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-[#282A37] rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#898CA9] mb-1">Email Address</label>
                  <p className="text-white">{localRegistrationData.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-[#898CA9] mb-1">Wallet Address</label>
                  <p className="text-white break-all">{account}</p>
                </div>
                <div>
                  <label className="block text-sm text-[#898CA9] mb-1">X Username</label>
                  <div className="flex items-center gap-2">
                    <p className="text-white">
                      {localRegistrationData.xUsername ? 
                        `@${localRegistrationData.xUsername.replace(/^@/, '')}` : 
                        'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HOT TASK: Link X Account */}
            <div className="bg-[#282A37] rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Hot Tasks</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#1A1B23] rounded-lg border-2 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-pulse">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 1200 1227" fill="none" className="text-white">
                      <g>
                        <path fill="currentColor" d="M1199.14 0H944.93L600.01 455.36L255.07 0H0l462.36 613.19L0 1227h254.21l345.8-466.13L945.79 1227H1201L736.98 601.5 1199.14 0ZM300.6 112.36l299.41 397.13 299.41-397.13h151.13L750.13 601.5l300.42 401.14h-151.13L600.01 805.86 299.41 1002.64H148.28l300.42-401.14L148.28 112.36H300.6Z"/>
                      </g>
                    </svg>
                    <div>
                      <h4 className="text-white font-medium">Link X Account</h4>
                      <p className="text-sm text-[#898CA9]">Link your X (Twitter) account for verification!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {localRegistrationData.xId ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#04c74f] px-4 py-2">Linked</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#04c74f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (account) {
                            window.location.href = `/api/testnet/x-auth?wallet=${account}`;
                          } else {
                            alert('Please connect your wallet first.');
                          }
                        }}
                        className="px-4 py-2 bg-[#323544] text-white rounded-lg transition-colors hover:bg-[#3E4151]"
                      >
                        Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Testnet Status */}
            <div className="bg-[#282A37] rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Testnet Status</h3>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#04c74f] rounded-full"></div>
                <span className="text-[#04c74f]">Active Participant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
