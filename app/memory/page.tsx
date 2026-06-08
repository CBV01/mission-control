'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Brain, Folder, FileText, Search, Network, ZoomIn, ZoomOut, Locate,
  ChevronRight, X, Hash, Calendar, Tag, Maximize2,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { api } from '@/lib/api';
import { cn, fmtRelative } from '@/lib/utils';
import type { ObsidianNote } from '@/lib/types';

// ─── Types ─────────────────────────────────────────────────────────
interface GraphNode {
  id: string;
  note: ObsidianNote;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;       // pinned position (when dragging)
  fy?: number;
  radius: number;
}

interface GraphEdge {
  source: string;
  target: string;
}

// Folder colors — each folder gets a distinct hue
const FOLDER_COLORS: Record<string, string> = {
  'Inbox':                  '#06b6d4',  // cyan
  'Projects/ArkiloStudio':  '#8b5cf6',  // violet
  'Agents':                 '#10b981',  // green
  'Daily Notes':            '#f59e0b',  // amber
  'Templates':              '#d946ef',  // magenta
};

// Force-directed simulation parameters
const FORCE = {
  repulsion: 14000,   // how much nodes push each other away
  springLength: 130,  // ideal edge length
  springK: 0.04,      // spring stiffness
  damping: 0.82,      // velocity decay per tick
  centerPull: 0.012,  // gentle pull toward canvas center
  maxVelocity: 8,
};

// ─── Main Component ─────────────────────────────────────────────────
function MemoryContent() {
  const { data, isLoading } = useQuery({ queryKey: ['memory'], queryFn: api.memory });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [openNote, setOpenNote] = useState<ObsidianNote | null>(null);

  // Notes + edges (from [[wikilinks]])
  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };
    return buildGraph(data.notes, activeFolder, activeTag, search);
  }, [data, activeFolder, activeTag, search]);

  // All folders/tags
  const allFolders = useMemo(() => Array.from(new Set(data?.notes.map((n) => n.folder) ?? [])).sort(), [data]);
  const allTags = useMemo(() => Array.from(new Set(data?.notes.flatMap((n) => n.tags) ?? [])).sort(), [data]);

  return (
    <>
      <PageHeader
        title="Memory / Obsidian"
        description={`${data?.notes.length ?? 0} notes · ${edges.length} links · ${allFolders.length} folders`}
        icon={<Brain className="h-4 w-4 text-white" />}
        badge={{ label: 'Live', tone: 'cyan' }}
        actions={
          <Button variant="primary" size="sm" onClick={() => nodes.length > 0 && setSelectedId(nodes[0].id)}>
            <Network className="h-3.5 w-3.5" /> Explore
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)] min-h-[600px]">
        {/* ── LEFT RAIL: file tree ── */}
        <Card innerGlow className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardContent className="p-3 flex-1 overflow-y-auto scrollbar-hide space-y-3">
            {/* Search */}
            <div>
              <label className="text-2xs uppercase tracking-wider text-text-tertiary px-1">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a note…"
                  className="w-full h-8 pl-7 pr-2 rounded-md border border-white/[0.08] bg-white/[0.04] text-xs text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Folder filter */}
            <div>
              <label className="text-2xs uppercase tracking-wider text-text-tertiary px-1 flex items-center gap-1.5">
                <Folder className="h-2.5 w-2.5" /> Folder
              </label>
              <div className="mt-1 space-y-0.5">
                <FolderFilter
                  label="all"
                  count={data?.notes.length ?? 0}
                  color="#94a3b8"
                  active={activeFolder === 'all'}
                  onClick={() => setActiveFolder('all')}
                />
                {allFolders.map((f) => {
                  const count = data?.notes.filter((n) => n.folder === f).length ?? 0;
                  return (
                    <FolderFilter
                      key={f}
                      label={f}
                      count={count}
                      color={FOLDER_COLORS[f] ?? '#94a3b8'}
                      active={activeFolder === f}
                      onClick={() => setActiveFolder(f)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div>
                <label className="text-2xs uppercase tracking-wider text-text-tertiary px-1 flex items-center gap-1.5">
                  <Tag className="h-2.5 w-2.5" /> Tag
                </label>
                <div className="mt-1 flex flex-wrap gap-1 px-1">
                  <button
                    onClick={() => setActiveTag('all')}
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-2xs font-medium transition-colors cursor-pointer',
                      activeTag === 'all'
                        ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                        : 'border-white/[0.08] text-text-secondary hover:bg-white/5',
                    )}
                  >
                    all
                  </button>
                  {allTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(t)}
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-2xs font-medium transition-colors cursor-pointer',
                        activeTag === t
                          ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                          : 'border-white/[0.08] text-text-secondary hover:bg-white/5',
                      )}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Note list */}
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="text-2xs uppercase tracking-wider text-text-tertiary px-1 mb-1.5 flex items-center gap-1.5">
                <FileText className="h-2.5 w-2.5" /> Notes ({nodes.length})
              </div>
              <div className="space-y-0.5">
                {nodes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setSelectedId(n.id)}
                    onMouseEnter={() => setHoveredId(n.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors cursor-pointer',
                      selectedId === n.id
                        ? 'bg-cyan-500/15 text-text-primary border border-cyan-400/30'
                        : hoveredId === n.id
                        ? 'bg-white/[0.06] text-text-primary'
                        : 'text-text-secondary hover:bg-white/5 border border-transparent',
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: FOLDER_COLORS[n.note.folder] ?? '#94a3b8' }}
                    />
                    <span className="flex-1 truncate">{n.note.title}</span>
                    <span className="text-2xs text-text-tertiary font-mono">{n.note.backlinks}</span>
                  </button>
                ))}
                {nodes.length === 0 && (
                  <div className="text-2xs text-text-tertiary italic px-2 py-3">No notes match filters.</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── CENTER: Graph canvas ── */}
        <Card innerGlow className="lg:col-span-3 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex-1 relative">
            {isLoading || nodes.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                onOpenNote={(n) => setOpenNote(n)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <NoteModal note={openNote} onClose={() => setOpenNote(null)} />
    </>
  );
}

// ─── Folder filter item ────────────────────────────────────────────
function FolderFilter({ label, count, color, active, onClick }: { label: string; count: number; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1 rounded text-left text-xs transition-colors cursor-pointer',
        active
          ? 'bg-cyan-500/15 text-text-primary border border-cyan-400/30'
          : 'text-text-secondary hover:bg-white/5 border border-transparent',
      )}
    >
      <span
        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
        style={{ background: color }}
      />
      <span className="flex-1 truncate">{label}</span>
      <span className="text-2xs text-text-tertiary font-mono">{count}</span>
    </button>
  );
}

