import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

// Database and collection names
const DB_NAME = 'kaleido';
const COLLECTION_NAME = 'kaleido';

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check if user exists and hasn't already claimed
    const user = await collection.findOne({ walletAddress });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.twitterScreenshotTaskClaimed) {
      return NextResponse.json(
        { error: 'Points already claimed' },
        { status: 400 }
      );
    }

    // Update user document
    await collection.updateOne(
      { walletAddress },
      { 
        $set: { twitterScreenshotTaskClaimed: true },
        $inc: { balance: 300 } // Update balance instead of points to match other tasks
      }
    );

    // Get updated user data to return new balance
    const updatedUser = await collection.findOne({ walletAddress });

    return NextResponse.json({ 
      success: true,
      balance: updatedUser?.balance || 0
    });
  } catch (error) {
    console.error('Error claiming screenshot points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
