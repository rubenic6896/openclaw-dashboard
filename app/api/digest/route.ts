import { NextResponse } from 'next/server';
import { generateDailyDigest } from '@/lib/scheduler/digest';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const entryId = await generateDailyDigest();
    return NextResponse.json({ success: true, entryId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
