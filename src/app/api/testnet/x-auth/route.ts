import { NextRequest, NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { TwitterApi } from 'twitter-api-v2';

// You may need to install 'twitter-api-v2' or similar for OAuth 2.0
// import { TwitterApi } from 'twitter-api-v2';

// TODO: Fill in with your actual project X handle
const PROJECT_X_HANDLE = process.env.X_PROJECT_HANDLE || 'YourProjectHandle';
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET!;
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL!;

// Twitter scopes needed for reading user and following info
const SCOPE = [
  'tweet.read',
  'users.read',
  'offline.access',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const walletAddress = searchParams.get('wallet'); // Pass wallet in state or as param

  // 1. If no code, start OAuth flow
  if (!code) {
    // Generate a random state for CSRF protection (could be improved)
    const stateParam = walletAddress || Math.random().toString(36).substring(2);
    const client = new TwitterApi({
      clientId: TWITTER_CLIENT_ID,
      clientSecret: TWITTER_CLIENT_SECRET,
    });
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      TWITTER_CALLBACK_URL,
      { scope: SCOPE, state: stateParam }
    );
    // Store codeVerifier in a cookie (or session, for demo use cookie)
    const response = NextResponse.redirect(url);
    response.cookies.set('twitter_oauth_code_verifier', codeVerifier, { httpOnly: true, path: '/' });
    response.cookies.set('twitter_oauth_state', state, { httpOnly: true, path: '/' });
    if (walletAddress) response.cookies.set('twitter_wallet', walletAddress, { httpOnly: true, path: '/' });
    return response;
  }

  // 2. Handle callback: exchange code for access token
  const codeVerifier = req.cookies.get('twitter_oauth_code_verifier')?.value;
  const stateCookie = req.cookies.get('twitter_oauth_state')?.value;
  const wallet = req.cookies.get('twitter_wallet')?.value || walletAddress;
  if (!codeVerifier || !stateCookie) {
    return NextResponse.json({ error: 'Missing OAuth state or code verifier.' }, { status: 400 });
  }
  if (state && state !== stateCookie) {
    return NextResponse.json({ error: 'Invalid OAuth state.' }, { status: 400 });
  }
  const client = new TwitterApi({
    clientId: TWITTER_CLIENT_ID,
    clientSecret: TWITTER_CLIENT_SECRET,
  });
  let accessToken, refreshToken, expiresIn, clientUser;
  try {
    const {
      client: loggedClient,
      accessToken: at,
      refreshToken: rt,
      expiresIn: ei,
      scope,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: TWITTER_CALLBACK_URL,
    });
    accessToken = at;
    refreshToken = rt;
    expiresIn = ei;
    clientUser = loggedClient;
  } catch (err) {
    return NextResponse.json({ error: 'Failed to authenticate with X', details: err }, { status: 500 });
  }

  // 3. Fetch user info
  let userInfo;
  try {
    userInfo = await clientUser.v2.me({ 'user.fields': ['id', 'name', 'username'] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch X user info', details: err }, { status: 500 });
  }

  // 4. Update MongoDB registration (no follow check)
  try {
    const client = await clientPromise;
    const db = client.db('kaleido');
    const collection = db.collection('kaleido');
    // Check if xId is already linked to another wallet
    const existing = await collection.findOne({ xId: userInfo.data.id, walletAddress: { $ne: wallet?.toLowerCase() } });
    if (existing) {
      // Set error cookie and redirect
      const response = NextResponse.redirect('https://kaleidofinance.xyz/testnet');
      response.cookies.set('x_link_error', '1', { path: '/testnet', maxAge: 60 }); // 1 minute
      return response;
    }
    const update = await collection.findOneAndUpdate(
      { walletAddress: wallet?.toLowerCase() },
      {
        $set: {
          xId: userInfo.data.id,
          xUsername: userInfo.data.username,
          xProfile: userInfo.data,
        },
      },
      { returnDocument: 'after' }
    );
    if (!update.value) {
      return NextResponse.json({ error: 'User not found for wallet', wallet }, { status: 404 });
    }
    // Optionally, clear cookies
    const response = NextResponse.redirect('https://kaleidofinance.xyz/testnet');
    response.cookies.set('twitter_oauth_code_verifier', '', { maxAge: 0, path: '/' });
    response.cookies.set('twitter_oauth_state', '', { maxAge: 0, path: '/' });
    response.cookies.set('twitter_wallet', '', { maxAge: 0, path: '/' });
    response.cookies.set('x_link_success', '1', { path: '/testnet', maxAge: 60 }); // 1 minute
    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update registration', details: err }, { status: 500 });
  }
} 