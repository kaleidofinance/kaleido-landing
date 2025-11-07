import { MiningWorker, MiningPool } from '@/types/mining';
import { POOL_ALGORITHMS, MINING_POOLS, MINING_WORKERS } from '@/constants/mining';
import { encryptData, decryptData } from '@/utils/crypto';

interface MiningConfig {
  pool: MiningPool;
  worker: MiningWorker;
  threads?: number;
  intensity?: number;
  previousEarnings?: number;
}

// Types for balance updates
interface BalanceUpdate {
  amount: number;
  timestamp: number;
  wallet: string;
}

class MiningService {
  private static instance: MiningService;
  private static readonly FAILED_UPDATES_KEY = 'kalaido_failed_updates';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000; // 2 seconds
  private static readonly MAX_UPDATE_RETRIES = 3;
  private static readonly BALANCE_UPDATE_THRESHOLD = 0.1; // Only update server when balance changes by 10%
  private static readonly MIN_UPDATE_INTERVAL = 10 * 60 * 1000; // Minimum 10 minutes between updates

  private miningWorker: globalThis.Worker | null = null;
  private isActive = false;
  private currentConfig: MiningConfig | null = null;
  private startTime: number = 0;
  private totalEarnings: number = 0;
  private sessionEarnings: number = 0;
  private startingBalance: number = 0;
  private wallet: string | null = null;
  private referralBonus: number = 0;
  private bonusSystem: 'simple' | 'tier' | 'milestone' = 'milestone';
  private readonly STORAGE_KEY = 'kalaido_mining_state';
  private readonly BALANCE_STORAGE_KEY = 'kalaido_balance_state';
  private lastSaveTime = 0;
  private lastStateSave = 0;
  private readonly STATE_SAVE_INTERVAL = 5000; // Increased to 5 seconds
  private readonly BALANCE_CHECK_INTERVAL = 15 * 60 * 1000; // 15 minutes between checks
  private lastBalanceCheck = 0;
  private lastSuccessfulUpdate: number = 0;
  private updateRetryCount: number = 0;
  private isStoppingMining = false;
  private pendingStateSync = false;
  private lastBalanceUpdate = 0;
  private lastServerBalance = 0;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupVisibilityHandling();

      // Listen for registration updates (task claims)
      window.addEventListener('registration-updated', ((e: CustomEvent) => {
        const registration = e.detail;
        if (registration) {
          this.updateTotalEarningsFromTasks(registration);
        }
      }) as EventListener);

