import { NextResponse } from 'next/server';
import { getAvailableAndSpecialDays } from '../../lib/daily-cards';

export async function GET() {
  try {
    const availableDays = await getAvailableAndSpecialDays();
    return NextResponse.json(availableDays);
  } catch (error) {
    console.error('Error fetching available days:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available days' },
      { status: 500 }
    );
  }
}
