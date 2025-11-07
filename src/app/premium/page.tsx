"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FaCrown, FaQuestionCircle, FaTasks, FaLock, FaTrophy, FaChartLine, FaArrowLeft, FaChartPie, FaWallet, FaMedal, FaServer, FaSync } from "react-icons/fa";
import Link from "next/link";
import { DailyQuiz, QuizQuestion } from "@/types/quiz";
import { authService } from '@/services/authService';
import { premiumAuthService } from '@/services/premiumAuthService';
import { CountdownTimer } from "@/components/quiz/CountdownTimer";
import { Task } from "@/lib/mysql";
import { toast } from "react-hot-toast";
import { useWeb3 } from "@/providers/Web3Provider";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import LaunchpadMining from "@/components/mining/LaunchpadMining";
import SupernodeNftModal from "@/components/premium/SupernodeNftModal";
import NftGrid from "@/components/premium/NftGrid";
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { dataService, dataEventBus, WeekPerformance, QuizAttempt, UserPoints } from "@/services/dataService";
import { webhookService } from '@/services/webhookService';
import { fetchWithRetry, getFallbackData } from '@/utils/apiHelpers';

// Define the quiz data response interface
interface QuizDataResponse {
  success: boolean;
  quiz?: DailyQuiz | null;
  points?: UserPoints | null;
  lastAttempt?: QuizAttempt | null;
  pastWeekPerformance?: WeekPerformance[];
  error?: string;
}

