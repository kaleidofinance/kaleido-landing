"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/lib/mysql';
import { dataService, dataEventBus } from '@/services/dataService';
import { authService } from '@/services/authService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { MiningDashboardData, MiningWorker, MiningPool } from '@/types/mining';
import SystemCheck from './SystemCheck';
import MiningService from '@/services/miningService';
import toast from 'react-hot-toast';
import { useWeb3 } from '@/providers/Web3Provider';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
// charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Function to convert chart data to bar chart format
const getBarChartData = (chartData: { timestamp: string; value: number }[], label: string) => {
  return {
    labels: chartData.map(() => ''), // Empty labels for cleaner look
    datasets: [
      {
        label,
        data: chartData.map(d => d.value),
        backgroundColor: 'rgba(4, 199, 79, 0.8)',
        hoverBackgroundColor: 'rgba(4, 199, 79, 1)',
        borderColor: '#03b347',
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 12,
        maxBarThickness: 12
      }
    ]
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300 // Quick but visible animation
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: '#1A1B23',
      titleColor: '#fff',
      bodyColor: '#898CA9',
      borderColor: '#282A37',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          let value = context.parsed.y;
          return `${label}: ${value.toFixed(3)}`;
        }
      }
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: '#898CA9',
        maxTicksLimit: 8,
        display: false // Hide x-axis labels for cleaner look
      },
    },
    y: {
      grid: {
        color: 'rgba(40, 42, 55, 0.5)',
        drawBorder: false,
        lineWidth: 0.5
      },
      ticks: {
        color: '#898CA9',
        callback: function(value: any) {
          return value.toFixed(2);
        },
        padding: 10
      },
      min: 0,
      suggestedMax: 5, // Increased max value
      beginAtZero: true,
      grace: '10%' // Add some padding at the top
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  hover: {
    mode: 'nearest' as const,
    intersect: false
  }
} as const;

const MINING_CACHE_KEY = 'kalaido_mining_data';
const CHART_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STORAGE_UPDATE_INTERVAL = 1 * 1000; // Save every second for better data preservation

// Define custom event types
interface RegistrationUpdateEvent {
  balance?: number;
  twitterTaskClaimed?: boolean;
}

declare global {
  interface WindowEventMap {
    'registration-update': CustomEvent<RegistrationUpdateEvent>;
  }
}

