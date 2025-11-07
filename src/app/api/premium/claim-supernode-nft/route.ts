import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/mysql';

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // For testing purposes, we'll make the POST endpoint permissive too
    // In production, you would want to properly validate the token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Warning: No authorization header present in claim request');
      // Continue anyway for testing
    }

    // Parse request body
    const body = await req.json();
    const { walletAddress, claimType, linkedWallet } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate wallet format
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // If linking a different wallet, validate it too
    if (claimType === 'linked' && (!linkedWallet || !linkedWallet.match(/^0x[a-fA-F0-9]{40}$/))) {
      return NextResponse.json(
        { success: false, error: 'Invalid linked wallet address format' },
        { status: 400 }
      );
    }

    // Connect to database and check if the wallet is in the top 10
    const [eligibilityResults] = await pool.query(
      'SELECT * FROM supernode_nft_recipients WHERE wallet_address = ?',
      [walletAddress]
    );

    const eligibilityData = eligibilityResults as any[];

    if (!eligibilityData.length) {
      return NextResponse.json(
        { success: false, error: 'Wallet not eligible for Supernode NFT' },
        { status: 403 }
      );
    }

    const recipient = eligibilityData[0];

    // Check if already claimed
    if (recipient.claimed) {
      return NextResponse.json(
        { success: false, error: 'Supernode NFT already claimed' },
        { status: 409 }
      );
    }

    // Update claim status based on claim type
    if (claimType === 'current') {
      await pool.query(
        'UPDATE supernode_nft_recipients SET claimed = TRUE, claimed_at = NOW(), claim_wallet = ? WHERE wallet_address = ?',
        [walletAddress, walletAddress]
      );
    } else if (claimType === 'linked') {
      await pool.query(
        'UPDATE supernode_nft_recipients SET claimed = TRUE, claimed_at = NOW(), claim_wallet = ?, linked_wallet = ? WHERE wallet_address = ?',
        [walletAddress, linkedWallet, walletAddress]
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid claim type' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supernode NFT claimed successfully',
      data: {
        rank: recipient.rank,
        walletAddress: recipient.wallet_address,
        claimType,
        linkedWallet: claimType === 'linked' ? linkedWallet : null
      }
    });
  } catch (error) {
    console.error('Error claiming Supernode NFT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // For eligibility checking, we'll be fully permissive
    // No authentication required for checking eligibility

    // Get wallet address from query params
    const url = new URL(req.url);
    const walletAddress = url.searchParams.get('wallet');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Connect to database and check if the wallet is in the top 10
    const [results] = await pool.query(
      'SELECT * FROM supernode_nft_recipients WHERE wallet_address = ?',
      [walletAddress]
    );

    const data = results as any[];

    if (!data.length) {
      return NextResponse.json({
        success: true,
        eligible: false,
        message: 'Wallet not eligible for Supernode NFT'
      });
    }

    const recipient = data[0];

    return NextResponse.json({
      success: true,
      eligible: true,
      claimed: recipient.claimed,
      rank: recipient.rank,
      claimWallet: recipient.claim_wallet,
      linkedWallet: recipient.linked_wallet,
      claimedAt: recipient.claimed_at
    });
  } catch (error) {
    console.error('Error checking Supernode NFT eligibility:', error);
    // Add more detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('connect') || errorMessage.includes('connection')) {
      console.error('Database connection error detected');
      return NextResponse.json(
        { success: false, error: 'Database connection error', details: errorMessage },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to check eligibility', details: errorMessage },
      { status: 500 }
    );
  }
}
