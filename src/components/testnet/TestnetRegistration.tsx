"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { RegistrationStep, RegistrationData } from '@/types/registration';
import toast from 'react-hot-toast';
import { useWeb3 } from '@/providers/Web3Provider';
import { ConnectWallet } from '@/components/common/ConnectWallet';
import UserProfile from './UserProfile';
import { getDeviceFingerprint, DeviceInfo } from '@/utils/deviceFingerprint';
import { useSearchParams } from 'next/navigation';

// Extend Window interface to include requestQueue
declare global {
  interface Window {
    requestQueue: string[] | null;
    lastRequestTime: number | null;
  }
}

const SOCIAL_LINKS = {
  twitter: 'https://x.com/intent/follow?screen_name=kaleido_finance',
  telegram: 'https://t.me/kaleido_finance',
  discord: 'https://discord.gg/VcegZwwbcC',
};

const SESSION_KEY = 'kalaido_registration_session';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const STALE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function TestnetRegistration(): JSX.Element {
  const { account, disconnectWallet, isConnecting } = useWeb3();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('details');
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Start with false since we only load when wallet is connected
  const [referralCode, setReferralCode] = useState<string | null>(searchParams?.get('ref') ?? null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: '',
    walletAddress: '',
    socialTasks: {
      twitter: false,
      telegram: false,
      discord: false
    },
    agreedToTerms: false,
    referralCode: '',
    referralCount: 0,
    referralBonus: 0,
    balance: 0
  });

  useEffect(() => {
    const urlReferralCode = searchParams?.get('ref');
    if (urlReferralCode) {
      setRegistrationData(prev => ({
        ...prev,
        referredBy: urlReferralCode
      }));
    }
  }, [searchParams]);
  
  // Effect to run on page load/navigation to ensure wallet state is properly synced
  useEffect(() => {
    // This helps ensure the wallet state is properly updated when navigating between pages
    const syncWalletState = async () => {
      // If localStorage shows we're connected but our state doesn't reflect that
      const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
      const storedWalletAddress = localStorage.getItem('connected_wallet_address');
      
      if (isWalletConnected && storedWalletAddress && !account) {
        console.log('Syncing wallet state on testnet page navigation');
      }
      
      // If we have a wallet address, store it for cross-page synchronization
      if (account) {
        localStorage.setItem('connected_wallet_address', account);
        localStorage.setItem('walletConnected', 'true');
      }
    };
    
    syncWalletState();
  }, [account]);

  const verifyRegistration = async (wallet: string, maxAttempts = 3) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/testnet/user?walletAddress=${wallet}`);
        const data = await response.json();
        
        if (response.ok && data.registration) {
          return true;
        }
        
        // Wait before next attempt (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        attempts++;
      } catch (error) {
        console.error('Verification attempt failed:', error);
        attempts++;
      }
    }
    return false;
  };

  const refreshRegistrationData = useCallback(async (force: boolean = false) => {
    if (!account) return;
    
    // If not forced and we have cached data, use it
    if (!force) {
      const sessionData = sessionStorage.getItem(`${SESSION_KEY}_${account.toLowerCase()}`);
      if (sessionData) {
        const { userData, timestamp } = JSON.parse(sessionData);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_TTL) {
          setRegistrationData(userData);
          setIsRegistered(true);
          return;
        }
      }
    }

    try {
      const response = await fetch(`/api/testnet/check-registration?wallet=${account}`);
      const data = await response.json();
      
      if (data.isRegistered) {
        // Verify registration data exists
        const isVerified = await verifyRegistration(account);
        
        if (!isVerified) {
          console.error('Registration verification failed');
          setIsRegistered(false);
          return;
        }
        
        // Cache the registration data
        sessionStorage.setItem(
          `${SESSION_KEY}_${account.toLowerCase()}`,
          JSON.stringify({
            userData: data,
            timestamp: Date.now()
          })
        );
        
        setRegistrationData(data);
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
        // Clear session storage
        sessionStorage.removeItem(`${SESSION_KEY}_${account.toLowerCase()}`);
      }
    } catch (error) {
      console.error('Error refreshing registration data:', error);
      setIsRegistered(false);
    }
  }, [account]);

  useEffect(() => {
    // Only check registration status if wallet is connected
    if (account) {
      setIsLoading(true);
      // Check session storage first
      const sessionData = sessionStorage.getItem(`${SESSION_KEY}_${account.toLowerCase()}`);
      if (sessionData) {
        const { userData, timestamp } = JSON.parse(sessionData);
        const age = Date.now() - timestamp;
        
        // If data is within cache TTL, use it
        if (age < CACHE_TTL) {
          setRegistrationData(userData);
          setIsRegistered(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Only fetch if no cached data or cache expired
      refreshRegistrationData().finally(() => {
        setIsLoading(false);
      });
    } else {
      // Reset states when wallet is disconnected
      setIsLoading(false);
      setIsRegistered(false);
      setRegistrationData({
        email: '',
        walletAddress: '',
        socialTasks: {
          twitter: false,
          telegram: false,
          discord: false
        },
        agreedToTerms: false,
        referralCode: '',
        referralCount: 0,
        referralBonus: 0,
        balance: 0
      });
    }
  }, [account]); // Only run when account changes

  const handleLogout = async () => {
    try {
      await disconnectWallet();
      setIsRegistered(false);
      // Clear session storage for this wallet
      if (account) {
        sessionStorage.removeItem(`${SESSION_KEY}_${account.toLowerCase()}`);
      }
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  React.useEffect(() => {
    if (account) {
      setRegistrationData(prev => ({
        ...prev,
        walletAddress: account,
      }));
    }
  }, [account]);

  const handleSocialTaskComplete = async (platform: 'twitter' | 'discord' | 'telegram') => {
    // Open the social link in a new tab
    window.open(SOCIAL_LINKS[platform], '_blank');
    
    // Show loading state
    setLoadingTask(platform);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update task completion
    setRegistrationData(prev => ({
      ...prev,
      socialTasks: {
        ...prev.socialTasks,
        [platform]: true
      }
    }));
    
    // Clear loading state
    setLoadingTask(null);
    
    // Show success message
    toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} task completed!`);
  };

  const handleNextStep = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    
    if (currentStep === 'details') {
      // Validate form fields
      if (!registrationData.email.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!registrationData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!account) {
        toast.error('Please connect your wallet');
        return;
      }
      if (!registrationData.agreedToTerms) {
        toast.error('Please agree to the Terms of Service');
        return;
      }
    }

    if (currentStep === 'social') {
      const { twitter, telegram, discord } = registrationData.socialTasks;
      if (!twitter || !telegram || !discord) {
        toast.error('Please complete all social tasks before proceeding');
        return;
      }
    }

    if (currentStep === 'username') {
      if (!registrationData.xUsername?.trim()) {
        toast.error('Please enter your X (Twitter) username');
        return;
      }
      // Basic X username validation
      if (!registrationData.xUsername.match(/^@?(\w){1,15}$/)) {
        toast.error('Please enter a valid X username (1-15 characters, letters, numbers, and underscores only)');
        return;
      }
    }

    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id as RegistrationStep);
      toast.success('Step completed successfully');
      
      if (steps[stepIndex + 1].id === 'completion') {
        setIsRegistered(true);
        toast.success('Registration completed successfully!');
      }
    }
  };

  const handlePrevStep = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as RegistrationStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      setIsRegistering(true);
      
      // Get device fingerprint
      const deviceInfo: DeviceInfo = await getDeviceFingerprint();
      
      const response = await fetch('/api/testnet/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...registrationData,
          walletAddress: account,
          referredBy: referralCode,
          deviceInfo // Add device info to request
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      
      // Update registration data with the server response
      const updatedRegistrationData = {
        ...registrationData,
        ...data.registration,
        walletAddress: account
      };

      // Save to session storage
      sessionStorage.setItem(
        `${SESSION_KEY}_${account.toLowerCase()}`,
        JSON.stringify({
          userData: updatedRegistrationData,
          timestamp: Date.now()
        })
      );

      setRegistrationData(updatedRegistrationData);
      setIsRegistered(true);
      toast.success('Registration successful!');

      // Add a small delay before refreshing to ensure the toast is visible
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to submit registration');
      setIsRegistering(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="animate-spin">
      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  const steps = [
    { id: 'details', label: 'Details', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'social', label: 'Social', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2v-2a2 2 0 012-2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2v2h2a2 2 0 012 2V9a2 2 0 00-2-2h-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l.586-.586z" />
      </svg>
    )},
    // Remove this username step:
    /* { id: 'username', label: 'Username', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c1.474 0 2.689.347 3.577.893h.104c.635 1.028 1.137 2.157 1.457 3.487a4.753 4.753 0 01-1.449 3.582L12 20.667l-1.07 1.07a4.753 4.753 0 01-3.487-1.457A13.937 13.937 0 0112 16a13.937 13.937 0 013.577-.893h.104c1.028.635 2.157 1.137 3.487 1.457a4.753 4.753 0 013.582 1.449L20.667 12l1.07-1.07a4.753 4.753 0 011.457-3.487 13.937 13.937 0 01.893-3.577V6.807a13.937 13.937 0 00-3.577-.893L12 6.667l-1.07-1.07a13.937 13.937 0 00-3.487-1.457 4.753 4.753 0 01-3.582-1.449L6.333 12l-1.07 1.07a4.753 4.753 0 01-1.457 3.487 13.937 13.937 0 01-.893 3.577V17.804z" />
      </svg>
    )}, */
    { id: 'verification', label: 'Verification', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'completion', label: 'Ready', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )}
  ];

  // Show TGE warning on component mount
  useEffect(() => {
    const toastId = toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#22242F] border-2 border-red-500 shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-red-500 mb-1">⚠️ Important Distribution Notice</h3>
                <p className="text-sm text-gray-300">
                  As TGE is coming soon, all social accounts will be verified. Any account or referral associated with fake/non-existent social accounts will risk losing their rewards.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'top-center',
      }
    );
    return () => toast.dismiss(toastId);
  }, []);

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1B23] rounded-2xl p-6 sm:p-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="animate-spin mx-auto mb-4">
              <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-[#898CA9]">Checking registration status...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is registered, show profile
  if (isRegistered && account) {
    return <UserProfile registrationData={registrationData} onLogout={handleLogout} />;
  }

  // If no wallet is connected, show connect wallet button
  if (!account) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1B23] rounded-2xl p-6 sm:p-8">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to Continue</h2>
            <p className="text-[#898CA9] mb-8">Please connect your wallet to access the testnet registration</p>
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Personal Details</h2>
              <p className="text-sm sm:text-base text-[#898CA9]">Please provide your information to join the testnet</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-white mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={registrationData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-[#282A37] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E4151]"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Wallet Address</label>
                {account ? (
                  <div className="px-4 py-3 bg-[#282A37] text-white rounded-lg break-all">
                    {account}
                  </div>
                ) : (
                  <ConnectWallet />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  name="agreedToTerms"
                  checked={registrationData.agreedToTerms}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#04c74f] bg-[#282A37] border-[#282A37] rounded focus:ring-[#04c74f]"
                />
                <label htmlFor="terms" className="text-[#898CA9]">
                  I agree to the <a href="#" className="text-[#04c74f] hover:text-[#03b347]">Terms of Service</a> and{' '}
                  <a href="#" className="text-[#04c74f] hover:text-[#03b347]">Privacy Policy</a>
                </label>
              </div>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Complete Social Tasks</h2>
              <p className="text-sm sm:text-base text-[#898CA9]">Please complete all social tasks to proceed</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#282A37] rounded-xl p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.543 7.104l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701l-.332 4.885c.322.32.6.469.84.469c.361 0 .527-.168.828-.465l1.988-1.934l4.129 3.049c.76.42 1.309.203 1.498-.706l2.715-12.795c.278-1.114-.425-1.618-1.25-1.287z"/>
                    </svg>
                    <span className="text-white">Twitter</span>
                  </div>
                  <div className="relative z-10">
                    {registrationData.socialTasks.twitter ? (
                      <svg className="w-6 h-6 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : loadingTask === 'twitter' ? (
                      <LoadingSpinner />
                    ) : (
                      <button
                        onClick={() => handleSocialTaskComplete('twitter')}
                        className="px-4 py-2 rounded-lg bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition-colors"
                      >
                        Follow
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#282A37] rounded-xl p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701l-.332 4.885c.322.32.6.469.84.469c.361 0 .527-.168.828-.465l1.988-1.934l4.129 3.049c.76.42 1.309.203 1.498-.706l2.715-12.795c.278-1.114-.425-1.618-1.25-1.287z"/>
                    </svg>
                    <span className="text-white">Telegram</span>
                  </div>
                  <div className="relative z-10">
                    {registrationData.socialTasks.telegram ? (
                      <svg className="w-6 h-6 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : loadingTask === 'telegram' ? (
                      <LoadingSpinner />
                    ) : (
                      <button
                        onClick={() => handleSocialTaskComplete('telegram')}
                        className="px-4 py-2 rounded-lg bg-[#229ED9] text-white hover:bg-[#1e8dc1] transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-[#282A37] rounded-xl p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    <span className="text-white">Discord</span>
                  </div>
                  <div className="relative z-10">
                    {registrationData.socialTasks.discord ? (
                      <svg className="w-6 h-6 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : loadingTask === 'discord' ? (
                      <LoadingSpinner />
                    ) : (
                      <button
                        onClick={() => handleSocialTaskComplete('discord')}
                        className="px-4 py-2 rounded-lg bg-[#5865F2] text-white hover:bg-[#4752c4] transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Enter Your X Username</h2>
              <p className="text-[#898CA9] mb-8">
                Please enter your X (formerly Twitter) username. This will help us verify your social engagement.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="xUsername" className="block text-sm font-medium text-[#898CA9] mb-2">
                    X Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#898CA9]">@</span>
                    <input
                      type="text"
                      id="xUsername"
                      name="xUsername"
                      value={registrationData.xUsername?.replace('@', '') || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace('@', '');
                        handleInputChange({
                          target: {
                            name: 'xUsername',
                            value: value,
                            type: 'text'
                          }
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      className="w-full bg-[#1A1B23] text-white pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3E4151]"
                      placeholder="username"
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 bg-[#1A1B23] text-white rounded-lg hover:bg-[#282A37] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-[#04c74f] text-white rounded-lg hover:bg-[#03a842] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 'verification':
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Verify Your Information</h2>
              <p className="text-sm sm:text-base text-[#898CA9]">Please review your information before proceeding</p>
            </div>

            <div className="bg-[#282A37] p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-[#898CA9]">Email Address</p>
                  <p className="text-sm sm:text-base text-white font-medium">{registrationData.email}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-[#898CA9]">Wallet Address</p>
                  <p className="text-sm sm:text-base text-white font-medium break-all">{account}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#04c74f]/10 border border-[#04c74f]/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#04c74f] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm sm:text-base text-[#04c74f]">
                  Please ensure all information is correct. You won't be able to change this information after proceeding.
                </p>
              </div>
            </div>
          </div>
        );
      case 'completion':
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-block">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#04c74f]/20 flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full bg-[#04c74f]/10 animate-ping" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Registration Complete!</h2>
              <p className="text-[#898CA9]">Your account has been registered successfully.</p>
            </div>
          </div>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <main className="py-16">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="relative mb-8 sm:mb-12 px-4 sm:px-0">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#282A37] -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[#04c74f] -translate-y-1/2 transition-all duration-500"
            style={{ 
              width: `${(steps.findIndex(step => step.id === currentStep) / (steps.length - 1)) * 100}%` 
            }}
          />
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              return (
                <div 
                  key={step.id}
                  className="flex flex-col items-center"
                >
                  <div 
                    className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive || isCompleted ? 'bg-[#04c74f]' : 'bg-[#282A37]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 rounded-full bg-[#04c74f]/10 animate-ping opacity-20" />
                    )}
                    <div className={`text-white ${isActive ? 'animate-bounce-subtle' : ''}`}>
                      {step.icon}
                    </div>
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-[#04c74f]' : isCompleted ? 'text-white' : 'text-[#898CA9]'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-[#1A1B23] rounded-2xl p-4 sm:p-8 mx-4 sm:mx-0">
          <div className="max-w-lg mx-auto">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'completion' && (
          <div className="flex justify-between mt-8 pt-8 border-t border-[#282A37]">
            <button
              onClick={handlePrevStep}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentStep === 'details'
                  ? 'opacity-50 cursor-not-allowed bg-[#282A37] text-[#898CA9]'
                  : 'bg-[#282A37] text-white hover:bg-[#323544]'
              }`}
              disabled={currentStep === 'details'}
            >
              Previous Step
            </button>
            {currentStep !== 'verification' ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-[#04c74f] text-white rounded-lg hover:bg-[#03b347] transition-colors inline-flex items-center gap-2"
              >
                Next Step
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={async (e) => {
                  e.preventDefault();
                  await handleSubmit(e);
                }}
                className={`px-6 py-3 bg-[#04c74f] text-white rounded-lg hover:bg-[#03b347] transition-colors inline-flex items-center gap-2 ${
                  isRegistering ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <LoadingSpinner />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                Complete Registration
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
