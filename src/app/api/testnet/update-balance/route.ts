import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { emitPointsUpdate } from '@/lib/socketServer';
import { Document, WithId } from 'mongodb';

interface MiningHistoryEntry {
  timestamp: string;
  sessionEarnings: number;
  newBalance: number;
  type: string;
}

interface KaleidoUser extends WithId<Document> {
  walletAddress: string;
  balance: number;
  lastUpdated: string;
  miningHistory: MiningHistoryEntry[];
}

export async function POST(request: Request) {
  try {
    // Check if request body is empty
    const text = await request.text();
    if (!text) {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Try to parse JSON
    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { wallet, earnings } = body;

    if (!wallet || earnings === undefined) {
      return NextResponse.json(
        { error: 'Wallet address and earnings are required' },
        { status: 400 }
      );
    }

    if (typeof earnings !== 'object' || typeof earnings.session !== 'number' || isNaN(earnings.session)) {
      return NextResponse.json(
        { error: 'Invalid earnings format: session must be a number' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    const historyEntry: MiningHistoryEntry = {
      timestamp: new Date().toISOString(),
      sessionEarnings: earnings.session,
      newBalance: 0, // Will be set after update
      type: earnings.type || 'mining_update'
    };

    // First get current balance
    const user = await db.collection<KaleidoUser>('kaleido').findOne({ 
      walletAddress: wallet.toLowerCase() 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate the current balance
    if (typeof user.balance !== 'number' || isNaN(user.balance)) {
      // Fix invalid balance
      await db.collection<KaleidoUser>('kaleido').updateOne(
        { walletAddress: wallet.toLowerCase() },
        { $set: { balance: 0 } }
      );
      user.balance = 0;
    }

    // Calculate new balance
    const newBalance = user.balance + earnings.session;
    historyEntry.newBalance = newBalance;

    // Safeguard: Prevent balance from decreasing
    if (newBalance < user.balance) {
      console.error(`Prevented balance decrease for ${wallet}. Current: ${user.balance}, Update: ${earnings.session}, New: ${newBalance}`);
      return NextResponse.json(
        { 
          error: 'Invalid balance update', 
          message: 'New balance cannot be less than current balance',
          currentBalance: user.balance,
          requestedAmount: earnings.session
        },
        { status: 400 }
      );
    }

    // Update user's balance in the database using $set instead of $inc for safety
    const result = await db.collection<KaleidoUser>('kaleido').updateOne(
      { walletAddress: wallet.toLowerCase() },
      {
        $set: { 
          balance: newBalance,
          lastUpdated: new Date().toISOString()
        } as Partial<KaleidoUser>,
        $push: {
          'miningHistory': {
            $each: [historyEntry],
            $position: 0,
            $slice: 100
          }
        } as any
      }
    );

    // Emit points update via WebSocket
    emitPointsUpdate(wallet.toLowerCase(), newBalance);

    return NextResponse.json({
      success: true,
      balance: newBalance
    });

  } catch (error) {
    console.error('Error updating balance:', error);
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}
