import { MiningWorker, MiningPool, MiningStats as IMiningStats } from '@/types/mining';

// Worker configuration types
type WorkerType = 'cpu' | 'gpu' | 'asic';

interface WorkerTypeConfig {
  powerEfficiency: number;
  maxTemp: number;
}

// Type guard to check if a string is a valid worker type
function isValidWorkerType(type: string): type is WorkerType {
  return ['cpu', 'gpu', 'asic'].includes(type.toLowerCase());
}

// Map algorithm to worker type
function getWorkerTypeFromAlgorithm(algorithm: string): WorkerType {
  switch (algorithm.toLowerCase()) {
    case 'quantum hash':
      return 'asic';
    case 'neural mesh':
      return 'gpu';
    case 'chaos matrix':
      return 'cpu';
    default:
      return 'gpu';
  }
}

// Mining state
let isActive = false;
let startTime = 0;
let sessionEarnings = 0;
let previousEarnings = 0;
let lastUpdateTime = 0;
let lastError: Error | null = null;
let updateLoopTimeout: number | null = null;

// Cache for mining rate calculations
const rateCache: { [key: string]: number } = {};

// Mining settings
const settings = {
  baseRate: 0.003,  // Base rate for calculations
  updateInterval: 1000, // Update every second
  bonusMultiplier: 1.05, // Bonus multiplier
  randomVariation: 0.05, // Random variation
  workerTypes: {
    cpu: { powerEfficiency: 1.2 },
    gpu: { powerEfficiency: 1.4 },
    asic: { powerEfficiency: 1.7 }
  }
};

// Calculate mining earnings based on elapsed time
function calculateEarnings(elapsedTime: number, config: MiningConfig): number {
  const seconds = elapsedTime / 1000;
  
  // Base earnings per second based on worker type
  let baseEarningsPerSecond = 0.007; // Default rate
  
  if (config.worker) {
    const workerType = getWorkerTypeFromAlgorithm(config.worker.specialization);
    switch (workerType) {
      case 'cpu':
        baseEarningsPerSecond = 0.009; // ~0.18 points/hour
        break;
      case 'gpu':
        baseEarningsPerSecond = 0.012; // ~0.3 points/hour
        break;
      case 'asic':
        baseEarningsPerSecond = 0.017;  // ~0.48 points/hour
        break;
    }
  }

  // Calculate base earnings for the elapsed time
  const baseEarnings = baseEarningsPerSecond * seconds;
  
  // Apply multipliers
  let multiplier = 1.0;
  
  // Apply worker efficiency
  if (config.worker) {
    const workerType = getWorkerTypeFromAlgorithm(config.worker.specialization);
    if (isValidWorkerType(workerType)) {
      multiplier *= settings.workerTypes[workerType].powerEfficiency;
    }
  }

  // Apply pool bonus if applicable
  if (config.pool) {
    multiplier *= 1 + (config.pool.difficulty / 2000);
  }

  // Apply referral bonus if applicable
  if (config.referralBonus) {
    multiplier *= settings.bonusMultiplier;
  }

  // Apply time-based bonus (max 25% after 5 hours)
  const hoursMining = seconds / 3600;
  const timeBonus = Math.min(0.25, hoursMining * 0.05);
  multiplier *= (1 + timeBonus);

  // Apply random variation (±5%)
  const variation = 1 + (Math.random() * settings.randomVariation * 2 - settings.randomVariation);
  
  // Calculate final earnings
  return Math.max(0, baseEarnings * multiplier * variation);
}

// Function to handle the update loop
function startUpdateLoop(config: MiningConfig) {
  if (!isActive) return;
  
  const now = Date.now();
  const elapsedTime = now - startTime;
  
  // Calculate new earnings for this period only
  const newEarnings = calculateEarnings(elapsedTime, config);
  
  // Update session earnings
  sessionEarnings = Math.max(sessionEarnings, newEarnings);
  
  // Send update to main thread
  self.postMessage({
    type: 'update',
    sessionEarnings,
    previousEarnings
  });
  
  // Schedule next update
  updateLoopTimeout = self.setTimeout(() => startUpdateLoop(config), settings.updateInterval);
}

// Calculate mining rate based on worker and pool configuration
function calculateMiningRate(worker: MiningWorker, pool: MiningPool): number {
  const workerType = getWorkerTypeFromAlgorithm(worker.specialization);
  let rate = settings.baseRate;

  if (isValidWorkerType(workerType)) {
    // Apply worker type efficiency
    rate *= settings.workerTypes[workerType].powerEfficiency;

    // Temperature penalty
    const maxTemp = 75; // Default max temperature
    const tempPenalty = worker.temperature > maxTemp ? 
      Math.max(0.5, 1 - ((worker.temperature - maxTemp) / 50)) : 1;
    rate *= tempPenalty;
  }

  // Apply pool difficulty bonus
  rate *= (1 + pool.difficulty / 10);

  return rate;
}

