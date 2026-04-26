import { authService } from './authService';
import { premiumAuthService } from './premiumAuthService';
import { DailyQuiz } from '../types/quiz';
import { Task } from '../lib/mysql';
import { fetchWithRetry, getFallbackData } from '../utils/apiHelpers';
import { checkRateLimit, waitForRateLimit } from '../utils/rateLimiter';

export interface UserPoints {
  quiz_points: number;
  task_points: number;
  nft_points: number;
  mining_points: number;
  total_points: number;
}

export interface QuizAttempt {
  score: number;
  maxScore: number;
  correctAnswers: number;
  quizDate?: string;
}

export interface WeekPerformance {
  date: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
}

interface QuizResponse {
  success: boolean;
  quiz?: DailyQuiz;
  points?: UserPoints;
  lastAttempt?: QuizAttempt;
  pastWeekPerformance?: WeekPerformance[];
  error?: string;
}

interface TasksResponse {
  success: boolean;
  tasks: Task[];
  error?: string;
}

interface SubmitQuizResponse {
  success: boolean;
  score: number;
  maxScore: number;
  correctAnswers: number;
  points?: UserPoints;
  lastAttempt?: QuizAttempt;
  pastWeekPerformance?: WeekPerformance[];
  error?: string;
}

// Event bus for data changes
export const dataEventBus = {
  emitDataRefresh: () => {
    if (typeof window === 'undefined') return;
    
    // Use a safer way to create events for cross-browser compatibility
    let event;
    try {
      // Modern browsers
      event = new CustomEvent('dataRefresh');
    } catch (e) {
      // Fallback for older browsers
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('dataRefresh', true, true, {});
    }
    
    window.dispatchEvent(event);
  },
  
  onDataRefresh: (callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    
    window.addEventListener('dataRefresh', callback);
    return () => window.removeEventListener('dataRefresh', callback);
  }
};

