import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { getLeaderboard } from "@/lib/leaderboard";
import { getUserPoints } from "@/lib/mysql";

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET handler for retrieving leaderboard data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        console.log('Leaderboard API called');
        
        // Get JWT token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            console.log('Authentication failed: No Bearer token');
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        console.log('Verifying token...');
        const decoded = await verifyToken(token);
        if (!decoded?.walletAddress) {
            console.log('Invalid token:', decoded);
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        console.log('Token verified for wallet:', decoded.walletAddress);

        // Connect to MongoDB and verify registration
        console.log('Connecting to MongoDB...');
        const { db } = await connectToDatabase();
        const registration = await db.collection('kaleido').findOne({
            walletAddress: decoded.walletAddress.toLowerCase(),
            $or: [{ status: 'approved' }, { status: 'pending' }]
        });

        if (!registration?.walletAddress) {
            console.log('User not registered');
            return NextResponse.json({ error: "User not registered" }, { status: 401 });
        }
        console.log('User registration found:', registration.walletAddress);

        // As a fallback, let's try to get at least the user's points
        try {
            console.log('Getting user points as fallback...');
            const userPoints = await getUserPoints(registration.walletAddress);
            console.log('User points:', userPoints);
            
            // Create a simplified leaderboard with just the current user
            const simplifiedLeaderboard = {
                topUsers: [{
                    rank: 1,
                    walletAddress: registration.walletAddress,
                    total_points: userPoints.total_points,
                    username: registration.walletAddress.substring(0, 6) + '...' + registration.walletAddress.substring(registration.walletAddress.length - 4)
                }],
                currentUser: {
                    rank: 1,
                    walletAddress: registration.walletAddress,
                    total_points: userPoints.total_points,
                    username: registration.walletAddress.substring(0, 6) + '...' + registration.walletAddress.substring(registration.walletAddress.length - 4)
                }
            };
            
            // Try to get the full leaderboard
            try {
                console.log('Getting leaderboard data...');
                const limit = 20; // Top 20 users
                const leaderboard = await getLeaderboard(registration.walletAddress, limit);
                console.log('Leaderboard data retrieved successfully');
                return NextResponse.json({ leaderboard });
            } catch (leaderboardError) {
                console.error('Error getting full leaderboard:', leaderboardError);
                // Return the simplified leaderboard as a fallback
                return NextResponse.json({ leaderboard: simplifiedLeaderboard });
            }
        } catch (pointsError) {
            console.error('Error getting user points:', pointsError);
            throw pointsError; // Re-throw to be caught by the outer catch
        }
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return NextResponse.json({ 
            error: "Failed to get leaderboard data", 
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
