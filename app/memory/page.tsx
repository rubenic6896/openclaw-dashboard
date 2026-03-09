'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboardStore } from '@/store/dashboard';
import { cn, formatRelativeTime } from '@/lib/utils';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import type { MemoryEntry, MemoryEntryType } from '@/types';
import {
  Search,
  BookOpen,
  FileText,
  Lightbulb,
  AlertTriangle,
  StickyNote,
  Plus,
  Download,
  X,
  Tag,
} from 'lucide-react';

// --- Filter types ---

type FilterType = 'all' | MemoryEntryType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'session_summary', label: 'Episodic' },
  { key: 'decision', label: 'Factual' },
  { key: 'note', label: 'Notes' },
  { key: 'alert', label: 'Alerts' },
];

// --- Helpers ---

function getTypeIcon(type: MemoryEntryType) {
  switch (type) {
    case 'session_summary':
      return <BookOpen className="h-4 w-4 text-status-blue" />;
    case 'decision':
      return <Lightbulb className="h-4 w-4 text-status-amber" />;
    case 'note':
      return <StickyNote className="h-4 w-4 text-status-green" />;
    case 'alert':
      return <AlertTriangle className="h-4 w-4 text-status-red" />;
  }
}

function getTypeBadgeClass(type: MemoryEntryType): string {
  switch (type) {
    case 'session_summary':
      return 'bg-status-blue/10 text-status-blue border-status-blue/20';
    case 'decision':
      return 'bg-status-amber/10 text-status-amber border-status-amber/20';
    case 'note':
      return 'bg-status-green/10 text-status-green border-status-green/20';
    case 'alert':
      return 'bg-status-red/10 text-status-red border-status-red/20';
  }
}

function getTypeLabel(type: MemoryEntryType): string {
  switch (type) {
    case 'session_summary':
      return 'Episodic Memory';
    case 'decision':
      return 'Factual Memory';
    case 'note':
      return 'Note';
    case 'alert':
      return 'Alert';
  }
}

function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) return 'This Week';
  if (diffDays < 14) return 'Last Week';
  if (diffDays < 21) return '2 Weeks Ago';
  if (diffDays < 28) return '3 Weeks Ago';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// --- Compose form ---

interface ComposeFormProps {
  onClose: () => void;
  onSave: (entry: { title: string; content: string; tags: string[] }) => void;
  isSaving: boolean;
}

function ComposeForm({ onClose, onSave, isSaving }: ComposeFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ title: title.trim(), content: content.trim(), tags });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-text-primary">New Note</h2>
        <button
          onClick={onClose}
          className="rounded p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={12}
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. architecture, decision, sprint-3"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
        <button
          onClick={onClose}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim() || !content.trim() || isSaving}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}

// --- Main page ---

export default function MemoryPage() {
  const queryClient = useQueryClient();
  const { selectedMemoryId, setSelectedMemory } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showCompose, setShowCompose] = useState(false);

  const { data, isLoading } = useQuery<{ entries: MemoryEntry[]; unreadCount: number }>({
    queryKey: ['memory'],
    queryFn: () => fetch('/api/memory').then((r) => r.json()),
    refetchInterval: 60_000,
  });
  const entries = data?.entries ?? [];

  const createMutation = useMutation({
    mutationFn: (newEntry: { title: string; content: string; tags: string[] }) =>
      fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, type: 'note' }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory'] });
      setShowCompose(false);
    },
  });

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (activeFilter !== 'all') {
      result = result.filter((e) => e.type === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return [...result].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [entries, activeFilter, searchQuery]);

  const groupedEntries = useMemo(() => {
    const groups: { label: string; entries: MemoryEntry[] }[] = [];
    const labelMap = new Map<string, MemoryEntry[]>();

    for (const entry of filteredEntries) {
      const label = getWeekLabel(entry.createdAt);
      if (!labelMap.has(label)) {
        labelMap.set(label, []);
        groups.push({ label, entries: labelMap.get(label)! });
      }
      labelMap.get(label)!.push(entry);
    }

    return groups;
  }, [filteredEntries]);

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedMemoryId) ?? null,
    [entries, selectedMemoryId],
  );

  const handleExport = useCallback(() => {
    console.log('Export memory log — not yet implemented');
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r border-border p-4">
          <LoadingSkeleton variant="text" className="mb-4 h-9 w-full" />
          <LoadingSkeleton variant="text" className="mb-2 h-8 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="card" className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <LoadingSkeleton variant="card" className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-border">
        {/* mem0 badge + Search bar */}
        <div className="border-b border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              mem0
            </span>
            <span className="text-[10px] text-text-muted">
              {entries.length} memories stored
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                activeFilter === f.key
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 border-b border-border px-3 py-2">
          <button
            onClick={() => setShowCompose(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            New Note
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <FileText className="h-8 w-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                {searchQuery
                  ? 'No entries match your search'
                  : 'No memory entries yet'}
              </p>
            </div>
          ) : (
            groupedEntries.map((group) => (
              <div key={group.label}>
                <div className="sticky top-0 z-10 bg-background px-3 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    {group.label}
                  </span>
                </div>
                {group.entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedMemory(entry.id)}
                    className={cn(
                      'flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors',
                      selectedMemoryId === entry.id
                        ? 'bg-surface-active'
                        : 'hover:bg-surface-hover',
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getTypeIcon(entry.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-text-primary">
                          {entry.title}
                        </span>
                        {!entry.isRead && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-status-blue" />
                        )}
                      </div>
                      <span className="text-xs text-text-muted">
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right main area */}
      <div className="flex-1 overflow-y-auto">
        {showCompose ? (
          <ComposeForm
            onClose={() => setShowCompose(false)}
            onSave={(data) => createMutation.mutate(data)}
            isSaving={createMutation.isPending}
          />
        ) : selectedEntry ? (
          <div className="p-6">
            {/* Type badge + date */}
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
                  getTypeBadgeClass(selectedEntry.type),
                )}
              >
                {getTypeIcon(selectedEntry.type)}
                {getTypeLabel(selectedEntry.type)}
              </span>
              <span className="text-xs text-text-muted">
                {new Date(selectedEntry.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-4 text-xl font-semibold text-text-primary">
              {selectedEntry.title}
            </h1>

            {/* Agent */}
            {selectedEntry.agentId && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px]">
                  {selectedEntry.agentId}
                </span>
              </div>
            )}

            {/* Tags */}
            {selectedEntry.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedEntry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-text-secondary"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="mt-6 whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-text-secondary">
              {selectedEntry.content}
            </div>

            {/* Updated timestamp */}
            {selectedEntry.updatedAt !== selectedEntry.createdAt && (
              <p className="mt-4 text-xs text-text-muted">
                Updated {formatRelativeTime(selectedEntry.updatedAt)}
              </p>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-text-muted" />
              <p className="mt-3 text-sm text-text-muted">
                Select an entry from the sidebar to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