export const dataService = {
  // Get quiz data, user points, and performance history
  fetchQuizData: async (walletAddress: string, forceRefresh: boolean = false): Promise<QuizResponse> => {
    // Check for premium authentication first, then regular auth as fallback
    if (!premiumAuthService.isAuthenticated() && !authService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Validate wallet address
      if (!walletAddress) {
        return { success: false, error: 'Wallet address not provided' };
      }

      // First fetch quiz data from the API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/quiz`;
      
      // Use premium auth header if available, otherwise fall back to regular auth
      const headers: Record<string, string> = premiumAuthService.getAuthHeader() || authService.getAuthHeader() || {};
      console.log('Using auth headers for quiz API:', headers);
      
      // Add wallet address to headers for verification
      headers['X-Wallet-Address'] = walletAddress;
      
      console.log('Using auth headers for quiz API:', headers);
      
      // If forceRefresh is true, log it
      if (forceRefresh) {
        console.log('Forcing refresh of quiz data cache');
      }
      
      // Use fetchWithRetry with wallet-specific cache key and rate limiting handling
      let data;
      let retryCount = 0;
      const maxRetries = 3;
      const retryDelay = 2000; // 2 seconds initial delay
      
      // Check rate limit before making request
      if (!await checkRateLimit(walletAddress)) {
        console.log('Rate limit exceeded. Waiting for reset...');
        await waitForRateLimit(walletAddress);
      }
      
      // Add rate limiting headers
      headers['X-Rate-Limit'] = '20';
      headers['X-Rate-Limit-Window'] = '3600';
      headers['X-Rate-Limit-Remaining'] = '1';
      
      while (retryCount < maxRetries) {
        try {
          // Check rate limit again before each attempt
          if (!await checkRateLimit(walletAddress)) {
            console.log('Rate limit exceeded during retry. Waiting for reset...');
            await waitForRateLimit(walletAddress);
          }

          data = await fetchWithRetry<any>(apiUrl, {
            headers,
            cacheKey: `quiz_${walletAddress}`,
            cacheDuration: 15 * 60 * 1000, // 15 minutes
            maxRetries: 1, // Only one retry per attempt
            skipCache: forceRefresh,
            forceRefresh: forceRefresh
          });

          // Check for rate limiting response
          if (data.error?.includes('Too many requests')) {
            console.log(`Rate limited. Waiting ${retryCount * retryDelay}ms before retrying...`);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, retryCount * retryDelay));
              continue;
            }
          }

          // If we got data and it's not rate limited, break the loop
          if (data && !data.error?.includes('Too many requests')) {
            break;
          }
        } catch (fetchError) {
          console.error('Error fetching quiz data:', fetchError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryCount * retryDelay));
            continue;
          }
          // Use fallback data if all retries fail
          data = getFallbackData('quiz', walletAddress);
        }
      }
      
      // If we have a wallet address, also fetch mining points
      let miningPoints = 0;
      if (walletAddress) {
        try {
          // Import webhookService dynamically to avoid circular dependencies
          const { webhookService } = await import('./webhookService');
          const miningStatus = await webhookService.checkMiningStatus(walletAddress);
          
          if (miningStatus.success && miningStatus.status && miningStatus.status.totalPoints) {
            // Get the base mining points
            const baseMiningPoints = Number(miningStatus.status.totalPoints) || 0;
            
            // Apply 4x multiplier to mining points
            miningPoints = baseMiningPoints * 4;
            
        
          }
        } catch (miningError) {
          console.error('Error fetching mining points:', miningError);
          // Continue with 0 mining points on error
        }
      }
      
      // If we have points data from the API, add mining points to it
      if (data.points) {
        data.points.mining_points = miningPoints;
        
        // Also add the multiplied mining points to NFT points
        const baseNftPoints = Number(data.points.nft_points) || 0;
        data.points.nft_points = baseNftPoints + miningPoints;
        
        // Update total points to include mining points (already added to NFT points)
        const baseTotal = Number(data.points.total_points) || 0;
        data.points.total_points = baseTotal + miningPoints;
        
        // Log the updated points
        console.log('UPDATED POINTS WITH MINING:', {
          mining_points: miningPoints,
          nft_points: data.points.nft_points,
          total_points: data.points.total_points
        });
        
        // Store mining points in localStorage as a backup
        if (typeof window !== 'undefined' && miningPoints > 0) {
          localStorage.setItem('kalaido_mining_points', miningPoints.toString());
          localStorage.setItem('kalaido_mining_timestamp', new Date().toISOString());
        }
      }
      
      return {
        success: data.success,
        quiz: data.quiz,
        points: data.points,
        lastAttempt: data.lastAttempt,
        pastWeekPerformance: data.pastWeekPerformance,
        error: data.error
      };
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch quiz data' 
      };
    }
  },

  // Submit quiz answers
  submitQuiz: async (quizId: string, answers: number[]): Promise<SubmitQuizResponse> => {
    if (!authService.isAuthenticated()) {
      return { 
        success: false, 
        error: 'Not authenticated',
        score: 0,
        maxScore: 0,
        correctAnswers: 0
      };
    }

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({
          quizId,
          answers
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();
      return {
        success: true,
        score: data.score,
        maxScore: data.maxScore,
        correctAnswers: data.correctAnswers,
        points: data.points,
        lastAttempt: data.lastAttempt,
        pastWeekPerformance: data.pastWeekPerformance
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit quiz',
        score: 0,
        maxScore: 0,
        correctAnswers: 0
      };
    }
  },

  // Fetch premium tasks
  fetchTasks: async (): Promise<TasksResponse> => {
    // Check for premium authentication first, then regular auth as fallback
    if (!premiumAuthService.isAuthenticated() && !authService.isAuthenticated()) {
      return { success: false, tasks: [], error: 'Not authenticated' };
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`;
      
      // Use premium auth header if available, otherwise fall back to regular auth
      const headers = premiumAuthService.getAuthHeader() || authService.getAuthHeader() || {};
      console.log('Using auth headers for tasks API:', headers);
      
      const response = await fetch(apiUrl, {
        headers
      });
      const data = await response.json();
      
      return {
        success: response.ok,
        tasks: data.tasks || []
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { 
        success: false, 
        tasks: [],
        error: error instanceof Error ? error.message : 'Failed to fetch tasks' 
      };
    }
  },

  // Claim a task
  claimTask: async (taskId: string): Promise<{ 
    success: boolean, 
    tasks?: Task[], 
    points?: UserPoints,
    error?: string
  }> => {
    // Check for premium authentication first, then regular auth as fallback
    if (!premiumAuthService.isAuthenticated() && !authService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Get the wallet address for cache key
      const userData = authService.getUserData();
      const walletAddress = userData?.walletAddress || '';
      
      // Clear all related caches before making the request
      if (typeof window !== 'undefined') {
        // Import clearCachesByPattern dynamically to avoid circular dependencies
        const { clearCachesByPattern } = await import('../utils/apiHelpers');
        
        // Clear all quiz-related caches
        clearCachesByPattern('kalaido_quiz');
        
        // Clear all points-related caches
        clearCachesByPattern('points');
        
        // Clear all task-related caches
        clearCachesByPattern('tasks');
        
        console.log('Cleared all quiz, points, and task caches for task claim');
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ taskId })
      });

      const data = await response.json();
      
      // Trigger data refresh event
      dataEventBus.emitDataRefresh();
      
      // Pre-fetch the updated quiz data to update points
      try {
        console.log('Pre-fetching updated quiz data after task claim');
        await dataService.fetchQuizData(walletAddress);
      } catch (prefetchError) {
        console.error('Error pre-fetching quiz data after task claim:', prefetchError);
        // Continue even if pre-fetch fails
      }
      
      return {
        success: response.ok && data.success,
        tasks: data.tasks,
        points: data.points,
        error: data.error
      };
    } catch (error: any) {
      console.error('Error claiming task:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to claim task' 
      };
    }
  }
}; 