import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kaleido');
    const collection = db.collection('kaleido');

    // Sample test data
    const testData = {
      walletAddress: '0xtest123',
      email: 'test@example.com',
      referralCode: 'TEST123',
      points: 100,
      lastUpdated: new Date(),
      transactions: [],
      socialTasks: {
        twitter: true,
        discord: true,
        telegram: true
      },
      agreedToTerms: true,
      xUsername: 'testuser'
    };

    // Clear existing test data
    await collection.deleteOne({ walletAddress: testData.walletAddress });

    // Insert test data
    const result = await collection.insertOne(testData);

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: 'Test data seeded successfully',
        data: testData
      });
    } else {
      throw new Error('Failed to insert test data');
    }

  } catch (error) {
    console.error('Error seeding test data:', error);
    return NextResponse.json(
      { error: 'Failed to seed test data' },
      { status: 500 }
    );
  }
}
