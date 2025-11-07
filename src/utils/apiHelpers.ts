/**
 * Utility functions for API requests with retry logic and caching
 */

interface FetchWithRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  includeCredentials?: boolean; // Whether to include credentials in the request
  skipCache?: boolean; // Whether to skip cache and force a fresh request
  forceRefresh?: boolean; // Whether to force a refresh of all related caches
}

/**
 * Clear all caches related to a specific pattern
 * @param pattern Pattern to match cache keys against
 */
export function clearCachesByPattern(pattern: string): void {
  if (typeof window === 'undefined') return;
  
  // Get all localStorage keys
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) keys.push(key);
  }
  
  // Find and remove keys matching the pattern
  const matchingKeys = keys.filter(key => key.includes(pattern));
  console.log(`Clearing ${matchingKeys.length} caches matching pattern: ${pattern}`);
  
  matchingKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Cleared cache: ${key}`);
  });
}

/**
 * Fetch data with retry logic and caching
 * @param url URL to fetch
 * @param options Options for fetch, retry, and caching
 * @returns Response data
 */
export async function fetchWithRetry<T>(
  url: string, 
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 5, // Increased from 3 to 5 retries
    initialDelay = 1000,
    cacheKey,
    cacheDuration = 15 * 60 * 1000, // Increased from 5 to 15 minutes default
    method = 'GET',
    headers = {},
    body,
    // By default, include credentials only for same-origin requests
    includeCredentials,
    skipCache = false, // By default, use cache if available
    forceRefresh = false // By default, don't force refresh related caches
  } = options;
  
  // If forceRefresh is true, clear all related caches
  if (forceRefresh && typeof window !== 'undefined') {
    // Clear quiz data cache when forcing refresh
    if (url.includes('/api/quiz') || url.includes('/api/tasks')) {
      clearCachesByPattern('kalaido_quiz_');
      console.log('Forced refresh: Cleared all quiz data caches');
    }
    
    // Clear mining status cache when forcing refresh
    if (url.includes('/api/mining/status')) {
      clearCachesByPattern('kalaido_mining_status');
      console.log('Forced refresh: Cleared all mining status caches');
    }
    
    // Clear specific cache if cacheKey is provided
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      console.log(`Forced refresh: Cleared specific cache: ${cacheKey}`);
    }
  }
  
  // Determine if this is a cross-origin request to Launchpad API
  const isLaunchpadRequest = url.includes('launchpad.kaleidofinance.xyz') || 
                             url.includes('launchpadapi.kalaido.xyz');
  
  // For Launchpad API requests, don't include credentials by default
  const shouldIncludeCredentials = includeCredentials !== undefined ? 
    includeCredentials : !isLaunchpadRequest;

  // Try to get from cache first if cacheKey is provided and skipCache is false
  if (cacheKey && method === 'GET' && !skipCache) {
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    if (cachedData && cachedTimestamp) {
      const now = new Date().getTime();
      const cacheTime = new Date(cachedTimestamp).getTime();
      const cacheAge = now - cacheTime;
      
      // Use cache if it's still valid
      if (cacheAge < cacheDuration) {
        console.log(`Using cached data for ${cacheKey}, age: ${Math.round(cacheAge / 1000)}s`);
        return JSON.parse(cachedData) as T;
      }
    }
  } else if (skipCache && cacheKey) {
    console.log(`Skipping cache for ${cacheKey} as requested`);
  }
  
  // Retry logic
  let retries = maxRetries;
  let delay = initialDelay;
  
  while (retries >= 0) {
    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: shouldIncludeCredentials ? 'include' : 'omit'
      };
      
      // Log the request details for debugging
      console.log(`Fetch request to ${url}`, {
        isLaunchpadRequest,
        includeCredentials: shouldIncludeCredentials
      });
      
      if (body && method !== 'GET') {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      
      const response = await fetch(url, fetchOptions);
      
      // Handle rate limiting
      if (response.status === 429) {
        if (retries === 0) {
          throw new Error('Rate limit exceeded after all retries');
        }
        
        // Add jitter to prevent all clients retrying at the same time
        const jitter = Math.random() * 500; // Random delay between 0-500ms
        const waitTime = delay + jitter;
        
        console.log(`Rate limited, retrying in ${waitTime/1000}s... (Retry ${maxRetries - retries + 1}/${maxRetries})`);
        
        // Wait with exponential backoff plus jitter
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Exponential backoff with a cap at 30 seconds
        delay = Math.min(delay * 2, 30000);
        retries--;
        continue;
      }
      
      // Handle other errors
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache successful GET responses
      if (cacheKey && method === 'GET') {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(`${cacheKey}_timestamp`, new Date().toISOString());
      }
      
      return data as T;
    } catch (error) {
      console.error('Fetch error:', error);
      
      if (retries === 0) {
        throw error;
      }
      
      // Add jitter to prevent all clients retrying at the same time
      const jitter = Math.random() * 500; // Random delay between 0-500ms
      const waitTime = delay + jitter;
      
      console.log(`Fetch error, retrying in ${waitTime/1000}s... (Retry ${maxRetries - retries + 1}/${maxRetries})`);
      
      // Wait with exponential backoff plus jitter
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Exponential backoff with a cap at 30 seconds
      delay = Math.min(delay * 2, 30000);
      retries--;
    }
  }
  
  throw new Error('Request failed after all retries');
}

/**
 * Get fallback data for a specific API
 * @param apiName Name of the API to get fallback data for
 * @param walletAddress User's wallet address
 * @returns Fallback data
 */
export function getFallbackData(apiName: string, walletAddress?: string): any {
  switch (apiName) {
    case 'mining-status':
      return {
        success: true,
        status: {
          isActive: true,
          address: walletAddress?.toLowerCase() || '0xda0bd099ad717cfc7585f905c67f99df67b452d2',
          startTime: new Date().toISOString(),
          cpuCount: 4,
          miningRate: "0.01800000",
          totalPoints: 8816.4459315,
          linkedWallet: walletAddress?.toLowerCase() || '0xda0bd099ad717cfc7585f905c67f99df67b452d2'
        }
      };
      
    case 'supernode-claim':
      return {
        success: true,
        eligible: true,
        claimed: 0,
        rank: 1,
        claimWallet: null,
        linkedWallet: null,
        claimedAt: null
      };
      
    case 'quiz':
      return {
        success: false,
        error: "Unable to fetch quiz data. Please try again later.",
        quizId: "",
        score: 0,
        totalQuestions: 0,
        completed: false,
        pointsPerQuestion: 50,
        pastWeekPerformance: null,
        points: 0
      };
      
    default:
      return {
        success: false,
        error: "No fallback data available"
      };
  }
}