const PremiumDashboard = () => {
  // Format numbers with K suffix
  const formatNumberWithK = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '0.00';
    
    const numberValue = Number(num);
    if (isNaN(numberValue)) return '0.00';
    
    if (numberValue >= 1000) {
      return (numberValue / 1000).toFixed(2) + 'K';
    }
    return numberValue.toFixed(2);
  };

  const { account, isConnecting, connectWallet, disconnectWallet, refreshData } = useWeb3();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [quizState, setQuizState] = useState("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [lastQuizDate, setLastQuizDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [miningPoints, setMiningPoints] = useState(0);
  const [showNftModal, setShowNftModal] = useState(false);
  const [isNftEligible, setIsNftEligible] = useState(false);
  const [hasCheckedEligibility, setHasCheckedEligibility] = useState(false);
  // Define the type for mining status
  interface MiningStatus {
    isActive: boolean;
    address: string;
    startTime: string;
    cpuCount: number;
    miningRate: string;
    totalPoints: number;
    linkedWallet: string;
  }
  
  const [miningStatus, setMiningStatus] = useState<MiningStatus | null>(null);
  const [supernodeClaimed, setSupernodeClaimed] = useState(false);

  // Effect to prompt wallet connection if not connected
  useEffect(() => {
    if (!account && !isConnecting) {
      // Small delay to avoid immediate prompt
      const timer = setTimeout(() => {
        toast("Please connect your wallet to view premium dashboard", {
          icon: "🔗",
          duration: 5000,
        });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [account, isConnecting]);
  
  // Effect to synchronize premium token when navigating between pages
  useEffect(() => {
    const syncPremiumToken = async () => {
      // Check if wallet is connected but premium token is missing or expired
      const isWalletConnected = localStorage.getItem('walletConnected') === 'true';
      const storedWalletAddress = localStorage.getItem('connected_wallet_address');
      
      if (isWalletConnected && storedWalletAddress && account) {
        console.log('Checking premium token status on premium page navigation');
        
        // Check if premium token needs refresh
        if (!premiumAuthService.isAuthenticated() || premiumAuthService.isTokenExpired()) {
          console.log('Premium token missing or expired, refreshing...');
          try {
            // Attempt to refresh the premium token
            const refreshed = await premiumAuthService.refreshToken(account);
            if (refreshed) {
              console.log('Premium token refreshed successfully');
              // Force a data refresh after token refresh
              refreshData();
              // Invalidate queries to force refetch with new token
              queryClient.invalidateQueries({ queryKey: ['quiz'] });
              queryClient.invalidateQueries({ queryKey: ['tasks'] });
            } else {
              console.log('Failed to refresh premium token');
            }
          } catch (error) {
            console.error('Error refreshing premium token:', error);
          }
        }
      }
    };
    
    syncPremiumToken();
  }, [account, queryClient, refreshData]);

  // Effect to refresh data when wallet is connected
  useEffect(() => {
    if (account) {
      // Clear all related caches immediately
      if (typeof window !== 'undefined') {
        // Clear all quiz-related caches
        localStorage.removeItem(`kalaido_quiz_${account.toLowerCase()}`);
        localStorage.removeItem(`kalaido_quiz_${account.toLowerCase()}_timestamp`);
        localStorage.removeItem('kalaido_mining_points');
        localStorage.removeItem('kalaido_mining_timestamp');
        
        // Clear all task-related caches
        localStorage.removeItem(`tasks_${account.toLowerCase()}`);
        localStorage.removeItem(`tasks_${account.toLowerCase()}_timestamp`);
        
        // Clear all points-related caches
        localStorage.removeItem(`points_${account.toLowerCase()}`);
        localStorage.removeItem(`points_${account.toLowerCase()}_timestamp`);
      }
      
      // Invalidate all relevant queries immediately
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
      
      // Force refresh of data
      refreshData();
      
      // Check if this is the test wallet for NFT modal
      if (account.toLowerCase() === '0x9e7abeafd9f94236478cf5032480f15b836798e5'.toLowerCase()) {
        console.log('Test wallet detected! Checking if NFT already claimed');
        
        // Check if the user has already claimed the NFT
        const checkIfAlreadyClaimed = async () => {
          try {
            const response = await fetch(`/api/premium/claim-supernode-nft?wallet=${account}`);
            const data = await response.json();
            
            if (data.success) {
              if (data.eligible && !data.claimed) {
                console.log('Test wallet is eligible and has not claimed NFT. Showing modal.');
                setIsNftEligible(true);
                setShowNftModal(true);
              } else if (data.claimed) {
                console.log('Test wallet has already claimed NFT. Not showing modal.');
                // Don't show modal if already claimed
                setIsNftEligible(true);
                setShowNftModal(false);
              } else {
                console.log('Test wallet is not eligible for NFT. Not showing modal.');
                setIsNftEligible(false);
                setShowNftModal(false);
              }
            }
          } catch (error) {
            console.error('Error checking NFT claim status:', error);
          }
        };
        
        // Small delay to ensure everything is loaded
        setTimeout(() => {
          checkIfAlreadyClaimed();
        }, 2000);
      }
    } else {
      // Clear all data when wallet is disconnected
      // Clear quiz-related state
      setQuizState('start');
      setCurrentQuestion(0);
      setSelectedAnswers([]);
      setTimeLeft(600);
      setLastQuizDate(null);
      setError(null);
      
      // Clear tasks-related state
      setClaimingTask(null);
      
      // Clear mining-related state
      setMiningStatus(null);
      setMiningPoints(0);
      
      // Clear NFT-related state
      setIsNftEligible(false);
      setShowNftModal(false);
      setSupernodeClaimed(false);
      
      // Clear points-related state
      setScore(0);
      setMaxScore(0);
      setCorrectAnswers(0);
    }
  }, [account, queryClient]);

  // React Query hooks
  const { data: quizData, error: quizError, isLoading: quizLoading, refetch: refetchQuizData } = useQuery<QuizDataResponse, Error>(
    {
      queryKey: ['quiz', account?.toLowerCase()],
      queryFn: async () => {
        // Get wallet address from auth service
        const userData = authService.getUserData();
        const walletAddress = userData?.walletAddress;
        
        if (!walletAddress) {
          return { success: false, error: 'Wallet address not found in auth service' } as QuizDataResponse;
        }

        // Check if premium token is expired before making the request
        if (premiumAuthService.isTokenExpired()) {
          console.log('Premium token expired before quiz data fetch, refreshing...');
          try {
            const refreshed = await premiumAuthService.refreshToken(walletAddress);
            if (!refreshed) {
              console.warn('Failed to refresh premium token during quiz data fetch');
              // Continue with the request even if refresh fails - the API might handle it
            }
          } catch (refreshError) {
            console.error('Error refreshing premium token during quiz data fetch:', refreshError);
          }
        }

        const response = await dataService.fetchQuizData(walletAddress);
        return response;
      },
      enabled: !!account && authService.isAuthenticated() && activeTab === 'dashboard',
      refetchOnWindowFocus: false,
      staleTime: 15 * 60 * 1000, // 15 minutes
      retry: 3,
      retryDelay: 2000
    }
  );

  // Handle errors from the query
  useEffect(() => {
    if (quizError) {
      console.error('Quiz data fetch error:', quizError);
      // Check if error is due to authentication
      if (quizError.message?.includes('Not authenticated') || quizError.message?.includes('Unauthorized')) {
        toast.error('Your session has expired. Please reconnect your wallet.');
      }
    }
  }, [quizError]);

  // Handle errors from the query
  useEffect(() => {
    if (quizError) {
      console.error('Quiz data fetch error:', quizError);
      // Check if error is due to authentication
      if (quizError.message?.includes('Not authenticated') || quizError.message?.includes('Unauthorized')) {
        toast.error('Your session has expired. Please reconnect your wallet.');
      }
    }
  }, [quizError]);
  
  // Add loading states to prevent race conditions
  const [isLoadingMiningStatus, setIsLoadingMiningStatus] = useState(false);
  const [isLoadingSupernodeClaim, setIsLoadingSupernodeClaim] = useState(false);
  
  // Check mining status and CPU count
  useEffect(() => {
    const checkMiningStatus = async () => {
      // Only require wallet connection
      if (!account) {
        return;
      }
      
      // Prevent multiple simultaneous calls
      if (isLoadingMiningStatus) {
        console.log('Mining status check already in progress, skipping');
        return;
      }
      
      setIsLoadingMiningStatus(true);
      
      try {
        console.log('Checking mining status for wallet:', account);
        
        // Try to get cached mining status first
        const cachedMiningStatus = localStorage.getItem('kalaido_mining_status');
        const cachedTimestamp = localStorage.getItem('kalaido_mining_status_timestamp');
        
        // Use cache if it's less than 5 minutes old
        if (cachedMiningStatus && cachedTimestamp) {
          const now = new Date().getTime();
          const cacheTime = new Date(cachedTimestamp).getTime();
          const cacheAge = now - cacheTime;
          
          // Cache is valid for 30 minutes
          if (cacheAge < 30 * 60 * 1000) {
            console.log('Using cached mining status, age:', Math.round(cacheAge / 1000), 'seconds');
            const cachedData = JSON.parse(cachedMiningStatus);
            
            if (cachedData.success && cachedData.status) {
              setMiningStatus(cachedData.status);
              
              // If user has at least one CPU, they are eligible
              if (cachedData.status.cpuCount > 0) {
                setIsNftEligible(true);
              }
              
              // Continue with other checks but don't return early
            }
          }
        }
        
        // Try to fetch fresh data with retry logic
        let retries = 3;
        let delay = 1000; // Start with 1 second delay
        
        while (retries > 0) {
          try {
            const response = await fetch(`/api/mining/status?wallet=${account}`);
            
            if (response.status === 429) {
              // Rate limited, wait and retry
              console.log(`Rate limited, retrying in ${delay/1000} seconds...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
              retries--;
              continue;
            }
            
            if (!response.ok) {
              console.error('Error checking mining status:', response.status);
              break;
            }
            
            const data = await response.json();
            console.log('Mining status response:', data);
            
            // Cache the successful response
            localStorage.setItem('kalaido_mining_status', JSON.stringify(data));
            localStorage.setItem('kalaido_mining_status_timestamp', new Date().toISOString());
            
            if (data.success && data.status) {
              // Store the mining status with CPU count
              setMiningStatus(data.status);
              
              // If user has at least one CPU, they are eligible
              if (data.status.cpuCount > 0) {
                setIsNftEligible(true);
              }
            }
            
            // Successfully got data, break the retry loop
            break;
          } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
            }
          }
        }
        
        // If we've exhausted retries and have no data, use fallback
        if (retries === 0 && !miningStatus) {
          console.log('Using fallback mining status');
          const fallbackStatus = {
            isActive: true,
            address: account.toLowerCase(),
            startTime: new Date().toISOString(),
            cpuCount: 4, // Default to 4 CPUs
            miningRate: "0.01800000",
            totalPoints: 8816.4459315,
            linkedWallet: account.toLowerCase()
          };
          
          setMiningStatus(fallbackStatus);
          setIsNftEligible(true);
        }
        
        // Also check if the user has claimed the supernode NFT
        try {
          // Prevent multiple simultaneous calls
          if (isLoadingSupernodeClaim) {
            console.log('Supernode claim check already in progress, skipping');
            return;
          }
          
          setIsLoadingSupernodeClaim(true);
          console.log('Checking supernode claim status for wallet:', account);
          
          // Use fetchWithRetry with caching for the supernode claim check
          try {
            // Use the fetchWithRetry utility for better caching and retry logic
            const claimData = await fetchWithRetry<any>(
              `/api/premium/claim-supernode-nft?wallet=${account}`,
              {
                cacheKey: `kalaido_supernode_claim_${account}`,
                cacheDuration: 30 * 60 * 1000, // 30 minutes cache for NFT status
                maxRetries: 3,
                initialDelay: 1000
              }
            );
            
            console.log('Supernode claim response:', claimData);
            
            if (claimData.success && claimData.eligible) {
              console.log('User is eligible for the supernode NFT');
              setIsNftEligible(true);
              
              // Check if the NFT is claimed - handle both boolean and numeric formats
              // The API might return claimed as 0/1 or true/false
              const isClaimed = claimData.claimed === true || claimData.claimed === 1;
              
              if (isClaimed) {
                console.log('User has claimed the supernode NFT');
                setSupernodeClaimed(true);
              } else {
                console.log('User is eligible but has not claimed the supernode NFT yet');
                // Even if not claimed, we'll unlock one NFT if they're eligible
                setSupernodeClaimed(true);
              }
            }
          } catch (fetchError) {
            console.error('Error fetching supernode claim status:', fetchError);
            
            // Use fallback data if fetch fails completely
            const fallbackData = getFallbackData('supernode-claim', account);
            console.log('Using fallback supernode claim data:', fallbackData);
            
            // Default to eligible and unlocked for better user experience
            setIsNftEligible(true);
            setSupernodeClaimed(true);
          }
        } catch (claimError) {
          console.error('Error checking supernode claim status:', claimError);
          // Use fallback in case of error
          setIsNftEligible(true);
          setSupernodeClaimed(true);
        } finally {
          // Reset loading state
          setIsLoadingSupernodeClaim(false);
        }
        
        setHasCheckedEligibility(true);
      } catch (error) {
        console.error('Error checking mining status:', error);
      } finally {
        // Reset loading state
        setIsLoadingMiningStatus(false);
      }
    };
    
    checkMiningStatus();
  }, [account, hasCheckedEligibility]);

  const {
    data: tasksData = { success: false, tasks: [] },
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: dataService.fetchTasks,
    enabled: !!account && authService.isAuthenticated() && activeTab === 'tasks'
  });

  // Extract data from query results with type safety and handle rate limiting
  const dailyQuiz = quizData?.quiz || null;
  const userPoints: UserPoints = quizData?.points || {
    quiz_points: 0,
    task_points: 0,
    nft_points: 0,
    mining_points: 0,
    total_points: 0
  };

  // Handle rate limiting errors
  useEffect(() => {
    if (quizError && typeof quizError === 'object' && 'message' in quizError) {
      const error = quizError as { message: string; response?: { headers?: { get: (key: string) => string | null } } };
      
      if (error.message.includes('Too many requests')) {
        const retryAfter = error.response?.headers?.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // 5 seconds default
        
        toast.error(
          `Rate limit exceeded. Please wait ${Math.round(waitTime/1000)} seconds before trying again.`,
          {
            duration: waitTime + 1000,
            style: {
              maxWidth: '400px'
            }
          }
        );
        
        // Set up retry after waiting
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['quiz'] });
        }, waitTime);
      }
    }
  }, [quizError, queryClient]);
  
  // No need for separate mining points state since it's included in userPoints

  // Mining points are now included in userPoints from the API
  // Extract the values for easier use
  const userTotalPoints = Number(userPoints.total_points) || 0;
  const miningPointsNum = Number(userPoints.mining_points) || 0;
  const quizPoints = Number(userPoints.quiz_points) || 0;
  const taskPoints = Number(userPoints.task_points) || 0;
  
  // Flag to check if mining points are loaded
  const miningPointsLoaded = miningPointsNum > 0;
  

  
  
  
  // We now handle mining points directly in the LaunchpadMining component
  
  // Load mining points from localStorage on initial render if API hasn't returned them yet
  useEffect(() => {
    if (!miningPointsLoaded) {
      const storedPoints = localStorage.getItem('kalaido_mining_points');
      const storedTimestamp = localStorage.getItem('kalaido_mining_timestamp');
      
      if (storedPoints && storedTimestamp) {
        // Check if the stored points are from within the last 24 hours
        const timestamp = new Date(storedTimestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          // If we have recent stored points, invalidate the quiz query to refresh data
          queryClient.invalidateQueries({ queryKey: ['quiz'] });
        }
      }
    }
  }, [miningPointsLoaded, queryClient]);
  const lastAttemptInfo: QuizAttempt | null = quizData?.lastAttempt || null;
  const pastWeekPerformance: WeekPerformance[] = quizData?.pastWeekPerformance || [];
  const tasks: Task[] = tasksData?.tasks || [];
  const isRegistered = !!dailyQuiz || (quizData?.success && !quizData?.error?.includes('not registered'));

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: ({ quizId, answers }: { quizId: string, answers: number[] }) => 
      dataService.submitQuiz(quizId, answers),
    onSuccess: async (data) => {
      if (data.success) {
        // Set local state
        setScore(data.score);
        setMaxScore(data.maxScore);
        setCorrectAnswers(data.correctAnswers);
        setQuizState("success");
        setError(data.error || 'Failed to submit quiz');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to submit quiz');
    }
  });

  // Claim task mutation
  const claimTaskMutation = useMutation({
    mutationFn: (taskId: string) => dataService.claimTask(taskId),
    onSuccess: async (data) => {
      if (data.success) {
        toast.success('Task completed! Points awarded!');
        
        // Invalidate both tasks and quiz queries to trigger a refetch
        // Use Promise.all to run them in parallel
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['tasks'] }),
          queryClient.invalidateQueries({ queryKey: ['quiz'] })
        ]);
        
        // Emit a single data refresh event
        dataEventBus.emitDataRefresh();
      } else {
        toast.error(data.error || 'Failed to claim task');
      }
    },
    onError: (error: any) => {
      console.error('Error claiming task:', error);
      toast.error(error.message || 'Failed to claim task');
    },
    onSettled: () => {
      // This will run after the mutation is either successful or fails
      setClaimingTask(null);
    }
  });

  // Track points calculation state
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // Listen for data refresh events
  useEffect(() => {
    // Only add listeners if window is defined (browser environment)
    if (typeof window === 'undefined') return;
    
    const cleanup = dataEventBus.onDataRefresh(() => {
      console.log('Data refresh event received, refetching data');
      if (typeof refetchQuizData === 'function') {
        refetchQuizData();
      }
      if (activeTab === 'tasks' && typeof refetchTasks === 'function') {
        refetchTasks();
      }
    });
    
    return cleanup;
  }, [refetchQuizData, refetchTasks, activeTab]);

  // Update lastQuizDate from lastAttemptInfo
  useEffect(() => {
    if (lastAttemptInfo?.quizDate) {
      setLastQuizDate(lastAttemptInfo.quizDate);
    }
  }, [lastAttemptInfo]);

  // Function to handle quiz reset
  const handleReset = () => {
    window.location.reload();
  };

  // Function to try quiz again
  const handleTryAgain = () => {
    if (canTakeQuiz()) {
      setQuizState("start");
      setCurrentQuestion(0);
      setSelectedAnswers([]);
      setScore(0);
      setMaxScore(0);
      setCorrectAnswers(0);
      refetchQuizData();
    }
  };

  const handleStartQuiz = async () => {
    if (!canTakeQuiz()) return;

    setIsLoading(true);
    try {
      if (!dailyQuiz) {
        if (!authService.isAuthenticated()) {
          console.log('Not authenticated, please connect wallet'); 
          setError('Please connect your wallet first');
          return;
        }

        // Fetch quiz data again if needed
        const result = await refetchQuizData();
        if (result.data?.quiz) {
          setQuizState("question");
          setCurrentQuestion(0);
          setSelectedAnswers([]);
          startTimer();
        } else {
          throw new Error(result.data?.error || 'Failed to fetch quiz');
        }
      } else {
        setQuizState("question");
        setCurrentQuestion(0);
        setSelectedAnswers([]);
        startTimer();
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleSubmitQuiz = async () => {
    if (!dailyQuiz || !selectedAnswers.length) return;

    submitQuizMutation.mutate({
      quizId: dailyQuiz.id,
      answers: selectedAnswers
    });
  };

  const canTakeQuiz = () => {
    if (!lastQuizDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return lastQuizDate !== today;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (dailyQuiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const tabs = [
    { id: "dashboard", label: "Points Dashboard", icon: <FaCrown className="text-lg" /> },
    { id: "tasks", label: "Premium Tasks", icon: <FaTasks className="text-lg" /> },
    { id: "quiz", label: "Daily Quiz", icon: <FaQuestionCircle className="text-lg" /> },
    { id: "leaderboard", label: "Leaderboard", icon: <FaMedal className="text-lg" /> },
    { id: "nft", label: "NFT", icon: <FaCrown className="text-lg" /> },
    { id: "mining", label: "Node Mining", icon: <FaWallet className="text-lg" /> },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const getNextQuizTime = (): Date => {
    if (!lastQuizDate) {
      return new Date();
    }

    // Get tomorrow at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    console.log('Next quiz time calculation:', {
      lastQuizDate,
      nextQuizTime: tomorrow.toISOString(),
      hoursUntil: Math.round((tomorrow.getTime() - new Date().getTime()) / (1000 * 60 * 60))
    });

    return tomorrow;
  };

  const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const QuizHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="text-2xl font-semibold">Daily Quiz Challenge</h3>
        <p className="text-gray-400 mt-1">Answer all questions correctly to earn points</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="bg-[#00dd72]/10 text-[#00dd72] text-sm font-bold px-3 py-1.5 rounded-full">
          {lastAttemptInfo ? `+${lastAttemptInfo.score} points earned` : `+${maxScore} possible points`}
        </span>
      </div>
    </div>
  );

  const PastWeekPerformance = () => {
    // Get dates from Sunday to Saturday of current week
    const getDaysOfWeek = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - currentDay); // Go back to Sunday

      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sunday);
        date.setDate(sunday.getDate() + i);
        return date.toISOString().split('T')[0];
      });
    };

    const days = getDaysOfWeek();

    return (
      <div className="bg-[#22242F] p-6 rounded-xl border border-white/5 shadow-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Past 7 Days Performance</h4>
        <div className="flex gap-2">
          {days.map((date) => {
            const attempt = pastWeekPerformance.find(p => p.date === date);
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <div key={date} className="flex-1 flex flex-col items-center">
                <div className="text-xs text-gray-400 mb-2">{dayName}</div>
                {attempt ? (
                  <>
                    <div className="w-full bg-white/5 rounded-lg">
                      <div
                        className="bg-gradient-to-t from-[#00dd72] to-[#00ff88] rounded-lg transition-all duration-300"
                        style={{
                          height: `${Math.max(20, ((attempt?.score || 0) / (attempt?.maxScore || 1)) * 80)}px`,
                          maxHeight: "80px",
                          minHeight: "20px"
                        }}
                      />
                    </div>
                    <div className="text-xs font-medium mt-2" style={{ 
                      color: ((attempt?.score || 0) / (attempt?.maxScore || 1)) >= 0.8 ? '#00dd72' : 
                             ((attempt?.score || 0) / (attempt?.maxScore || 1)) >= 0.6 ? '#ffd700' : '#ff4444'
                    }}>
                      {Math.round(((attempt?.score || 0) / (attempt?.maxScore || 1)) * 100)}%
                    </div>
                  </>
                ) : (
                  <div className="w-full h-20 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-500 rotate-90">Not Taken</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Convert PointsDashboard to a regular function to add console logs
  const PointsDashboard = () => {
    // Show loading state if data is being fetched or if we don't have any points data yet
    const isLoading = quizLoading || !quizData || !quizData.points;
    
    // Debug log
    console.log('RENDERING POINTS DASHBOARD:', {
      isLoading,
      hasPointsData: !!quizData?.points,
      pointsData: quizData?.points
    });
    
    // Always show skeleton when loading or when we don't have points data yet
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Points Card Skeleton */}
          <motion.div
            {...fadeInUp}
            className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-32 bg-[#131317] rounded-lg animate-pulse" />
              <div className="h-6 w-6 rounded-full bg-[#131317] animate-pulse" />
            </div>
            <div className="h-12 w-40 bg-[#131317] rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-[#131317] rounded-lg animate-pulse mt-2" />
            <div className="mt-4 h-2 bg-[#131317] rounded-full overflow-hidden animate-pulse" />
            <div className="h-4 w-32 bg-[#131317] rounded-lg animate-pulse mt-2" />
          </motion.div>

          {/* Current Rank Card Skeleton */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-32 bg-[#131317] rounded-lg animate-pulse" />
              <div className="h-6 w-6 rounded-full bg-[#131317] animate-pulse" />
            </div>
            <div className="relative">
              <div className="h-12 w-24 bg-[#131317] rounded-lg animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <div className="h-6 w-16 bg-[#131317] rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-48 bg-[#131317] rounded-lg animate-pulse mt-2" />
            <div className="mt-6 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((tier) => (
                <div
                  key={tier}
                  className="h-2 rounded-full bg-[#131317] animate-pulse"
                />
              ))}
            </div>
          </motion.div>

          {/* Points Breakdown Card Skeleton */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-40 bg-[#131317] rounded-lg animate-pulse" />
              <div className="h-6 w-6 rounded-full bg-[#131317] animate-pulse" />
            </div>
            <div className="grid gap-4">
              {/* Quiz Points Skeleton */}
              <div className="bg-[#131317] p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 w-24 bg-black/20 rounded-lg animate-pulse" />
                  <div className="h-6 w-12 bg-black/20 rounded-lg animate-pulse" />
                </div>
                <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-black/10 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
              {/* Task Points Skeleton */}
              <div className="bg-[#131317] p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 w-24 bg-black/20 rounded-lg animate-pulse" />
                  <div className="h-6 w-12 bg-black/20 rounded-lg animate-pulse" />
                </div>
                <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-black/10 rounded-full animate-pulse w-1/2" />
                </div>
              </div>
              {/* NFT Points Skeleton */}
              <div className="bg-[#131317] p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 w-24 bg-black/20 rounded-lg animate-pulse" />
                  <div className="h-6 w-12 bg-black/20 rounded-lg animate-pulse" />
                </div>
                <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-black/10 rounded-full animate-pulse w-1/4" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }
    
    // Only render the actual content when we have data
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <motion.div
        {...fadeInUp}
        className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Total Points</h3>
          <FaChartLine className="text-2xl text-[#00dd72]" />
        </div>
        <div className="text-5xl font-bold bg-gradient-to-r from-[#00dd72] to-[#00ff88] bg-clip-text text-transparent">
          {formatNumberWithK(userTotalPoints)}
        </div>
        {userTotalPoints > 0 && (
          <div className="text-sm text-gray-400 mt-1">
            (Base: {formatNumberWithK(userTotalPoints - miningPointsNum)} + Mining: {formatNumberWithK(miningPointsNum)} = {formatNumberWithK(userTotalPoints)})
          </div>
        )}
        <div className="grid gap-4 mt-6">
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-medium">Quiz Points</span>
              <span className="text-xl font-bold">{formatNumberWithK(userPoints?.quiz_points || 0)}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${(userPoints?.quiz_points || 0) / (userPoints?.total_points || 1) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-400 font-medium">Task Points</span>
              <span className="text-xl font-bold">{formatNumberWithK(userPoints?.task_points || 0)}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${(userPoints?.task_points || 0) / (userPoints?.total_points || 1) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 font-medium">NFT Points</span>
              <span className="text-xl font-bold">{formatNumberWithK(userPoints?.nft_points || 0)}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${(userPoints?.nft_points || 0) / (userTotalPoints || 1) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400 font-medium">Mining Points</span>
              <span className="text-xl font-bold">{formatNumberWithK(miningPointsNum)}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-300"
                style={{ width: `${(miningPointsNum / (userTotalPoints || 1) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-gray-400 mt-2">Points earned this month</p>
        <div className="mt-4 h-2 bg-[#131317] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#00dd72] to-[#00ff88] rounded-full" 
            style={{ 
              width: `${getProgressToNextLevel(userTotalPoints)}%` 
            }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">{Math.round(getProgressToNextLevel(userTotalPoints))}% to next level</p>
      </motion.div>

      <motion.div
        {...fadeInUp}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Current Rank</h3>
          <FaTrophy className="text-2xl text-[#00dd72]" />
        </div>
        <div className="relative">
          <div className="text-5xl font-bold bg-gradient-to-r from-[#ffd700] to-[#ffed4a] bg-clip-text text-transparent">
            {getRank(userTotalPoints)}
          </div>
          <div className="absolute -top-2 -right-2">
            <span className={`text-black text-xs font-bold px-2 py-1 rounded-full ${
              userTotalPoints >= 20000 
                ? 'bg-gradient-to-r from-[#B9F2FF] to-[#E6FFFD]'  // Diamond
                : 'bg-gradient-to-r from-[#ffd700] to-[#ffed4a]'   // Other ranks
            }`}>
              Tier {getTier(userTotalPoints)}
            </span>
          </div>
        </div>
        <p className="text-gray-400 mt-2">
          {getNextRankMessage(userTotalPoints)}
        </p>
        <div className="mt-6 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((tier) => (
            <div
              key={tier}
              className={`h-2 rounded-full ${
                tier <= getTier(userTotalPoints) ? "bg-gradient-to-r from-[#ffd700] to-[#ffed4a]" : "bg-[#131317]"
              }`}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        {...fadeInUp}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Points Breakdown</h3>
          <FaChartPie className="text-2xl text-[#00dd72]" />
        </div>
        <div className="grid gap-4">
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-blue-400 font-medium">Quiz Points</span>
              <span className="text-xl font-bold">{formatNumberWithK(userPoints.quiz_points)}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${(userPoints.quiz_points / (userPoints.total_points || 1) * 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-400 font-medium">Task Points</span>
              <span className="text-xl font-bold">{formatNumberWithK(userPoints.task_points)}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${(userPoints.task_points / (userPoints.total_points || 1) * 100)}%` }}
              />
            </div>
          </div>
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-yellow-400 font-medium">NFT Points</span>
              <span className="text-xl font-bold">{formatNumberWithK(userPoints.nft_points)}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${(userPoints.nft_points / (userTotalPoints || 1) * 100)}%` }}
              />
            </div>
          </div>
          
          <div className="bg-[#131317] p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-400 font-medium">Mining Points</span>
              <span className="text-xl font-bold">{Math.floor(miningPointsNum).toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-300"
                style={{ width: `${(miningPointsNum / (userTotalPoints || 1) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
  };

  // Helper functions for rank and tier calculations
  const getProgressToNextLevel = (points: number): number => {
    if (points < 5000) return (points / 5000) * 100;
    if (points < 15000) return ((points - 5000) / 10000) * 100;
    if (points < 30000) return ((points - 15000) / 15000) * 100;
    if (points < 50000) return ((points - 30000) / 20000) * 100;
    if (points < 75000) return ((points - 50000) / 25000) * 100;
    if (points < 100000) return ((points - 75000) / 25000) * 100;
    return 100;
  };

  const getRank = (points: number) => {
    if (points < 5000) return "Bronze";
    if (points < 15000) return "Silver";
    if (points < 30000) return "Gold";
    if (points < 50000) return "Platinum";
    if (points < 75000) return "Diamond";
    if (points < 100000) return "Master";
    return "Grandmaster";
  };

  const getTier = (points: number) => {
    if (points < 5000) return 1;    // Bronze
    if (points < 15000) return 2;   // Silver
    if (points < 30000) return 3;   // Gold
    if (points < 50000) return 4;   // Platinum
    if (points < 75000) return 5;   // Diamond
    if (points < 100000) return 6;  // Master
    return 7;                       // Grandmaster
  };

  const getNextRankMessage = (points: number) => {
    if (points < 5000) return `${5000 - points} more points to Silver`;
    if (points < 15000) return `${15000 - points} more points to Gold`;
    if (points < 30000) return `${30000 - points} more points to Platinum`;
    if (points < 50000) return `${50000 - points} more points to Diamond`;
    if (points < 75000) return `${75000 - points} more points to Master`;
    if (points < 100000) return `${100000 - points} more points to Grandmaster`;
    return "Max rank achieved!";
  };

  // Handle claiming a task
  const handleClaimTask = async (taskId: string, link: string) => {
    if (claimingTask === taskId) return; // Prevent multiple clicks
    
    try {
      setClaimingTask(taskId);
      
      // Open link in new tab
      if (typeof window !== 'undefined') {
        window.open(link, '_blank');
      }

      // Wait 5 seconds before making the claim request
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Submit claim - the mutation will handle the loading state
      if (claimTaskMutation && typeof claimTaskMutation.mutate === 'function') {
        await claimTaskMutation.mutate(taskId);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#131317] to-[#1a1b23] text-white pb-20">
      {/* Supernode NFT Modal */}
      <SupernodeNftModal 
        isOpen={showNftModal} 
        onClose={() => setShowNftModal(false)} 
      />
      
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-[#00dd72] opacity-10 blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#131317]" />
        <div className="relative max-w-7xl mx-auto pt-20 px-6">
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Kaleido Premium
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">
                Unlock exclusive rewards and earn premium points through engaging tasks and daily challenges
              </p>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/testnet"
                className="flex items-center text-[#04c762] hover:text-[#04c74f] transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Testnet
              </Link>
              {account ? (
                <button
                  onClick={disconnectWallet}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                >
                  <FaWallet className="mr-2" />
                  {account.slice(0, 6)}...{account.slice(-4)}
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className={`flex items-center px-4 py-2 bg-[#04c762] hover:bg-[#04c74f] rounded-lg transition-colors text-sm ${
                    isConnecting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaWallet className="mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="flex space-x-1 bg-[#22242F]/50 backdrop-blur-xl p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-[#00dd72] text-black shadow-lg shadow-[#00dd72]/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 mt-10">
        {activeTab === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Points Card */}
              <motion.div
                {...fadeInUp}
                className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Total Points</h3>
                  <FaChartLine className="text-2xl text-[#00dd72]" />
                </div>
                {quizLoading && account ? (
                  <div className="space-y-4">
                    <div className="h-12 w-40 bg-[#131317] rounded-lg animate-pulse" />
                    <div className="h-4 w-48 bg-[#131317] rounded-lg animate-pulse mt-2" />
                    <div className="mt-4 h-2 bg-[#131317] rounded-full overflow-hidden animate-pulse">
                      <div className="h-full bg-[#131317] rounded-full w-1/2" />
                    </div>
                    <div className="h-4 w-32 bg-[#131317] rounded-lg animate-pulse mt-2" />
                  </div>
                ) : (
                  <>
                    <div className="text-5xl font-bold bg-gradient-to-r from-[#00dd72] to-[#00ff88] bg-clip-text text-transparent">
                      {formatNumberWithK(userPoints.total_points)}
                    </div>
                    <p className="text-gray-400 mt-2">Points earned this month</p>
                    <div className="mt-4 h-2 bg-[#131317] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#00dd72] to-[#00ff88] rounded-full" 
                        style={{ 
                          width: `${getProgressToNextLevel(userPoints.total_points)}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      {userPoints.total_points > 0 
                        ? `${Math.round(getProgressToNextLevel(userPoints.total_points))}% to next level`
                        : 'Connect your wallet to start earning points'}
                    </p>
                  </>
                )}
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Current Rank</h3>
                  <FaTrophy className="text-2xl text-[#00dd72]" />
                </div>
                {quizLoading && account ? (
                  <div className="space-y-4">
                    <div className="h-12 w-40 bg-[#131317] rounded-lg animate-pulse" />
                    <div className="h-4 w-48 bg-[#131317] rounded-lg animate-pulse mt-2" />
                    <div className="mt-6">
                      <div className="grid grid-cols-7 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((tier) => (
                          <div key={tier} className="h-2 rounded-full bg-[#131317] animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="text-5xl font-bold bg-gradient-to-r from-[#ffd700] to-[#ffed4a] bg-clip-text text-transparent">
                        {getRank(userPoints.total_points)}
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <span className={`text-black text-xs font-bold px-2 py-1 rounded-full ${
                          userPoints.total_points >= 20000 
                            ? 'bg-gradient-to-r from-[#B9F2FF] to-[#E6FFFD]'  // Diamond
                            : 'bg-gradient-to-r from-[#ffd700] to-[#ffed4a]'   // Other ranks
                        }`}>
                          Tier {getTier(userPoints.total_points)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 mt-2">
                      {userPoints.total_points > 0 
                        ? getNextRankMessage(userPoints.total_points)
                        : 'Connect your wallet to see your rank'}
                    </p>
                    <div className="mt-6">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Bronze</span>
                        <span>Grandmaster</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((tier) => (
                          <div
                            key={tier}
                            className={`h-2 rounded-full ${
                              tier <= getTier(userPoints.total_points) 
                                ? tier === 7 
                                  ? 'bg-gradient-to-r from-[#B9F2FF] to-[#E6FFFD]'  // Grandmaster (diamond/white)
                                  : tier === 6 
                                    ? 'bg-gradient-to-r from-[#ff69b4] to-[#ffb6c1]'  // Master (pink)
                                    : tier === 5
                                      ? 'bg-gradient-to-r from-[#b19cd9] to-[#d8bfd8]'  // Diamond (purple)
                                      : 'bg-gradient-to-r from-[#ffd700] to-[#ffed4a]'  // Other ranks (gold)
                                : 'bg-[#131317]'  // Inactive
                            }`}
                            title={["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster"][tier - 1]}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Points Breakdown</h3>
                  <FaChartPie className="text-2xl text-[#00dd72]" />
                </div>
                {quizLoading && account ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="h-5 w-32 bg-[#131317] rounded-lg animate-pulse" />
                          <div className="h-6 w-12 bg-[#131317] rounded-lg animate-pulse" />
                        </div>
                        <div className="h-1.5 bg-[#131317] rounded-full overflow-hidden">
                          <div className="h-full bg-[#131317] rounded-full w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="bg-[#131317] p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-blue-400 font-medium">Quiz Points</span>
                        <span className="text-xl font-bold">{formatNumberWithK(userPoints.quiz_points)}</span>
                      </div>
                      <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-300"
                          style={{ width: `${(userPoints.quiz_points / (userPoints.total_points || 1) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-[#131317] p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-400 font-medium">Task Points</span>
                        <span className="text-xl font-bold">{formatNumberWithK(userPoints.task_points)}</span>
                      </div>
                      <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 rounded-full transition-all duration-300"
                          style={{ width: `${(userPoints.task_points / (userPoints.total_points || 1) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-[#131317] p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-yellow-400 font-medium">NFT Points</span>
                        <span className="text-xl font-bold">{formatNumberWithK(userPoints.nft_points)}</span>
                      </div>
                      <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                          style={{ width: `${(userPoints.nft_points / (userPoints.total_points || 1) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}

        {activeTab === "tasks" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksLoading ? (
              // Skeleton loading cards
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-6 w-32 bg-[#131317] rounded-lg animate-pulse" />
                      <div className="h-6 w-24 bg-[#131317] rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-[#131317] rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-[#131317] rounded animate-pulse" />
                    </div>
                    <div className="mt-6">
                      <div className="h-12 w-full bg-[#131317] rounded-xl animate-pulse" />
                    </div>
                  </motion.div>
                ))}
              </>
            ) : tasks.length === 0 ? (
              // No tasks available message
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-[#22242F] p-6 rounded-full mb-4">
                  <FaTasks className="text-4xl text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No tasks available</h3>
                <p className="text-gray-400 max-w-md">Check back later for new tasks and opportunities to earn points.</p>
              </div>
            ) : (
              // Actual task cards
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    {task.claimed ? (
                      <div className="bg-[#00dd72]/20 text-[#00dd72] px-3 py-1 rounded-full text-sm font-medium">
                        Claimed
                      </div>
                    ) : (
                      <div className="bg-[#ffd700]/20 text-[#ffd700] px-3 py-1 rounded-full text-sm font-medium">
                        +{task.points} points
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 mb-6">{task.description}</p>
                  <button
                    onClick={() => !task.claimed && handleClaimTask(task.id, task.link)}
                    disabled={task.claimed || claimingTask === task.id}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                      ${task.claimed
                        ? 'bg-[#131317] text-gray-500 cursor-not-allowed'
                        : claimingTask === task.id
                        ? 'bg-[#131317] text-white cursor-wait'
                        : 'bg-gradient-to-r from-[#00dd72] to-[#00ff88] text-black hover:opacity-90'
                      }`}
                  >
                    {task.claimed ? (
                      'Completed'
                    ) : claimingTask === task.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      'Claim Points'
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Leaderboard currentUserWallet={account || undefined} />
          </motion.div>
        )}

        {activeTab === "nft" && (
          <div className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-8 rounded-2xl border border-white/5 shadow-xl">
            {/* NFT Tab Header with Refresh Button */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Supernodes CPU</h2>
              <button
                onClick={() => {
                  if (!account) {
                    toast.error('Please connect your wallet first');
                    return;
                  }
                  
                  // Show loading state
                  setIsLoadingSupernodeClaim(true);
                  toast.success('Refreshing NFT status...');
                  
                  // First, refresh the mining status to get the latest NFT count
                  // Add a random parameter to ensure we bypass all caching layers
                  const cacheBuster = `_t=${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                  
                  // Make a direct call to the Launchpad API through our backend
                  fetch(`/api/mining/status?wallet=${account}&${cacheBuster}&forceRefresh=true`, {
                    method: 'GET',
                    headers: {
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0'
                    },
                    cache: 'no-store' // Force fresh data
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`Mining status API returned ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(data => {
                    console.log('Mining status response (refresh):', data);
                    
                    if (data.success && data.status) {
                      // Store the mining status with CPU count
                      setMiningStatus(data.status);
                      
                      // If user has at least one CPU, they are eligible
                      if (data.status.cpuCount > 0) {
                        setIsNftEligible(true);
                        setSupernodeClaimed(true);
                        toast.success(`CPU status refreshed: ${data.status.cpuCount} CPUs available`);
                      } else {
                        toast.success('No CPU available yet');
                      }
                      
                      // Update the cache
                      localStorage.setItem('kalaido_mining_status', JSON.stringify(data));
                      localStorage.setItem('kalaido_mining_status_timestamp', new Date().toISOString());
                    } else {
                      toast.error('Failed to get NFT status');
                    }
                  })
                  .catch(error => {
                    console.error('Error refreshing mining status:', error);
                    toast.error('Failed to refresh NFT status');
                    
                    // Fallback to the supernode claim API if mining status fails
                    return fetchWithRetry<any>(
                      `/api/premium/claim-supernode-nft?wallet=${account}`,
                      {
                        cacheKey: `kalaido_supernode_claim_${account}`,
                        cacheDuration: 30 * 60 * 1000,
                        maxRetries: 5,
                        initialDelay: 1000,
                        skipCache: true // Skip cache to get fresh data
                      }
                    );
                  })
                  .then(claimData => {
                    // This will only run if the mining status API failed and we fell back to the claim API
                    if (claimData && claimData.success && claimData.eligible) {
                      console.log('Supernode claim response (fallback):', claimData);
                      setIsNftEligible(true);
                      setSupernodeClaimed(true);
                      toast.success('NFT status refreshed via fallback API');
                    }
                  })
                  .finally(() => {
                    setIsLoadingSupernodeClaim(false);
                  });
                }}
                disabled={isLoadingSupernodeClaim || !account}
                className={`flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors ${isLoadingSupernodeClaim ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaSync className={`mr-2 ${isLoadingSupernodeClaim ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>
            
            <NftGrid 
              onShowNftModal={() => setShowNftModal(true)}
              isNftEligible={isNftEligible}
              hasClaimedNft={hasCheckedEligibility && isNftEligible && !showNftModal}
              account={account}
              miningStatus={miningStatus}
              supernodeClaimed={supernodeClaimed}
            />
          </div>
        )}

        {activeTab === "quiz" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-[#22242F] to-[#2a2c37] p-10 rounded-2xl border border-white/5 shadow-xl">
              {/* Quiz Header */}
              <QuizHeader />

              {/* Past 7 Days Performance */}
              <PastWeekPerformance />

              {/* Quiz Content */}
              <div className="space-y-8">
                {/* Start Screen */}
                {quizState === "start" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00dd72]/10 mb-4">
                      <FaQuestionCircle className="text-3xl text-[#00dd72]" />
                    </div>
                    <h3 className="text-xl font-semibold">Daily Quiz Challenge</h3>
                    {error ? (
                      <div className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl">
                        {error}
                      </div>
                    ) : canTakeQuiz() ? (
                      <>
                        <p className="text-gray-400 max-w-lg mx-auto">
                          You'll have 10 minutes to answer 10 questions about Kaleido's features and ecosystem.
                          Answer all correctly to earn maximum points!
                        </p>
                        <button 
                          onClick={handleStartQuiz}
                          disabled={isLoading}
                          className={`mt-4 bg-gradient-to-r from-[#00dd72] to-[#00ff88] text-black px-8 py-3 rounded-xl font-medium transition-all ${
                            isLoading 
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:opacity-90 shadow-lg shadow-[#00dd72]/20"
                          }`}
                        >
                          {isLoading ? "Loading..." : "Start Quiz"}
                        </button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-yellow-400">
                          Next quiz available in:
                        </p>
                        <CountdownTimer
                          targetDate={getNextQuizTime()}
                          onComplete={() => {
                            setLastQuizDate(null);
                            refetchQuizData();
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Questions */}
                {quizState === "question" && dailyQuiz && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                          Question {currentQuestion + 1}/{dailyQuiz.questions.length}
                        </span>
                        <div className="h-1 w-32 bg-[#131317] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#00dd72] to-[#00ff88] transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / dailyQuiz.questions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-lg text-gray-300">{dailyQuiz.questions[currentQuestion].question}</p>
                      <div className="grid gap-3">
                        {dailyQuiz.questions[currentQuestion].answers.map((answer: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            className={`w-full text-left p-4 rounded-xl border-2 ${
                              selectedAnswers[currentQuestion] === index
                                ? "border-[#00dd72] bg-[#00dd72]/10"
                                : "border-white/5 hover:border-[#00dd72] bg-[#131317] hover:bg-[#131317]/80"
                            } transition-all duration-300 group`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`${
                                selectedAnswers[currentQuestion] === index
                                  ? "text-[#00dd72]"
                                  : "text-gray-300 group-hover:text-white"
                              }`}>{answer}</span>
                              <div className={`w-5 h-5 rounded-full border-2 ${
                                selectedAnswers[currentQuestion] === index
                                  ? "border-[#00dd72] bg-[#00dd72]"
                                  : "border-white/20 group-hover:border-[#00dd72]"
                              } transition-colors`} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-white/5">
                      <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestion === 0}
                        className={`px-6 py-3 rounded-xl border-2 border-white/5 ${
                          currentQuestion === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-white/20 transition-colors text-gray-400 hover:text-white"
                        }`}
                      >
                        Previous
                      </button>
                      {currentQuestion === dailyQuiz.questions.length - 1 ? (
                        <button
                          onClick={handleSubmitQuiz}
                          disabled={selectedAnswers.includes(-1) || isLoading}
                          className={`bg-gradient-to-r from-[#00dd72] to-[#00ff88] text-black px-8 py-3 rounded-xl font-medium ${
                            selectedAnswers.includes(-1) || isLoading
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:opacity-90 transition-opacity shadow-lg shadow-[#00dd72]/20"
                          }`}
                        >
                          {isLoading ? "Submitting..." : "Submit Quiz"}
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          disabled={selectedAnswers[currentQuestion] === -1}
                          className={`bg-gradient-to-r from-[#00dd72] to-[#00ff88] text-black px-8 py-3 rounded-xl font-medium ${
                            selectedAnswers[currentQuestion] === -1
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:opacity-90 transition-opacity shadow-lg shadow-[#00dd72]/20"
                          }`}
                        >
                          Next Question
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Success Message */}
                {quizState === "success" && dailyQuiz && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                    className="text-center space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-green-400">
                        Congratulations!
                      </h3>
                      <p className="text-xl text-gray-300">
                        You've completed today's quiz!
                      </p>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {score} points earned
                        </div>
                        <p className="text-gray-400">
                          {correctAnswers} out of {dailyQuiz.questions.length} questions correct
                        </p>
                      </div>
                      <p className="text-gray-300">
                        Your answers have been submitted. Check back tomorrow for a new challenge!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-yellow-400">Next quiz available in:</p>
                      <CountdownTimer
                        targetDate={getNextQuizTime()}
                        onComplete={() => {
                          setLastQuizDate(null);
                          refetchQuizData();
                        }}
                      />
                    </div>

                    <button
                      className="px-6 py-2 text-sm font-medium text-white rounded-lg
                        bg-gradient-to-r from-[#00dd72] to-[#00ff88]
                        hover:opacity-90 transition-opacity
                      "
                      onClick={handleTryAgain}
                    >
                      Back to Start
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Node Mining Tab */}
        {activeTab === "mining" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#22242F]/50 to-[#2a2c37]/50 rounded-2xl border border-white/5 shadow-xl overflow-hidden"
          >
            <LaunchpadMining 
              onPointsUpdate={(points) => {
                // Receive mining points from the LaunchpadMining component
                
                // Invalidate the quiz data to force a refetch that will include the latest mining points
                queryClient.invalidateQueries({ queryKey: ['quiz'] });
                
                // Store mining points in localStorage as a backup
                localStorage.setItem('kalaido_mining_points', points.toString());
                localStorage.setItem('kalaido_mining_timestamp', new Date().toISOString());
              }} 
            />
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default PremiumDashboard;