      // Listen for visibility changes but don't stop mining
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // Just save state when becoming visible
          if (this.isActive) {
            this.saveState();
          }
        }
      });

      // Optimize beforeunload handler
      window.addEventListener('beforeunload', () => {
        // Only save locally if there are changes
        if (this.isActive && this.pendingStateSync) {
          this.saveState();
        }
      });

      // Listen for state updates from other tabs
      window.addEventListener('mining-state-sync', ((e: CustomEvent) => {
        const state = e.detail;
        this.applyState(state);
      }) as EventListener);
    }
  }

  private setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      // When tab becomes visible again, ensure state is up to date
      if (document.visibilityState === 'visible' && this.isActive) {
        this.loadState();
      }
    });
  }

  private loadState() {
    if (!this.wallet) return;
    
    try {
      // Try to get stored state
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      // If no stored state, initialize fresh state
      if (!stored) {
        console.log('No stored state found, initializing fresh state');
        this.initializeState();
        return;
      }

      // First try parsing as plain JSON for old data
      try {
        const oldData = JSON.parse(stored);
        if (oldData && typeof oldData === 'object' && oldData.wallet === this.wallet) {
          console.log('Found old format data, migrating...');
          this.migrateOldState(oldData);
          return;
        }
      } catch (e) {
        // Not old format, continue to try decrypted format
      }

      // Try decrypted format
      const state = decryptData(stored, this.wallet);
      if (!state) {
        console.warn('Could not decrypt stored state, initializing fresh state');
        this.initializeState();
        localStorage.removeItem(this.STORAGE_KEY);
        return;
      }

      this.applyState(state);
    } catch (error) {
      console.error('Failed to load mining state:', error);
      this.initializeState();
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private initializeState() {
    this.isActive = false;
    this.currentConfig = null;
    this.totalEarnings = 0;
    this.sessionEarnings = 0;
    this.startTime = 0;
    this.referralBonus = 0;
    this.bonusSystem = 'milestone';
  }

  private migrateOldState(oldData: any) {
    // Apply old state
    this.applyState(oldData);
    
    // Re-encrypt and save in new format
    this.saveState();
    
    // Remove old format data
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private applyState(state: any) {
    // Validate and sanitize all values
    this.isActive = Boolean(state.isActive);
    this.currentConfig = state.currentConfig || null;
    this.totalEarnings = Math.max(0, Number(state.totalEarnings) || 0);
    this.sessionEarnings = Math.max(0, Number(state.sessionEarnings) || 0);
    this.startTime = Number(state.startTime) || 0;
    this.referralBonus = Math.max(0, Number(state.referralBonus) || 0);
    this.bonusSystem = ['simple', 'tier', 'milestone'].includes(state.bonusSystem) 
      ? state.bonusSystem 
      : 'milestone';

    // Emit updated stats
    window.dispatchEvent(new CustomEvent('mining-stats', {
      detail: {
        totalEarnings: this.totalEarnings,
        sessionEarnings: this.sessionEarnings
      }
    }));
  }

  private loadBalanceFromStorage(): number {
    if (!this.wallet) return 0;
    
    try {
      const stored = localStorage.getItem(this.BALANCE_STORAGE_KEY);
      if (!stored) return 0;

      // Try plain JSON first
      try {
        const oldData = JSON.parse(stored);
        if (oldData && typeof oldData === 'object' && oldData.wallet === this.wallet) {
          const balance = Math.max(0, Number(oldData.totalEarnings) || 0);
          
          // Migrate to new format
          const encrypted = encryptData({ 
            wallet: this.wallet, 
            totalEarnings: balance 
          }, this.wallet);
          localStorage.setItem(this.BALANCE_STORAGE_KEY, encrypted);
          
          return balance;
        }
      } catch (e) {
        // Not old format, continue to try decrypted format
      }

      const data = decryptData(stored, this.wallet);
      if (!data) {
        localStorage.removeItem(this.BALANCE_STORAGE_KEY);
        return 0;
      }

      return Math.max(0, Number(data.totalEarnings) || 0);
    } catch (error) {
      console.error('Error loading balance from storage:', error);
      localStorage.removeItem(this.BALANCE_STORAGE_KEY);
      return 0;
    }
  }

  async startMining(config: MiningConfig & { wallet: string }): Promise<boolean> {
    if (this.isActive) return false;

    this.wallet = config.wallet;
    this.currentConfig = config;
    this.startTime = Date.now();
    
    try {
      // First retry any failed updates from previous sessions
      await this.retryFailedUpdates();

      // Load stored balance and use the highest available balance
      const storedBalance = this.loadBalanceFromStorage();
      const configBalance = config.previousEarnings || 0;
      
      // Always use the highest balance we have
      this.startingBalance = Math.max(storedBalance, configBalance);
      this.totalEarnings = this.startingBalance;
      this.sessionEarnings = 0;

      // Start mining worker with correct previous earnings
      this.miningWorker = new Worker(new URL('../workers/miningWorker.ts', import.meta.url), {
        // Ensure worker runs in the background
        type: 'module'
      });
      
      this.miningWorker.onmessage = (event) => this.handleMiningUpdate(event.data);
      
      // Send start message with correct previous earnings
      this.miningWorker.postMessage({
        type: 'start',
        config: {
          ...this.currentConfig,
          previousEarnings: this.startingBalance,
          startTime: this.startTime
        }
      });

      this.isActive = true;
      this.startLocalStorage();
      
      // Emit initial stats
      window.dispatchEvent(new CustomEvent('mining-stats', {
        detail: {
          totalEarnings: this.totalEarnings,
          sessionEarnings: this.sessionEarnings
        }
      }));

      return true;
    } catch (error) {
      console.error('Failed to start mining:', error);
      this.miningWorker?.terminate();
      this.miningWorker = null;
      this.isActive = false;
      return false;
    }
  }

  private startLocalStorage() {
    // Save state to localStorage every second
    const saveInterval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(saveInterval);
        return;
      }

      // Only save to localStorage, never to server
      this.saveState();
    }, 1000);
  }

  private handleMiningUpdate(data: any) {
    if (!this.isActive || this.isStoppingMining) return;

    try {
      if (data.type === 'update') {
        // Ensure numeric types and prevent negative values
        const newSessionEarnings = Math.max(0, Number(data.sessionEarnings) || 0);
        
        // Only allow session earnings to increase
        if (newSessionEarnings >= this.sessionEarnings) {
          this.sessionEarnings = newSessionEarnings;
          this.totalEarnings = (this.startingBalance || 0) + this.sessionEarnings;
          
          // Only save to localStorage
          this.saveState();
          
          window.dispatchEvent(new CustomEvent('mining-stats', {
            detail: {
              totalEarnings: this.totalEarnings,
              sessionEarnings: this.sessionEarnings
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error handling mining update:', error);
    }
  }

  private saveState() {
    if (!this.wallet) return;

    const currentTotal = Math.max(0, this.totalEarnings);
    
    // Save mining state
    const state = {
      isActive: this.isActive,
      currentConfig: this.currentConfig,
      totalEarnings: currentTotal,
      sessionEarnings: this.sessionEarnings,
      startTime: this.startTime,
      wallet: this.wallet,
      referralBonus: this.referralBonus,
      bonusSystem: this.bonusSystem,
      lastUpdate: Date.now()
    };

    // Encrypt state before saving to localStorage
    const encryptedState = encryptData(state, this.wallet);
    localStorage.setItem(this.STORAGE_KEY, encryptedState);

    // Save balance separately
    const balanceState = {
      wallet: this.wallet,
      totalEarnings: currentTotal,
      lastUpdate: Date.now()
    };
    const encryptedBalance = encryptData(balanceState, this.wallet);
    localStorage.setItem(this.BALANCE_STORAGE_KEY, encryptedBalance);

    this.lastStateSave = Date.now();
    this.pendingStateSync = true;
  }

  async stopMining(): Promise<boolean> {
    if (!this.isActive || !this.wallet || this.isStoppingMining) {
      return false;
    }

    try {
      this.isStoppingMining = true;

      // Stop the worker first
      if (this.miningWorker) {
        this.miningWorker.terminate();
        this.miningWorker = null;
      }

      // Save final state
      this.saveState();

      // Only send update to server when stopping
      if (this.sessionEarnings > 0) {
        let success = false;
        
        for (let attempt = 0; attempt < MiningService.MAX_RETRIES; attempt++) {
          try {
            success = await this.updateBalance(this.wallet, this.sessionEarnings);
            if (success) break;
            
            const delay = Math.min(MiningService.RETRY_DELAY * Math.pow(2, attempt), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
          } catch (error) {
            console.error(`Update attempt ${attempt + 1} failed:`, error);
          }
        }

        if (!success) {
          // Store failed update for retry later
          this.storeFailedUpdate(this.sessionEarnings);
        }
      }

      this.isActive = false;
      this.isStoppingMining = false;
      this.currentConfig = null;
      this.sessionEarnings = 0;
      
      return true;
    } catch (error) {
      console.error('Error stopping mining:', error);
      this.isStoppingMining = false;
      return false;
    }
  }

  private async verifyBalance() {
    return; // Do nothing - we only update when stopping
  }

  async updateBalance(wallet: string, earnings: number) {
    // This is only called when stopping mining
    try {
      const response = await fetch('/api/testnet/update-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet,
          earnings: {
            session: earnings,
            type: 'mining_update'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update balance');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Failed to update balance:', error);
      return false;
    }
  }

  private async storeFailedUpdate(amount: number) {
    if (!this.wallet) return;
    
    try {
      const stored = localStorage.getItem(MiningService.FAILED_UPDATES_KEY);
      const updates: BalanceUpdate[] = stored ? JSON.parse(stored) : [];
      updates.push({
        amount,
        timestamp: Date.now(),
        wallet: this.wallet
      });
      localStorage.setItem(MiningService.FAILED_UPDATES_KEY, JSON.stringify(updates));
    } catch (error) {
      console.error('Failed to store update:', error);
    }
  }

  private getFailedUpdates(): BalanceUpdate[] {
    try {
      const stored = localStorage.getItem(MiningService.FAILED_UPDATES_KEY);
      if (!stored) return [];
      
      const updates: BalanceUpdate[] = JSON.parse(stored);
      return updates.filter(update => update.wallet === this.wallet);
    } catch (error) {
      console.error('Failed to get stored updates:', error);
      return [];
    }
  }

  private clearProcessedUpdates(processedTimestamps: number[]) {
    try {
      const stored = localStorage.getItem(MiningService.FAILED_UPDATES_KEY);
      if (!stored) return;
      
      const updates: BalanceUpdate[] = JSON.parse(stored);
      const remaining = updates.filter(update => 
        update.wallet !== this.wallet || 
        !processedTimestamps.includes(update.timestamp)
      );
      
      localStorage.setItem(MiningService.FAILED_UPDATES_KEY, JSON.stringify(remaining));
    } catch (error) {
      console.error('Failed to clear processed updates:', error);
    }
  }

  private async retryFailedUpdates(): Promise<void> {
    const updates = this.getFailedUpdates();
    if (updates.length === 0) return;

    console.log(`Found ${updates.length} failed updates to retry`);
    const processedTimestamps: number[] = [];

    for (const update of updates) {
      let success = false;
      
      for (let attempt = 0; attempt < MiningService.MAX_RETRIES; attempt++) {
        try {
          const delay = Math.min(MiningService.RETRY_DELAY * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          success = await this.updateBalance(update.wallet, update.amount);
          if (success) {
            console.log(`Successfully processed failed update: ${update.amount} points`);
            processedTimestamps.push(update.timestamp);
            break;
          }
        } catch (error) {
          console.error(`Retry attempt ${attempt + 1} failed:`, error);
        }
      }
      
      if (!success) {
        console.error(`Failed to process update after ${MiningService.MAX_RETRIES} attempts: ${update.amount} points`);
      }
    }

    if (processedTimestamps.length > 0) {
      this.clearProcessedUpdates(processedTimestamps);
    }
  }

  public static getInstance(): MiningService {
    if (!MiningService.instance) {
      MiningService.instance = new MiningService();
    }
    return MiningService.instance;
  }

  private calculateSimpleBonus(referralCount: number): number {
    return referralCount * 0.05;
  }

  private calculateTierBonus(referralCount: number): number {
    if (referralCount >= 16) {
      return referralCount * 0.12;
    } else if (referralCount >= 6) {
      return referralCount * 0.08;
    } else {
      return referralCount * 0.05;
    }
  }

  private calculateMilestoneBonus(referralCount: number): number {
    let bonus = referralCount * 0.05;

    if (referralCount >= 50) {
      bonus += 1.0;
    } else if (referralCount >= 25) {
      bonus += 0.5;
    } else if (referralCount >= 10) {
      bonus += 0.25;
    } else if (referralCount >= 5) {
      bonus += 0.1;
    }

    return bonus;
  }

  public setBonusSystem(system: 'simple' | 'tier' | 'milestone'): void {
    this.bonusSystem = system;
    this.saveState();
  }

  public setReferralBonus(referralCount: number): void {
    switch (this.bonusSystem) {
      case 'simple':
        this.referralBonus = this.calculateSimpleBonus(referralCount);
        break;
      case 'tier':
        this.referralBonus = this.calculateTierBonus(referralCount);
        break;
      case 'milestone':
        this.referralBonus = this.calculateMilestoneBonus(referralCount);
        break;
    }
    this.saveState();
  }

  getMiningStatus() {
    return {
      isActive: this.isActive,
      config: this.currentConfig,
      totalEarnings: this.totalEarnings,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      wallet: this.wallet
    };
  }

  getAvailablePools(): MiningPool[] {
    return MINING_POOLS;
  }

  getAvailableWorkers(): MiningWorker[] {
    return MINING_WORKERS;
  }

  // Update total earnings (e.g. when points are claimed)
  public updateTotalEarnings(newBalance: number): void {
    this.totalEarnings = Number(newBalance || 0);
    this.saveState();
  }

  private updateTotalEarningsFromTasks(registration: any) {
    let taskPoints = 0;
    
    // Add points for each completed task
    if (registration.twitterTaskClaimed) {
      taskPoints += 100;
    }
    if (registration.twitterCommentTaskClaimed) {
      taskPoints += 200;
    }
    if (registration.twitterCommentBackTaskClaimed) {
      taskPoints += 200;
    }
    if (registration.twitterScreenshotTaskClaimed) {
      taskPoints += 300;
    }
    
    // Update total earnings to include task points and maintain mining progress
    if (this.isActive) {
      // During mining: startingBalance + sessionEarnings + taskPoints
      this.totalEarnings = (this.startingBalance || 0) + (this.sessionEarnings || 0) + taskPoints;
      
      // Update the mining worker with new previous earnings
      if (this.miningWorker && this.currentConfig) {
        this.miningWorker.postMessage({
          type: 'update',
          config: {
            ...this.currentConfig,
            previousEarnings: (this.startingBalance || 0) + taskPoints
          }
        });
      }
    } else {
      // Not mining: just use the new balance from registration
      this.totalEarnings = registration.balance || 0;
    }
    
    // Emit stats update
    window.dispatchEvent(new CustomEvent('mining-stats', {
      detail: {
        totalEarnings: this.totalEarnings,
        sessionEarnings: this.sessionEarnings
      }
    }));
    
    // Save state and sync
    this.saveState();
    this.syncState({
      isActive: this.isActive,
      currentConfig: this.currentConfig,
      totalEarnings: this.totalEarnings,
      sessionEarnings: this.sessionEarnings,
      startTime: this.startTime,
      wallet: this.wallet,
      referralBonus: this.referralBonus,
      bonusSystem: this.bonusSystem
    });
  }

  private syncState(state: any) {
    // Removed WebSocket dependency
    // WebSocketService.getInstance().syncState(state);
  }
}

export default MiningService;
