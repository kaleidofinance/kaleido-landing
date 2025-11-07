import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { generateReferralCode } from '@/utils/referral';
// import { Redis } from 'ioredis';
import { DeviceInfo } from '@/utils/deviceFingerprint';
import { createToken } from '@/lib/jwt';

// Redis initialization and event handlers removed

// Database and collection names
const DB_NAME = 'kaleido';
const COLLECTION_NAME = 'kaleido';

export async function POST(req: Request) {
  try {
    const instanceId = process.env.INSTANCE_ID || '0';
    const body = await req.json();

    const { email, walletAddress, socialTasks, agreedToTerms, referredBy, deviceInfo } = body;

    // Validate required fields
    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: 'Email and wallet address are required' },
        { status: 400 }
      );
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the terms and conditions' },
        { status: 400 }
      );
    }

    // Validate social tasks
    if (!socialTasks?.twitter || !socialTasks?.telegram || !socialTasks?.discord) {
      return NextResponse.json(
        { error: 'All social tasks must be completed' },
        { status: 400 }
      );
    }

    
    // 1. Check for VPN/Proxy
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isProxy = await checkForProxy(ip);
    if (isProxy) {
      return NextResponse.json({ error: 'VPN/Proxy detected' }, { status: 403 });
    }

    // 2. Rate limiting by IP (DISABLED: Redis removed)
    // const ipKey = `ratelimit:ip:${ip}`;
    // const ipLimit = await checkRateLimit(ipKey, 20, 3600); // Increased to 20 attempts per hour
    // if (!ipLimit.allowed) {
    //   return NextResponse.json({ error: 'Too many attempts from this IP' }, { status: 429 });
    // }

    // 3. Device fingerprint checks (DISABLED: Redis removed)
    // if (deviceInfo?.fingerprint) {
    //   const fingerprintKey = `device:${deviceInfo.fingerprint}`;
    //   const deviceCount = await redis.scard(fingerprintKey);
    //   if (deviceCount >= 5) { // Increased to 5 accounts per device
    //     return NextResponse.json({ error: 'Device limit reached' }, { status: 403 });
    //   }
    if (deviceInfo?.fingerprint) {

      // 4. Browser automation detection
      if (isBotBehavior(deviceInfo)) {
        // Only block extremely obvious bot behavior
        const riskScore = calculateRiskScore({
          hasDeviceInfo: true,
          isKnownIP: true,
          socialTasksCompleted: Object.values(socialTasks).filter(Boolean).length,
          referralPresent: Boolean(referredBy)
        });
        
        if (riskScore > 0.8) { // Only block very high risk scores
          return NextResponse.json({ error: 'Automated behavior detected' }, { status: 403 });
        }
      }

      // 5. Time-based patterns - check removed due to no Redis
    }

    // Store IP for monitoring (DISABLED: Redis removed)
    // await redis.sadd(`ip:${ip}`, walletAddress);
    // await redis.expire(`ip:${ip}`, 24 * 60 * 60); // 24 hours expiry

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check for existing wallet with retry
    const maxRetries = 3;
    let retryCount = 0;
    let registrationSuccess = false;

    while (retryCount < maxRetries && !registrationSuccess) {
      try {
        // Check for existing wallet
        const existingWallet = await collection.findOne({ walletAddress });
        if (existingWallet) {
          return NextResponse.json({ error: 'Wallet already registered' }, { status: 400 });
        }

        // Check for existing email
        const existingEmail = await collection.findOne({ email });
        if (existingEmail) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Check for multiple registrations from same IP subnet (DISABLED: Redis removed)
        const ipParts = ip.split('.');
        const ipSubnet = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`;
        const subnetCount = 0;

        

        // Remove X username validation and related checks
        // Remove X username from registration object
        const registration = {
          email,
          walletAddress,
          socialTasks,
          agreedToTerms,
          referredBy: referredBy || null,
          deviceInfo: deviceInfo || null,
          registrationMeta: {
            ip,
            ipSubnet,
            userAgent: req.headers.get('user-agent'),
            registrationTime: new Date(),
            lastSeenTime: new Date(),
            registrationSource: deviceInfo ? 'browser' : 'other',
            riskScore: calculateRiskScore({
              hasDeviceInfo: !!deviceInfo,
              isKnownIP: subnetCount > 0,
              socialTasksCompleted: Object.values(socialTasks).filter(Boolean).length,
              referralPresent: !!referredBy
            })
          },
          status: 'pending',
          referralCode: await generateReferralCode(collection),
          earnings: 0,
          referralCount: 0,
          referralEarnings: 0
        };

        // Insert with write concern majority and longer timeout
        const result = await collection.insertOne(registration, {
          writeConcern: { w: 'majority', wtimeout: 15000 }
        });

        if (result.acknowledged) {
          // Verify the write was successful
          const verifyWrite = await collection.findOne({ _id: result.insertedId });
          if (verifyWrite) {
            registrationSuccess = true;

            // Create JWT token for the registered user
            const token = await createToken({
              walletAddress,
              email,
              status: 'approved'
            });

            // If referral exists, update the referrer's referral count
            if (referredBy) {
              try {
                const referrerUpdate = await collection.findOneAndUpdate(
                  { referralCode: referredBy },
                  { 
                    $inc: { 
                      referralCount: 1,
                      referralEarnings: 100 // Base referral bonus points
                    }
                  },
                  { 
                    returnDocument: 'after',
                    projection: { referralCount: 1, referralCode: 1 }
                  }
                );

                // Get the updated referrer document after the update
                const updatedReferrer = await collection.findOne({ referralCode: referredBy });
                
                // Calculate referral bonus based on new referral count
                if (updatedReferrer && updatedReferrer.referralCount !== undefined) {
                  const referralBonus = calculateReferralBonus(updatedReferrer.referralCount);
                  
                  await collection.updateOne(
                    { referralCode: referredBy },
                    { 
                      $set: { 
                        referralBonus: referralBonus 
                      }
                    }
                  );
                }
              } catch (error) {
                console.error('Error updating referrer:', error);
                // Non-critical error, continue with registration
              }
            }

            return NextResponse.json({
              success: true,
              message: 'Registration successful',
              token,
              referralCode: registration.referralCode 
            }, { status: 201 });
          }
        }

        // If we reach here, write verification failed
        throw new Error('Write verification failed');

      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error('Registration failed after max retries:', error);
          return NextResponse.json(
            { error: 'Registration failed, please try again' },
            { status: 500 }
          );
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  } catch (error: any) {
    console.error('API: Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function checkForProxy(ip: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://proxycheck.io/v2/${ip}?key=${process.env.PROXY_CHECK_API_KEY}&vpn=1`
    );
    const data = await response.json();
    return data[ip]?.proxy === 'yes';
  } catch {
    return false; // Fail open if service is unavailable
  }
}

