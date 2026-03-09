'use client';

import { ArrowLeft, GitCommit, Tag } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ReleaseEntry {
  version: string;
  date: string;
  tag: 'major' | 'minor' | 'patch';
  changes: { type: 'feat' | 'fix' | 'refactor' | 'perf'; text: string }[];
}

const RELEASES: ReleaseEntry[] = [
  {
    version: '1.1.0',
    date: '2026-03-06',
    tag: 'minor',
    changes: [
      { type: 'feat', text: 'Organism visualization tab — bio-luminescent cell rendering with force-directed layout' },
      { type: 'feat', text: 'NAAB Advisory Board cluster with amber color scheme and cluster-boundary connection' },
      { type: 'feat', text: 'Release logs page with full version history' },
      { type: 'feat', text: 'Project rename and multi-project support in sidebar' },
      { type: 'feat', text: 'Memory Log updated to reflect mem0 integration (episodic/factual memory types)' },
      { type: 'perf', text: 'Reduced polling intervals across all hooks (5-15s to 30-60s)' },
      { type: 'perf', text: 'SSE invalidation debouncing (200ms batch) in useAgentStream and usePulseStream' },
      { type: 'perf', text: 'OrganismCanvas wrapped in React.memo, selectedAgentId via ref' },
      { type: 'perf', text: 'Global staleTime increased to 30s, removed aggressive refetchInterval default' },
      { type: 'refactor', text: 'Removed Office tab from fleet page' },
      { type: 'refactor', text: 'Reordered sidebar navigation sections' },
      { type: 'refactor', text: 'Rebranded UI with configurable project names' },
    ],
  },
  {
    version: '1.0.3',
    date: '2026-03-05',
    tag: 'patch',
    changes: [
      { type: 'fix', text: 'Donarg tileset scaling for correct pixel-perfect rendering' },
      { type: 'feat', text: 'MetroCity sprite integration for agent characters' },
      { type: 'feat', text: 'Market Intel dashboard with competitive analysis data' },
    ],
  },
  {
    version: '1.0.2',
    date: '2026-03-04',
    tag: 'patch',
    changes: [
      { type: 'feat', text: 'Full Donarg furniture catalog for office environment' },
      { type: 'feat', text: 'Donarg tileset and MetroCity sprites visual overhaul' },
      { type: 'refactor', text: 'Reference OfficeCanvas implementation adapted for Next.js' },
    ],
  },
  {
    version: '1.0.1',
    date: '2026-03-03',
    tag: 'patch',
    changes: [
      { type: 'fix', text: 'Rewrite OfficeCanvas with proper rendering pipeline' },
      { type: 'fix', text: 'Map string agent IDs to numeric IDs for office rendering' },
      { type: 'feat', text: 'OfficeCanvas component with game loop integration' },
      { type: 'feat', text: 'Pixel-agents canvas engine integrated into lib/office/' },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-01',
    tag: 'major',
    changes: [
      { type: 'feat', text: 'Initial Mission Control dashboard with Agent Fleet, System Pulse, Memory Log' },
      { type: 'feat', text: 'Constellation graph visualization with force-directed layout' },
      { type: 'feat', text: 'Real-time SSE pulse stream from OpenClaw' },
      { type: 'feat', text: 'Cost tracking with 24h/7d/30d breakdowns and per-agent attribution' },
      { type: 'feat', text: 'Task Manager with sprint tracking and agent assignment' },
      { type: 'feat', text: 'DS Parity QA reporting with component-level test results' },
      { type: 'feat', text: 'Identity and security monitoring dashboard' },
      { type: 'feat', text: 'Dark theme UI with sidebar navigation' },
      { type: 'feat', text: 'Setup wizard for OpenClaw configuration' },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  feat: 'text-status-green',
  fix: 'text-status-amber',
  refactor: 'text-status-blue',
  perf: 'text-purple-400',
};

const TYPE_LABELS: Record<string, string> = {
  feat: 'FEAT',
  fix: 'FIX',
  refactor: 'REFAC',
  perf: 'PERF',
};

const TAG_STYLES: Record<string, string> = {
  major: 'bg-status-red/10 text-status-red border-status-red/20',
  minor: 'bg-status-green/10 text-status-green border-status-green/20',
  patch: 'bg-status-blue/10 text-status-blue border-status-blue/20',
};

export default function ReleasesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/fleet"
          className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Release Log</h1>
          <p className="text-xs text-text-muted">
            OpenClaw Dashboard version history
          </p>
        </div>
      </div>

      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-8 bottom-0 w-px bg-border" />

        {RELEASES.map((release, idx) => (
          <div key={release.version} className="relative pb-8">
            {/* Timeline dot */}
            <div className={cn(
              'absolute left-[12px] top-1.5 z-10 flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 border-border',
              idx === 0 ? 'bg-accent' : 'bg-surface',
            )}>
              {idx === 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </div>

            <div className="ml-12">
              {/* Version header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-text-muted" />
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    v{release.version}
                  </span>
                </div>
                <span className={cn(
                  'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                  TAG_STYLES[release.tag],
                )}>
                  {release.tag}
                </span>
                <span className="text-xs text-text-muted">{release.date}</span>
              </div>

              {/* Change list */}
              <ul className="mt-3 space-y-1.5">
                {release.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className={cn(
                      'mt-0.5 shrink-0 font-mono text-[10px] font-bold',
                      TYPE_COLORS[change.type],
                    )}>
                      {TYPE_LABELS[change.type]}
                    </span>
                    <span className="text-text-secondary">{change.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
