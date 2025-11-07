import { JWTPayload } from '@/lib/jwt';

const PREMIUM_TOKEN_KEY = 'kaleido_premium_token';
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds
const TOKEN_TIMESTAMP_KEY = 'premium_token_timestamp';
const MAX_TOKEN_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class PremiumAuthService {
  private static instance: PremiumAuthService;

  private constructor() {}

  public static getInstance(): PremiumAuthService {
    if (!PremiumAuthService.instance) {
      PremiumAuthService.instance = new PremiumAuthService();
    }
    return PremiumAuthService.instance;
  }

  public setToken(token: string): void {
    try {
      localStorage.setItem(PREMIUM_TOKEN_KEY, token);
      localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
      console.log('Premium token saved successfully');
    } catch (error) {
      console.error('Error saving premium token:', error);
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(PREMIUM_TOKEN_KEY);
  }

  public clear(): void {
    try {
      localStorage.removeItem(PREMIUM_TOKEN_KEY);
      localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
      console.log('Premium token cleared successfully');
    } catch (error) {
      console.error('Error clearing premium token:', error);
    }
  }

  public getAuthHeader(): { Authorization: string } | undefined {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      console.log('Premium token is expired, authentication failed');
      return false;
    }
    
    // Check if token is too old (regardless of expiration)
    const timestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
    if (timestamp) {
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > MAX_TOKEN_AGE) {
        console.log('Premium token is too old, authentication failed');
        return false;
      }
    }
    
    return true;
  }

  public getTokenExpiration(): number | null {
    try {
      const token = this.getToken();
      if (!token) return null;
      
      // Decode token without verification (just to check expiration)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const { exp } = JSON.parse(jsonPayload);
      return exp ? exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  
  public isTokenExpired(): boolean {
    try {
      const expiration = this.getTokenExpiration();
      if (!expiration) return true;
      
      // Check if token has already expired
      if (Date.now() > expiration) {
        console.log('Premium token has expired');
        return true;
      }
      
      // Add a buffer time to refresh token before it actually expires
      const shouldRefresh = Date.now() > (expiration - TOKEN_REFRESH_THRESHOLD);
      if (shouldRefresh) {
        console.log('Premium token will expire soon, should refresh');
      }
      
      return shouldRefresh;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Assume expired on error
    }
  }
  
  public async refreshToken(walletAddress: string): Promise<boolean> {
    try {
      console.log('Refreshing premium token for wallet:', walletAddress);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`/api/auth/refresh-token?wallet=${walletAddress}`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error('Token refresh failed with status:', response.status);
          
          // Handle specific error cases
          if (response.status === 401 || response.status === 403) {
            console.log('Authentication error during token refresh, clearing token');
            this.clear();
          }
          
          return false;
        }
        
        const data = await response.json();
        if (data.success && data.token) {
          this.setToken(data.token);
          console.log('Premium token refreshed successfully');
          return true;
        }
        
        console.error('Token refresh response did not contain a token:', data);
        return false;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('Token refresh request timed out');
        } else {
          console.error('Fetch error during token refresh:', fetchError);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error refreshing premium token:', error);
      return false;
    }
  }
}

export const premiumAuthService = PremiumAuthService.getInstance();

// Add a global API request interceptor to handle auth errors
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    try {
      const response = await originalFetch(input, init);
      
      // Check if response indicates auth error
      if (response.status === 401 || response.status === 403) {
        // Only handle API routes that might need premium auth
        let urlString: string;
        
        if (typeof input === 'string') {
          urlString = input;
        } else if (input instanceof URL) {
          urlString = input.href;
        } else if (input instanceof Request) {
          urlString = input.url;
        } else {
          // Fallback for other cases
          urlString = String(input);
        }
        
        if (urlString.includes('/api/') && urlString.includes('/premium/')) {
          console.log('Auth error detected, triggering token refresh event');
          // Dispatch an event that the Web3Provider can listen for
          const event = new CustomEvent('premium-auth-error', {
            detail: { url: urlString, status: response.status }
          });
          window.dispatchEvent(event);
        }
      }
      
      return response;
    } catch (error) {
      // Pass through the error
      throw error;
    }
  };
}
