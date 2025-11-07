'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { premiumAuthService } from '@/services/premiumAuthService';
import { dataEventBus } from '@/services/dataService';
import { useQueryClient } from '@tanstack/react-query';

interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshData: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  refreshData: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const queryClient = useQueryClient();

  // Function to refresh all data
  const refreshData = () => {
    // Safely invalidate queries with error handling
    try {
      // Invalidate all queries to trigger refetching
      if (queryClient && typeof queryClient.invalidateQueries === 'function') {
        queryClient.invalidateQueries();
      }
    } catch (error) {
      console.error('Error invalidating queries:', error);
    }
    
    // Emit event for non-React Query components
    dataEventBus.emitDataRefresh();
    
    // Update last active timestamp
    try {
      localStorage.setItem('lastActiveTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  };

  // Function to check if MetaMask is installed
  const checkIfMetaMaskInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const { ethereum } = window;
    if (!ethereum || !ethereum.isMetaMask) {
      toast.error('Please install MetaMask to continue');
      return false;
    }
    return true;
  };

  // Function to handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      localStorage.removeItem('walletConnected');
// Removed: toast.error('Wallet disconnected');
    } else {
      // User switched accounts
      setAccount(accounts[0]);
      localStorage.setItem('walletConnected', 'true');
      
      // Refresh data when account changes
      refreshData();
    }
  };

  // Function to handle chain changes
  const handleChainChanged = () => {
    // Reload the page when the chain changes
    window.location.reload();
  };

  // Function to check registration
  const checkRegistration = async (address: string) => {
    try {
      console.log('Checking registration for:', address);

      // Check if we already have a valid token
      if (authService.isAuthenticated()) {
        const userData = authService.getUserData();
        console.log('Existing user data:', userData);
        if (userData?.walletAddress.toLowerCase() === address.toLowerCase()) {
          return true;
        }
      }

      // Set timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/testnet/check-registration?wallet=${address}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error('Registration API returned error status:', response.status);
          // Don't clear auth data on API failure - only on confirmed "not registered"
          return false;
        }

        const data = await response.json();
        console.log('Registration check response:', data);

        if (data.isRegistered && data.token) {
          // Store token and user data
          authService.setToken(data.token);
          authService.setUserData(data.userData);
          console.log('Stored token:', data.token);
          console.log('Stored user data:', data.userData);
          return true;
        }

        // Clear any existing auth data if explicitly not registered
        console.log('User not registered, clearing auth data');
        authService.clear();
        return false;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error('Fetch error during registration check:', fetchError);
        if (fetchError.name === 'AbortError') {
          console.error('Registration check timed out');
        }
        // Don't clear auth data on network errors
        return false;
      }
    } catch (error) {
      console.error('Error checking registration:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  // Function to refresh token with proper state management
  const refreshTokenIfNeeded = async (walletAddress: string): Promise<boolean> => {
    if (!walletAddress) return false;
    
    // Don't attempt refresh if already in progress
    if (isRefreshingToken) return false;
    
    try {
      setIsRefreshingToken(true);
      
      // Only refresh if token is expired or about to expire
      if (premiumAuthService.isTokenExpired()) {
        console.log('Premium token expired or expiring soon, refreshing...');
        const refreshed = await premiumAuthService.refreshToken(walletAddress);
        
        if (!refreshed) {
          console.warn('Failed to refresh premium token');
          return false;
        }
        
        console.log('Token refreshed successfully');
        // Update last active timestamp on successful refresh
        localStorage.setItem('lastActiveTimestamp', Date.now().toString());
        return true;
      }
      
      return true; // Token is still valid
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    } finally {
      setIsRefreshingToken(false);
    }
  };

  // Create a custom event for wallet connection state
  const broadcastConnectionState = (connected: boolean, walletAddress: string | null, connecting: boolean) => {
    if (typeof window === 'undefined') return;
    
    try {
      const event = new CustomEvent('wallet-connection-state-change', {
        detail: {
          connected,
          walletAddress,
          connecting
        }
      });
      window.dispatchEvent(event);
      console.log('Broadcasting wallet state:', { connected, walletAddress, connecting });
    } catch (error) {
      console.error('Error broadcasting wallet state:', error);
    }
  };
  
  // Listen for connection state changes from other instances
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleConnectionStateChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { connected, walletAddress, connecting } = customEvent.detail;
      
      console.log('Received wallet state update:', { connected, walletAddress, connecting });
      
      // Only update if the state is different
      if (connecting !== isConnecting) {
        setIsConnecting(connecting);
      }
      
      if (connected && walletAddress && walletAddress !== account) {
        setAccount(walletAddress);
      } else if (!connected && account !== null) {
        setAccount(null);
      }
    };
    
    window.addEventListener('wallet-connection-state-change', handleConnectionStateChange);
    
    return () => {
      window.removeEventListener('wallet-connection-state-change', handleConnectionStateChange);
    };
  }, [account, isConnecting]);

  // Listen for storage events to sync wallet state across tabs/pages
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'walletConnected') {
        if (event.newValue === 'true' && !account) {
          // Another tab/page connected the wallet
          const storedAddress = localStorage.getItem('connected_wallet_address');
          if (storedAddress) {
            console.log('Syncing wallet connection from another tab/page:', storedAddress);
            setAccount(storedAddress);
            setIsConnecting(false);
          }
        } else if (event.newValue === null && account) {
          // Another tab/page disconnected the wallet
          console.log('Syncing wallet disconnection from another tab/page');
          setAccount(null);
          setIsConnecting(false);
        }
      } else if (event.key === 'wallet_connecting') {
        if (event.newValue === 'true') {
          // Another tab/page is connecting
          setIsConnecting(true);
        } else if (event.newValue === null) {
          // Connection process finished in another tab/page
          setIsConnecting(false);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [account]);

  // Effect to reset connecting state on page load/navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Reset connecting state if wallet is already connected
    const checkConnectionState = () => {
      const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
      const storedWalletAddress = localStorage.getItem('connected_wallet_address');
      
      if (isWalletConnected && storedWalletAddress && isConnecting) {
        console.log('Resetting connecting state on page navigation');
        setIsConnecting(false);
      }
    };
    
    // Check immediately and also after a short delay
    checkConnectionState();
    const timer = setTimeout(checkConnectionState, 1000);
    
    return () => clearTimeout(timer);
  }, [isConnecting]);
  
  // Effect to set up event listeners and attempt auto-connect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setupWeb3 = async () => {
      if (!checkIfMetaMaskInstalled()) return;

      const { ethereum } = window;
      if (!ethereum) return;

      // Set up event listeners
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);

      // Check if user was previously connected
      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      if (wasConnected) {
        try {
          setIsConnecting(true); // Show loading state while checking
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            // Check if the session is too old (more than 1 hour)
            const lastActive = localStorage.getItem('lastActiveTimestamp');
            const currentTime = Date.now();
            const oneHour = 60 * 60 * 1000;
            const sessionTooOld = !lastActive || (currentTime - parseInt(lastActive)) > oneHour;
            
            // Update last active timestamp
            localStorage.setItem('lastActiveTimestamp', currentTime.toString());
            
            // Always attempt to refresh token on reconnect
            await refreshTokenIfNeeded(accounts[0]);
            
            const isRegistered = await checkRegistration(accounts[0]);
            
            if (isRegistered) {
              // Refresh data instead of page reload
              refreshData();
              
              // If session is very old, we might still want to reload
              // but only if we haven't successfully refreshed the token
              if (sessionTooOld && premiumAuthService.isTokenExpired()) {
                console.log('Session too old and token refresh failed, refreshing page');
                window.location.reload();
                return;
              }
            }
          } else {
            localStorage.removeItem('walletConnected');
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          localStorage.removeItem('walletConnected');
        }
      }

      return () => {
        // Clean up event listeners
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    };

    setupWeb3();
    
    // Set up background token refresh interval
    const tokenRefreshInterval = setInterval(() => {
      if (account) {
        refreshTokenIfNeeded(account).catch(err => {
          console.error('Background token refresh failed:', err);
        });
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Set up activity tracking for session management
    const updateActivityTimestamp = () => {
      if (account) {
        localStorage.setItem('lastActiveTimestamp', Date.now().toString());
      }
    };
    
    // Handle premium auth errors
    const handlePremiumAuthError = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Premium auth error detected:', customEvent.detail);
      
      if (account) {
        // Attempt to refresh token
        toast.error('Session expired. Refreshing authentication...', { id: 'auth-refresh' });
        refreshTokenIfNeeded(account)
          .then(success => {
            if (success) {
              toast.success('Authentication refreshed successfully', { id: 'auth-refresh' });
              // Refresh data to update UI
              refreshData();
            } else {
              toast.error('Failed to refresh authentication. Please reconnect your wallet.', { id: 'auth-refresh' });
            }
          })
          .catch(err => {
            console.error('Error handling auth error:', err);
            toast.error('Authentication error. Please reconnect your wallet.', { id: 'auth-refresh' });
          });
      }
    };
    
    // Track user activity to keep session fresh
    window.addEventListener('click', updateActivityTimestamp);
    window.addEventListener('keypress', updateActivityTimestamp);
    window.addEventListener('scroll', updateActivityTimestamp);
    window.addEventListener('mousemove', updateActivityTimestamp);
    
    // Listen for premium auth errors
    window.addEventListener('premium-auth-error', handlePremiumAuthError);
    
    return () => {
      clearInterval(tokenRefreshInterval);
      window.removeEventListener('click', updateActivityTimestamp);
      window.removeEventListener('keypress', updateActivityTimestamp);
      window.removeEventListener('scroll', updateActivityTimestamp);
      window.removeEventListener('mousemove', updateActivityTimestamp);
      window.removeEventListener('premium-auth-error', handlePremiumAuthError);
    };
  }, [account]);

  // Connect wallet function
  const connectWallet = async () => {
    if (!checkIfMetaMaskInstalled()) return;

    const { ethereum } = window;
    if (!ethereum) return;

    setIsConnecting(true);
    // Set a global flag to indicate we're connecting
    localStorage.setItem('wallet_connecting', 'true');
    
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setAccount(address);
      
      // Clear any existing auth data before setting new wallet
      authService.clear();
      premiumAuthService.clear();
      
      try {
        const isRegistered = await checkRegistration(address);
        if (isRegistered) {
          // Always refresh token on explicit connect
          await refreshTokenIfNeeded(address);
          
          // Update auth service with wallet address
          const userData = {
            email: '',
            walletAddress: address,
            socialTasks: {
              twitter: false,
              telegram: false,
              discord: false
            },
            agreedToTerms: false,
            referralCode: '',
            referralCount: 0,
            referralBonus: 0
          };
          
          authService.setUserData(userData);
          
          // Update localStorage
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('lastActiveTimestamp', Date.now().toString());
          localStorage.setItem('connected_wallet_address', address);
          localStorage.removeItem('wallet_connecting');
          
          // Refresh data instead of reloading the page
          refreshData();
          
          // Show success toast only after all operations are successful
          toast.success('Wallet connected successfully');
        } else {
          // Update auth service with wallet address even if not registered
          const userData = {
            email: '',
            walletAddress: address,
            socialTasks: {
              twitter: false,
              telegram: false,
              discord: false
            },
            agreedToTerms: false,
            referralCode: '',
            referralCount: 0,
            referralBonus: 0
          };
          
          authService.setUserData(userData);
          
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('connected_wallet_address', address);
          localStorage.removeItem('wallet_connecting');
          
          // Show error toast only after all operations are complete
          toast.error('Wallet is not registered');
        }
      } catch (registrationError) {
        console.error('Error checking registration status:', registrationError);
        // Only show one error toast
        toast.error('Error verifying wallet registration');
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('connected_wallet_address', address);
        localStorage.removeItem('wallet_connecting');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      // Only show one error toast
      toast.error(error.message || 'Error connecting wallet');
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('connected_wallet_address');
      localStorage.removeItem('wallet_connecting');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async (options = { showToast: true }) => {
    try {
      if (typeof window === 'undefined') return;
      const { ethereum } = window;
      if (!ethereum) return;
      
      // Check if we already have a disconnect in progress
      const disconnectInProgress = localStorage.getItem('disconnect_in_progress');
      if (disconnectInProgress === 'true') {
        console.log('Disconnect already in progress, skipping duplicate call');
        return;
      }
      
      // Set flag to prevent multiple disconnects
      localStorage.setItem('disconnect_in_progress', 'true');

      // Clear local state
      setAccount(null);
      // Ensure isConnecting is set to false
      setIsConnecting(false);
      
      // Safely handle localStorage - clear all wallet and mining related items
      try {
        // Clear wallet connection items
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('lastActiveTimestamp');
        localStorage.removeItem('connected_wallet_address');
        localStorage.removeItem('wallet_connecting');
        
        // Clear mining related items
        localStorage.removeItem('linked_launchpad_wallet');
        localStorage.removeItem('mining_points_backup');
        localStorage.removeItem('mining_time_backup');
        localStorage.removeItem('mining_status');
        localStorage.removeItem('mining_last_init_time');
        localStorage.removeItem('last_refresh_time');
        localStorage.removeItem('refresh_count');
        localStorage.removeItem('launchpad_mining_status');
        localStorage.removeItem('registered_wallet');
        
        // Clear auth data
        authService.clear();
        premiumAuthService.clear();
        
        // Clear any remaining token-related items
        localStorage.removeItem('kaleido_premium_token');
        localStorage.removeItem('premium_token_timestamp');
        localStorage.removeItem('kaleido_auth_token');
        localStorage.removeItem('auth_token_timestamp');
      } catch (localStorageError) {
        console.error('Error clearing localStorage:', localStorageError);
      }

      // Safely attempt to revoke permissions
      try {
        // Request MetaMask to forget this site
        if (ethereum.request) {
          await ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          });
        }
      } catch (revokeError) {
        console.error('Error revoking wallet permissions:', revokeError);
      }

      // Clear auth data on disconnect
      authService.clear();
      premiumAuthService.clear();
      
      // Clear cached queries
      try {
        if (queryClient && typeof queryClient.clear === 'function') {
          queryClient.clear();
        }
        
        // Clear React Query cache for specific queries
        if (queryClient) {
          queryClient.removeQueries({ queryKey: ['quiz'] });
          queryClient.removeQueries({ queryKey: ['tasks'] });
          queryClient.removeQueries({ queryKey: ['points'] });
          queryClient.removeQueries({ queryKey: ['supernode'] });
          queryClient.removeQueries({ queryKey: ['mining'] });
        }
      } catch (clearError) {
        console.error('Error clearing query cache:', clearError);
      }

      // Clear the disconnect in progress flag
      localStorage.removeItem('disconnect_in_progress');
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
      
      // Ensure isConnecting is set to false even on error
      setIsConnecting(false);
      
      // Clear the disconnect in progress flag even on error
      localStorage.removeItem('disconnect_in_progress');
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnecting,
        connectWallet,
        disconnectWallet,
        refreshData,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
