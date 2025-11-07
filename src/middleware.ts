import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter } from './middleware/rateLimiter';

// List of endpoints that bypass rate limiting
const EXEMPT_ENDPOINTS = [
  '/api/testnet/balance',
  '/api/testnet/check-registration',
  '/api/testnet/register',
  '/api/testnet/claim-points',
  '/api/testnet/claim-comment-points',
  '/api/testnet/claim-comment-back-points',
  '/api/testnet/update-balance',
  '/api/testnet/user'  // Exempt user endpoint to prevent verification issues
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip rate limiting for exempt endpoints
  if (EXEMPT_ENDPOINTS.some(endpoint => path === endpoint)) {
    return NextResponse.next()
  }

  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = await rateLimiter(request);
    if (response) return response;
  }

  // Continue with the request if rate limit not exceeded
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
