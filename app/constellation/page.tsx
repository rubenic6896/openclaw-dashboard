'use client';

import { useState, useCallback } from 'react';
import { useConstellationGraph } from '@/hooks/useConstellationGraph';
import ConstellationCanvas from '@/components/constellation/ConstellationCanvas';
import NodeTooltip from '@/components/constellation/NodeTooltip';
import NodeDrawer from '@/components/constellation/NodeDrawer';
import type { ConstellationNode } from '@/types/constellation';
import { WifiOff, Radio, Cpu, Zap } from 'lucide-react';

export default function ConstellationPage() {
  const { data: graph, isLoading, isError } = useConstellationGraph();

  const [hoveredNode, setHoveredNode] = useState<ConstellationNode | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<ConstellationNode | null>(null);

  const handleNodeHover = useCallback(
    (node: ConstellationNode | null, x: number, y: number) => {
      setHoveredNode(node);
      setHoverPos({ x, y });
    },
    [],
  );

  const handleNodeClick = useCallback((node: ConstellationNode) => {
    setSelectedNode(node);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const nodes = graph?.nodes ?? [];
  const edges = graph?.edges ?? [];
  const isLive = graph?.isLive ?? false;

  const activeCount = nodes.filter((n) => n.status === 'active').length;
  const totalCount = nodes.length;
  const totalTokens = nodes.reduce((sum, n) => sum + (n.tokensUsed24h ?? 0), 0);
  const totalCost = nodes.reduce((sum, n) => sum + (n.costUSD24h ?? 0), 0);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0c14]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-[#0f1117]/80 backdrop-blur-sm px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-text-primary tracking-tight">
            Constellation
          </h1>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-text-muted">Agents</span>
              <span className="font-semibold text-text-primary">
                {activeCount}/{totalCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-text-muted">Tokens</span>
              <span className="font-mono font-semibold text-text-primary">
                {formatTokens(totalTokens)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-text-muted">$</span>
              <span className="font-mono font-semibold text-text-primary">
                {totalCost.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isLive && (
            <div className="flex items-center gap-1.5 rounded-md border border-status-amber/30 bg-status-amber/10 px-2.5 py-1 text-[10px] font-medium text-status-amber">
              <WifiOff className="h-3 w-3" />
              Live data unavailable
            </div>
          )}
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-green opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-status-green" />
              </span>
              <span className="text-[10px] font-medium text-status-green">LIVE</span>
            </div>
          )}
          {graph?.computedAt && (
            <span className="text-[10px] text-text-muted">
              Updated {formatRelative(graph.computedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative flex-1">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
              <p className="text-xs text-text-muted">Mapping constellation...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <WifiOff className="mx-auto mb-3 h-8 w-8 text-text-muted opacity-40" />
              <p className="text-sm text-text-muted">Failed to load agent data</p>
              <p className="mt-1 text-xs text-text-muted">Using fallback constellation</p>
            </div>
          </div>
        ) : (
          <ConstellationCanvas
            nodes={nodes}
            edges={edges}
            isLive={isLive}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
          />
        )}

        {/* Hover tooltip */}
        {hoveredNode && !selectedNode && (
          <NodeTooltip node={hoveredNode} x={hoverPos.x} y={hoverPos.y} />
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 rounded-lg border border-border/50 bg-[#0f1117]/80 backdrop-blur-sm px-3.5 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-0.5">
            Status
          </span>
          <LegendItem color="bg-status-green" label="Active" />
          <LegendItem color="bg-status-amber" label="Idle" />
          <LegendItem color="bg-status-red" label="Error" />
          <LegendItem color="bg-text-muted/50" label="Offline" />
          <div className="my-1 h-px bg-border/50" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-0.5">
            Edges
          </span>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-accent/40 rounded" />
            <span className="text-[10px] text-text-muted">Delegation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative h-0.5 w-4 bg-accent/20 rounded">
              <div className="absolute left-1 top-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-accent" />
            </div>
            <span className="text-[10px] text-text-muted">Pulse = Event</span>
          </div>
        </div>

        {/* Interaction hint */}
        <div className="absolute bottom-4 right-4 text-[10px] text-text-muted/60 italic">
          Hover to inspect &middot; Click to drill down
        </div>
      </div>

      {/* Node Detail Drawer */}
      <NodeDrawer node={selectedNode} onClose={handleCloseDrawer} />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[10px] text-text-secondary">{label}</span>
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60000) return 'just now';
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
  return `${Math.floor(ms / 86400000)}d ago`;
}
