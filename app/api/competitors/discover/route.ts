import { NextRequest, NextResponse } from 'next/server';
import { getCompetitors } from '@/lib/db/queries';

// Configure your product context here for competitor discovery
const PRODUCT_CONTEXT = process.env.COMPETITOR_PRODUCT_CONTEXT || `Your product is a software platform. Update this context in environment variable COMPETITOR_PRODUCT_CONTEXT or edit this file to describe your product and competitive landscape for better discovery results.`;

function gatewayPort(): number {
  return parseInt(process.env.OPENCLAW_GATEWAY_PORT || '18789', 10);
}

function gatewayToken(): string {
  return process.env.OPENCLAW_GATEWAY_TOKEN || '';
}

export async function POST(req: NextRequest) {
  const existing = getCompetitors();
  const existingNames = existing.map((c: any) => c.name).join(', ');

  const prompt = `You are a competitive intelligence researcher.

${PRODUCT_CONTEXT}

Already tracked competitors: ${existingNames}

Find 5-10 NEW competitors or emerging startups in this space that are NOT in the list above. Focus on:
- Direct competitors offering similar core functionality
- Adjacent tools that overlap with key features
- Emerging startups disrupting this space
- Tools that target the same buyer persona

For each competitor found, return a JSON array with objects like:
{ "name": "Company Name", "url": "https://...", "description": "What they do", "category": "Category" }

Return ONLY the JSON array, no other text.`;

  try {
    const res = await fetch(`http://localhost:${gatewayPort()}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gatewayToken() ? { 'Authorization': `Bearer ${gatewayToken()}` } : {}),
      },
      body: JSON.stringify({
        model: 'kilocode/x-ai/grok-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Gateway error: ${res.status}`, details: text }, { status: 502 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse response', raw: content }, { status: 500 });
    }

    const discovered = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ discovered });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to reach researcher agent', details: err.message },
      { status: 503 },
    );
  }
}
