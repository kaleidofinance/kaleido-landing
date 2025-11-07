export const POLLING_INTERVALS = {
  MINING: 0,          // Disabled - only update on mining stop
  REGISTRATION: 0,    // Disabled - only update on user action
  BALANCE: 0,        // Disabled - only update on mining stop
  STATS: 0          // Disabled - only update on user action
} as const;

export const RATE_LIMITS = {
  WINDOW_MS: 5 * 60 * 1000,  // 5 minutes
  MAX_REQUESTS: 300,          // 300 requests per 5 minutes
  MAX_REQUESTS_PER_IP: 150    // 150 requests per IP per 5 minutes
} as const;

export const API_RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,    // Increased to 2 seconds between retries
  BACKOFF_FACTOR: 2     // Double the delay after each retry
} as const;
