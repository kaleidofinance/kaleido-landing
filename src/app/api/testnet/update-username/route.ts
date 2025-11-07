import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getDeviceFingerprint } from '@/utils/deviceFingerprint';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet, xUsername } = body;

    // Validate input
    if (!wallet || typeof wallet !== 'string' || !wallet.startsWith('0x')) {
      return NextResponse.json({ 
        error: 'Invalid input',
        message: 'Valid wallet address is required'
      }, { status: 400 });
    }

    if (!xUsername || typeof xUsername !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid input',
        message: 'Valid X username is required'
      }, { status: 400 });
    }

    // Basic X username validation
    if (!xUsername.match(/^@?(\w){1,15}$/)) {
      return NextResponse.json({ 
        error: 'Invalid X username',
        message: 'Please enter a valid X username (1-15 characters, letters, numbers, and underscores only)'
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('kaleido');

    // Normalize X username (remove @ if present)
    const normalizedUsername = xUsername.startsWith('@') ? xUsername.substring(1) : xUsername;

    // Find the user
    const user = await collection.findOne({
      walletAddress: wallet.toLowerCase()
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the user's X username
    const result = await collection.updateOne(
      { walletAddress: wallet.toLowerCase() },
      { 
        $set: { 
          xUsername: normalizedUsername,
          lastUpdated: new Date().toISOString()
        }
      }
    );

    if (!result.modifiedCount) {
      return NextResponse.json({ error: 'Failed to update X username' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'X username updated successfully',
      xUsername: normalizedUsername
    });

  } catch (error) {
    console.error('Error updating X username:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
