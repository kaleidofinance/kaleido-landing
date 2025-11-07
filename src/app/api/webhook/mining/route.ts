import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Get the webhook signature from headers
    const signature = req.headers.get('x-webhook-signature');
    
    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing webhook signature' },
        { status: 401 }
      );
    }
    
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET is not defined in environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Get the request body as text
    const body = await req.text();
    
    // Verify the signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');
    
    if (calculatedSignature !== signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Parse the body
    const data = JSON.parse(body);
    
    // Validate required fields
    if (!data.event || !data.wallet_address) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Process the webhook notification
    // In a real implementation, you would store this in a database or message queue
    // For now, we'll just log it and return success
    console.log('Received mining webhook notification:', data);
    
    // In a production environment, you would broadcast this to connected clients
    // using WebSockets or a similar real-time communication method
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Signature',
      'Access-Control-Max-Age': '86400',
    },
  });
}
