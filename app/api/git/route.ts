import { NextResponse } from 'next/server';
import { getGitInfo } from '@/lib/git/repo';
import { getConfig } from '@/lib/db/queries';
import { resolveHomePath } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getConfig();
    if (!config.projectRepoPath) {
      return NextResponse.json({ error: 'No repo path configured', git: null });
    }

    const repoPath = resolveHomePath(config.projectRepoPath);
    const gitInfo = await getGitInfo(repoPath);

    return NextResponse.json({ git: gitInfo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, git: null }, { status: 500 });
  }
}
