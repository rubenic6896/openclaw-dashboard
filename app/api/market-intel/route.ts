import { NextRequest, NextResponse } from 'next/server';
import { getMarketSignals, getMarketSignalTypes, insertMarketSignal } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const fields = searchParams.get('fields');
    const signals = getMarketSignals({ type });

    // Lightweight dedup mode: return only url + title (~90% smaller response)
    if (fields === 'dedup') {
      return NextResponse.json({
        signals: signals.map((s: any) => ({ url: s.url, title: s.title, date_iso: s.date_iso })),
      });
    }

    const types = getMarketSignalTypes();
    return NextResponse.json({ signals, types });
  } catch (error: any) {
    console.error('[market-intel] GET error:', error.message, error.stack);
    return NextResponse.json({ error: error.message, signals: [], types: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[market-intel] POST received:', Array.isArray(body) ? `${body.length} items` : '1 item');
    const items = Array.isArray(body) ? body : [body];
    for (const item of items) {
      if (!item.url || !item.type || !item.title) {
        console.error('[market-intel] Validation failed: missing required fields', JSON.stringify(item, null, 2));
        return NextResponse.json(
          { error: 'Required fields: url, type, title' },
          { status: 400 },
        );
      }
      insertMarketSignal(item);
      console.log('[market-intel] Inserted:', item.url);
    }
    return NextResponse.json({ inserted: items.length });
  } catch (error: any) {
    console.error('[market-intel] POST error:', error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
