'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import {
  TrendingUp,
  ExternalLink,
  Calendar,
  Tag,
  Lightbulb,
  CheckCircle2,
  Search,
  DollarSign,
  Rocket,
  CalendarDays,
  BarChart3,
} from 'lucide-react';

interface MarketSignal {
  url: string;
  type: string;
  source: string;
  competitor: string | null;
  title: string;
  context: string;
  analysis: string;
  tags_json: string;
  date: string;
  date_iso: string;
  ingested_at: string;
}

interface SignalType {
  type: string;
  count: number;
}

const TYPE_META: Record<string, { label: string; color: string; icon: typeof Lightbulb }> = {
  funding: { label: 'Funding', color: 'text-status-green', icon: DollarSign },
  launch: { label: 'Launch', color: 'text-status-blue', icon: Rocket },
  pricing: { label: 'Pricing', color: 'text-status-amber', icon: BarChart3 },
  event: { label: 'Event', color: 'text-accent', icon: CalendarDays },
};

export default function MarketIntelPage() {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<{ signals: MarketSignal[]; types: SignalType[] }>({
    queryKey: ['market-intel', activeType],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeType) params.set('type', activeType);
      return fetch(`/api/market-intel?${params}`).then((r) => r.json());
    },
    refetchInterval: 60000,
  });

  const signals = data?.signals ?? [];
  const types = data?.types ?? [];

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return signals;
    const q = searchQuery.toLowerCase();
    return signals.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.context.toLowerCase().includes(q) ||
        s.analysis.toLowerCase().includes(q),
    );
  }, [signals, searchQuery]);

  const grouped = useMemo(() => {
    const dateMap = new Map<string, MarketSignal[]>();
    for (const s of filtered) {
      const d = s.date_iso || s.date || 'Unknown';
      if (!dateMap.has(d)) {
        dateMap.set(d, []);
      }
      dateMap.get(d)!.push(s);
    }
    // Sort groups by date descending (newest first)
    const groups = Array.from(dateMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, items }));
    return groups;
  }, [filtered]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <LoadingSkeleton variant="text" className="h-8 w-48" />
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-accent/10 p-2">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-primary">Market Intel</h1>
            <p className="text-xs text-text-muted">
              {signals.length} signals from {new Set(signals.map((s) => s.source)).size} sources
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signals..."
            className="rounded-md border border-border bg-surface py-1.5 pl-8 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </header>

      {/* Type filters */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-6 py-3">
        <button
          onClick={() => setActiveType(null)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            !activeType
              ? 'bg-accent text-white'
              : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
          )}
        >
          All
        </button>
        {types.map((t) => {
          const meta = TYPE_META[t.type] || { label: t.type, color: 'text-text-muted', icon: TrendingUp };
          const Icon = meta.icon;
          return (
            <button
              key={t.type}
              onClick={() => setActiveType(activeType === t.type ? null : t.type)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                activeType === t.type
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
              )}
            >
              <Icon className="h-3 w-3" />
              {meta.label}
              <span className="opacity-60">({t.count})</span>
            </button>
          );
        })}
      </div>

      {/* Signals list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover">
              <TrendingUp className="h-7 w-7 text-text-muted" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              {searchQuery ? 'No matching signals' : 'No signals yet'}
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              {searchQuery
                ? 'Try a different search term.'
                : 'Market signals will appear here as they are ingested.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {grouped.map((group) => (
              <div key={group.date}>
                <div className="sticky top-0 z-10 bg-background px-6 py-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {group.date}
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {group.items.map((signal) => {
                    const meta = TYPE_META[signal.type] || { label: signal.type, color: 'text-text-muted', icon: TrendingUp };
                    const TypeIcon = meta.icon;
                    let tags: string[] = [];
                    try { tags = JSON.parse(signal.tags_json || '[]'); } catch {}
                    const isExpanded = expandedUrl === signal.url;

                    return (
                      <div
                        key={signal.url}
                        onClick={() => setExpandedUrl(isExpanded ? null : signal.url)}
                        className="cursor-pointer px-6 py-3 transition-colors hover:bg-surface-hover"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('mt-0.5 flex-shrink-0 rounded bg-surface p-1.5', meta.color)}>
                            <TypeIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', meta.color, 'bg-surface')}>
                                {meta.label}
                              </span>
                              <h3 className="truncate text-sm font-medium text-text-primary">
                                {signal.title}
                              </h3>
                              <a
                                href={signal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 text-text-muted transition-colors hover:text-accent"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>

                            {signal.context && (
                              <p className={cn(
                                'mt-1 text-xs text-text-secondary',
                                !isExpanded && 'line-clamp-2',
                              )}>
                                {signal.context}
                              </p>
                            )}

                            {isExpanded && signal.analysis && (
                              <div className="mt-2 rounded-md border border-border-subtle bg-background px-3 py-2">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Analysis</span>
                                <p className="mt-1 text-xs text-text-secondary">{signal.analysis}</p>
                              </div>
                            )}

                            <div className="mt-1.5 flex flex-wrap items-center gap-3">
                              <span className="text-[11px] text-text-muted">
                                {signal.source}
                              </span>
                              {tags.length > 0 && tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-text-muted"
                                >
                                  <Tag className="h-2.5 w-2.5" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
