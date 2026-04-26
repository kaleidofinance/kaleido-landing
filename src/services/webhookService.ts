import { authService } from './authService';
import { fetchWithRetry, getFallbackData } from '../utils/apiHelpers';

// Define the response types
interface WebhookRegistrationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface WalletLinkResponse {
  success: boolean;
  message?: string;
  error?: string;
  linkId?: number;
  kalaidoWallet?: string;
  launchpadWallet?: string;
}

interface MiningStatusResponse {
  success: boolean;
  status: {
    isActive: boolean;
    address: string;
    startTime?: string | Date | null;
    cpuCount?: number;
    miningRate?: string | number;
    points?: number;
    sessionPoints?: number;
    totalPoints?: number;
    linkedWallet?: string;
    registeredWallet?: string | null;
  };
  registeredWallet?: string | null;
  error?: string;
}

class WebhookService {
  private static instance: WebhookService;
  private launchpadApiUrl: string;
  private callbackUrl: string;
  private isRegistered: boolean = false;
  private constructor() {
    this.launchpadApiUrl = process.env.NEXT_PUBLIC_LAUNCHPAD_API_URL || 'http://localhost:3001';
    // This should be the URL that the Launchpad server will call when mining status changes
    this.callbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/webhook/mining`;
    
    // Initialize by checking if already registered
    if (typeof window !== 'undefined') {
      this.checkRegistrationStatus();
    }
  }

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Register for mining status updates from Launchpad
   */
  public async registerWebhook(walletAddress: string): Promise<WebhookRegistrationResponse> {
    if (!walletAddress) {
      return { success: false, error: 'Wallet address is required' };
    }

    try {
      const response = await fetch(`${this.launchpadApiUrl}/api/mining-public/webhook/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LAUNCHPAD_API_KEY || ''
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          callbackUrl: this.callbackUrl,
          projectId: 'kalaido'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.isRegistered = true;
        localStorage.setItem('webhook_registered', 'true');
        localStorage.setItem('registered_wallet', walletAddress);
      }
      
