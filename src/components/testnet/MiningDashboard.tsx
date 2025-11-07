"use client";

import { useState, useEffect, useCallback } from 'react';
import { POLLING_INTERVALS } from '@/constants/polling';
import { debounce } from 'lodash';
import { useSocket } from '@/hooks/useSocket';
import { useWeb3 } from '@/providers/Web3Provider';
import MiningService from '@/services/miningService';
import { MINING_POOLS, MINING_WORKERS } from '@/constants/mining';
import toast from 'react-hot-toast';

interface SystemCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  details: string;
  minRequirement: string;
}

const MiningDashboard = () => {
  const { account } = useWeb3();
  const { onPointsUpdate } = useSocket();
  const [isMining, setIsMining] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [canStartMining, setCanStartMining] = useState(false);
  const [isStartingMining, setIsStartingMining] = useState(false);
  const [hashRate, setHashRate] = useState('0');
  const [totalMined, setTotalMined] = useState('0');
  const [previousMined, setPreviousMined] = useState('0');
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(true);
  
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([
    {
      id: 'ram',
      name: 'RAM Check',
      description: 'Verifying system memory capacity',
      status: 'pending',
      details: 'Waiting to check...',
      minRequirement: '16GB RAM'
    },
    {
      id: 'cpu',
      name: 'CPU Check',
      description: 'Analyzing processor capabilities',
      status: 'pending',
      details: 'Waiting to check...',
      minRequirement: 'Any CPU'
    },
    {
      id: 'gpu',
      name: 'GPU Check',
      description: 'Checking GPU availability',
      status: 'pending',
      details: 'Waiting to check...',
      minRequirement: 'Any dedicated GPU'
    },
    {
      id: 'network',
      name: 'Network Check',
      description: 'Testing connection stability',
      status: 'pending',
      details: 'Waiting to check...',
      minRequirement: 'Any internet connection'
    },
    {
      id: 'storage',
      name: 'Storage Check',
      description: 'Verifying available disk space',
      status: 'pending',
      details: 'Waiting to check...',
      minRequirement: '25GB free space'
    }
  ]);

  const [selectedPool, setSelectedPool] = useState(MINING_POOLS[0]);
  const [selectedWorker, setSelectedWorker] = useState(MINING_WORKERS[0]);

  // Function to fetch initial points - only called once on mount
  const fetchInitialPoints = useCallback(async () => {
    if (!account) return;
    
    try {
      setIsLoadingPoints(true);
      const response = await fetch(`/api/testnet/user?walletAddress=${account}`);
      const data = await response.json();
      
      if (response.ok && data.registration) {
        const balance = data.registration.balance?.toString() || '0';
        setTotalMined(balance);
        setPreviousMined(balance); // Set initial previous mined
      }
    } catch (error) {
      console.error('Error fetching initial points:', error);
    } finally {
      setIsLoadingPoints(false);
    }
  }, [account]);

  // Only fetch points once on mount or account change
  useEffect(() => {
    fetchInitialPoints();
  }, [fetchInitialPoints]);

  // Listen for WebSocket points updates
  useEffect(() => {
    if (!account) return;

    const handlePointsUpdate = (points: number) => {
      if (points === 0 && parseFloat(totalMined) > 0) {
        // Prevent accidental reset to zero
        console.warn('Prevented reset to zero. Current total:', totalMined);
        return;
      }

      if (isMining) {
        // During mining, calculate session earnings properly
        const sessionPoints = Math.max(0, parseFloat(totalMined) - parseFloat(previousMined));
        const newTotal = Math.max(points + sessionPoints, parseFloat(totalMined));
        setTotalMined(newTotal.toString());
      } else {
        // When not mining, ensure we never decrease the balance
        const newTotal = Math.max(points, parseFloat(totalMined));
        setTotalMined(newTotal.toString());
        setPreviousMined(newTotal.toString());
      }
      setIsLoadingPoints(false);
    };

    // Subscribe to WebSocket updates
    const unsubscribe = onPointsUpdate(handlePointsUpdate);

    return () => {
      unsubscribe?.();
    };
  }, [account, isMining, onPointsUpdate, totalMined, previousMined]);

  // Listen for registration updates (task claims) via WebSocket
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRegistrationUpdate = (event: CustomEvent) => {
      const { balance } = event.detail;
      if (balance !== undefined) {
        if (isMining) {
          // Preserve mining progress while updating base balance
          const sessionPoints = Math.max(0, parseFloat(totalMined) - parseFloat(previousMined));
          const newTotal = Math.max(parseFloat(balance.toString()) + sessionPoints, parseFloat(totalMined));
          setTotalMined(newTotal.toString());
          setPreviousMined(balance.toString());
        } else {
          const newTotal = Math.max(parseFloat(balance.toString()), parseFloat(totalMined));
          setTotalMined(newTotal.toString());
          setPreviousMined(newTotal.toString());
        }
      }
    };

    window.addEventListener('registration-updated', handleRegistrationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('registration-updated', handleRegistrationUpdate as EventListener);
    };
  }, [isMining, totalMined, previousMined]);

  // Mining points updates via WebSocket
  useEffect(() => {
    if (!account || !isMining) return;

    const handleMiningUpdate = (value: string) => {
      setTotalMined(value);
      setHashRate('125.5');
    };

    // Listen for points updates via WebSocket
    const unsubscribe = onPointsUpdate((points) => {
      handleMiningUpdate(points.toFixed(3));
    });

    return () => {
      unsubscribe?.();
      setHashRate('0');
    };
  }, [account, isMining, onPointsUpdate]);

  // Check registration status
  useEffect(() => {
    const checkRegistration = async () => {
      if (!account) {
        setIsRegistered(false);
        setIsLoadingRegistration(false);
        return;
      }

      try {
        const response = await fetch(`/api/testnet/user?walletAddress=${account}`);
        const data = await response.json();
        setIsRegistered(response.ok && !!data.registration);
      } catch (error) {
        console.error('Error checking registration:', error);
        setIsRegistered(false);
      } finally {
        setIsLoadingRegistration(false);
      }
    };

    checkRegistration();
  }, [account]);

  // Listen for registration updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleRegistrationUpdate = () => {
      setIsRegistered(true);
      // Refresh the page after a short delay to ensure all states are updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    window.addEventListener('registration-updated', handleRegistrationUpdate);
    
    return () => {
      window.removeEventListener('registration-updated', handleRegistrationUpdate);
    };
  }, []);

  const handleMiningError = async (error: any) => {
    setIsMining(false);
    if (error?.response?.data?.error === 'Invalid balance update') {
      toast.error(
        "Your local balance appears to be outdated. Please refresh the page to see your current balance.",
        {
          duration: 5000,
        }
      );
      return;
    }
    toast.error(error?.response?.data?.error || "An error occurred while mining", {
      duration: 5000,
    });
  };

  const toggleMining = useCallback(async () => {
    if (!canStartMining && !isMining) {
      return;
    }
    
    if (!isMining) {
      setIsStartingMining(true);
      try {
        // Store current balance before starting mining
        setPreviousMined(totalMined);
        
        // Start mining using the service with selected pool and worker
        const success = await MiningService.getInstance().startMining({
          pool: selectedPool,
          worker: selectedWorker,
          wallet: account || '',
          previousEarnings: parseFloat(totalMined)
        });

        if (!success) {
          throw new Error('Failed to start mining');
        }
        
        setIsMining(true);
      } catch (error) {
        handleMiningError(error);
      } finally {
        setIsStartingMining(false);
      }
    } else {
      try {
        // Stop mining using the service
        const success = await MiningService.getInstance().stopMining();
        if (!success) {
          throw new Error('Failed to stop mining');
        }
        setIsMining(false);
      } catch (error) {
        handleMiningError(error);
      }
    }
  }, [canStartMining, isMining, totalMined, account, selectedPool, selectedWorker]);

  const startSystemCheck = async () => {
    setIsChecking(true);
    setCanStartMining(false);
    
    // Reset all checks to pending
    setSystemChecks(prev => prev.map(check => ({
      ...check,
      status: 'pending',
      details: 'Waiting to check...'
    })));

    // Perform checks sequentially
    for (let i = 0; i < systemChecks.length; i++) {
      // Update current check to checking status
      setSystemChecks(prev => prev.map((check, index) => ({
        ...check,
        status: index === i ? 'checking' : check.status,
        details: index === i ? 'Analyzing...' : check.details
      })));

      // Simulate check duration
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate check result (80% success rate)
      const success = Math.random() > 0.2;
      
      // Update check result
      setSystemChecks(prev => prev.map((check, index) => {
        if (index === i) {
          return {
            ...check,
            status: success ? 'success' : 'error',
            details: success 
              ? `✓ Meets minimum requirement: ${check.minRequirement}` 
              : `✗ Does not meet minimum requirement: ${check.minRequirement}`
          };
        }
        return check;
      }));

      // If any check fails, stop the process
      if (!success) {
        setIsChecking(false);
        setCanStartMining(false);
        return;
      }
    }

    // All checks passed
    setIsChecking(false);
    setCanStartMining(true);
  };

  return (
    <section className="py-16">
      <div className="bg-[#1A1B23] rounded-2xl p-8 md:p-12">
        {/* Header Section with Animated Background */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#04c74f]/10 to-transparent rounded-lg" />
          <div className="relative flex items-center justify-between z-10">
            <div>
              <h2 className="font-KyivType text-3xl md:text-4xl font-bold text-white mb-2">
                Mining Dashboard
              </h2>
              <p className="text-[#898CA9]">Track your mining progress and rewards</p>
            </div>
            {!isLoadingRegistration && !isRegistered ? (
              <div className="text-center">
                <p className="text-red-500 mb-2">Please register for the testnet program first</p>
                <a href="#registration" className="px-4 py-2 bg-[#04c74f] hover:bg-[#03b347] text-white rounded-lg transition-colors">
                  Register Now
                </a>
              </div>
            ) : (
              <button
                onClick={toggleMining}
                disabled={(!canStartMining && !isMining) || isStartingMining}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isMining
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : canStartMining
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isStartingMining ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Mining...
                  </span>
                ) : isMining ? (
                  'Stop Mining'
                ) : (
                  'Start Mining'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mining Configuration */}
        <div className="bg-[#282A37] rounded-xl p-6 mb-8">
          <h3 className="text-white text-xl font-semibold mb-4">Mining Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pool Selection */}
            <div>
              <label className="block text-[#898CA9] text-sm mb-2">Mining Pool</label>
              <select
                value={selectedPool.id}
                onChange={(e) => setSelectedPool(MINING_POOLS.find(p => p.id === e.target.value) || MINING_POOLS[0])}
                disabled={isMining}
                className="w-full bg-[#1A1B23] border border-[#282A37] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#04c74f]"
              >
                {MINING_POOLS.map(pool => (
                  <option key={pool.id} value={pool.id}>
                    {pool.name} - {pool.algorithm}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-[#898CA9]">
                Fee: {selectedPool.fee}% | Min Payout: {selectedPool.minPayout}
              </div>
            </div>

            {/* Worker Selection */}
            <div>
              <label className="block text-[#898CA9] text-sm mb-2">Mining Worker</label>
              <select
                value={selectedWorker.id}
                onChange={(e) => setSelectedWorker(MINING_WORKERS.find(w => w.id === e.target.value) || MINING_WORKERS[0])}
                disabled={isMining}
                className="w-full bg-[#1A1B23] border border-[#282A37] text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#04c74f]"
              >
                {MINING_WORKERS.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.specialization}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-[#898CA9]">
                Status: {selectedWorker.status} | Efficiency: {selectedWorker.powerEfficiency}%
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Hash Rate */}
          <div className="bg-[#282A37] rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#04c74f]/20 rounded-lg">
                <svg className="w-5 h-5 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-[#898CA9] text-sm">Hash Rate</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-white text-2xl font-bold">{hashRate}</span>
              <span className="text-[#898CA9] text-sm">H/s</span>
            </div>
          </div>

          {/* Total Mined */}
          <div className="bg-[#282A37] rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#04c74f]/20 rounded-lg">
                <svg className="w-5 h-5 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[#898CA9] text-sm">Total KLD Mined</h3>
            </div>
            <div className="flex items-end gap-2">
              {isLoadingPoints ? (
                <div className="animate-pulse">
                  <div className="h-8 w-20 bg-[#383B47] rounded"></div>
                </div>
              ) : (
                <>
                  <span className="text-white text-2xl font-bold">{totalMined}</span>
                  <span className="text-[#898CA9] text-sm">KLD</span>
                </>
              )}
            </div>
          </div>

          {/* Mining Status */}
          <div className="bg-[#282A37] rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#04c74f]/20 rounded-lg">
                <svg className="w-5 h-5 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[#898CA9] text-sm">Mining Status</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isMining ? 'bg-[#04c74f] animate-pulse' : 'bg-red-500'}`} />
              <span className="text-white font-medium">{isMining ? 'Mining' : 'Stopped'}</span>
            </div>
          </div>
        </div>

        {/* System Checks */}
        <div className="space-y-4">
          <h3 className="text-white text-xl font-bold mb-6">System Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemChecks.map((check) => (
              <div key={check.id} className="bg-[#282A37] rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-white font-medium mb-1">{check.name}</h4>
                    <p className="text-[#898CA9] text-sm">{check.description}</p>
                  </div>
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${check.status === 'success' ? 'bg-[#04c74f]/20 text-[#04c74f]' : 
                      check.status === 'error' ? 'bg-red-500/20 text-red-500' :
                      check.status === 'checking' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-[#383B47] text-[#898CA9]'
                    }
                  `}>
                    {check.status === 'success' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : check.status === 'error' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : check.status === 'checking' ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-[#898CA9] mb-1">Minimum Requirement:</p>
                  <p className="text-white">{check.minRequirement}</p>
                </div>
                <p className={`text-sm mt-2 ${
                  check.status === 'success' ? 'text-[#04c74f]' :
                  check.status === 'error' ? 'text-red-500' :
                  'text-[#898CA9]'
                }`}>
                  {check.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiningDashboard;
