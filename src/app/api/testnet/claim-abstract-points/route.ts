import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

const ABSTRACT_POINTS = 200; // Points for RT & Comment with #KaleidoAbstract task

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
    const collection = db.collection('kaleido');

    const user = await collection.findOne({
      walletAddress: wallet.toLowerCase()
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if task already claimed
    if (user.twitterAbstractTaskClaimed) {
      return NextResponse.json({ 
        error: 'Points already claimed',
        message: 'You have already claimed points for this task'
      }, { status: 400 });
    }

    // Ensure balance is a number
    const currentBalance = Number(user.balance) || 0;
    
    // Calculate new balance
    const newBalance = currentBalance + ABSTRACT_POINTS;

    // Prevent negative balance
    if (newBalance < currentBalance) {
      console.error(`Prevented balance decrease for ${wallet}. Current: ${currentBalance}, Update: ${ABSTRACT_POINTS}, New: ${newBalance}`);
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
          twitterAbstractTaskClaimed: true
        }
      }
    );

    if (!result.modifiedCount) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      previousBalance: currentBalance,
      addedPoints: ABSTRACT_POINTS,
      newBalance
    });

  } catch (error) {
    console.error('Error claiming points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