const MiningDashboard = () => {
  const { account } = useWeb3();
  const [data, setData] = useState<MiningDashboardData>({
    workers: [],
    pools: [],
    networkStats: {
      hashrate: {
        total: 0,
        average: 0,
        peak: 0
      },
      difficulty: 0,
      blockHeight: 0,
      blockReward: 0,
      networkNodes: 0,
      poolShare: 0
    },
    minerStats: {
      totalHashrate: 0,
      activeWorkers: 0,
      totalShares: {
        accepted: 0,
        rejected: 0,
        invalid: 0
      },
      earnings: {
        total: 0,
        pending: 0,
        paid: 0
      },
      efficiency: 0,
      uptime: 0,
      powerEfficiency: 0
    },
    charts: {
      hashrate: [],
      earnings: [],
      shares: [],
      difficulty: []
    }
  });
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [isMining, setIsMining] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [miningStats, setMiningStats] = useState({
    hashrate: {
      current: 0,
      average: 0,
      peak: 0
    },
    shares: { 
      accepted: 0, 
      rejected: 0,
      invalid: 0 
    },
    temperature: 0,
    powerUsage: 0,
    earnings: {
      total: 0, // Ensure initialized as 0
      pending: 0,
      paid: 0
    },
    miningRate: 0,
    uptime: 0
  });
  const [isStoppingMining, setIsStoppingMining] = useState(false);
  const [isStartingMining, setIsStartingMining] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const miningService = MiningService.getInstance();

  // Tasks (copied from Premium tasks UI)
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: tasksData = { success: false, tasks: [] },
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['tasks', account?.toLowerCase()],
    queryFn: dataService.fetchTasks,
    enabled: !!account // only fetch when wallet connected
  });

  const claimTaskMutation = useMutation({
    mutationFn: (taskId: string) => dataService.claimTask(taskId),
    onSuccess: async (data: any) => {
      if (data.success) {
        toast.success('Task completed! Points awarded!');
        try {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['tasks'] }),
            queryClient.invalidateQueries({ queryKey: ['quiz'] })
          ]);
        } catch (err) {
          console.error('Error invalidating queries after claim:', err);
        }

        // Emit global data refresh so other parts of the app (Premium page) update
        try {
          dataEventBus.emitDataRefresh();
        } catch (err) {
          console.error('Error emitting data refresh event:', err);
        }
      } else {
        toast.error(data.error || 'Failed to claim task');
      }
    },
    onError: (error: any) => {
      console.error('Error claiming task:', error);
      toast.error(error.message || 'Failed to claim task');
    },
    onSettled: () => setClaimingTask(null)
  });

  const tasks: Task[] = (tasksData as any)?.tasks || [];

  const handleClaimTask = async (taskId: string, link: string) => {
    if (claimingTask === taskId) return;

    try {
      setClaimingTask(taskId);
      if (typeof window !== 'undefined') {
        window.open(link, '_blank');
      }

      // wait a short period before claiming
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (claimTaskMutation && typeof claimTaskMutation.mutate === 'function') {
        claimTaskMutation.mutate(taskId);
      } else {
        console.error('claimTaskMutation is not available');
        toast.error('Failed to claim task - browser not supported');
      }
    } catch (error) {
      console.error('Error in handleClaimTask:', error);
      toast.error('Failed to start task claiming process');
      setClaimingTask(null);
    }
  };

  // Initialize available workers and pools
  useEffect(() => {
    // Generate some initial data points for the charts
    const initialPoints = Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - (9 - i) * 60000).toISOString(),
      value: 0.5 + Math.random() * 0.5 // Initial values between 0.5 and 1.0
    }));

    setData({
      workers: miningService.getAvailableWorkers(),
      pools: miningService.getAvailablePools(),
      networkStats: {
        hashrate: {
          total: 0,
          average: 0,
          peak: 0
        },
        difficulty: 0,
        blockHeight: 0,
        blockReward: 0,
        networkNodes: 0,
        poolShare: 0
      },
      minerStats: {
        totalHashrate: miningStats.hashrate.current,
        activeWorkers: isMining ? 1 : 0,
        totalShares: {
          accepted: miningStats.shares.accepted,
          rejected: miningStats.shares.rejected,
          invalid: miningStats.shares.invalid
        },
        earnings: {
          total: miningStats.earnings.total,
          pending: miningStats.earnings.pending,
          paid: miningStats.earnings.paid
        },
        efficiency: ((miningStats.shares.accepted / (miningStats.shares.accepted + miningStats.shares.rejected + miningStats.shares.invalid)) * 100) || 0,
        uptime: miningStats.uptime,
        powerEfficiency: miningStats.hashrate.current / miningStats.powerUsage
      },
      charts: {
        hashrate: initialPoints,
        earnings: initialPoints.map(p => ({ ...p, value: p.value * 0.001 })),
        shares: initialPoints.map(p => ({ ...p, value: Math.floor(p.value * 10) })),
        difficulty: initialPoints
      }
    });
  }, []);

  // Cache timeout and last fetch time
  const CACHE_TIMEOUT = 30000; // 30 seconds
  const DEBOUNCE_TIMEOUT = 5000; // 5 seconds
  const [lastVisibilityFetch, setLastVisibilityFetch] = useState(0);

  // Update chart data on mining stats event
  useEffect(() => {
    if (!isMining) return;

    const handleMiningStats = (event: CustomEvent) => {
      const { hashRate, totalEarnings } = event.detail;
      const timestamp = new Date().toISOString();
      
      setData(prevData => {
        const newData = [...prevData.charts.hashrate];
        newData.push({ timestamp, value: parseFloat(hashRate) });
        // Keep only last 10 data points
        if (newData.length > 10) newData.shift();
        return {
          ...prevData,
          charts: {
            ...prevData.charts,
            hashrate: newData
          }
        };
      });

      // Save to storage on each stats update
      const saveToStorage = () => {
        if (!account) return; // Early return if no account

        const dataToSave = {
          selectedWorker,
          selectedPool,
          earnings: miningStats.earnings,
          uptime: miningStats.uptime,
          lastUpdated: new Date().toISOString()
        };
        try {
          localStorage.setItem(
            `mining_cache_${account.toLowerCase()}`,
            JSON.stringify(dataToSave)
          );
        } catch (error) {
          // console.error('Failed to save mining state:', error);
        }
      };
      saveToStorage();
    };

    window.addEventListener('mining-stats', handleMiningStats as EventListener);
    
    return () => {
      window.removeEventListener('mining-stats', handleMiningStats as EventListener);
    };
  }, [isMining]);

  // Save initial state when mining starts
  useEffect(() => {
    if (!account || !isMining) return;
    const saveToStorage = () => {
      const dataToSave = {
        selectedWorker,
        selectedPool,
        earnings: miningStats.earnings,
        uptime: miningStats.uptime,
        lastUpdated: new Date().toISOString()
      };
      try {
        localStorage.setItem(
          `mining_cache_${account.toLowerCase()}`,
          JSON.stringify(dataToSave)
        );
      } catch (error) {
        // console.error('Failed to save mining state:', error);
      }
    };
    saveToStorage();
  }, [account, isMining]);

  // Remove backend balance update listener
  useEffect(() => {
    const handleRegistrationUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<RegistrationUpdateEvent>;
      if (customEvent.detail?.balance !== undefined) {
        // Update both mining stats and data with new balance
        setMiningStats(prev => ({
          ...prev,
          earnings: {
            total: Number(customEvent.detail.balance || 0),
            pending: 0,
            paid: Number(customEvent.detail.balance || 0)
          }
        }));

        // Also update the data state to reflect new earnings
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            minerStats: {
              ...prev.minerStats,
              earnings: {
                total: Number(customEvent.detail.balance || 0),
                pending: 0,
                paid: Number(customEvent.detail.balance || 0)
              }
            }
          };
        });

        // Update local storage with new balance
        if (account) {
          const storageKey = `mining_cache_${account.toLowerCase()}`;
          const cachedData = localStorage.getItem(storageKey);
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData);
              const updatedCache = {
                ...parsed,
                earnings: {
                  total: Number(customEvent.detail.balance || 0),
                  pending: 0,
                  paid: Number(customEvent.detail.balance || 0)
                }
              };
              localStorage.setItem(storageKey, JSON.stringify(updatedCache));
            } catch (error) {
              // console.error('Error updating cache:', error);
            }
          }
        }
      }
    };

    window.addEventListener('registration-updated', handleRegistrationUpdate);
    return () => {
      window.removeEventListener('registration-updated', handleRegistrationUpdate);
    };
  }, [account]);

  // Listen for balance updates (e.g. from point claims)
  useEffect(() => {
    if (!account || !isMining) return;

    const handleBalanceUpdate = (event: CustomEvent<RegistrationUpdateEvent>) => {
      if (event.detail?.balance !== undefined) {
        const newBalance = Number(event.detail.balance);
        const currentPending = miningStats.earnings.pending || 0;
        
        // Update mining stats with new balance while preserving pending earnings
        setMiningStats(prev => ({
          ...prev,
          earnings: {
            total: newBalance + currentPending,
            pending: currentPending,
            paid: newBalance
          }
        }));

        // Also update the data state to reflect new balance
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            minerStats: {
              ...prev.minerStats,
              earnings: {
                total: newBalance + currentPending,
                pending: currentPending,
                paid: newBalance
              }
            }
          };
        });

        // Update MiningService with new balance
        const miningService = MiningService.getInstance();
        miningService.updateTotalEarnings(newBalance);

        // Save to localStorage with new balance
        const dataToSave = {
          selectedWorker,
          selectedPool,
          earnings: {
            total: newBalance + currentPending,
            pending: currentPending,
            paid: newBalance
          },
          uptime: miningStats.uptime,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(
          `mining_cache_${account.toLowerCase()}`,
          JSON.stringify(dataToSave)
        );
      }
    };

    // Add listener for balance updates
    window.addEventListener('registration-update', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('registration-update', handleBalanceUpdate);
    };
  }, [account, isMining, miningStats.earnings.pending, miningStats.uptime, selectedPool, selectedWorker]);

  useEffect(() => {
    if (!isMining) return;

    const handleMiningStats = (event: CustomEvent<{ totalEarnings: number; sessionEarnings: number }>) => {
      const { totalEarnings, sessionEarnings } = event.detail;
      const uptime = Date.now() - startTime;
      
      // Simulate mining stats
      const hashrate = 30000 + Math.random() * 20000; // 30-50 KH/s
      const powerUsage = 180 + Math.random() * 40; // 180-220W
      const temperature = 65 + Math.random() * 15; // 65-80°C
      const acceptedShares = Math.floor(100 + Math.random() * 50); // 100-150 shares
      const rejectedShares = Math.floor(Math.random() * 5); // 0-5 rejected
      const invalidShares = Math.floor(Math.random() * 2); // 0-2 invalid
      const efficiency = 95 + Math.random() * 5; // 95-100%
      
      // Calculate mining rate (points per second)
      const baseRate = 0.003; // Base earnings rate per second
      const miningRate = 1 + Math.random() * 3;

      // Update chart data function
      const updateChart = (chart: { timestamp: string; value: number }[], newValue: number) => {
        const updated = [...chart];
        if (updated.length >= 24) updated.shift();
        updated.push({ 
          timestamp: new Date().toISOString(), 
          value: Number(newValue) || 0
        });
        return updated;
      };

      setMiningStats(prev => ({
        ...prev,
        hashrate: {
          current: hashrate,
          average: prev.hashrate.average * 0.9 + hashrate * 0.1,
          peak: Math.max(prev.hashrate.peak, hashrate)
        },
        shares: {
          accepted: acceptedShares,
          rejected: rejectedShares,
          invalid: invalidShares
        },
        temperature,
        powerUsage,
        earnings: {
          total: totalEarnings,
          pending: sessionEarnings,
          paid: totalEarnings - sessionEarnings
        },
        uptime,
        miningRate
      }));

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          minerStats: {
            ...prev.minerStats,
            totalHashrate: hashrate,
            totalShares: {
              accepted: acceptedShares,
              rejected: rejectedShares,
              invalid: invalidShares
            },
            earnings: {
              total: totalEarnings,
              pending: sessionEarnings,
              paid: totalEarnings - sessionEarnings
            },
            efficiency,
            uptime,
            powerEfficiency: hashrate / powerUsage,
            totalEarnings,
            sessionEarnings
          },
          charts: {
            hashrate: updateChart(prev.charts.hashrate, hashrate),
            earnings: updateChart(prev.charts.earnings, sessionEarnings),
            shares: updateChart(prev.charts.shares, acceptedShares),
            difficulty: prev.charts.difficulty
          }
        };
      });
    };

    window.addEventListener('mining-stats', handleMiningStats as EventListener);
    return () => {
      window.removeEventListener('mining-stats', handleMiningStats as EventListener);
    };
  }, [isMining, startTime]);

  // Handle page visibility changes
  useEffect(() => {
    if (!isMining || !account) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, but keep mining
        // console.log('Tab hidden, continuing mining in background');
      } else {
        // Tab is visible again, fetch current stats with debounce
        const now = Date.now();
        if (now - lastVisibilityFetch > DEBOUNCE_TIMEOUT) {
          // console.log('Tab visible, fetching current stats');
          const { isActive, totalEarnings, uptime } = miningService.getMiningStatus();
          setIsMining(isActive);
          setMiningStats(prev => ({
            ...prev,
            earnings: {
              ...prev.earnings,
              total: totalEarnings
            },
            uptime
          }));
          setLastVisibilityFetch(now);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMining, account, lastVisibilityFetch]);

  const handleStartMining = async () => {
    try {
      setIsStartingMining(true);
      if (!account) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (!isRegistered) {
        toast.error('Please register in the testnet program before mining');
        return;
      }

      if (!selectedWorker || !selectedPool) {
        toast.error('Please select both a worker and a pool');
        return;
      }

      const worker = data?.workers.find(w => w.id === selectedWorker);
      const pool = data?.pools.find(p => p.id === selectedPool);

      if (!worker || !pool) {
        toast.error('Invalid worker or pool selection');
        return;
      }

      // Get current balance before starting mining
      const currentBalance = Number(miningStats.earnings.total || 0);

      const config = {
        worker,
        pool,
        wallet: account.toLowerCase(),
        previousEarnings: currentBalance, // Pass the current balance as previous earnings
        previousUptime: miningStats.uptime
      };

      const success = await miningService.startMining(config);
      if (success) {
        setIsMining(true);
        setStartTime(Date.now());
        // Initialize mining stats with current balance
        setMiningStats(prev => ({
          ...prev,
          earnings: {
            ...prev.earnings,
            total: currentBalance,
            pending: 0,
            paid: currentBalance
          }
        }));
        toast.success('Mining started successfully');
      }
    } catch (error) {
      // console.error('Error starting mining:', error);
      toast.error('Failed to start mining');
    } finally {
      setIsStartingMining(false);
    }
  };

  const handleStopMining = async () => {
    setIsStoppingMining(true);
    try {
      if (!account) {
        toast.error('Wallet not connected');
        return;
      }

      // Get the current total earnings
      const finalEarnings = {
        total: miningStats.earnings.total,
        session: miningStats.earnings.pending,
        lastUpdate: new Date().toISOString()
      };

      // Save to local storage first
      const dataToSave = {
        selectedWorker,
        selectedPool,
        earnings: {
          total: finalEarnings.total,
          pending: 0,
          paid: finalEarnings.total
        },
        uptime: miningStats.uptime,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(
        `mining_cache_${account.toLowerCase()}`,
        JSON.stringify(dataToSave)
      );

      try {
        const response = await fetch('/api/testnet/update-balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet: account,
            earnings: finalEarnings
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          // console.error('Failed to update balance:', error);
          toast.error('Failed to save mining earnings');
        } else {
          const data = await response.json();
          toast.success(`Mining earnings saved: ${data.balance} KLD`);
          
          // Update local storage with confirmed balance
          const confirmedDataToSave = {
            ...dataToSave,
            earnings: {
              total: data.balance,
              pending: 0,
              paid: data.balance
            }
          };
          localStorage.setItem(
            `mining_cache_${account.toLowerCase()}`,
            JSON.stringify(confirmedDataToSave)
          );

          // Update mining stats with confirmed balance
          setMiningStats(prev => ({
            ...prev,
            earnings: {
              total: data.balance,
              pending: 0,
              paid: data.balance
            }
          }));
        }
      } catch (error) {
        // console.error('Error updating balance:', error);
        toast.error('Failed to save mining earnings');
      }

      await miningService.stopMining();
      setIsMining(false);
      setStartTime(0);
      toast.success('Mining stopped successfully');
    } catch (error) {
      // console.error('Error stopping mining:', error);
      toast.error('Failed to stop mining');
    } finally {
      setIsStoppingMining(false);
    }
  };

  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} GH/s`;
    return `${hashrate.toFixed(2)} MH/s`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const renderWorkerStatus = (worker: MiningWorker) => {
    if (isMining && selectedWorker === worker.id) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-[#04c74f]/20 text-[#04c74f]">
          Mining
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        worker.status === 'online' ? 'bg-[#04c74f]/20 text-[#04c74f]' :
        worker.status === 'offline' ? 'bg-[#898CA9]/20 text-[#898CA9]' : 'bg-[#f44336]/20 text-[#f44336]'
      }`}>
        {worker.status}
      </span>
    );
  };

  const renderPoolStatus = (pool: MiningPool) => {
    if (isMining && selectedPool === pool.id) {
      return (
        <span className="px-2 py-1 rounded-full text-xs bg-[#04c74f]/20 text-[#04c74f]">
          Connected
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        pool.status === 'active' ? 'bg-[#04c74f]/20 text-[#04c74f]' :
        pool.status === 'maintenance' ? 'bg-[#ffc107]/20 text-[#ffc107]' : 'bg-[#f44336]/20 text-[#f44336]'
      }`}>
        {pool.status}
      </span>
    );
  };

  const renderWorkerDetails = (worker: MiningWorker) => (
    <div className="space-y-2 text-sm text-[#898CA9]">
      <div>Hashrate: {formatHashrate(worker.hashrate)}</div>
      <div>Temperature: {worker.temperature}°C</div>
      <div>Power Usage: {worker.powerUsage}W</div>
      <div>Efficiency: {worker.powerEfficiency.toFixed(2)}x</div>
      <div>Specialization: {worker.specialization}</div>
      <div>Uptime: {formatUptime(worker.uptime)}</div>
    </div>
  );

  const renderPoolDetails = (pool: MiningPool) => (
    <div className="space-y-2 text-sm text-[#898CA9]">
      <div>Algorithm: {pool.algorithm}</div>
      <div>Difficulty: {pool.difficulty}</div>
      <div>Fee: {pool.fee}%</div>
      <div>Min Payout: {pool.minPayout} KLD</div>
      <div>URL: {pool.url}:{pool.port}</div>
    </div>
  );

  // Check registration status and fetch initial balance
  useEffect(() => {
    const checkRegistration = async () => {
      if (!account) {
        setIsRegistered(false);
        setCheckingRegistration(false);
        return;
      }

      try {
        setCheckingRegistration(true);
        const response = await fetch(`/api/testnet/check-registration?wallet=${account}`);
        const data = await response.json();

        if (data.isRegistered) {
          setIsRegistered(true);
          // Update initial balance from registration data
          setMiningStats(prev => ({
            ...prev,
            earnings: {
              ...prev.earnings,
              total: data.userData?.balance || 0
            }
          }));
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        // console.error('Error checking registration:', error);
        setIsRegistered(false);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistration();
  }, [account]);

  useEffect(() => {
    const { isActive, totalEarnings, uptime } = miningService.getMiningStatus();
    setIsMining(isActive);
    
    // Use cached data instead of fetching from backend
    const cachedData = localStorage.getItem(`mining_cache_${account?.toLowerCase()}`);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setMiningStats(prev => ({
        ...prev,
        earnings: {
          ...prev.earnings,
          total: Number(parsed.earnings?.total || 0)
        },
        uptime: parsed.uptime || 0
      }));
    } else {
      setMiningStats(prev => ({
        ...prev,
        earnings: {
          ...prev.earnings,
          total: totalEarnings
        },
        uptime
      }));
    }
  }, [account, miningService]);

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0F1014] text-white p-8">
      {/* System Check Row */}
      <div className="mb-8">
        <SystemCheck />
      </div>

      {/* Mining Phase Completion */}
      <div className="bg-[#1A1B23] rounded-xl p-8 mb-8">
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#04c74f] to-[#03b347] rounded-full p-4 inline-block mb-6 shadow-lg shadow-[#04c74f]/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            🎉 Congratulations! Mining Phase Complete
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-[#898CA9] mb-6 leading-relaxed">
              Premium Node mining is still on and you can still mine points with SuperNode.{' '}
              <a
                href={process.env.NEXT_PUBLIC_LAUNCHPAD_API_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#04c74f] underline hover:text-[#03b347] transition-colors"
              >
                Visit the launchpad
              </a>
            </p>
            
            <div className="bg-[#282A37] rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-2 h-2 bg-[#04c74f] rounded-full animate-pulse"></div>
                <span className="text-[#04c74f] font-medium">What's Next?</span>
                <div className="w-2 h-2 bg-[#04c74f] rounded-full animate-pulse"></div>
              </div>
              <ul className="space-y-3 text-[#898CA9] text-center">
                <li className="flex items-center justify-center gap-2">
                  <span className="text-[#04c74f]">•</span>
                  <span>Testnet dApp launch</span>
                </li>
                <li className="flex items-center justify-center gap-2">
                  <span className="text-[#04c74f]">•</span>
                  <span>Token Generation Event (TGE)</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-[#898CA9] text-sm">
              <span>—</span>
              <span className="font-medium text-white">Kaleido Team</span>
              <span>—</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Tasks (copied from Premium page) */}
      <div className="bg-[#1A1B23] rounded-xl p-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-medium mb-6">Premium Tasks</h3>
          <div className="mb-4 flex items-center justify-center">
            <div className="bg-[#0f1720] border border-white/5 text-sm text-[#898CA9] px-4 py-2 rounded-md max-w-2xl text-center">
              <strong className="text-[#04c74f]">Note:</strong> Points awarded from these tasks will appear on your <span className="font-medium text-white">Premium</span> page under your account.
            </div>
          </div>
          {tasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-[#282A37] p-6 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-[#898CA9] py-6">No premium tasks available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#282A37] rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">{task.title}</h4>
                    {task.claimed ? (
                      <div className="bg-[#00dd72]/20 text-[#00dd72] px-3 py-1 rounded-full text-sm font-medium">Claimed</div>
                    ) : (
                      <div className="bg-[#ffd700]/20 text-[#ffd700] px-3 py-1 rounded-full text-sm font-medium">+{task.points} pts</div>
                    )}
                  </div>
                  <p className="text-[#898CA9] mb-6">{task.description}</p>
                  <button
                    onClick={() => !task.claimed && handleClaimTask(task.id, task.link)}
                    disabled={task.claimed || claimingTask === task.id}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                      ${task.claimed
                        ? 'bg-[#131317] text-gray-500 cursor-not-allowed'
                        : claimingTask === task.id
                        ? 'bg-[#131317] text-white cursor-wait'
                        : 'bg-gradient-to-r from-[#04c74f] to-[#03b347] text-black hover:opacity-90'
                      }`}
                  >
                    {task.claimed ? 'Completed' : claimingTask === task.id ? 'Claiming...' : 'Claim Points'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1A1B23] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Network Hashrate</h3>
            <div className="w-8 h-8 rounded-lg bg-[#04c74f]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{formatHashrate(data.networkStats.hashrate.total)}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#898CA9]">Peak:</span>
              <span className="text-[#04c74f]">{formatHashrate(data.networkStats.hashrate.peak)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1B23] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Active Workers</h3>
            <div className="w-8 h-8 rounded-lg bg-[#04c74f]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{data.minerStats.activeWorkers}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#898CA9]">Efficiency:</span>
              <span className="text-[#04c74f]">{data.minerStats.efficiency}%</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1B23] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Total Earnings</h3>
            <div className="w-8 h-8 rounded-lg bg-[#04c74f]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 0118 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{data.minerStats.earnings.total.toFixed(4)} KLD</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#898CA9]">Pending:</span>
              <span className="text-[#04c74f]">{data.minerStats.earnings.pending.toFixed(4)} KLD</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1B23] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Power Efficiency</h3>
            <div className="w-8 h-8 rounded-lg bg-[#04c74f]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#04c74f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{data.minerStats.powerEfficiency.toFixed(3)} H/W</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#898CA9]">Total Power:</span>
              <span className="text-[#04c74f]">{data.workers.reduce((acc, w) => acc + w.powerUsage, 0)}W</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Hashrate Chart */}
        <div className="bg-[#1A1B23] rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Hashrate</h3>
          <div className="h-[300px] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#04c74f]/10 to-transparent pointer-events-none" />
            <Bar 
              data={getBarChartData(data.charts.hashrate, 'Hashrate')}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: function(context: any) {
                        let value = context.parsed.y;
                        return `Hashrate: ${value.toFixed(3)} H/s`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Shares Chart */}
        <div className="bg-[#1A1B23] rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Shares</h3>
          <div className="h-[300px] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#04c74f]/10 to-transparent pointer-events-none" />
            <Bar 
              data={getBarChartData(data.charts.shares, 'Shares')}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: function(context: any) {
                        let value = context.parsed.y;
                        return `Shares: ${value.toFixed(0)}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Workers */}
      <div className="bg-[#1A1B23] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Workers</h3>
          <button className="px-4 py-2 rounded-lg bg-[#04c74f] text-white hover:bg-[#03b347] transition-colors">
            Add Worker
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[#898CA9] text-sm">
                <th className="text-left pb-4">Name</th>
                <th className="text-left pb-4">Status</th>
                <th className="text-left pb-4">Hashrate</th>
                <th className="text-left pb-4">Shares</th>
                <th className="text-left pb-4">Temperature</th>
                <th className="text-left pb-4">Power</th>
                <th className="text-left pb-4">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {data.workers.map(worker => (
                <tr 
                  key={worker.id} 
                  className={`border-t border-[#282A37] ${
                    isMining && selectedWorker === worker.id ? 'bg-[#282A37]' : ''
                  }`}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isMining && selectedWorker === worker.id ? 'bg-[#04c74f]' :
                        worker.status === 'online' ? 'bg-[#04c74f]' :
                        worker.status === 'offline' ? 'bg-[#898CA9]' : 'bg-[#f44336]'
                      }`} />
                      {worker.name}
                    </div>
                  </td>
                  <td className="py-4">
                    {renderWorkerStatus(worker)}
                  </td>
                  <td className="py-4">
                    {isMining && selectedWorker === worker.id 
                      ? `${miningStats.hashrate.current.toFixed(2)} MH/s`
                      : formatHashrate(worker.hashrate)
                    }
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#04c74f]">
                        {isMining && selectedWorker === worker.id 
                          ? miningStats.shares.accepted
                          : worker.shares.accepted
                        }
                      </span>
                      <span className="text-[#f44336]">
                        {isMining && selectedWorker === worker.id 
                          ? miningStats.shares.rejected
                          : worker.shares.rejected
                        }
                      </span>
                      <span className="text-[#ffc107]">
                        {isMining && selectedWorker === worker.id 
                          ? miningStats.shares.invalid
                          : worker.shares.invalid
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      {isMining && selectedWorker === worker.id 
                        ? `${miningStats.temperature}°C`
                        : `${worker.temperature}°C`
                      }
                      <span className="text-[#898CA9]">{worker.fanSpeed}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    {isMining && selectedWorker === worker.id 
                      ? `${miningStats.powerUsage}W`
                      : `${worker.powerUsage}W`
                    }
                  </td>
                  <td className="py-4">{formatUptime(worker.uptime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mining Pools */}
      <div className="bg-[#1A1B23] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Mining Pools</h3>
          <button className="px-4 py-2 rounded-lg bg-[#04c74f] text-white hover:bg-[#03b347] transition-colors">
            Add Pool
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.pools.map(pool => (
            <div 
              key={pool.id} 
              className={`bg-[#282A37] rounded-xl p-6 ${
                isMining && selectedPool === pool.id 
                  ? 'ring-2 ring-[#04c74f] ring-opacity-50' 
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">{pool.name}</h4>
                {renderPoolStatus(pool)}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[#898CA9] text-sm mb-1">URL</p>
                  <p className="font-mono text-sm">{pool.url}:{pool.port}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#898CA9] text-sm mb-1">Algorithm</p>
                    <p>{pool.algorithm}</p>
                  </div>
                  <div>
                    <p className="text-[#898CA9] text-sm mb-1">Fee</p>
                    <p>{pool.fee}%</p>
                  </div>
                  <div>
                    <p className="text-[#898CA9] text-sm mb-1">Difficulty</p>
                    <p>{pool.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-[#898CA9] text-sm mb-1">Min. Payout</p>
                    <p>{pool.minPayout} KLD</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (isMining && selectedPool === pool.id) {
                      handleStopMining();
                    } else if (!isMining) {
                      setSelectedPool(pool.id);
                    }
                  }}
                  disabled={isStartingMining || isStoppingMining}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isMining && selectedPool === pool.id
                      ? 'bg-[#f44336] hover:bg-[#d32f2f]'
                      : 'bg-[#04c74f] hover:bg-[#03b347]'
                  } text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isStartingMining ? 'Starting...' : isStoppingMining ? 'Stopping...' : (isMining && selectedPool === pool.id ? 'Disconnect' : 'Connect')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-[#1A1B23] rounded-xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-r from-[#04c74f] to-[#03b347] rounded-lg p-2">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">How Mining Works</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mining Pools */}
          <div className="bg-[#282A37] rounded-xl p-6 hover:bg-[#2F313F] transition-colors">
            <div className="bg-gradient-to-br from-[#04c74f] to-[#03b347] rounded-lg p-3 inline-block mb-4 shadow-lg shadow-[#04c74f]/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11H3m3.343-5.657l-.707-.707M21 12a9 9 0 0118 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-white font-medium text-lg mb-4">Mining Pools</h4>
            <div className="space-y-3 text-[#898CA9]">
              <p className="text-sm font-medium text-white/80">Three specialized pools available:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Quantum Hash:</span> Peak performance during business hours (9-5)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Neural Mesh:</span> Wave-pattern efficiency with steady returns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Chaos Matrix:</span> High-risk, high-reward volatility</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mining Workers */}
          <div className="bg-[#282A37] rounded-xl p-6 hover:bg-[#2F313F] transition-colors">
            <div className="bg-gradient-to-br from-[#04c74f] to-[#03b347] rounded-lg p-3 inline-block mb-4 shadow-lg shadow-[#04c74f]/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-white font-medium text-lg mb-4">Mining Workers</h4>
            <div className="space-y-3 text-[#898CA9]">
              <p className="text-sm font-medium text-white/80">Seven worker types with unique capabilities:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Specialized workers:</span> 30% bonus with matching pools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Hybrid workers:</span> 10% bonus with any pool</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Power efficiency:</span> Different ratings affect earnings</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mining Performance */}
          <div className="bg-[#282A37] rounded-xl p-6 hover:bg-[#2F313F] transition-colors">
            <div className="bg-gradient-to-br from-[#04c74f] to-[#03b347] rounded-lg p-3 inline-block mb-4 shadow-lg shadow-[#04c74f]/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-white font-medium text-lg mb-4">Mining Performance</h4>
            <div className="space-y-3 text-[#898CA9]">
              <p className="text-sm font-medium text-white/80">Dynamic performance factors:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Time-based:</span> Pool algorithm efficiency varies by time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Specialization:</span> Worker type affects mining rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span><span className="text-white/90">Environment:</span> External factors influence performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Strategy Tips */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-[#04c74f] to-[#03b347] rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Strategy Tips</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#282A37] rounded-xl p-6 hover:bg-[#2F313F] transition-colors">
              <h5 className="text-lg font-medium text-white mb-4">Optimal Pairing</h5>
              <ul className="space-y-3 text-[#898CA9]">
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span>Match specialized workers with their preferred pools for maximum efficiency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span>Use Quantum workers during business hours for peak performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span>Deploy hybrid workers when market conditions are uncertain</span>
                </li>
              </ul>
            </div>
            <div className="bg-[#282A37] rounded-xl p-6 hover:bg-[#2F313F] transition-colors">
              <h5 className="text-lg font-medium text-white mb-4">Maximizing Earnings</h5>
              <ul className="space-y-3 text-[#898CA9]">
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span>Monitor pool performance patterns and adjust strategy accordingly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span>Find the sweet spot between power efficiency and hashrate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#04c74f] mt-1">•</span>
                  <span>Switch pools based on their time-of-day efficiency patterns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default MiningDashboard;