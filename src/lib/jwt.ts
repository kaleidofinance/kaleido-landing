// Lazy load jsonwebtoken to avoid build-time prototype errors
const getJwt = async () => await import('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  walletAddress: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the decoded payload
 * @param token - The JWT token to verify
 * @returns The decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const jwt = await getJwt();
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error: any) {
    const jwt = await getJwt();
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Creates a new JWT token
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 24h)
 * @returns The signed JWT token
 */
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '24h'): Promise<string> {
  const jwt = await getJwt();
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
