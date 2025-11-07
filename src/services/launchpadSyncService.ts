import { webhookService } from './webhookService';
import { authService } from './authService';

/**
 * Interface for mining status
 */
interface MiningStatus {
  isActive: boolean;
  walletAddress?: string;
  startTime?: string | Date | null;
  cpuCount?: number;
  miningRate?: string | number;
  points?: number;
  sessionPoints?: number;
  totalPoints?: number;
}

/**
 * Service to handle synchronization with Launchpad mining
 */
class LaunchpadSyncService {
  private static instance: LaunchpadSyncService;
  private miningStatus: MiningStatus = {
    isActive: false
  };
  // Removed periodic sync interval
  private readonly STORAGE_KEY = 'launchpad_mining_status';

  private constructor() {
    if (typeof window !== 'undefined') {
      // Load initial state from localStorage
      this.loadState();
      
      // Only register event listeners once
      if (!this.isInitialized) {
        // Listen for mining events from the webhook service using stored handlers
        window.addEventListener('launchpad-mining-started', this.miningStartedHandler);
        window.addEventListener('launchpad-mining-stopped', this.miningStoppedHandler);
        window.addEventListener('launchpad-mining-active', this.miningActiveHandler);
        
        this.isInitialized = true;
      }
    }
  }

  public static getInstance(): LaunchpadSyncService {
    if (!LaunchpadSyncService.instance) {
      LaunchpadSyncService.instance = new LaunchpadSyncService();
    }
    return LaunchpadSyncService.instance;
  }

  /**
   * Initialize the service with the user's wallet address
   */
  public async initialize(walletAddress: string): Promise<void> {
    if (!walletAddress) return;
    
    // Update wallet address in status
    this.miningStatus.walletAddress = walletAddress;
    
    // Check if we're registered for webhook notifications
    const registeredWallet = localStorage.getItem('registered_wallet');
    if (!registeredWallet && !webhookService.isWebhookRegistered()) {
      // Only register if we don't have a registered wallet in localStorage and we're not already registered
      await this.registerWebhook(walletAddress);
    }
    
    // Check current mining status from Launchpad
    await this.checkAndSyncStatus(walletAddress);
    
    // Periodic sync removed to eliminate unnecessary API calls
  }

  /**
   * Register for webhook notifications
   */
  private async registerWebhook(walletAddress: string): Promise<void> {
    try {
      const result = await webhookService.registerWebhook(walletAddress);
      console.log('Webhook registration result:', result);
    } catch (error) {
      console.error('Error registering webhook:', error);
    }
  }

  /**
   * Check and sync mining status with Launchpad
   */
  private async checkAndSyncStatus(walletAddress: string): Promise<void> {
    try {
      const result = await webhookService.checkMiningStatus(walletAddress);
      
      if (result.success) {
        // Save the previous values to detect changes
        const prevStatus = { ...this.miningStatus };
        
        // Update local status based on Launchpad status
        this.miningStatus.isActive = result.status.isActive;
        
        // Only update these fields if they exist in the response
        if (result.status.startTime !== undefined) {
          this.miningStatus.startTime = result.status.startTime;
        }
        
        if (result.status.miningRate !== undefined) {
          this.miningStatus.miningRate = result.status.miningRate;
        }
        
        if (result.status.cpuCount !== undefined) {
          this.miningStatus.cpuCount = result.status.cpuCount;
        }
        
        // Always update the base totalPoints from the server
        // This is the base value that we'll add real-time session points to
        if (result.status.totalPoints !== undefined) {
          this.miningStatus.totalPoints = result.status.totalPoints;
        }
        
        // If mining just started, handle it
        if (!prevStatus.isActive && this.miningStatus.isActive) {
          this.handleMiningStarted({ address: walletAddress });
        }
        // If mining just stopped, handle it
        else if (prevStatus.isActive && !this.miningStatus.isActive) {
          this.handleMiningStopped({ address: walletAddress });
        }
        
        // Save the updated state
        this.saveState();
        
        // Emit status update event
        this.emitStatusUpdate();
        
        console.log('Updated mining status from server:', {
          isActive: this.miningStatus.isActive,
          startTime: this.miningStatus.startTime,
          miningRate: this.miningStatus.miningRate,
          totalPoints: this.miningStatus.totalPoints
        });
      }
    } catch (error) {
      console.error('Error checking mining status:', error);
    }
  }

  /**
   * Start periodic sync with Launchpad - REMOVED
   * This functionality was removed to eliminate unnecessary API calls
   */
  private startPeriodicSync(walletAddress: string): void {
    // Functionality removed to eliminate unnecessary API calls
    return;
  }

