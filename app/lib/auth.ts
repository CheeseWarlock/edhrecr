import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const AUTH_SECRET = process.env.AUTH_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || 'builder-auth';

if (!AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required');
}

export interface AuthToken {
  authenticated: boolean;
  timestamp: number;
}

export function signToken(): string {
  const payload: AuthToken = {
    authenticated: true,
    timestamp: Date.now()
  };
  
  return jwt.sign(payload, AUTH_SECRET!, { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthToken | null {
  if (!AUTH_SECRET) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as AuthToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getAuthTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthTokenFromCookie();
  if (!token) return false;
  
  const decoded = verifyToken(token);
  return decoded !== null;
} 