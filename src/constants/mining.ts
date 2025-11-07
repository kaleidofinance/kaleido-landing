import { MiningPool, MiningWorker } from '@/types/mining';

// Mining pool algorithms with dynamic performance characteristics
export const POOL_ALGORITHMS = {
  QUANTUM_HASH: {
    name: 'Quantum Hash',
    baseRate: 1.2,
    getMultiplier: () => {
      const timeOfDay = new Date().getHours();
      const peakHourBonus = (timeOfDay >= 9 && timeOfDay <= 17) ? 1.5 : 1;
      const quantumFluctuation = 0.5 + Math.random();
      return peakHourBonus * quantumFluctuation;
    }
  },
  NEURAL_MESH: {
    name: 'Neural Mesh',
    baseRate: 1.0,
    getMultiplier: () => {
      const cyclePosition = (Date.now() % 3600000) / 3600000;
      const waveEffect = Math.sin(cyclePosition * Math.PI * 2) * 0.3 + 1;
      const randomFactor = 0.8 + Math.random() * 0.4;
      return waveEffect * randomFactor;
    }
  },
  CHAOS_MATRIX: {
    name: 'Chaos Matrix',
    baseRate: 1.5,
    getMultiplier: () => {
      const volatility = Math.random() < 0.3 ? 2 : 1;
      const chaosEffect = 0.5 + Math.random() * 1.5;
      return volatility * chaosEffect;
    }
  }
};

// Available mining pools
export const MINING_POOLS: MiningPool[] = [
  {
    id: 'quantum-1',
    name: 'Quantum Surge Pool',
    url: 'quantum.kaleido.network',
    port: 3333,
    algorithm: POOL_ALGORITHMS.QUANTUM_HASH.name,
    difficulty: 2.5,
    fee: 1,
    minPayout: 0.1,
    status: 'active',
  },
  {
    id: 'neural-1',
    name: 'Neural Network Pool',
    url: 'neural.kaleido.network',
    port: 3334,
    algorithm: POOL_ALGORITHMS.NEURAL_MESH.name,
    difficulty: 2.0,
    fee: 0.8,
    minPayout: 0.05,
    status: 'active',
  },
  {
    id: 'chaos-1',
    name: 'Chaos Matrix Pool',
    url: 'chaos.kaleido.network',
    port: 3335,
    algorithm: POOL_ALGORITHMS.CHAOS_MATRIX.name,
    difficulty: 3.0,
    fee: 1.2,
    minPayout: 0.15,
    status: 'active',
  }
];

// Available workers with different capabilities
export const MINING_WORKERS: MiningWorker[] = [
  {
    id: 'quantum-rig-1',
    name: 'Quantum Accelerator',
    status: 'online',
    hashrate: 75.5,
    shares: { accepted: 0, rejected: 0, invalid: 0 },
    powerEfficiency: 1.4, // Supercharged worker
    specialization: POOL_ALGORITHMS.QUANTUM_HASH.name,
    temperature: 65,
    fanSpeed: 70,
    powerUsage: 120,
    uptime: 86400,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'neural-node-1',
    name: 'Neural Processor',
    status: 'online',
    hashrate: 45.5,
    shares: { accepted: 0, rejected: 0, invalid: 0 },
    powerEfficiency: 1.1,
    specialization: POOL_ALGORITHMS.NEURAL_MESH.name,
    temperature: 62,
    fanSpeed: 65,
    powerUsage: 110,
    uptime: 86400,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'chaos-engine-1',
    name: 'Chaos Engine',
    status: 'online',
    hashrate: 55.5,
    shares: { accepted: 0, rejected: 0, invalid: 0 },
    powerEfficiency: 1.2,
    specialization: POOL_ALGORITHMS.CHAOS_MATRIX.name,
    temperature: 68,
    fanSpeed: 75,
    powerUsage: 130,
    uptime: 86400,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'hybrid-miner-1',
    name: 'Hybrid Miner',
    status: 'online',
    hashrate: 40.5,
    shares: { accepted: 0, rejected: 0, invalid: 0 },
    powerEfficiency: 1.0,
    specialization: 'hybrid',
    temperature: 60,
    fanSpeed: 60,
    powerUsage: 100,
    uptime: 86400,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'quantum-rig-2',
    name: 'Quantum Lite',
    status: 'online',
    hashrate: 35.5,
    shares: { accepted: 0, rejected: 0, invalid: 0 },
    powerEfficiency: 0.9,
    specialization: POOL_ALGORITHMS.QUANTUM_HASH.name,
    temperature: 58,
    fanSpeed: 55,
    powerUsage: 90,
    uptime: 86400,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'neural-node-2',
    name: 'Neural Lite',
    status: 'online',
    hashrate: 30.5,
    shares: { accepted: 0, rejected: 0, invalid: 0 },
    powerEfficiency: 0.85,
    specialization: POOL_ALGORITHMS.NEURAL_MESH.name,
    temperature: 55,
    fanSpeed: 50,
    powerUsage: 85,
    uptime: 86400,
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'chaos-engine-2',
    name: 'Chaos Lite',
    status: 'online',
    hashrate: 25.5,
    shares: { accepted: 0, rejected: 0, invalid: 0 },
    powerEfficiency: 0.8,
    specialization: POOL_ALGORITHMS.CHAOS_MATRIX.name,
    temperature: 52,
    fanSpeed: 45,
    powerUsage: 80,
    uptime: 86400,
    lastSeen: new Date().toISOString(),
  }
];
