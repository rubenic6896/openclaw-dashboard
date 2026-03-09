import { NextResponse } from 'next/server';
import { getDSSummary, getDSDistinctComponents, getDSDistinctBatches } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = getDSSummary();
    const components = getDSDistinctComponents();
    const batches = getDSDistinctBatches();
    return NextResponse.json({ ...summary, availableComponents: components, availableBatches: batches });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }
}
