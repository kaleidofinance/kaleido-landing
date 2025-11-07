import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import type { RegistrationData, ContentSubmission } from '@/types/registration';
import { Collection } from 'mongodb';

// Cooldown period in milliseconds (3 hours)
const SUBMISSION_COOLDOWN = 3 * 60 * 60 * 1000;

interface AutoApproveRequest {
  wallet: string;
  submissions?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AutoApproveRequest;
    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Missing wallet address' },
        { status: 400 }
      );
    }

    // Connect to MongoDB with proper write concern
    const { db } = await connectToDatabase();
    const kaleidoCollection = db.collection('kaleido') as Collection<RegistrationData>;
    
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - SUBMISSION_COOLDOWN);

    // Find user with pending submissions using compound index
    const registration = await kaleidoCollection.findOne({
      walletAddress: wallet.toLowerCase(),
      'contentSubmissions': {
        $elemMatch: {
          status: 'pending',
          submittedAt: { $lte: cutoffTime }
        }
      }
    });

    if (!registration || !registration.contentSubmissions?.length) {
      return NextResponse.json(
        { error: 'No pending submissions found' },
        { status: 404 }
      );
    }

    // Filter eligible submissions
    const eligibleSubmissions = registration.contentSubmissions.filter(sub => 
      sub.status === 'pending' && new Date(sub.submittedAt) <= cutoffTime
    );

    if (eligibleSubmissions.length === 0) {
      return NextResponse.json(
        { error: 'No submissions were eligible for approval' },
        { status: 400 }
      );
    }

    const totalPointsAwarded = eligibleSubmissions.reduce((total, sub) => total + sub.pendingReward, 0);

    // Update all eligible submissions atomically
    const result = await kaleidoCollection.updateOne(
      { walletAddress: wallet.toLowerCase() },
      {
        $set: {
          'contentSubmissions.$[elem].status': 'approved',
          'contentSubmissions.$[elem].reviewStatus': 'reviewed',
          'contentSubmissions.$[elem].rewardClaimed': true,
          lastUpdated: now.toISOString()
        },
        $inc: { balance: totalPointsAwarded }
      },
      { 
        arrayFilters: [{
          'elem.status': 'pending',
          'elem.submittedAt': { $lte: cutoffTime }
        }],
        writeConcern: { w: 'majority' }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update submissions' },
        { status: 500 }
      );
    }

    // Get updated registration data
    const updatedRegistration = await kaleidoCollection.findOne({
      walletAddress: wallet.toLowerCase()
    });

    if (!updatedRegistration) {
      return NextResponse.json(
        { error: 'Failed to fetch updated registration' },
        { status: 500 }
      );
    }

    // Return success response with updated registration data
    return NextResponse.json({
      message: 'Content submissions auto-approved and points awarded',
      pointsAwarded: totalPointsAwarded,
      approvedSubmissions: eligibleSubmissions,
      updatedRegistration
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Auto-approve error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
