'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import {
  Newspaper,
  ExternalLink,
  Calendar,
  Tag,
  MessageSquare,
  Code,
  Cpu,
  Shield,
  Zap,
  BookOpen,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  Code,
  Cpu,
  Shield,
  Zap,
  BookOpen,
  Newspaper,
};

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Newspaper;
}

interface TechUpdate {
  url: string;
  category_id: string;
  category_label: string;
  category_icon: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  date_iso: string;
  ingested_at: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export default function TechUpdatesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ updates: TechUpdate[]; categories: Category[] }>({
    queryKey: ['tech-updates', activeCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      return fetch(`/api/tech-updates?${params}`).then((r) => r.json());
    },
    refetchInterval: 60000,
  });

  const updates = data?.updates ?? [];
  const categories = data?.categories ?? [];

  const freshSignals = useMemo(() => {
    const now = new Date();
    const hoursAgo48 = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    return updates
      .filter(u => new Date(u.ingested_at) >= hoursAgo48)
      .sort((a, b) => (b.date_iso ?? b.date ?? '').localeCompare(a.date_iso ?? a.date ?? ''));
  }, [updates]);

  const grouped = useMemo(() => {
    // Exclude items already shown in the Fresh Signals section
    const freshUrls = new Set(freshSignals.map(u => u.url));
    const remaining = updates.filter(u => !freshUrls.has(u.url));

    const dateMap = new Map<string, TechUpdate[]>();
    for (const u of remaining) {
      const d = u.date_iso || u.date || 'Unknown';
      if (!dateMap.has(d)) {
        dateMap.set(d, []);
      }
      dateMap.get(d)!.push(u);
    }
    // Sort groups by date descending (newest first)
    const groups = Array.from(dateMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({ date, items }));
    return groups;
  }, [updates, freshSignals]);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <LoadingSkeleton variant="text" className="h-8 w-48" />
        </div>
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-4">
        <div className="rounded-md bg-accent/10 p-2">
          <Newspaper className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-text-primary">Latest Tech Updates</h1>
          <p className="text-xs text-text-muted">
            {updates.length} updates across {categories.length} categories
          </p>
        </div>
      </header>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 border-b border-border px-6 py-3">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            !activeCategory
              ? 'bg-accent text-white'
              : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
          )}
        >
          All
        </button>
        {categories.map((cat) => {
          const Icon = getIcon(cat.icon);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                activeCategory === cat.id
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
              )}
            >
              <Icon className="h-3 w-3" />
              {cat.label}
              <span className="opacity-60">({cat.count})</span>
            </button>
          );
        })}
      </div>

      {/* Updates list */}
      <div className="flex-1 overflow-y-auto">
        {updates.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover">
              <Newspaper className="h-7 w-7 text-text-muted" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">No updates yet</h2>
            <p className="mt-2 text-sm text-text-muted">Tech updates will appear here as they are ingested.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Fresh Signals Section - Last 48 hours */}
            {freshSignals.length > 0 && (
              <div className="border-l-2 border-accent bg-accent/5">
                <div className="sticky top-0 z-10 bg-background px-6 py-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                    <Zap className="h-3 w-3" />
                    🔄 Fresh Signals (Last 48h) — {freshSignals.length}
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {freshSignals.map((update) => {
                    const Icon = getIcon(update.category_icon);
                    return (
                      <div key={update.url} className="px-6 py-3 transition-colors hover:bg-surface-hover">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 rounded bg-surface p-1.5">
                            <Icon className="h-3.5 w-3.5 text-text-muted" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-medium text-text-primary">
                                {update.title}
                              </h3>
                              <a
                                href={update.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-text-muted transition-colors hover:text-accent"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                            {update.summary && (
                              <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                                {update.summary}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                                <Tag className="h-3 w-3" />
                                {update.category_label}
                              </span>
                              {update.source && (
                                <span className="text-[11px] text-text-muted">
                                  {update.source}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {grouped.map((group) => (
              <div key={group.date}>
                <div className="sticky top-0 z-10 bg-background px-6 py-2">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    <Calendar className="h-3 w-3" />
                    {group.date}
                  </span>
                </div>
                <div className="divide-y divide-border/50">
                  {group.items.map((update) => {
                    const Icon = getIcon(update.category_icon);
                    return (
                      <div key={update.url} className="px-6 py-3 transition-colors hover:bg-surface-hover">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 rounded bg-surface p-1.5">
                            <Icon className="h-3.5 w-3.5 text-text-muted" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-medium text-text-primary">
                                {update.title}
                              </h3>
                              <a
                                href={update.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-text-muted transition-colors hover:text-accent"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                            {update.summary && (
                              <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                                {update.summary}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                                <Tag className="h-3 w-3" />
                                {update.category_label}
                              </span>
                              {update.source && (
                                <span className="text-[11px] text-text-muted">
                                  {update.source}
                                </span>
                              )}
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
