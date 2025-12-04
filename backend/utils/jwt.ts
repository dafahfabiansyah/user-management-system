import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface JWTPayload {
  userId: number;
  email: string;
}

/**
 * Generate Access Token (short-lived)
 * @param payload - Data yang akan di-encode dalam token
 * @returns JWT access token string
 */
export function generateAccessToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}

/**
 * Generate Refresh Token (long-lived, random string)
 * @returns Secure random token string
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Verify Access Token
 * @param token - JWT access token string
 * @returns Decoded payload atau null jika invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Calculate refresh token expiry date
 * @returns Date object for expiry
 */
export function getRefreshTokenExpiry(): Date {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  const days = parseInt(expiresIn.replace('d', ''));
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}