      return data;
    } catch (error) {
      console.error('Error registering webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to register webhook'
      };
    }
  }

  /**
   * Link a Kalaido wallet to a Launchpad wallet
   */
  public async linkWallets(kalaidoWallet: string, launchpadWallet: string): Promise<WalletLinkResponse> {
    if (!kalaidoWallet || !launchpadWallet) {
      return { success: false, error: 'Both wallet addresses are required' };
    }

    try {
      const response = await fetch(`${this.launchpadApiUrl}/api/mining-public/wallet/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LAUNCHPAD_API_KEY || ''
        },
        body: JSON.stringify({
          kalaido_wallet: kalaidoWallet,
          launchpad_wallet: launchpadWallet
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error linking wallets:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to link wallets'
      };
    }
  }

  /**
   * Unregister from mining status updates
   */
  public async unregisterWebhook(walletAddress: string): Promise<WebhookRegistrationResponse> {
    if (!walletAddress) {
      return { success: false, error: 'Wallet address is required' };
    }

    try {
      const response = await fetch(`${this.launchpadApiUrl}/api/mining-public/webhook/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_LAUNCHPAD_API_KEY || ''
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          callbackUrl: this.callbackUrl,
          projectId: 'kalaido'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.isRegistered = false;
        localStorage.removeItem('webhook_registered');
        localStorage.removeItem('registered_wallet');
      }
      
      return data;
    } catch (error) {
      console.error('Error unregistering webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to unregister webhook'
      };
    }
  }

  /**
   * Check current mining status from Launchpad
   * @param walletAddress The wallet address to check status for
   * @param forceRefresh Whether to force a refresh and bypass cache
   */
  public async checkMiningStatus(walletAddress: string, forceRefresh: boolean = false): Promise<MiningStatusResponse> {
    if (!walletAddress) {
      return { 
        success: false, 
        error: 'Wallet address is required',
        status: { isActive: false, address: '' }
      };
    }

    try {
      // First, check if the wallet is registered with the webhook service
      const isRegistered = this.isWebhookRegistered();
      
      // Use fetchWithRetry with caching to get the mining status
      let data;
      try {
        // Log whether we're forcing a refresh
        if (forceRefresh) {
          console.log(`Forcing refresh of mining status for wallet ${walletAddress}`);
        }
        
        data = await fetchWithRetry<any>(
          `${this.launchpadApiUrl}/api/mining-public/status/${walletAddress}`, 
          {
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_LAUNCHPAD_API_KEY || ''
            },
            cacheKey: `kalaido_mining_status_${walletAddress}`,
            cacheDuration: 30 * 60 * 1000, // 30 minutes cache (increased from 5 minutes)
            maxRetries: 5, // Increased from 3 to 5 retries
            initialDelay: 1000,
            includeCredentials: false, // Don't include credentials for cross-origin Launchpad API calls
            skipCache: forceRefresh // Skip cache if forceRefresh is true
          }
        );
      } catch (fetchError) {
        console.error('Error fetching mining status with retry:', fetchError);
        // Use fallback data if fetch fails completely
        data = getFallbackData('mining-status', walletAddress);
      }
      
      // If registered, store the wallet address in localStorage
      if (isRegistered) {
        localStorage.setItem('registered_wallet', walletAddress);
      }
      
      // Check if the response already has the expected structure
      if (data.success && data.status) {
        // New format - server returns { success: true, status: {...} }
        // Add registered wallet information
        data.registeredWallet = isRegistered ? walletAddress : null;
        data.status.registeredWallet = isRegistered ? walletAddress : null;
        return data;
      }
      
      // Fallback for old format where mining status was at the top level
      const transformedData = {
        success: true,
        registeredWallet: isRegistered ? walletAddress : null,
        status: {
          isActive: data.isActive || false,
          address: walletAddress,
          startTime: data.startTime,
          cpuCount: data.cpuCount,
          miningRate: data.miningRate,
          points: data.points,
          registeredWallet: isRegistered ? walletAddress : null
        }
      };
      
      // If mining is active on Launchpad, emit an event that the mining component can listen for
      if (transformedData.status.isActive) {
        window.dispatchEvent(new CustomEvent('launchpad-mining-active', {
          detail: { address: walletAddress }
        }));
        
        console.log('Mining is active on Launchpad:', transformedData.status);
      } else {
        console.log('Mining is not active on Launchpad');
      }
      
      return transformedData;
    } catch (error) {
      console.error('Error checking mining status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check mining status',
        status: { isActive: false, address: '' }
      };
    }
  }

  /**
   * Handle webhook notification received from Launchpad
   */
  public handleWebhookNotification(data: any): void {
    if (!data || !data.event) return;
    
    const { event, wallet_address, timestamp } = data;
    
    if (event === 'mining_started') {
      // Emit an event to start mining
      window.dispatchEvent(new CustomEvent('launchpad-mining-started', {
        detail: { address: wallet_address, timestamp }
      }));
    } else if (event === 'mining_stopped') {
      // Emit an event to stop mining
      window.dispatchEvent(new CustomEvent('launchpad-mining-stopped', {
        detail: { address: wallet_address, timestamp }
      }));
    }
  }

  /**
   * Check if already registered with Launchpad
   */
  private checkRegistrationStatus(): void {
    const isRegistered = localStorage.getItem('webhook_registered') === 'true';
    const registeredWallet = localStorage.getItem('registered_wallet');
    
    this.isRegistered = isRegistered;
    
    if (isRegistered && registeredWallet) {
      // Check current status from Launchpad
      this.checkMiningStatus(registeredWallet);
    }
  }

  /**
   * Returns whether this client is registered for webhook notifications
   */
  public isWebhookRegistered(): boolean {
    return this.isRegistered;
  }
}

export const webhookService = WebhookService.getInstance();