  /**
   * Stop periodic sync - REMOVED
   * This functionality was removed to eliminate unnecessary API calls
   */
  private stopPeriodicSync(): void {
    // Functionality removed to eliminate unnecessary API calls
    return;
  }

  /**
   * Handle mining started event
   */
  private handleMiningStarted(detail: { address: string, timestamp?: number }): void {
    console.log('Mining started on Launchpad:', detail);
    
    this.miningStatus.isActive = true;
    
    // Only set the start time if it's not already set
    if (!this.miningStatus.startTime) {
      this.miningStatus.startTime = detail.timestamp ? new Date(detail.timestamp) : new Date();
    }
    
    // Initialize mining rate if not set
    if (!this.miningStatus.miningRate) {
      this.miningStatus.miningRate = 0.0045; // Default rate in points per second
    }
    
    // Save state
    this.saveState();
    
    // Emit status update event
    this.emitStatusUpdate();
    
    console.log('Mining started with:', {
      startTime: this.miningStatus.startTime,
      miningRate: this.miningStatus.miningRate,
      totalPoints: this.miningStatus.totalPoints
    });
  }

  /**
   * Handle mining stopped event
   */
  private handleMiningStopped(detail: { address: string, timestamp?: number }): void {
    console.log('Mining stopped on Launchpad:', detail);
    
    this.miningStatus.isActive = false;
    
    // Calculate session points if we have a start time
    if (this.miningStatus.startTime) {
      // Convert startTime to a number (timestamp) if it's a string or Date
      const startTimeMs = typeof this.miningStatus.startTime === 'string' 
        ? new Date(this.miningStatus.startTime).getTime() 
        : this.miningStatus.startTime instanceof Date 
          ? this.miningStatus.startTime.getTime() 
          : 0;
      
      const endTimeMs = detail.timestamp || Date.now();
      const durationMs = endTimeMs - startTimeMs;
      const durationSeconds = durationMs / 1000;
      
      // Get mining rate (points per second)
      let miningRate = 0.0045; // Default fallback rate
      if (this.miningStatus.miningRate !== undefined) {
        if (typeof this.miningStatus.miningRate === 'string') {
          miningRate = parseFloat(this.miningStatus.miningRate);
        } else {
          miningRate = this.miningStatus.miningRate as number;
        }
      }
      
      // Calculate points earned: mining rate * duration in seconds
      const pointsEarned = durationSeconds * miningRate;
      
      console.log('Mining session completed:', {
        startTime: new Date(startTimeMs).toISOString(),
        endTime: new Date(endTimeMs).toISOString(),
        durationSeconds,
        miningRate,
        pointsEarned,
        previousTotalPoints: this.miningStatus.totalPoints || 0
      });
      
      // Update total points
      this.miningStatus.totalPoints = (this.miningStatus.totalPoints || 0) + pointsEarned;
      this.miningStatus.startTime = null; // Clear start time when mining stops
    }
    
    // Save state
    this.saveState();
    
    // Emit status update event
    this.emitStatusUpdate();
  }

  /**
   * Emit status update event
   */
  private emitStatusUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('launchpad-status-update', {
        detail: { ...this.miningStatus }
      }));
    }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.miningStatus));
    }
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.miningStatus = { ...this.miningStatus, ...parsed };
        } catch (error) {
          console.error('Error parsing stored mining status:', error);
        }
      }
    }
  }

  /**
   * Get current mining status
   */
  public getMiningStatus(): MiningStatus {
    return { ...this.miningStatus };
  }

  // Store event handlers as class properties to properly remove them later
  private miningStartedHandler = (e: any) => this.handleMiningStarted(e.detail);
  private miningStoppedHandler = (e: any) => this.handleMiningStopped(e.detail);
  private miningActiveHandler = (e: any) => this.checkAndSyncStatus(e.detail.address);
  private isInitialized = false;

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopPeriodicSync();
    
    if (typeof window !== 'undefined') {
      // Remove event listeners using the stored handlers
      window.removeEventListener('launchpad-mining-started', this.miningStartedHandler);
      window.removeEventListener('launchpad-mining-stopped', this.miningStoppedHandler);
      window.removeEventListener('launchpad-mining-active', this.miningActiveHandler);
      
      // Reset mining status
      this.miningStatus = { isActive: false };
      
      // Reset initialization flag
      this.isInitialized = false;
      
      // Clear localStorage
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

export const launchpadSyncService = LaunchpadSyncService.getInstance();
