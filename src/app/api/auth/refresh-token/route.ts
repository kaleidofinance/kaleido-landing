import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h'; // Set token to expire after 24 hours

// Add export config to mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Lazy load jsonwebtoken to avoid build-time prototype errors
    const jwt = await import('jsonwebtoken');
    
    // Get the wallet parameter from the search params
    const wallet = request.nextUrl.searchParams.get('wallet');
    
    if (!wallet) {
      console.error('Refresh token request missing wallet address');
      return NextResponse.json({ success: false, error: 'Wallet address required' }, { status: 400 });
    }
    
    console.log('Refreshing token for wallet:', wallet);
    
    // Connect to MongoDB and verify registration
    const { db } = await connectToDatabase();
    const registration = await db.collection('kaleido').findOne({
      walletAddress: wallet.toLowerCase(),
      $or: [
        { status: 'approved' },
        { status: 'pending' }
      ]
    });
    
    if (!registration) {
      console.error('User not registered:', wallet);
      return NextResponse.json({ success: false, error: 'User not registered' }, { status: 401 });
    }
    
    console.log('User registration found:', registration.walletAddress);
    
    // Generate a new token
    const token = jwt.sign(
      { 
        walletAddress: wallet.toLowerCase(),
        email: registration.email || '',
        status: registration.status 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    console.log('New token generated for wallet:', wallet);
    
    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
