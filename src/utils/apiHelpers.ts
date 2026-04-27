// Cache storage
const cache: Record<string, { data: any; timestamp: number }> = {};

interface FetchWithRetryOptions {
  headers?: Record<string, string>;
  cacheKey?: string;
  cacheDuration?: number;
  maxRetries?: number;
  initialDelay?: number;
  includeCredentials?: boolean;
  skipCache?: boolean;
  forceRefresh?: boolean;
}

/**
 * Fetch with automatic retry, exponential backoff, and optional caching.
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T> {
  const {
    headers = {},
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    maxRetries = 3,
    initialDelay = 1000,
    includeCredentials = true,
    skipCache = false,
    forceRefresh = false,
  } = options;

  // Return cached data if available and not expired
  if (cacheKey && !skipCache && !forceRefresh) {
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data as T;
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fetchOptions: RequestInit = { 
        headers,
        credentials: includeCredentials ? 'include' : 'omit'
      };
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: T = await response.json();

      // Store in cache
      if (cacheKey) {
        cache[cacheKey] = { data, timestamp: Date.now() };
      }

      return data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * initialDelay; // Exponential backoff starting with initialDelay
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new Error('fetchWithRetry: unknown error');
}

/**
 * Returns a safe fallback structure for known data types when all retries fail.
 */
export function getFallbackData(type: string, _identifier?: string): any {
  switch (type) {
    case 'quiz':
      return {
        success: false,
        quiz: null,
        points: {
          quiz_points: 0,
          task_points: 0,
          nft_points: 0,
          mining_points: 0,
          total_points: 0,
        },
        lastAttempt: null,
        pastWeekPerformance: [],
        error: 'Service temporarily unavailable. Please try again later.',
      };
    case 'tasks':
      return { success: false, tasks: [], error: 'Service temporarily unavailable.' };
    default:
      return { success: false, error: 'Service temporarily unavailable.' };
  }
}

/**
 * Clears all localStorage and in-memory cache entries whose keys include the given pattern.
 */
export function clearCachesByPattern(pattern: string): void {
  // Clear in-memory cache
  for (const key of Object.keys(cache)) {
    if (key.includes(pattern)) {
      delete cache[key];
    }
  }

  // Clear localStorage cache
  if (typeof window !== 'undefined') {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}
