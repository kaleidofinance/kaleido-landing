export interface MiningWorker {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  hashrate: number;
  shares: {
    accepted: number;
    rejected: number;
    invalid: number;
  };
  powerEfficiency: number;
  specialization: string;
  temperature: number;
  fanSpeed: number;
  powerUsage: number;
  uptime: number;
  lastSeen: string;
}

export interface MiningPool {
  id: string;
  name: string;
  url: string;
  port: number;
  algorithm: string;
  difficulty: number;
  fee: number;
  minPayout: number;
  status: 'active' | 'maintenance' | 'offline';
}

export interface NetworkStats {
  hashrate: {
    total: number;
    average: number;
    peak: number;
  };
  difficulty: number;
  blockHeight: number;
  blockReward: number;
  networkNodes: number;
  poolShare: number;
}

export interface MinerStats {
  totalHashrate: number;
  activeWorkers: number;
  totalShares: {
    accepted: number;
    rejected: number;
    invalid: number;
  };
  earnings: {
    total: number;
    pending: number;
    paid: number;
  };
  efficiency: number;
  uptime: number;
  powerEfficiency: number;
}

export interface ChartData {
  timestamp: string;
  value: number;
}

export interface MiningDashboardData {
  workers: MiningWorker[];
  pools: MiningPool[];
  networkStats: NetworkStats;
  minerStats: MinerStats;
  charts: {
    hashrate: ChartData[];
    earnings: ChartData[];
    shares: ChartData[];
    difficulty: ChartData[];
  };
}

export interface EnvironmentalFactors {
  temperature: number;
  networkCondition: number;
  powerEfficiency: number;
}

export interface MiningStats {
  hashrate: number;
  shares: {
    accepted: number;
    rejected: number;
    invalid: number;
  };
  temperature: number;
  powerUsage: number;
  earnings: number;
  miningRate: number;
  predictions?: {
    nextHashrate: number;
    nextShares: number;
    nextTemperature: number;
    confidence: number;
  };
  trends?: {
    hashrateTrend: 'increasing' | 'decreasing' | 'stable';
    efficiency: number;
    performance: 'optimal' | 'suboptimal' | 'warning';
  };
}
