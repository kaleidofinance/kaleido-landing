import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { taskCache } from '@/utils/taskCache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = request.nextUrl.searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Check if registration exists
    const user = await db.collection('kaleido').findOne({ walletAddress: walletAddress.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Cache any completed tasks
    if (user.twitterTaskClaimed) {
      taskCache.setTaskComplete(walletAddress, 'twitterTaskClaimed');
    }
    if (user.twitterCommentTaskClaimed) {
      taskCache.setTaskComplete(walletAddress, 'twitterCommentTaskClaimed');
    }
    if (user.twitterCommentBackTaskClaimed) {
      taskCache.setTaskComplete(walletAddress, 'twitterCommentBackTaskClaimed');
    }

    return NextResponse.json({ registration: user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
