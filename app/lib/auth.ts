import * as jose from 'jose';
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

export async function signToken(): Promise<string> {
  const payload = {
    authenticated: true,
    timestamp: Date.now()
  };
  
  const secret = new TextEncoder().encode(AUTH_SECRET!);
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthToken | null> {
  if (!AUTH_SECRET) {
    return null;
  }
  try {
    const secret = new TextEncoder().encode(AUTH_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      authenticated: payload.authenticated as boolean,
      timestamp: payload.timestamp as number
    };
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
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
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
  
  const decoded = await verifyToken(token);
  return decoded !== null;
} 