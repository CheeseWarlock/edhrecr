import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.COOKIE_NAME || 'builder-auth';

// Routes that require authentication
const PROTECTED_ROUTES = ['/builder', '/api'];
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/calendar'];

async function verifyToken(token: string): Promise<boolean> {
  if (!JWT_SECRET) {
    return false;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jose.jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.log("Error verifying token: ", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const authToken = request.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = authToken ? await verifyToken(authToken) : false;

  const isApiRoute = pathname.startsWith('/api');
  if (isApiRoute) {
    if (PUBLIC_API_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }
    const authHeader = request.headers.get('Authorization');
    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.next();
    }
  }

  // Check if the current route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // For API routes, return a 401 Unauthorized response
    if (isApiRoute) {
      return new Response('Unauthorized', { status: 401 });
    }
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
    '/builder/:path*',
    '/login',
    '/api/:path*'
  ],
}; 