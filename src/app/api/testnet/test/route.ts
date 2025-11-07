import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('kaleido');
    const collection = db.collection('kaleido');
    
    // Try to insert a test document
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'MongoDB connection test'
    };

    const result = await collection.insertOne(testDoc);
    
    if (result.acknowledged) {
      // Clean up test document
      await collection.deleteOne({ _id: result.insertedId });
      
      return NextResponse.json({
        success: true,
        message: 'MongoDB connection test successful'
      });
    } else {
      throw new Error('Failed to insert test document');
    }
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json(
      { error: 'MongoDB connection test failed' },
      { status: 500 }
    );
  }
}
