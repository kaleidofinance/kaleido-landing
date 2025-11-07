import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaPlay, FaStop, FaLink, FaUnlink, FaExclamationTriangle, FaWallet, FaServer, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useWeb3 } from '@/providers/Web3Provider';
import { webhookService } from '@/services/webhookService';
import { launchpadSyncService } from '@/services/launchpadSyncService';

interface MiningStatus {
  isActive: boolean;
  walletAddress?: string;
  startTime?: string | Date | null;
  cpuCount?: number;
  miningRate?: string | number;
  points?: number;
  sessionPoints?: number;
  totalPoints?: number;
}

interface LaunchpadMiningProps {
  onPointsUpdate?: (points: number) => void;
}

function LaunchpadMining({ onPointsUpdate }: LaunchpadMiningProps) {
  const { account } = useWeb3();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [miningStatus, setMiningStatus] = useState<MiningStatus>({ isActive: false });
  const [displayTime, setDisplayTime] = useState('0h 0m 0s');
  const [displayPoints, setDisplayPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [launchpadWallet, setLaunchpadWallet] = useState<string>('');
  const [isWalletLinking, setIsWalletLinking] = useState(false);
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [showLinkConfirmation, setShowLinkConfirmation] = useState(false);

  // Track if initial data has been loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Track initialization to prevent duplicate requests
  const isInitializedRef = useRef(false);
  
  // We no longer need this ref since we've disabled logging
  // const lastMiningLogTimeRef = useRef<number>(0);
  
  // Track initialization request timestamp to prevent duplicate requests in quick succession
  const lastInitRequestTimeRef = useRef<number>(0);
  
  // Initialize on component mount and handle account changes
  useEffect(() => {
    // Skip if component is already initialized
    if (isInitializedRef.current) {
      return;
    }
    
    // Prevent multiple requests within a short time window (1 second)
    const now = Date.now();
    if (now - lastInitRequestTimeRef.current < 1000) {
      return;
    }
    lastInitRequestTimeRef.current = now;
    
    if (account) {
      // Mark as initialized to prevent duplicate requests
      isInitializedRef.current = true;
      
      // Check for saved mining points first to prevent flash of 0
      const savedPoints = localStorage.getItem('mining_points_backup');
      const savedTime = localStorage.getItem('mining_time_backup');
      
      if (savedPoints) {
        const savedPointsValue = parseFloat(savedPoints);
        if (!isNaN(savedPointsValue) && savedPointsValue > 0) {
          // Pre-populate with saved points to prevent flash of 0
          setDisplayPoints(savedPointsValue);
          pointsRef.current = savedPointsValue;
          persistentPointsRef.current = savedPointsValue;
        }
      }
      
      // Check for linked wallet in localStorage
      const linked = localStorage.getItem('linked_launchpad_wallet');
      if (linked) {
        setLinkedWallet(linked);
      }
      
      // Initialize sync and check status - with debounce
      const initialize = async () => {
        try {
          // Check if another initialization is already in progress
          if (apiRequestsInProgressRef.current['initSync'] || apiRequestsInProgressRef.current['checkStatus']) {
            return; // Skip if already in progress
          }
          
          // Track this initialization in localStorage to prevent duplicate initializations across tab visits
          const lastInitTime = localStorage.getItem('mining_last_init_time');
          if (lastInitTime) {
            const lastInit = parseInt(lastInitTime, 10);
            // If we've initialized in the last 30 seconds, don't initialize again
            if (now - lastInit < 30000) {
              // Just restore the mining status from localStorage
              const savedStatus = localStorage.getItem('mining_status');
              if (savedStatus) {
                try {
                  const parsedStatus = JSON.parse(savedStatus);
                  setMiningStatus(parsedStatus);
                  setInitialDataLoaded(true);
                  return; // Skip initialization if we have recent data
                } catch (e) {
                  // If parsing fails, continue with normal initialization
                }
              }
            }
          }
          
          // Save the current time as the last initialization time
          localStorage.setItem('mining_last_init_time', now.toString());
          
          await initializeSync();
          // Add a small delay to prevent race conditions
          await new Promise(resolve => setTimeout(resolve, 300));
          // Only check status if we're still mounted and initialized
          if (isInitializedRef.current) {
            await handleCheckStatus(false);
          }
          setInitialDataLoaded(true);
        } catch (error) {
          console.error('Error during initialization:', error);
          // Reset initialization flag on error so we can try again
          isInitializedRef.current = false;
        }
      };
      
      // Use setTimeout to ensure we don't have multiple simultaneous initializations
      setTimeout(initialize, 100);
      
      // Listen for status updates
      const handleStatusUpdate = (e: any) => {
        setMiningStatus(e.detail);
        // Save the current status to localStorage
        localStorage.setItem('mining_status', JSON.stringify(e.detail));
      };
      window.addEventListener('launchpad-status-update', handleStatusUpdate);
      
      // Clean up on unmount
      return () => {
        window.removeEventListener('launchpad-status-update', handleStatusUpdate);
        launchpadSyncService.cleanup();
        // Don't reset the flag on unmount, as this can cause issues with React 18's strict mode
        // which mounts, unmounts, and remounts components during development
      };
    } else {
      // Clear all data when account disconnects
      setLinkedWallet(null);
      setLaunchpadWallet('');
      setDisplayTime('0h 0m 0s');
      setDisplayPoints(0);
      setMiningStatus({ isActive: false });
      setIsRegistered(false);
      setError(null);
      setIsWalletLinking(false);
      setIsLoading(false);
      
      // Clear all localStorage data related to mining
      localStorage.removeItem('linked_launchpad_wallet');
      localStorage.removeItem('mining_points_backup');
      localStorage.removeItem('mining_time_backup');
      localStorage.removeItem('mining_status');
      localStorage.removeItem('mining_last_init_time');
      localStorage.removeItem('last_refresh_time');
      localStorage.removeItem('refresh_count');
      
      // Reset all refs
      isInitializedRef.current = false;
      lastInitRequestTimeRef.current = 0;
      if (typeof pointsRef !== 'undefined' && pointsRef.current) {
        pointsRef.current = 0;
      }
      if (typeof persistentPointsRef !== 'undefined' && persistentPointsRef.current) {
        persistentPointsRef.current = 0;
      }
      if (typeof apiRequestsInProgressRef !== 'undefined' && apiRequestsInProgressRef.current) {
        apiRequestsInProgressRef.current = { initSync: false, checkStatus: false };
      }
      
      // Clean up the launchpad sync service
      launchpadSyncService.cleanup();
      
      // Set initial data loaded to true to prevent loading state
      setInitialDataLoaded(true);
      
      return () => {}; // Empty cleanup function when no account
    }
  }, [account]);

  // Initialize synchronization
  const initializeSync = async () => {
    if (!account) return;
    
    // Check if we already have a sync in progress
    if (apiRequestsInProgressRef.current['initSync']) {
      return;
    }
    
    // Mark this sync as in progress
    apiRequestsInProgressRef.current['initSync'] = true;
    
    setIsLoading(true);
    try {
      // Check if registered from localStorage first
      const registeredWallet = localStorage.getItem('registered_wallet');
      if (registeredWallet) {
        setIsRegistered(true);
      } else {
        // Fallback to the webhook service check
        setIsRegistered(webhookService.isWebhookRegistered());
      }
      
      // Initialize the sync service
      await launchpadSyncService.initialize(account);
      
      // Get current status
      setMiningStatus(launchpadSyncService.getMiningStatus());
    } catch (error) {
      console.error('Error initializing sync:', error);
      setError('Failed to initialize synchronization with Launchpad');
    } finally {
      // Clear the in-progress flag
      apiRequestsInProgressRef.current['initSync'] = false;
      setIsLoading(false);
    }
  };

  // Register for webhook notifications
  const handleRegister = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Determine which wallet to register
    const walletToRegister = linkedWallet || account;

    setIsLoading(true);
    try {
      const result = await webhookService.registerWebhook(walletToRegister);
      
      if (result.success) {
        setIsRegistered(true);
        // Store the registered wallet in localStorage
        localStorage.setItem('registered_wallet', walletToRegister);
        toast.success('Successfully registered for mining notifications');
        
        // Initialize the sync service
        await launchpadSyncService.initialize(walletToRegister);
      } else {
        throw new Error(result.error || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering webhook:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register for mining notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Link a Launchpad wallet to the current Kalaido wallet
  const handleLinkWallet = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!launchpadWallet || !launchpadWallet.startsWith('0x') || launchpadWallet.length !== 42) {
      toast.error('Please enter a valid Launchpad wallet address');
      return;
    }

    // Show confirmation dialog
    setShowLinkConfirmation(true);
  };

  // Handle confirmation of wallet linking
  const handleConfirmLink = async () => {
    setShowLinkConfirmation(false);
    setIsWalletLinking(true);
    try {
      if (!account) {
        throw new Error('No wallet connected');
      }
      
      if (!launchpadWallet) {
        throw new Error('No Launchpad wallet address provided');
      }

      const result = await webhookService.linkWallets(account, launchpadWallet);
      
      if (result.success) {
        // Use the launchpadWallet returned from the API if available
        const linkedAddress = result.launchpadWallet || launchpadWallet;
        setLinkedWallet(linkedAddress);
        localStorage.setItem('linked_launchpad_wallet', linkedAddress);
        toast.success('Wallets linked successfully');
        setLaunchpadWallet(''); // Clear the input field
      } else {
        throw new Error(result.error || 'Failed to link wallets');
      }
    } catch (error) {
      console.error('Error linking wallets:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to link wallets');
    } finally {
      setIsWalletLinking(false);
    }
  };

  // Handle cancellation of wallet linking
  const handleCancelLink = () => {
    setShowLinkConfirmation(false);
  };

  // Unregister from webhook notifications
  const handleUnregister = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const result = await webhookService.unregisterWebhook(account);
      
      if (result.success) {
        setIsRegistered(false);
        // Remove the registered wallet from localStorage
        localStorage.removeItem('registered_wallet');
        toast.success('Successfully unregistered from mining notifications');
        
        // Stop the sync service
        launchpadSyncService.cleanup();
      } else {
        throw new Error(result.error || 'Failed to unregister');
      }
    } catch (error) {
      console.error('Error unregistering webhook:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unregister from mining notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Track API requests to prevent duplicates
  const apiRequestsInProgressRef = useRef<Record<string, boolean>>({});
  
  // Debounce timers for API calls
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Debounce function to prevent rapid successive calls
  const debounce = (key: string, fn: Function, delay: number = 500) => {
    // Clear any existing timer for this key
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key]);
    }
    
    // Set a new timer
    debounceTimersRef.current[key] = setTimeout(() => {
      fn();
      // Clear the timer reference
      delete debounceTimersRef.current[key];
    }, delay);
  };
  
  // Check current mining status
  const handleCheckStatus = async (showToast: boolean = false, forceRefresh: boolean = false) => {
    if (!account) {
      if (showToast) {
        toast.error('Please connect your wallet first');
      }
      return;
    }

    // Check if we already have a request in progress
    if (apiRequestsInProgressRef.current['checkStatus']) {
      return;
    }
    
    // Mark this request as in progress
    apiRequestsInProgressRef.current['checkStatus'] = true;
    
    setIsLoading(true);
    try {
      
      // Save current values before API call to prevent flickering
      const prevPoints = miningStatus.totalPoints || 0;
      const prevIsActive = miningStatus.isActive;
      const prevStartTime = miningStatus.startTime;
      const prevMiningRate = miningStatus.miningRate;
      
      // Call the API to get mining status with forceRefresh parameter
      // When forceRefresh is true, it will bypass the cache and get fresh data
      const result = await webhookService.checkMiningStatus(account, forceRefresh);
      
      if (result.success) {
        // Get the total points from the response - we'll calculate session points ourselves
        const totalPoints = result.status.totalPoints || 0;
        
        // Detect if mining status has changed significantly
        const statusChanged = 
          prevIsActive !== result.status.isActive ||
          !prevStartTime !== !result.status.startTime ||
          (prevMiningRate !== result.status.miningRate && result.status.miningRate !== 0);
        
        // If mining is active in the response but totalPoints is suspiciously low
        // or suddenly drops to 0/1, there might be an issue with the response
        const suspiciousPointsReset = 
          result.status.isActive && 
          ((totalPoints <= 1 && prevPoints > totalPoints) || // Points suddenly dropped to 0 or 1
           (Math.abs(totalPoints - prevPoints) > 10 && totalPoints < prevPoints)) && // Points suddenly dropped significantly
          prevIsActive === result.status.isActive;
        
        // Points comparison logging removed
        
        // Use previous total points if we detect a suspicious reset
        const finalTotalPoints = suspiciousPointsReset ? prevPoints : totalPoints;
        
        // Update local status with all available information
        setMiningStatus({
          isActive: result.status.isActive,
          walletAddress: result.status.address,
          startTime: result.status.startTime,
          cpuCount: result.status.cpuCount,
          miningRate: result.status.miningRate,
          points: result.status.points,
          totalPoints: finalTotalPoints
        });
        
        // If there's a linked wallet in the response, update the linked wallet state
        if (result.status.linkedWallet) {
          setLinkedWallet(result.status.linkedWallet);
          localStorage.setItem('linked_launchpad_wallet', result.status.linkedWallet);
        }
        
        // Check if there's a registered wallet in the response and update the isRegistered state
        if (result.registeredWallet) {
          setIsRegistered(true);
          localStorage.setItem('registered_wallet', result.registeredWallet);
        } else {
          // If there's no registered wallet, check if we have one in localStorage
          const storedRegisteredWallet = localStorage.getItem('registered_wallet');
          if (!storedRegisteredWallet) {
            setIsRegistered(false);
            localStorage.removeItem('registered_wallet');
          }
        }
        
        // Initialize display values - calculate real-time values immediately
        if (result.status.isActive) {
          const newTime = getMiningDuration();
          const newPoints = calculateRealTimePoints();
          setDisplayTime(newTime);
          setDisplayPoints(newPoints);
          timeRef.current = newTime;
          pointsRef.current = newPoints;
        } else {
          setDisplayTime('0h 0m 0s');
          setDisplayPoints(finalTotalPoints);
          timeRef.current = '0h 0m 0s';
          pointsRef.current = finalTotalPoints;
        }
        
        // Mining status update logging removed
        
        // Only show toast notifications when explicitly requested
        if (showToast) {
          if (result.status.isActive) {
            toast.success(`Mining is active! Rate: ${result.status.miningRate} points/sec`);
          } else {
            toast.success('Mining is currently inactive on Launchpad');
          }
        }
      } else {
        throw new Error(result.error || 'Failed to check status');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check mining status');
    } finally {
      // Clear the in-progress flag
      apiRequestsInProgressRef.current['checkStatus'] = false;
      setIsLoading(false);
    }
  };

  // Calculate mining duration
  const getMiningDuration = (): string => {
    if (!miningStatus.isActive || !miningStatus.startTime) return '0h 0m 0s';
    
    // Convert startTime to a number (timestamp) if it's a string or Date
    const startTimeMs = typeof miningStatus.startTime === 'string' 
      ? new Date(miningStatus.startTime).getTime() 
      : miningStatus.startTime instanceof Date 
        ? miningStatus.startTime.getTime() 
        : 0;
    
    if (!startTimeMs) return '0h 0m 0s';
    
    const duration = Date.now() - startTimeMs;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((duration % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  
  // Store the last valid points calculation to prevent resets
  const lastValidPointsRef = useRef<number | null>(null);
  
  // Calculate real-time points with millisecond precision
  const calculateRealTimePoints = (): number => {
    if (!miningStatus.isActive || !miningStatus.startTime || !miningStatus.miningRate) {
      // Reset the last valid points if mining is not active
      if (!miningStatus.isActive) {
        lastValidPointsRef.current = null;
      }
      return miningStatus.totalPoints || 0;
    }
    
    try {
      // Convert startTime to a number (timestamp) with millisecond precision
      let startTimeMs: number;
      if (typeof miningStatus.startTime === 'string') {
        startTimeMs = new Date(miningStatus.startTime).getTime();
      } else if (miningStatus.startTime instanceof Date) {
        startTimeMs = miningStatus.startTime.getTime();
      } else {
        startTimeMs = 0;
      }
      
      if (!startTimeMs) {
        // Return base points if start time is invalid
        return miningStatus.totalPoints || 0;
      }
      
      // Calculate duration in milliseconds with full precision
      const currentTimeMs = Date.now();
      const durationMs = currentTimeMs - startTimeMs;
      
      // Convert duration to seconds with full decimal precision
      const durationSeconds = durationMs / 1000;
      
      // Get mining rate with full precision - ensure it's a proper number
      // The mining rate from the server is in points per SECOND
      let miningRate: number;
      if (typeof miningStatus.miningRate === 'string') {
        // Make sure we're parsing the string correctly
        miningRate = parseFloat(miningStatus.miningRate.replace(/[^0-9.]/g, ''));
      } else {
        miningRate = Number(miningStatus.miningRate) || 0;
      }
      
      // Validate mining rate to prevent calculation errors
      if (isNaN(miningRate) || miningRate <= 0) {
        miningRate = 0.0045; // Fallback to default rate if invalid (0.0045 points per second)
      }
      
      // Calculate real-time session points with full precision
      // Mining rate is per SECOND, so multiply by seconds directly
      const realTimeSessionPoints = durationSeconds * miningRate;
      
      // Get the base total points (excluding session points)
      const basePoints = miningStatus.totalPoints || 0;
      
      // Calculate total points with full precision
      const totalPoints = basePoints + realTimeSessionPoints;
      
      // Ensure we're returning a valid number
      if (isNaN(totalPoints) || !isFinite(totalPoints)) {
        return lastValidPointsRef.current !== null ? lastValidPointsRef.current : basePoints;
      }
      
      // Check if the calculated points are suspiciously low compared to our last valid calculation
      if (lastValidPointsRef.current !== null && totalPoints < lastValidPointsRef.current && totalPoints <= 1) {
        return lastValidPointsRef.current;
      }
      
      // Store this as our last valid calculation
      lastValidPointsRef.current = totalPoints;
      
      return totalPoints;
    } catch (error) {
      return miningStatus.totalPoints || 0;
    }
  };
  
  // Use refs to track the current values without triggering re-renders
  const pointsRef = useRef(0);
  const timeRef = useRef('0h 0m 0s');
  const tabVisibleRef = useRef(true); // Track if the tab is visible
  
  // Persistent storage for mining points to prevent resets
  const persistentPointsRef = useRef<number | null>(null);
  
  // Load mining points from server immediately on component mount
  useEffect(() => {
    const loadInitialMiningPoints = async () => {
      try {
        // Fetch mining status directly from the server
        // Use the current wallet address from the web3 context
        const result = await webhookService.checkMiningStatus(account || '');
        
        if (result.success && result.status) {
          // Extract mining points from server response
          const serverMiningPoints = Number(result.status.totalPoints) || 0;
          
          // Update refs and state
          pointsRef.current = serverMiningPoints;
          persistentPointsRef.current = serverMiningPoints;
          setDisplayPoints(serverMiningPoints);
          
          // Pass to parent component with 4x multiplier - only during initial load
          if (onPointsUpdate) {
            const multipliedPoints = serverMiningPoints * 4;
            onPointsUpdate(multipliedPoints);
          }
        }
      } catch (error) {
        console.error('Error loading initial mining points:', error);
      }
    };
    
    // Execute the async function
    loadInitialMiningPoints();
  }, []); // Empty dependency array ensures this runs once on mount

  // Flag to track when we should update the parent component
  const shouldUpdateParentRef = useRef<boolean>(false);
  
  // Update timer and points in real-time with millisecond precision
  useEffect(() => {
    // Immediately calculate initial values
    if (miningStatus.isActive) {
      // If we have a persistent value and it's higher than what we'd calculate now, use it
      const calculatedPoints = calculateRealTimePoints();
      const initialPoints = persistentPointsRef.current !== null && 
                           persistentPointsRef.current > calculatedPoints ? 
                           persistentPointsRef.current : calculatedPoints;
      
      const initialTime = getMiningDuration();
      
      // Update both the state and the refs
      setDisplayTime(initialTime);
      setDisplayPoints(initialPoints);
      timeRef.current = initialTime;
      pointsRef.current = initialPoints;
      persistentPointsRef.current = initialPoints;
      
      // We no longer update the parent component on every interval
      // This prevents excessive network requests and console logs
      // Parent updates now only happen on: initial load, manual refresh, and tab visibility change
      // Save to localStorage as backup
      localStorage.setItem('mining_points_backup', initialPoints.toString());
      localStorage.setItem('mining_time_backup', new Date().toISOString());
    } else {
      setDisplayTime('0h 0m 0s');
      setDisplayPoints(miningStatus.totalPoints || 0);
      timeRef.current = '0h 0m 0s';
      pointsRef.current = miningStatus.totalPoints || 0;
      persistentPointsRef.current = null; // Reset persistent points when mining is inactive
    }
    
    // Set up interval for more frequent updates (every 50ms for smoother updates)
    const intervalId = setInterval(() => {
      if (miningStatus.isActive) {
        // Calculate new values
        const newTime = getMiningDuration();
        const calculatedPoints = calculateRealTimePoints();
        
        // Ensure points never decrease unless mining is stopped
        const newPoints = persistentPointsRef.current !== null && 
                         persistentPointsRef.current > calculatedPoints ? 
                         persistentPointsRef.current : calculatedPoints;
        
        // Only update state if values have changed significantly
        if (newTime !== timeRef.current) {
          setDisplayTime(newTime);
          timeRef.current = newTime;
        }
        
        // For points, only update if the difference is significant (0.001 or more)
        // AND ensure we never go backwards in points
        if (Math.abs(newPoints - pointsRef.current) >= 0.001 && newPoints >= pointsRef.current) {
          setDisplayPoints(newPoints);
          pointsRef.current = newPoints;
          persistentPointsRef.current = newPoints;
          
          // Save to localStorage every time points change significantly
          localStorage.setItem('mining_points_backup', newPoints.toString());
          localStorage.setItem('mining_time_backup', new Date().toISOString());
          
          // Notify parent component about points update only when specifically triggered
          if (onPointsUpdate && shouldUpdateParentRef.current) {
            const multipliedPoints = newPoints * 4;
            onPointsUpdate(multipliedPoints);
            shouldUpdateParentRef.current = false; // Reset the flag after updating
          }
        }
      }
    }, 50); // Update 20 times per second for smoother real-time display
    
    // Clean up interval on unmount or when dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [miningStatus]);
  
  // No automatic refresh - users will click the refresh button manually
  // or refresh will happen when tab becomes visible
  
  // Reset all displayed data when wallet is disconnected
  useEffect(() => {
    if (!account) {
      // Reset all state variables to their default values
      setLinkedWallet(null);
      setLaunchpadWallet('');
      setDisplayTime('0h 0m 0s');
      setDisplayPoints(0);
      setMiningStatus({ isActive: false });
      setIsRegistered(false);
      setError(null);
      setIsWalletLinking(false);
      setIsLoading(false);
      setInitialDataLoaded(true);
      
      // Reset all refs
      isInitializedRef.current = false;
      lastInitRequestTimeRef.current = 0;
      if (typeof pointsRef !== 'undefined' && pointsRef.current) {
        pointsRef.current = 0;
      }
      if (typeof persistentPointsRef !== 'undefined' && persistentPointsRef.current) {
        persistentPointsRef.current = 0;
      }
      if (typeof apiRequestsInProgressRef !== 'undefined' && apiRequestsInProgressRef.current) {
        apiRequestsInProgressRef.current = { initSync: false, checkStatus: false };
      }
      if (typeof lastRefreshTimeRef !== 'undefined' && lastRefreshTimeRef.current) {
        lastRefreshTimeRef.current = 0;
      }
      if (typeof refreshCountsRef !== 'undefined' && refreshCountsRef.current) {
        refreshCountsRef.current = [];
      }
      if (typeof shouldUpdateParentRef !== 'undefined' && shouldUpdateParentRef.current) {
        shouldUpdateParentRef.current = false;
      }
      if (typeof tabVisibleRef !== 'undefined' && tabVisibleRef.current) {
        tabVisibleRef.current = true;
      }
      if (typeof timeRef !== 'undefined' && timeRef.current) {
        timeRef.current = '0h 0m 0s';
      }
    }
  }, [account]);

  // Track last refresh time to prevent multiple rapid refreshes
  const lastRefreshTimeRef = useRef<number>(0);
  
  // Track refresh counts for rate limiting (max 5 per minute)
  const refreshCountsRef = useRef<number[]>([]);
  const MAX_REFRESHES_PER_MINUTE = 5;
  
  // Handle manual refresh button click with debounce and rate limiting
  const handleRefresh = () => {
    const now = Date.now();
    
    // Prevent multiple refreshes within a short time window (1.5 seconds)
    if (now - lastRefreshTimeRef.current < 1500) {
      toast.success('Please wait before refreshing again');
      return;
    }
    
    // Rate limiting: Check how many refreshes in the last minute
    // Remove timestamps older than 1 minute
    const oneMinuteAgo = now - 60000;
    refreshCountsRef.current = refreshCountsRef.current.filter(timestamp => timestamp > oneMinuteAgo);
    
    // Check if we've exceeded the rate limit
    if (refreshCountsRef.current.length >= MAX_REFRESHES_PER_MINUTE) {
      const oldestTimestamp = refreshCountsRef.current[0];
      const timeUntilReset = Math.ceil((oldestTimestamp + 60000 - now) / 1000);
      toast.error(`Rate limit reached (${MAX_REFRESHES_PER_MINUTE} refreshes per minute). Please wait ${timeUntilReset} seconds.`);
      return;
    }
    
    // Add current timestamp to the refresh counts
    refreshCountsRef.current.push(now);
    
    // Update last refresh time
    lastRefreshTimeRef.current = now;
    
    // Check if a request is already in progress
    if (apiRequestsInProgressRef.current['checkStatus']) {
      toast.success('Status check already in progress');
      return;
    }
    
    // Manual refresh should trigger a parent update and force a cache refresh
    shouldUpdateParentRef.current = true;
    // Pass true for showToast and true for forceRefresh to bypass cache
    handleCheckStatus(true, true);
  };

  // Handle tab visibility changes
  useEffect(() => {
    // Function to handle visibility change
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      tabVisibleRef.current = isVisible;
      
      if (isVisible) {
        // Only restore mining state from localStorage, but don't make new requests
        if (miningStatus.isActive) {
          const savedPoints = localStorage.getItem('mining_points_backup');
          const savedTime = localStorage.getItem('mining_time_backup');
          
          if (savedPoints && savedTime) {
            const savedPointsValue = parseFloat(savedPoints);
            const timeDiff = (new Date().getTime() - new Date(savedTime).getTime()) / 1000;
            
            // Only use saved state if it's from the current session
            if (miningStatus.startTime && savedPointsValue > 0) {
              const startTime = new Date(miningStatus.startTime).getTime();
              const savedTimeValue = new Date(savedTime).getTime();
              
              // Check if saved time is after mining start time
              if (savedTimeValue > startTime) {
                // Restore mining state from localStorage
                // Calculate additional points earned while tab was inactive
                const additionalPoints = timeDiff * (parseFloat(miningStatus.miningRate?.toString() || '0'));
                const restoredPoints = savedPointsValue + additionalPoints;
                
                // Update points with restored value
                pointsRef.current = restoredPoints;
                setDisplayPoints(restoredPoints);
                // Points successfully restored without making new requests
              }
            }
          }
        }
      } else {
        // Save mining state when tab becomes hidden
        if (miningStatus.isActive && pointsRef.current > 0) {
          localStorage.setItem('mining_points_backup', pointsRef.current.toString());
          localStorage.setItem('mining_time_backup', new Date().toISOString());
        }
      }
    };
    
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initial check
    handleVisibilityChange();
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [miningStatus.isActive, miningStatus.startTime, miningStatus.miningRate]);

  // Render the component
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Premium Node Mining</h2>
          
        </div>
        <div>
          <button
            onClick={handleRefresh}
            disabled={isLoading || !account}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors"
          >
            <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Cards Container - Horizontal Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confirmation Modal */}
        {showLinkConfirmation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-[#22242F] p-6 rounded-2xl max-w-sm w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Confirm Wallet Linking</h3>
                <button
                  onClick={handleCancelLink}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-300">
                  Are you sure you want to link your Kalaido wallet to this Launchpad wallet?
                </p>
                
                <div className="bg-[#00dd72]/10 rounded-lg p-3">
                  <p className="text-[#00dd72] text-sm font-mono break-all">
                    {launchpadWallet}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleCancelLink}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmLink}
                    disabled={isWalletLinking}
                    className={`flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white ${
                      isWalletLinking ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isWalletLinking ? 'Linking...' : 'Link Wallets'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {/* Connection Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-6 rounded-2xl border border-white/5 shadow-xl h-full flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Connection Status</h3>
            <div className={`h-3 w-3 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          
          <p className="text-gray-300 mb-4">
            {isRegistered 
              ? 'Your wallet is registered to receive mining notifications from Launchpad.' 
              : 'Register your wallet to receive mining notifications from Launchpad.'}
          </p>
          
          {!account ? (
            <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-lg flex items-start mb-4">
              <FaExclamationTriangle className="text-xl mr-3 mt-1 flex-shrink-0" />
              <p>Please connect your wallet to use this feature.</p>
            </div>
          ) : null}
          
          {/* Wallet Linking Section */}
          {account && (
            <div className="mb-6 mt-2">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <FaWallet className="mr-2 text-[#00dd72]" />
                {linkedWallet ? 'Linked Launchpad Wallet' : 'Link Launchpad Wallet (Optional)'}
              </h4>
              
              {linkedWallet ? (
                <div className="bg-[#00dd72]/10 text-[#00dd72] p-3 rounded-lg text-sm font-mono break-all">
                  {linkedWallet}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    If you use a different wallet on Launchpad, enter it below to link accounts.
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={launchpadWallet}
                      onChange={(e) => setLaunchpadWallet(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={handleLinkWallet}
                      disabled={isWalletLinking || !launchpadWallet}
                      className={`px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm ${
                        isWalletLinking || !launchpadWallet ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isWalletLinking ? 'Linking...' : 'Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-4 mt-auto pt-4">
            {isRegistered ? (
              <>
                <button
                  onClick={handleUnregister}
                  disabled={isLoading || !account}
                  className={`flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors ${
                    isLoading || !account ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaUnlink className="mr-2" />
                  Unregister
                </button>
                <button
                  onClick={() => {
                    // Check if there's a link available
                    if (process.env.NEXT_PUBLIC_LAUNCHPAD_URL) {
                      window.open(process.env.NEXT_PUBLIC_LAUNCHPAD_URL, '_blank');
                    } else {
                      toast.success('Launchpad access coming soon!');
                    }
                  }}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <FaServer className="mr-2" />
                  Visit Launchpad
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRegister}
                  disabled={isLoading || !account}
                  className={`flex items-center px-6 py-3 bg-[#00dd72] hover:bg-[#00c066] text-black rounded-xl transition-colors ${
                    isLoading || !account ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaLink className="mr-2" />
                  Register
                </button>
                <button
                  onClick={() => {
                    // Check if there's a link available
                    if (process.env.NEXT_PUBLIC_LAUNCHPAD_URL) {
                      window.open(process.env.NEXT_PUBLIC_LAUNCHPAD_URL, '_blank');
                    } else {
                      toast.success('Launchpad access coming soon!');
                    }
                  }}
                  className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <FaServer className="mr-2" />
                  Visit Launchpad
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Mining Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-6 rounded-2xl border border-white/5 shadow-xl h-full flex flex-col"
        >
          <div className="flex items-center gap-2">
            <FaLink className="text-green-500" />
            <span>Link Launchpad Wallet</span>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              miningStatus.isActive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {miningStatus.isActive ? 'Active' : 'Inactive'}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 mb-1">Mining Duration</p>
              <div className="relative">
                {/* Always show the current value */}
                <p className="text-2xl font-bold text-[#00dd72]">{displayTime}</p>
                
                {/* Show loading overlay only when loading */}
                {isLoading && !initialDataLoaded && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-8 bg-gray-800/70 rounded animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Points Earned</p>
              <div className="relative">
                {/* Don't show 0 points during initial loading unless we have confirmed it's really 0 */}
                <p className="text-2xl font-bold text-[#00dd72]" data-testid="points-display">
                  {(!initialDataLoaded && displayPoints === 0) ? '' : displayPoints.toFixed(3)}
                </p>
                
                {/* Show loading overlay when loading or waiting for initial data */}
                {(isLoading || (!initialDataLoaded && displayPoints === 0)) && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-8 bg-gray-800/70 rounded animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 4x Multiplier Notification */}
          <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-lg flex items-center mb-4 animate-pulse">
            <div className="mr-2 text-lg font-bold">4x</div>
            <div>
              <p className="font-semibold">Premium Points Boost!</p>
              <p className="text-xs">Mining points are multiplied by 4 in your total premium points.</p>
            </div>
          </div>
          
          
          
          <div className="bg-blue-500/20 text-blue-300 p-4 rounded-lg flex items-start mt-auto">
            <FaExclamationTriangle className="text-xl mr-3 mt-1 flex-shrink-0" />
            <p>Launchpad access is coming soon! Stay Tunned!</p>
          </div>
        </motion.div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 text-red-300 p-4 rounded-lg flex items-start mt-6">
          <FaExclamationTriangle className="text-xl mr-3 mt-1 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default LaunchpadMining;
