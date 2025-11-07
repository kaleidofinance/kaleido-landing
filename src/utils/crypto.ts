import CryptoJS from 'crypto-js';

// Get encryption key and salt from environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';
const ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || '';

if (!ENCRYPTION_KEY || !ENCRYPTION_SALT) {
  console.error('Encryption key or salt not found in environment variables');
}

/**
 * Encrypts data with AES-256 and adds an HMAC for integrity
 */
export function encryptData(data: any, wallet: string): string {
  try {
    if (!data || !wallet) return '';

    // Convert data to string if it's an object
    const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Generate key for this wallet
    const uniqueKey = generateKey(wallet);
    
    // Create hash for integrity check
    const hash = CryptoJS.HmacSHA256(text + wallet, uniqueKey).toString();
    
    // Create payload
    const payload = {
      data: text,
      hash,
      wallet,
      timestamp: Date.now()
    };

    // Encrypt using AES
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      uniqueKey
    ).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

/**
 * Decrypts and verifies the integrity of stored data
 */
export function decryptData(encrypted: string, wallet: string): any | null {
  if (!encrypted || !wallet) return null;

  try {
    // Generate key for this wallet
    const uniqueKey = generateKey(wallet);
    
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encrypted, uniqueKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      console.error('Decryption resulted in empty string');
      return null;
    }

    // Parse the decrypted payload
    const payload = JSON.parse(decrypted);
    
    // Validate payload
    if (!payload || typeof payload !== 'object') {
      console.error('Invalid payload structure');
      return null;
    }

    // Verify wallet matches
    if (payload.wallet !== wallet) {
      console.error('Wallet mismatch in stored data');
      return null;
    }

    // Verify hash
    const expectedHash = CryptoJS.HmacSHA256(payload.data + wallet, uniqueKey).toString();
    if (payload.hash !== expectedHash) {
      console.error('Data integrity check failed');
      return null;
    }

    // Parse the final data
    try {
      return JSON.parse(payload.data);
    } catch {
      return payload.data;
    }
  } catch (error) {
    // Don't log error here as it's expected when trying to decrypt old format
    return null;
  }
}

/**
 * Generates a unique key for each wallet using PBKDF2
 */
function generateKey(wallet: string): string {
  return CryptoJS.PBKDF2(
    wallet + ENCRYPTION_KEY,
    ENCRYPTION_SALT,
    {
      keySize: 256 / 32,
      iterations: 1000
    }
  ).toString();
}
