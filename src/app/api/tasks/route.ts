import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { getTasks, claimTask, getUserPoints } from "@/lib/mysql";

/**
 * GET handler for retrieving tasks
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Get JWT token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);
        if (!decoded?.walletAddress) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Connect to MongoDB and verify registration
        const { db } = await connectToDatabase();
        const registration = await db.collection('kaleido').findOne({
            walletAddress: decoded.walletAddress.toLowerCase(),
            $or: [{ status: 'approved' }, { status: 'pending' }]
        });

        if (!registration?.walletAddress) {
            return NextResponse.json({ error: "User not registered" }, { status: 401 });
        }

        // Get tasks and points
        const tasks = await getTasks(registration.walletAddress);
        const points = await getUserPoints(registration.walletAddress);

        return NextResponse.json({ tasks, points });
    } catch (error) {
        console.error('Error getting tasks:', error);
        return NextResponse.json({ error: "Failed to get tasks" }, { status: 500 });
    }
}

/**
 * POST handler for claiming tasks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Get JWT token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Authentication failed, please reconnect your wallet" }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = await verifyToken(token);
        if (!decoded?.walletAddress) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Connect to MongoDB and verify registration
        const { db } = await connectToDatabase();
        const registration = await db.collection('kaleido').findOne({
            walletAddress: decoded.walletAddress.toLowerCase(),
            $or: [{ status: 'approved' }, { status: 'pending' }]
        });

        if (!registration?.walletAddress) {
            return NextResponse.json({ error: "User not registered" }, { status: 401 });
        }

        // Get task ID from request
        const { taskId } = await request.json();
        if (!taskId) {
            return NextResponse.json({ error: "Task ID required" }, { status: 400 });
        }

        // Claim task
        await claimTask(registration.walletAddress, taskId);

        // Get updated tasks and points
        const tasks = await getTasks(registration.walletAddress);
        const points = await getUserPoints(registration.walletAddress);

        return NextResponse.json({ success: true, tasks, points });
    } catch (error: any) {
        console.error('Error claiming task:', error);
        return NextResponse.json({ 
            error: error.message || "Failed to claim task" 
        }, { status: error.message === "Task already claimed" ? 400 : 500 });
    }
}
