import { NextRequest, NextResponse } from 'next/server';
import { getCompetitors, insertCompetitor, seedDefaultCompetitors } from '@/lib/db/queries';

export async function GET() {
  seedDefaultCompetitors();
  const competitors = getCompetitors();
  return NextResponse.json({ competitors });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, url, description, category } = body;
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const id = insertCompetitor({ name, url, description, category });
  return NextResponse.json({ id }, { status: 201 });
}
