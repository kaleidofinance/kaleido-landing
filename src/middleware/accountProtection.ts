import { NextApiRequest, NextApiResponse } from 'next';
import { getDeviceFingerprint, DeviceInfo } from '@/utils/deviceFingerprint';
import { Redis } from 'ioredis';

// Initialize Redis with authentication
const redis = new Redis({
  host: 'redis-16899.c240.us-east-1-3.ec2.redns.redis-cloud.com',
  port: 16899,
  password: process.env.REDIS_PASSWORD,
  tls: {}, // Enable TLS/SSL
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
});

interface RateLimitInfo {
  count: number;
  firstAttempt: number;
}

export async function accountProtection(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    const { wallet } = req.body;
    const deviceInfo: DeviceInfo = req.body.deviceInfo;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // 1. Check for VPN/Proxy
    const isProxy = await checkForProxy(ip as string);
    if (isProxy) {
      return res.status(403).json({ error: 'VPN/Proxy detected' });
    }

    // 2. Rate limiting by IP
    const ipKey = `ratelimit:ip:${ip}`;
    const ipLimit = await checkRateLimit(ipKey, 5, 3600); // 5 attempts per hour
    if (!ipLimit.allowed) {
      return res.status(429).json({ error: 'Too many attempts from this IP' });
    }

    // 3. Device fingerprint checks
    const fingerprintKey = `device:${deviceInfo.fingerprint}`;
    const deviceCount = await redis.scard(fingerprintKey);
    if (deviceCount >= 3) { // Max 2 accounts per device
      return res.status(403).json({ error: 'Device limit reached' });
    }

    // 4. Browser automation detection
    if (isBotBehavior(deviceInfo)) {
      return res.status(403).json({ error: 'Automated behavior detected' });
    }

    // 5. Time-based patterns
    const timeKey = `registration:time:${deviceInfo.fingerprint}`;
    const timePattern = await checkTimePatterns(timeKey);
    if (timePattern.suspicious) {
      return res.status(403).json({ error: 'Suspicious registration pattern' });
    }

    // If all checks pass, store the association
    await redis.sadd(fingerprintKey, wallet);
    await redis.expire(fingerprintKey, 30 * 24 * 60 * 60); // 30 days expiry

    // Store IP for monitoring
    await redis.sadd(`ip:${ip}`, wallet);
    await redis.expire(`ip:${ip}`, 24 * 60 * 60); // 24 hours expiry

    next();
  } catch (error) {
    console.error('Account protection error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkForProxy(ip: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://proxycheck.io/v2/${ip}?key=${process.env.PROXY_CHECK_API_KEY}&vpn=1`
    );
    const data = await response.json();
    return data[ip]?.proxy === 'yes';
  } catch {
    return false; // Fail open if service is unavailable
  }
}

async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<{ allowed: boolean; remaining: number }> {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current)
  };
}

function isBotBehavior(deviceInfo: DeviceInfo): boolean {
  // Check for common bot indicators
  const suspicious = [
    !deviceInfo.hardwareConcurrency,
    !deviceInfo.deviceMemory,
    deviceInfo.platform === 'unknown',
    /headless/i.test(deviceInfo.userAgent),
    /phantom/i.test(deviceInfo.userAgent),
    /selenium/i.test(deviceInfo.userAgent),
    /puppet/i.test(deviceInfo.userAgent)
  ];

  return suspicious.some(flag => flag);
}

async function checkTimePatterns(key: string): Promise<{ suspicious: boolean }> {
  const now = Date.now();
  const registrations = await redis.lrange(key, 0, -1);
  
  // Add current timestamp
  await redis.lpush(key, now);
  await redis.ltrim(key, 0, 9); // Keep last 10 registrations
  
  if (registrations.length < 2) {
    return { suspicious: false };
  }

  // Check for suspicious patterns
  const timestamps = registrations.map(Number);
  const intervals = timestamps.slice(1).map((time, i) => time - timestamps[i]);
  
  // Check for too regular intervals (bot-like behavior)
  const isRegular = intervals.every((interval, i, arr) => 
    i === 0 || Math.abs(interval - arr[i-1]) < 100 // Too regular if intervals differ by less than 100ms
  );

  // Check for too rapid registrations
  const tooRapid = intervals.some(interval => interval < 1000); // Less than 1 second apart

  return { suspicious: isRegular || tooRapid };
}