// ─── Build the graph from notes ────────────────────────────────────
function buildGraph(notes: ObsidianNote[], folder: string, tag: string, search: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
  // Apply filters
  const filtered = notes.filter((n) => {
    if (folder !== 'all' && n.folder !== folder) return false;
    if (tag !== 'all' && !n.tags.includes(tag)) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const filteredIds = new Set(filtered.map((n) => n.id));

  // Place nodes in a circle initially (will be replaced by force layout)
  const N = filtered.length;
  const radius = 180;
  const cx = 300, cy = 300;
  const nodes: GraphNode[] = filtered.map((note, i) => {
    const angle = (i / Math.max(N, 1)) * Math.PI * 2 - Math.PI / 2;
    return {
      id: note.id,
      note,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      radius: 8 + Math.sqrt(note.backlinks) * 4, // size by backlink count
    };
  });

  // Edges — only between filtered nodes
  const edges: GraphEdge[] = [];
  for (const n of filtered) {
    for (const targetId of n.links) {
      if (filteredIds.has(targetId) && targetId !== n.id) {
        edges.push({ source: n.id, target: targetId });
      }
    }
  }

  return { nodes, edges };
}

// ─── Graph canvas with force simulation + drag + zoom + rotate ────────
const VIEW_BOX_SIZE = 600;
const VIEW_BOX_CENTER = VIEW_BOX_SIZE / 2; // 300 — the FIXED center point

function GraphCanvas({
  nodes: initialNodes, edges, hoveredId, setHoveredId, selectedId, setSelectedId, onOpenNote,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onOpenNote: (n: ObsidianNote) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [dragging, setDragging] = useState<{ id: string; startNodeX: number; startNodeY: number; startMouseX: number; startMouseY: number } | null>(null);
  // 3D rotation: rotateX (tilt forward/back), rotateY (spin left/right), rotateZ (roll)
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [rotationDrag, setRotationDrag] = useState<{ startX: number; startY: number; startRot: { x: number; y: number; z: number } } | null>(null);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize nodes positions when initialNodes change (filter changes)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Force-directed simulation — PAUSED during rotation drag so the center stays fixed
  useEffect(() => {
    if (nodes.length === 0) return;
    if (rotationDrag || dragging) return; // pause during user interaction

    const tick = () => {
      setNodes((prev) => {
        const next = prev.map((n) => ({ ...n }));
        const byId = new Map(next.map((n) => [n.id, n]));

        for (let i = 0; i < next.length; i++) {
          const a = next[i];
          let fx = 0;
          let fy = 0;

          // Repulsion from other nodes
          for (let j = 0; j < next.length; j++) {
            if (i === j) continue;
            const b = next[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distSq = dx * dx + dy * dy + 0.01;
            const dist = Math.sqrt(distSq);
            const force = FORCE.repulsion / distSq;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }

          // Spring forces from connected nodes
          for (const e of edges) {
            const other = (e.source === a.id ? byId.get(e.target) : e.target === a.id ? byId.get(e.source) : null);
            if (!other) continue;
            const dx = other.x - a.x;
            const dy = other.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const force = (dist - FORCE.springLength) * FORCE.springK;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }

          // Gentle pull toward the FIXED center
          fx += (VIEW_BOX_CENTER - a.x) * FORCE.centerPull;
          fy += (VIEW_BOX_CENTER - a.y) * FORCE.centerPull;

          // Apply forces
          a.vx = (a.vx + fx) * FORCE.damping;
          a.vy = (a.vy + fy) * FORCE.damping;
          // Clamp velocity
          const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
          if (speed > FORCE.maxVelocity) {
            a.vx = (a.vx / speed) * FORCE.maxVelocity;
            a.vy = (a.vy / speed) * FORCE.maxVelocity;
          }
          // Snap tiny velocities to 0 so nodes don't drift forever
          if (Math.abs(a.vx) < 0.01) a.vx = 0;
          if (Math.abs(a.vy) < 0.01) a.vy = 0;
          a.x += a.vx;
          a.y += a.vy;
        }
        return next;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [nodes.length, edges, dragging, rotationDrag]);

  // ── Mouse handlers ────────────────────────────────────────────
  // Convert mouse screen coords to viewBox (world) coords, accounting for pan + zoom
  // Note: dragging a node operates in screen-space, and rotation is applied to the
  // SVG group, so a node's "world" position stays in the same SVG coordinates.

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    // Capture the node's current position and the mouse position so we can do delta math
    const n = nodes.find((nn) => nn.id === id);
    if (!n) return;
    setDragging({
      id,
      startNodeX: n.x,
      startNodeY: n.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    });
  };

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== svgRef.current && !(e.target as Element).classList?.contains('canvas-bg')) return;
    // Begin a rotation drag around the FIXED center (300, 300)
    setRotationDrag({
      startX: e.clientX,
      startY: e.clientY,
      startRot: rotation,
    });
    // Kill all node velocities so the layout doesn't fight the rotation
    setNodes((prev) => prev.map((n) => ({ ...n, vx: 0, vy: 0 })));
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      // Move the node in world coordinates using the delta in screen coordinates
      // The screen delta needs to be divided by the current zoom to be in world units
      const screenDx = e.clientX - dragging.startMouseX;
      const screenDy = e.clientY - dragging.startMouseY;
      setNodes((prev) => prev.map((n) => {
        if (n.id !== dragging.id) return n;
        const worldDx = screenDx / transform.k;
        const worldDy = screenDy / transform.k;
        return { ...n, x: dragging.startNodeX + worldDx, y: dragging.startNodeY + worldDy, vx: 0, vy: 0 };
      }));
    } else if (rotationDrag) {
      // Full 3D rotation around the fixed center
      // Horizontal drag → rotateY (spin left/right around vertical axis)
      // Vertical drag → rotateX (tilt forward/back around horizontal axis)
      const dx = e.clientX - rotationDrag.startX;
      const dy = e.clientY - rotationDrag.startY;
      setRotation({
        x: rotationDrag.startRot.x + dy * 0.3,        // tilt forward/back on X axis
        y: rotationDrag.startRot.y + dx * 0.3,        // spin left/right on Y axis
        z: rotationDrag.startRot.z,                    // Z stays at 0 (no roll for now)
      });
    }
  };

  const onMouseUp = () => {
    setDragging(null);
    setRotationDrag(null);
  };

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    const newK = Math.max(0.3, Math.min(3, transform.k * (1 + delta)));
    setTransform({ ...transform, k: newK });
  };

  // Reset view
  const resetView = () => {
    setTransform({ x: 0, y: 0, k: 1 });
    setRotation({ x: 0, y: 0, z: 0 });
  };
  const zoomIn  = () => setTransform((t) => ({ ...t, k: Math.min(3, t.k * 1.2) }));
  const zoomOut = () => setTransform((t) => ({ ...t, k: Math.max(0.3, t.k / 1.2) }));

  // Auto-fit on first load
  const fitToView = () => {
    if (nodes.length === 0) return;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const padding = 80;
    const k = Math.min(
      VIEW_BOX_SIZE / (maxX - minX + padding * 2),
      VIEW_BOX_SIZE / (maxY - minY + padding * 2),
      1.5,
    );
    // Center the graph on the FIXED center (300, 300) and reset rotation
    setTransform({
      x: -((minX + maxX) / 2 - VIEW_BOX_CENTER) * k,
      y: -((minY + maxY) / 2 - VIEW_BOX_CENTER) * k,
      k,
    });
    setRotation({ x: 0, y: 0, z: 0 });
  };

  useEffect(() => {
    fitToView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNodes.length]);

  // Build adjacency for hover highlighting
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    }
    return map;
  }, [edges]);

  const isHighlighted = (id: string) => {
    if (!hoveredId && !selectedId) return true;
    const focus = hoveredId ?? selectedId;
    if (id === focus) return true;
    return adjacency.get(focus!)?.has(id) ?? false;
  };

  const isEdgeHighlighted = (e: GraphEdge) => {
    const focus = hoveredId ?? selectedId;
    if (!focus) return true;
    return e.source === focus || e.target === focus;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      style={{
        cursor: dragging ? 'grabbing' : rotationDrag ? 'grabbing' : 'grab',
        // CSS 3D perspective — required for rotateX/rotateY to look like 3D rather than flat skew
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* Canvas background — grid */}
      <div
        className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.04) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3D rotating container — rotates the entire graph in 3D space */}
      <div
        className="w-full h-full"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transformStyle: 'preserve-3d',
          transition: rotationDrag ? 'none' : 'transform 200ms ease-out',
        }}
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 600 600"
          preserveAspectRatio="xMidYMid meet"
        >
        <defs>
          {Array.from(new Set(nodes.map((n) => FOLDER_COLORS[n.note.folder] ?? '#94a3b8'))).map((color) => (
            <radialGradient key={color} id={`nodeGrad-${color.replace('#', '')}`}>
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.4} />
            </radialGradient>
          ))}
        </defs>

        <g
          transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
        >
          {/* Edges */}
          {edges.map((e) => {
            const s = nodes.find((n) => n.id === e.source);
            const t = nodes.find((n) => n.id === e.target);
            if (!s || !t) return null;
            const key = `${e.source}-${e.target}`;
            const active = isEdgeHighlighted(e);
            const dim = !active && (hoveredId ?? selectedId) != null;
            return (
              <line
                key={key}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={dim ? 'rgba(255,255,255,0.05)' : 'rgba(6, 182, 212, 0.5)'}
                strokeWidth={active ? 1.5 : 0.8}
                onMouseEnter={() => setHoveredEdge(key)}
                onMouseLeave={() => setHoveredEdge(null)}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const color = FOLDER_COLORS[n.note.folder] ?? '#94a3b8';
            const isHovered = hoveredId === n.id;
            const isSelected = selectedId === n.id;
            const highlighted = isHighlighted(n.id);
            const dim = !highlighted && (hoveredId ?? selectedId) != null;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                onMouseDown={(e) => onNodeMouseDown(e, n.id)}
                onMouseEnter={() => setHoveredId(n.id)}
                onMouseLeave={() => setHoveredId(null)}
                onDoubleClick={() => onOpenNote(n.note)}
                className="cursor-grab active:cursor-grabbing"
                style={{ transition: 'opacity 200ms' }}
                opacity={dim ? 0.25 : 1}
              >
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    r={n.radius + 4}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    className="animate-spin"
                    style={{ transformOrigin: 'center', animationDuration: '12s' }}
                  />
                )}
                {/* Glow halo on hover/select */}
                {(isHovered || isSelected) && (
                  <circle
                    r={n.radius + 6}
                    fill={color}
                    opacity={0.2}
                  />
                )}
                {/* Node circle */}
                <circle
                  r={n.radius}
                  fill={`url(#nodeGrad-${color.replace('#', '')})`}
                  stroke={color}
                  strokeWidth={isHovered || isSelected ? 2 : 1.5}
                />
                {/* Title */}
                <text
                  y={n.radius + 12}
                  textAnchor="middle"
                  className="select-none pointer-events-none"
                  style={{
                    fontSize: '10px',
                    fontWeight: isSelected ? 600 : 500,
                    fill: isSelected ? '#06b6d4' : isHovered ? '#f8fafc' : '#cbd5e1',
                  }}
                >
                  {n.note.title.length > 18 ? n.note.title.slice(0, 16) + '…' : n.note.title}
                </text>
                {/* Backlink count badge */}
                {n.note.backlinks > 0 && (
                  <g transform={`translate(${n.radius * 0.7}, ${-n.radius * 0.7})`}>
                    <circle r="6" fill="#04060a" stroke={color} strokeWidth="1" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="select-none pointer-events-none"
                      style={{ fontSize: '8px', fontWeight: 600, fill: color }}
                    >
                      {n.note.backlinks}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      </div>

      {/* Fixed center marker — sits OUTSIDE the 3D rotated container, so it stays still */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer dashed ring */}
          <div className="absolute -inset-3.5 rounded-full border border-dashed border-cyan-400/30" />
          {/* Inner solid dot */}
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
          {/* Crosshair ticks */}
          <div className="absolute -left-2 top-1/2 h-px w-1 -translate-y-1/2 bg-cyan-400/40" />
          <div className="absolute -right-2 top-1/2 h-px w-1 -translate-y-1/2 bg-cyan-400/40" />
          <div className="absolute left-1/2 -top-2 h-1 w-px -translate-x-1/2 bg-cyan-400/40" />
          <div className="absolute left-1/2 -bottom-2 h-1 w-px -translate-x-1/2 bg-cyan-400/40" />
        </div>
      </div>

      {/* Controls (bottom-right) */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-bg-elevated/80 backdrop-blur-sm text-text-secondary hover:text-text-primary hover:border-cyan-400/30 transition-colors cursor-pointer"
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-bg-elevated/80 backdrop-blur-sm text-text-secondary hover:text-text-primary hover:border-cyan-400/30 transition-colors cursor-pointer"
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={resetView}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-bg-elevated/80 backdrop-blur-sm text-text-secondary hover:text-text-primary hover:border-cyan-400/30 transition-colors cursor-pointer"
          title="Reset view"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={fitToView}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-bg-elevated/80 backdrop-blur-sm text-text-secondary hover:text-text-primary hover:border-cyan-400/30 transition-colors cursor-pointer"
          title="Fit to view"
        >
          <Locate className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Hint text (top-left) */}
      <div className="absolute top-3 left-3 text-2xs text-text-tertiary font-mono bg-bg-elevated/60 backdrop-blur-sm rounded px-2 py-1 border border-white/[0.06]">
        drag to tilt (3D) · drag node to move · scroll to zoom · double-click to open
      </div>

      {/* Stats (bottom-left) */}
      <div className="absolute bottom-3 left-3 text-2xs font-mono text-text-tertiary bg-bg-elevated/60 backdrop-blur-sm rounded px-2 py-1 border border-white/[0.06]">
        {nodes.length} nodes · {edges.length} edges · {(transform.k * 100).toFixed(0)}%
      </div>
    </div>
  );
}

// ─── Note modal (full view) ────────────────────────────────────────
function NoteModal({ note, onClose }: { note: ObsidianNote | null; onClose: () => void }) {
  if (!note) return null;
  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-white/10 bg-bg-elevated shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent stripe */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/5">
          <div>
            <div className="flex items-center gap-1.5 text-2xs text-text-tertiary mb-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: FOLDER_COLORS[note.folder] ?? '#94a3b8' }}
              />
              <span className="font-mono">{note.folder}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-text-primary">{note.title}</h2>
            <p className="text-2xs text-text-tertiary font-mono mt-0.5">{note.path}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-sm text-text-primary leading-relaxed">{note.preview}</p>
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/5 p-3">
            <div className="text-2xs uppercase tracking-wider text-accent-cyan mb-1">Callout</div>
            <p className="text-sm text-text-primary">
              This note has {note.backlinks} backlink{note.backlinks !== 1 ? 's' : ''} and {note.links.length} outgoing link{note.links.length !== 1 ? 's' : ''}.
            </p>
          </div>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((t) => (
                <Badge key={t} tone="violet">#{t}</Badge>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-white/5">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="primary">Edit in Obsidian</Button>
        </div>
      </div>
    </div>
  );
}

export default function MemoryPage() {
  return <ClientShell><MemoryContent /></ClientShell>;
}