function isBotBehavior(deviceInfo: DeviceInfo): boolean {
  // Check for common bot indicators
  const suspicious = [
    !deviceInfo.hardwareConcurrency,
    !deviceInfo.deviceMemory,
    deviceInfo.platform === 'unknown',
    /headless/i.test(deviceInfo.userAgent),
    /phantom/i.test(deviceInfo.userAgent),
    /selenium/i.test(deviceInfo.userAgent),
    /puppet/i.test(deviceInfo.userAgent)
  ];

  return suspicious.some(flag => flag);
}

function calculateRiskScore({
  hasDeviceInfo,
  isKnownIP,
  socialTasksCompleted,
  referralPresent
}: {
  hasDeviceInfo: boolean;
  isKnownIP: boolean;
  socialTasksCompleted: number;
  referralPresent: boolean;
}): number {
  let score = 0;
  
  // Device fingerprint present (+30 trust)
  if (hasDeviceInfo) score += 30;
  
  // Known IP subnet (+20 trust)
  if (isKnownIP) score += 20;
  
  // Social tasks completed (up to +30 trust)
  score += socialTasksCompleted * 10;
  
  // Referred by existing user (+20 trust)
  if (referralPresent) score += 20;
  
  return score / 100; // 0-1, higher is better
}

function calculateReferralBonus(referralCount: number): number {
  // Each referral gives 20% bonus
  return referralCount * 20;
}
