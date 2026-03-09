import { NextRequest, NextResponse } from 'next/server';
import { computeDailyHistoryDetailed } from '@/lib/parsers/session-cost';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const days = parseInt(req.nextUrl.searchParams.get('days') || '30', 10);
    const history = computeDailyHistoryDetailed(Math.min(days, 90));

    return NextResponse.json({
      history,
      _meta: {
        source: 'openclaw',
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
