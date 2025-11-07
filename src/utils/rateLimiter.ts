import { throttle } from 'lodash';

// Rate limiter configuration
interface RateLimiterConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  retryDelay: number; // in milliseconds
}

// Default rate limiter configuration
const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRequests: 20,
  timeWindow: 3600000, // 1 hour
  retryDelay: 2000 // 2 seconds
};

// Rate limiter class
class RateLimiter {
  private requests: Map<string, number> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  private config: RateLimiterConfig;

  constructor(config?: Partial<RateLimiterConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Check if request is allowed
  public canRequest(walletAddress: string): boolean {
    const currentTime = Date.now();
    
    // Get last request time for this wallet
    const lastTime = this.lastRequestTime.get(walletAddress) || 0;
    
    // If last request was more than timeWindow ago, reset counter
    if (currentTime - lastTime > this.config.timeWindow) {
      this.requests.set(walletAddress, 0);
      this.lastRequestTime.set(walletAddress, currentTime);
    }
    
    // Get current request count
    const currentCount = this.requests.get(walletAddress) || 0;
    
    // Check if we've reached max requests
    if (currentCount >= this.config.maxRequests) {
      return false;
    }
    
    // Update request count
    this.requests.set(walletAddress, currentCount + 1);
    
    return true;
  }

  // Get remaining time before next request is allowed
  public getRemainingTime(walletAddress: string): number {
    const currentTime = Date.now();
    const lastTime = this.lastRequestTime.get(walletAddress) || 0;
    const currentCount = this.requests.get(walletAddress) || 0;
    
    if (currentCount >= this.config.maxRequests) {
      return this.config.timeWindow - (currentTime - lastTime);
    }
    return 0;
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Throttled version of the rate limiter check
export const checkRateLimit = throttle((walletAddress: string) => {
  return rateLimiter.canRequest(walletAddress);
}, 1000, { trailing: false });

// Utility function to wait for rate limit reset
export const waitForRateLimit = async (walletAddress: string): Promise<void> => {
  const remainingTime = rateLimiter.getRemainingTime(walletAddress);
  if (remainingTime > 0) {
    console.log(`Waiting ${remainingTime}ms before next request...`);
    await new Promise(resolve => setTimeout(resolve, remainingTime));
  }
};
