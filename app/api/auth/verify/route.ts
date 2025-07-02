import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    
    if (authenticated) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 