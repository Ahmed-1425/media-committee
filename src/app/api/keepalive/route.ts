import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const startTime = Date.now();

    // Query a lightweight record to keep Supabase PostgreSQL and API active
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const durationMs = Date.now() - startTime;

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: error.message,
          timestamp: new Date().toISOString(),
          durationMs,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'active',
      message: 'Supabase database is active and keep-alive ping succeeded',
      profilesCount: count,
      durationMs,
      timestamp: new Date().toISOString(),
      timezone: process.env.NEXT_PUBLIC_APP_TIMEZONE || 'Asia/Riyadh',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Unknown error occurred during keepalive',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
