import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/db/queries';
import { parseProviderConnections } from '@/lib/parsers/openclaw-logs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const providerName = req.nextUrl.searchParams.get('provider');
    if (!providerName) {
      return NextResponse.json({ error: 'Missing provider parameter' }, { status: 400 });
    }

    const config = getConfig();
    const connections = parseProviderConnections(config.openclawDataDir);
    const provider = connections.find(
      (c) => c.provider.toLowerCase() === providerName.toLowerCase(),
    );

    if (!provider) {
      return NextResponse.json({ error: `Provider '${providerName}' not found` }, { status: 404 });
    }

    return NextResponse.json({
      provider: provider.provider,
      status: provider.status,
      models: (provider as any).allModels || [],
      activeModels: (provider as any).activeModels || [],
      lastSuccessfulCall: provider.lastSuccessfulCall,
      keyAgeDays: provider.keyAgeDays,
      keyRotationDue: provider.keyRotationDue,
      totalSpendToday: (provider as any).totalSpendToday || 0,
      _meta: {
        source: 'openclaw',
        computedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
