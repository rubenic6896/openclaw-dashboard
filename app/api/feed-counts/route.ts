import { NextResponse } from 'next/server'
import { getFeedCounts } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const counts = getFeedCounts()
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
