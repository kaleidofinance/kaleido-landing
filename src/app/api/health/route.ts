import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    // Check MongoDB connection
    let mongoStatus = 'disconnected'
    try {
      const { db } = await connectToDatabase()
      const result = await db.command({ ping: 1 })
      mongoStatus = result?.ok === 1 ? 'connected' : 'disconnected'
    } catch (error) {
      console.error('MongoDB health check error:', error)
    }

    // Get system info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    }

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          mongodb: mongoStatus,
        },
        system: systemInfo,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}
