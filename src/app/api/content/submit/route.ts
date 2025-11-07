import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { connectToDatabase } from '@/lib/mongodb';
import type { ContentSubmission, RegistrationData } from '@/types/registration';
import { Collection, Document } from 'mongodb';

// Rate limiter: 20 submissions per hour per IP
const rateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 3600,
});

// Cooldown period in milliseconds (3 hours)
const SUBMISSION_COOLDOWN = 3 * 60 * 60 * 1000;

// Content rewards
const CONTENT_REWARDS: Record<'article' | 'video' | 'social', number> = {
  article: 5000,
  video: 5000,
  social: 5000
};

// Trusted domains for content submission
const TRUSTED_DOMAINS = [
  'github.com',
  'medium.com',
  'dev.to',
  'youtube.com',
  'youtu.be',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'substack.com',
  'mirror.xyz',
  'hashnode.com'
];

interface RateLimiterError {
  name: 'RateLimiterRes';
}

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await rateLimiter.consume(ip);

    const body = await req.json();
    const { url, type, walletAddress } = body;

    // Validate inputs
    if (!url || !type || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate URL format and domain
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      if (!TRUSTED_DOMAINS.some(trusted => domain.endsWith(trusted))) {
        return NextResponse.json(
          { 
            error: 'URL domain not allowed. Please use content from trusted platforms.',
            trustedDomains: TRUSTED_DOMAINS
          },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes = ['article', 'video', 'social'] as const;
    if (!validTypes.includes(type as typeof validTypes[number])) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const kaleidoCollection = db.collection('kaleido') as Collection<RegistrationData>;
    
    // Check if user is registered - using kaleido collection as per system design
    const registration = await kaleidoCollection.findOne({
      walletAddress: walletAddress.toLowerCase()
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'User not registered' },
        { status: 403 } // Changed to 403 Forbidden as this is an authorization issue
      );
    }

    // Check cooldown period
    if (registration.lastContentSubmission) {
      const lastSubmissionTime = new Date(registration.lastContentSubmission).getTime();
      const now = Date.now();
      const elapsed = now - lastSubmissionTime;

      if (elapsed < SUBMISSION_COOLDOWN) {
        const remaining = Math.ceil((SUBMISSION_COOLDOWN - elapsed) / 1000);
        return NextResponse.json(
          { 
            error: 'Submission cooldown active',
            remainingSeconds: remaining
          },
          { status: 429 }
        );
      }
    }

    // Check for duplicate submissions
    const existingSubmission = registration.contentSubmissions?.find(
      s => s.url.toLowerCase() === url.toLowerCase()
    );

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this content' },
        { status: 409 }
      );
    }

    // Add new content submission
    const submission: ContentSubmission = {
      url,
      type: type as 'article' | 'video' | 'social',
      submittedAt: new Date(),
      status: 'pending',
      reviewStatus: 'under_review',
      pendingReward: CONTENT_REWARDS[type as keyof typeof CONTENT_REWARDS],
      rewardClaimed: false
    };

    // Update registration in kaleido collection with write concern: majority
    const result = await kaleidoCollection.updateOne(
      { walletAddress: walletAddress.toLowerCase() },
      {
        $push: {
          'contentSubmissions': {
            $each: [submission],
            $position: 0 // Add new submissions at the start of the array
          }
        } as any, // Type assertion needed due to MongoDB typing limitations
        $set: {
          lastUpdated: new Date().toISOString(),
          lastContentSubmission: new Date().toISOString()
        }
      },
      { writeConcern: { w: 'majority' } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      );
    }

    // Return success with submission details
    return NextResponse.json({
      message: 'Content submitted successfully',
      submission
    }, {
      headers: {
        'Cache-Control': 'no-store' // Prevent caching of submission responses
      }
    });

  } catch (error: unknown) {
    // Type guard for rate limiter error
    if (error && typeof error === 'object' && 'name' in error && (error as RateLimiterError).name === 'RateLimiterRes') {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // Log the full error for debugging but return a safe error message
    console.error('Content submission error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
