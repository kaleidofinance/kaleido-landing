import { NextRequest, NextResponse } from 'next/server';

// This route is just for health checks
// The actual WebSocket server runs separately via PM2
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok',
    message: 'WebSocket health check endpoint'
  });
}

// No WebSocket server here - it runs in a separate process
// See websocket-server.ts in the root directory
