import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MemoryCache } from '@/lib/cache';
import { RegistrationData } from '@/types/registration';
import { createToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

interface ContentSubmission {
  url: string;
  type: string;
  submittedAt: string;
  status: string;
  reviewStatus?: string;
  pendingReward?: number;
  rewardClaimed?: boolean;
}

interface MiningHistoryItem {
  timestamp: string;
  sessionEarnings: number;
  newBalance: number;
  type: string;
}

interface RegistrationCheckResponse {
  isRegistered: boolean;
  token: string;
  userData: {
    email: string;
    walletAddress: string;
    socialTasks: {
      twitter: boolean;
      telegram: boolean;
      discord: boolean;
    };
    agreedToTerms: boolean;
    referralCode: string;
    referralCount: number;
    referralBonus: number;
    xUsername?: string;
    contentSubmissions: ContentSubmission[];
    lastContentSubmission?: string | null;
    balance?: number;
    status?: string;
    miningHistory?: MiningHistoryItem[];
    twitterTaskClaimed?: boolean;
    twitterCommentTaskClaimed?: boolean;
    twitterCommentBackTaskClaimed?: boolean;
    twitterFounderTaskClaimed?: boolean;
    twitterThreadTaskClaimed?: boolean;
    twitterThreadCommentTaskClaimed?: boolean;
    twitterPartnershipTaskClaimed?: boolean;
    twitterMubeenPostTaskClaimed?: boolean;
  } | null;
}

interface BatchRegistrationResponse {
  registrations: Array<NonNullable<RegistrationCheckResponse['userData']>>;
  total: number;
}

// Create optimized cache instance for registration data
const registrationCache = new MemoryCache({
  maxItems: 100000, // Cache up to 100k users
  maxSize: 200 * 1024 * 1024, // 200MB for registration data
  ttlSeconds: 300, // 5 minutes TTL
  allowStale: true
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

const rateLimitCache = new MemoryCache({
  maxItems: 10000, // Track up to 10k IPs
  ttlSeconds: RATE_LIMIT_WINDOW / 1000
});

function checkRateLimit(ip: string): boolean {
  const key = `rate_limit:${ip}`;
  const requests = rateLimitCache.get<number>(key) || 0;
  
  if (requests >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  rateLimitCache.set(key, requests + 1);
  return true;
}

// Helper function to process a single wallet
async function processWallet(db: any, wallet: string): Promise<RegistrationCheckResponse> {
  const normalizedWallet = wallet.toLowerCase();
  const cacheKey = `registration:${normalizedWallet}`;
  
  // Try to get from cache first
  const cachedData = registrationCache.get<RegistrationCheckResponse>(cacheKey);
  if (cachedData) return cachedData;

  const registration = await db.collection('kaleido').findOne({ 
    walletAddress: normalizedWallet 
  });

  if (registration) {
    // Update mining service with referral bonus
    const miningService = (await import('@/services/miningService')).default.getInstance();
    miningService.setReferralBonus(registration.referralCount || 0);
  }

  let token = '';
  // Allow both pending and approved users
  const isValid = registration?.status === 'approved' || registration?.status === 'pending';
  if (registration && isValid) {
    // Create JWT token for registered users (both pending and approved)
    token = await createToken({
      walletAddress: normalizedWallet,
      email: registration.email,
      status: registration.status
    });
  }

  const responseData: RegistrationCheckResponse = {
    isRegistered: !!registration && isValid, // Consider both pending and approved as registered
    token: token,
    userData: registration ? {
      email: registration.email,
      walletAddress: registration.walletAddress,
      socialTasks: registration.socialTasks || { twitter: false, telegram: false, discord: false },
      agreedToTerms: registration.agreedToTerms || false,
      referralCode: registration.referralCode || '',
      referralCount: registration.referralCount || 0,
      referralBonus: registration.referralBonus || 0,
      xUsername: registration.xUsername,
      contentSubmissions: registration.contentSubmissions || [],
      lastContentSubmission: registration.lastContentSubmission || null,
      balance: registration.balance || 0,
      status: registration.status || '',
      miningHistory: registration.miningHistory || [],
      twitterTaskClaimed: registration.twitterTaskClaimed || false,
      twitterCommentTaskClaimed: registration.twitterCommentTaskClaimed || false,
      twitterCommentBackTaskClaimed: registration.twitterCommentBackTaskClaimed || false,
      twitterFounderTaskClaimed: registration.twitterFounderTaskClaimed || false,
      twitterThreadTaskClaimed: registration.twitterThreadTaskClaimed || false,
      twitterThreadCommentTaskClaimed: registration.twitterThreadCommentTaskClaimed || false,
      twitterPartnershipTaskClaimed: registration.twitterPartnershipTaskClaimed || false,
      twitterMubeenPostTaskClaimed: registration.twitterMubeenPostTaskClaimed || false
    } : null
  };

  // Cache the response
  registrationCache.set(cacheKey, responseData);

  return responseData;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { db } = await connectToDatabase();
    const response = await processWallet(db, wallet);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { wallets } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!Array.isArray(wallets) || wallets.length === 0) {
      return NextResponse.json({ error: 'Wallet addresses are required' }, { status: 400 });
    }

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { db } = await connectToDatabase();
    const registrations = await Promise.all(wallets.map(wallet => processWallet(db, wallet)));

    // Filter out non-registered users and extract userData
    const validRegistrations = registrations
      .filter(reg => reg.isRegistered && reg.userData)
      .map(reg => reg.userData!);

    const response: BatchRegistrationResponse = {
      registrations: validRegistrations,
      total: validRegistrations.length
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600'
      }
    });
  } catch (error) {
    console.error('Error checking registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
