import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/db/queries';
import { resolveHomePath, safeJsonParse } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface CronJob {
  id: string;
  name: string;
  description: string;
  agent: string;
  enabled: boolean;
  schedule: string;
  lastRun: string | null;
  lastStatus: string | null;
  lastDurationMs: number | null;
  nextRun: string | null;
  prompt: string;
  error?: string;
}

function formatCronExpr(expr: string, tz?: string): string {
  // Return cron expression with optional timezone
  return tz ? `${expr} (${tz})` : expr;
}

export async function GET() {
  try {
    const config = getConfig();
    const dataDir = resolveHomePath(config.openclawDataDir);

    // Read cron jobs
    const cronFile = path.join(dataDir, 'cron', 'jobs.json');
    const cronData = safeJsonParse(
      fs.existsSync(cronFile) ? fs.readFileSync(cronFile, 'utf-8') : '{}',
      { jobs: [] }
    );

    const jobs: CronJob[] = [];

    // Handle different formats
    const rawJobs: any[] = cronData.jobs || (Array.isArray(cronData) ? cronData : []);

    for (const job of rawJobs) {
      // Use job.name as display name (NOT payload.message)
      const name = job.name || 'Unnamed Job';
      const description = job.description || '';

      // Use job.agentId (NOT job.agent)
      const agent = job.agentId || job.agent || 'main';

      // Parse schedule: use schedule.expr for cron-type, fallback to intervalMs
      let schedule = '';
      if (job.schedule?.kind === 'cron' && job.schedule?.expr) {
        schedule = formatCronExpr(job.schedule.expr, job.schedule.tz);
      } else if (job.schedule?.intervalMs) {
        const mins = Math.floor(job.schedule.intervalMs / 60000);
        schedule = mins >= 60 ? `every ${Math.floor(mins / 60)}h` : `every ${mins}m`;
      }

      // Use state.lastRunAtMs for last run time
      let lastRun: string | null = null;
      if (job.state?.lastRunAtMs) {
        lastRun = new Date(job.state.lastRunAtMs).toISOString();
      } else if (job.state?.lastRunAt) {
        lastRun = job.state.lastRunAt;
      }

      // Use state.nextRunAtMs for next run time
      let nextRun: string | null = null;
      if (job.state?.nextRunAtMs) {
        nextRun = new Date(job.state.nextRunAtMs).toISOString();
      }

      // Get status from state
      const lastStatus = job.state?.lastStatus || job.state?.lastRunStatus || null;
      const lastDurationMs = job.state?.lastDurationMs || null;

      // Get the full prompt from payload
      const prompt = job.payload?.message || job.payload?.text || '';

      jobs.push({
        id: job.id || `cron-${jobs.length}`,
        name,
        description,
        agent,
        enabled: job.enabled !== false,
        schedule,
        lastRun,
        lastStatus,
        lastDurationMs,
        nextRun,
        prompt,
        error: job.state?.lastError,
      });
    }

    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, jobs: [] }, { status: 500 });
  }
}
