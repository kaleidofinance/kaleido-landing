import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Database and collection names
const DB_NAME = 'kaleido';
const COLLECTION_NAME = 'kaleido';
const COMMENT_BACK_POINTS = 200;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet } = body;

    if (!wallet || typeof wallet !== 'string' || !wallet.startsWith('0x')) {
      return NextResponse.json({ 
        error: 'Invalid input',
        message: 'Valid wallet address is required'
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    // Check if user exists and hasn't already claimed
    const user = await collection.findOne({
      walletAddress: wallet.toLowerCase()
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twitterCommentBackTaskClaimed) {
      return NextResponse.json({ 
        error: 'Points already claimed',
        message: 'You have already claimed points for this task'
      }, { status: 400 });
    }

    // Ensure balance is a number
    const currentBalance = Number(user.balance) || 0;
    
    // Calculate new balance
    const newBalance = currentBalance + COMMENT_BACK_POINTS;

    // Prevent negative balance
    if (newBalance < currentBalance) {
      console.error(`Prevented balance decrease for ${wallet}. Current: ${currentBalance}, Update: ${COMMENT_BACK_POINTS}, New: ${newBalance}`);
      return NextResponse.json({ 
        error: 'Invalid balance update',
        message: 'New balance cannot be less than current balance'
      }, { status: 400 });
    }

    // Update with $set instead of $inc for safety
    const result = await collection.updateOne(
      { walletAddress: wallet.toLowerCase() },
      { 
        $set: { 
          balance: newBalance,
          lastUpdated: new Date().toISOString(),
          twitterCommentBackTaskClaimed: true
        }
      }
    );

    if (!result.modifiedCount) {
      throw new Error('Failed to update user');
    }

    // Get updated user data
    const updatedUser = await collection.findOne({ walletAddress: wallet.toLowerCase() });

    return NextResponse.json({
      success: true,
      previousBalance: currentBalance,
      addedPoints: COMMENT_BACK_POINTS,
      newBalance: updatedUser?.balance || 0
    });

  } catch (error: any) {
    console.error('Error claiming comment points:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
