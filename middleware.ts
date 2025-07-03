import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const AUTH_SECRET = process.env.AUTH_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || 'builder-auth';

// Routes that require authentication
const PROTECTED_ROUTES = ['/builder'];

async function verifyToken(token: string): Promise<boolean> {
  if (!AUTH_SECRET) {
    return false;
  }
  try {
    const secret = new TextEncoder().encode(AUTH_SECRET);
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.log("Error verifying token: ", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies
  const authToken = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = authToken ? await verifyToken(authToken) : false;

  // Check if the current route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login page while already authenticated, redirect to builder
  if (pathname === '/login' && isAuthenticated) {
    const builderUrl = new URL('/builder', request.url);
    return NextResponse.redirect(builderUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/builder/:path*',
    // Login page (to redirect authenticated users away)
    '/login'
  ],
}; 