import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RATE_LIMITS } from '@/constants/polling';
import { MemoryCache } from '@/lib/cache';

const rateLimitCache = new MemoryCache({
  ttlSeconds: Math.floor(RATE_LIMITS.WINDOW_MS / 1000),
  maxItems: 10000, // Store up to 10k IPs
  maxSize: 1024 * 1024, // 1MB should be plenty for rate limiting
  allowStale: false
});

export async function rateLimiter(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const key = `rate_limit:${ip}`;
  
  // Get current count for this IP
  const currentCount = rateLimitCache.get<number>(key) || 0;
  
  // Check if over limit
  if (currentCount >= RATE_LIMITS.MAX_REQUESTS_PER_IP) {
    return new NextResponse(JSON.stringify({
      error: 'Too many requests',
      message: 'Please try again later'
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(RATE_LIMITS.WINDOW_MS / 1000)
      }
    });
  }
  
  // Increment count
  rateLimitCache.set(key, currentCount + 1, Math.floor(RATE_LIMITS.WINDOW_MS / 1000));
  
  // Continue to the next middleware
  return NextResponse.next();
}