interface MiningConfig {
  worker: MiningWorker;
  pool: MiningPool;
  referralBonus?: boolean;
  startTime?: number;
  previousEarnings?: number;
}

// Send mining stats update to main thread
function updateMiningStats(config: MiningConfig): void {
  if (!isActive) return;

  const now = Date.now();
  const timeSinceLastUpdate = now - lastUpdateTime;
  
  // Ensure we update at least every second
  if (timeSinceLastUpdate < settings.updateInterval) return;
  
  const elapsedTime = now - startTime;
  
  // Calculate new earnings
  const newEarnings = calculateEarnings(elapsedTime, config);
  
  // Update session earnings (only if it increased)
  if (newEarnings > sessionEarnings) {
    sessionEarnings = newEarnings;
  }

  // Generate random stats in realistic ranges
  const hashrate = 30000 + Math.random() * 20000; // 30-50 KH/s
  const powerUsage = 180 + Math.random() * 40; // 180-220W
  const temperature = 65 + Math.random() * 15; // 65-80°C
  
  // Calculate shares
  const acceptedShares = Math.floor(100 + Math.random() * 50); // 100-150 shares
  const rejectedShares = Math.floor(Math.random() * 5); // 0-5 rejected
  const invalidShares = Math.floor(Math.random() * 2); // 0-2 invalid
  
  // Calculate efficiency (95-100%)
  const efficiency = 95 + Math.random() * 5;
  
  // Calculate mining rate based on hashrate
  const miningRate = (hashrate / 30000) * settings.baseRate;

  // Generate mining stats
  const stats: IMiningStats = {
    hashrate: hashrate,
    shares: {
      accepted: acceptedShares,
      rejected: rejectedShares,
      invalid: invalidShares
    },
    temperature: temperature,
    powerUsage: powerUsage,
    earnings: sessionEarnings + previousEarnings,
    miningRate: miningRate,
    predictions: {
      nextHashrate: hashrate * (0.95 + Math.random() * 0.1),
      nextShares: acceptedShares * (0.9 + Math.random() * 0.2),
      nextTemperature: temperature * (0.98 + Math.random() * 0.04),
      confidence: 0.85 + Math.random() * 0.15
    },
    trends: {
      hashrateTrend: Math.random() > 0.5 ? 'increasing' : 'stable',
      efficiency: efficiency / 100,
      performance: miningRate > settings.baseRate ? 'optimal' : 'suboptimal'
    }
  };

  // Send update to main thread
  self.postMessage({
    type: 'update',
    totalEarnings: previousEarnings,
    sessionEarnings: sessionEarnings,
    efficiency: efficiency,
    stats: stats
  });

  lastUpdateTime = now;
}

// Handle errors
function handleError(error: Error) {
  lastError = error;
  // console.error('Mining error:', error);
  self.postMessage({
    type: 'error',
    error: error.message
  });
}

// Handle messages from main thread
self.onmessage = function(e: MessageEvent) {
  try {
    const { type, config } = e.data as { type: string; config: MiningConfig };

    switch (type) {
      case 'start':
        // Initialize mining state
        isActive = true;
        startTime = config.startTime || Date.now();
        previousEarnings = Number(config.previousEarnings) || 0;
        sessionEarnings = 0;
        lastUpdateTime = startTime;
        
        // Clear rate cache
        Object.keys(rateCache).forEach(key => delete rateCache[key]);
        
        // console.log('Mining worker started:', { 
        //   startTime,
        //   config,
        //   workerType: getWorkerTypeFromAlgorithm(config.worker.specialization),
        //   baseRate: settings.baseRate,
        //   previousEarnings
        // });

        // Start the update loop
        startUpdateLoop(config);
        break;

      case 'stop':
        // Clean up
        isActive = false;
        if (updateLoopTimeout !== null) {
          self.clearTimeout(updateLoopTimeout);
          updateLoopTimeout = null;
        }
        // Send final update
        updateMiningStats(config);
        // console.log('Mining worker stopped');
        break;

      case 'update':
        // Update previous earnings if needed
        if (config.previousEarnings !== undefined) {
          previousEarnings = Number(config.previousEarnings);
        }
        // Send immediate update with new totals
        updateMiningStats(config);
        break;

      default:
        // console.error('Unknown message type:', type);
        self.postMessage({
          type: 'error',
          error: 'Unknown message type'
        });
    }
  } catch (error) {
    handleError(error as Error);
  }
};
