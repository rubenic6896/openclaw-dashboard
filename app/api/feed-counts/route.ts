import { NextRequest, NextResponse } from 'next/server'
import { getFeedCounts } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || 'default';
    const counts = getFeedCounts({ projectId })
    const res = NextResponse.json(counts)
    res.headers.set('Cache-Control', 'public, max-age=30')
    return res
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, marketIntel: 0, techUpdates: 0, practitionerSignals: 0 },
      { status: 500 },
    )
  }
}
