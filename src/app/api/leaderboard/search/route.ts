import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const usernameParam = (searchParams.get("username") || "").trim();
    if (!usernameParam) {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    const usernameNoAt = usernameParam.replace(/^@/, "");
    const usernameRegex = new RegExp(`^${usernameNoAt}$`, "i");

    const { db } = await connectToDatabase();
    const collection = db.collection("kaleido");
    const baseFilter = { xProfile: { $exists: true }, balance: { $type: "number" } } as const;

    const userDoc = await collection.findOne(
      { ...baseFilter, $or: [{ "xProfile.username": usernameRegex }, { xUsername: usernameRegex }] },
      { projection: { balance: 1, xUsername: 1, "xProfile.username": 1, walletAddress: 1, _id: 0 } }
    );

    if (!userDoc || typeof userDoc.balance !== "number") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const higherCount = await collection.countDocuments({ ...baseFilter, balance: { $gt: userDoc.balance } });
    const rank = higherCount + 1;

    const xUsername = (userDoc as any).xProfile?.username || (userDoc as any).xUsername || null;

    return NextResponse.json({
      user: {
        walletAddress: (userDoc as any).walletAddress,
        xUsername,
        balance: (userDoc as any).balance,
        rank,
      },
    });
  } catch (error) {
    console.error("Error searching leaderboard user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

