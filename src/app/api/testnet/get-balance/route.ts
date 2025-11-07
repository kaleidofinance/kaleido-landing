import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import memoryCache from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const normalizedWallet = wallet.toLowerCase();
    const cacheKey = `balance:${normalizedWallet}`;
    
    // Try to get from cache first (cache for 30 seconds)
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=30',
          'X-Cache': 'HIT'
        }
      });
    }

    const { db } = await connectToDatabase();
    
    const user = await db.collection('kaleido').findOne(
      { walletAddress: normalizedWallet }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const responseData = {
      success: true,
      balance: user.balance || 0,
      lastUpdated: user.lastUpdated
    };

    // Cache the response for 30 seconds
    memoryCache.set(cacheKey, responseData, 30);

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=30',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error getting balance:', error);
    return NextResponse.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
