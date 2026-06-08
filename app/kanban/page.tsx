'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KanbanSquare, Plus, GripVertical, Trash2 } from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { cn, fmtRelative } from '@/lib/utils';
import type { KanbanTask, TaskStatus } from '@/lib/types';

const columns: { id: TaskStatus; label: string; tone: 'default' | 'cyan' | 'success' | 'danger' }[] = [
  { id: 'ready', label: 'Ready', tone: 'default' },
  { id: 'in_progress', label: 'In Progress', tone: 'cyan' },
  { id: 'completed', label: 'Completed', tone: 'success' },
  { id: 'blocked', label: 'Blocked', tone: 'danger' },
];

const priorityColors = {
  0: 'bg-text-tertiary',
  1: 'bg-status-warning',
  2: 'bg-status-danger',
} as const;

const priorityLabels = ['Low', 'Med', 'High'] as const;

function KanbanContent() {
  const { data, isLoading } = useQuery({ queryKey: ['kanban'], queryFn: api.kanban });
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<KanbanTask | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const grouped = (data?.tasks ?? []).reduce<Record<TaskStatus, KanbanTask[]>>((acc, t) => {
    (acc[t.status] ??= []).push(t);
    return acc;
  }, { ready: [], in_progress: [], completed: [], blocked: [] });

  // ─── Drag and drop handlers ─────────────────────────────────
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggingId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, col: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== col) setDragOverCol(col);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if leaving the column (not entering a child)
    const related = e.relatedTarget as Node | null;
    if (!related || !(e.currentTarget as Node).contains(related)) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetCol: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    setDragOverCol(null);
    setDraggingId(null);
    if (!taskId) return;

    // Update the task's status in the cached data
    queryClient.setQueryData<typeof data>(['kanban'], (old) => {
      if (!old) return old;
      return {
        ...old,
        tasks: old.tasks.map((t) => (t.id === taskId ? { ...t, status: targetCol } : t)),
      };
    });
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  // ─── Delete a task ───────────────────────────────────────────
  const deleteTask = (taskId: string) => {
    queryClient.setQueryData<typeof data>(['kanban'], (old) => {
      if (!old) return old;
      return { ...old, tasks: old.tasks.filter((t) => t.id !== taskId) };
    });
    setSelected(null);
  };

  // ─── Add a new task ─────────────────────────────────────────
  const addTask = (newTask: KanbanTask) => {
    queryClient.setQueryData<typeof data>(['kanban'], (old) => {
      if (!old) return old;
      return { ...old, tasks: [newTask, ...old.tasks] };
    });
    setShowAdd(false);
  };

  return (
    <>
      <PageHeader
        title="Kanban Board"
        description="Tasks flowing across the agent workspace. Drag cards between columns."
        icon={<KanbanSquare className="h-4 w-4 text-white" />}
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5" /> New Task
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-3 min-w-0">
              {/* Column header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-text-primary">{col.label}</h2>
                  <span className="rounded-full bg-white/5 px-1.5 py-0.5 font-mono text-2xs text-text-tertiary">
                    {grouped[col.id].length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowAdd(true);
                    // Pre-set status to this column by mutating a ref-like state
                    // The AddTaskModal will default to the current column or 'ready'
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary hover:bg-white/5 hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Add card to this column"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={cn(
                  'flex-1 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-hide pr-1 rounded-lg p-1 transition-colors',
                  dragOverCol === col.id && 'bg-accent-cyan/5 ring-1 ring-accent-cyan/30',
                )}
              >
                {grouped[col.id].length === 0 ? (
                  <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-2xs text-text-tertiary">
                    {dragOverCol === col.id ? 'Drop here' : 'No tasks'}
                  </div>
                ) : (
                  grouped[col.id].map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      isDragging={draggingId === task.id}
                      onClick={() => setSelected(task)}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
                {dragOverCol === col.id && grouped[col.id].length > 0 && (
                  <div className="rounded-lg border border-dashed border-accent-cyan/40 bg-accent-cyan/5 p-3 text-center text-2xs text-accent-cyan">
                    Drop to move here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        size="md"
        footer={
          selected && (
            <>
              <Button variant="danger" onClick={() => deleteTask(selected.id)}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">{selected.body}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-text-tertiary">Status:</span> <Badge tone="default" dot>{selected.status}</Badge></div>
              <div><span className="text-text-tertiary">Priority:</span> <span className="font-mono text-text-primary">{priorityLabels[selected.priority] ?? 'Low'}</span></div>
              <div><span className="text-text-tertiary">Assignee:</span> <span className="font-mono text-text-primary">{selected.assignee}</span></div>
              <div><span className="text-text-tertiary">Workspace:</span> <span className="font-mono text-text-primary">{selected.workspace}</span></div>
              <div><span className="text-text-tertiary">Created:</span> <span className="font-mono text-text-primary">{fmtRelative(selected.createdAt)}</span></div>
              <div><span className="text-text-tertiary">ID:</span> <span className="font-mono text-text-primary">{selected.id}</span></div>
            </div>
            {selected.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {selected.tags.map((t) => <Badge key={t} tone="cyan">#{t}</Badge>)}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add task modal */}
      <AddTaskModal open={showAdd} onClose={() => setShowAdd(false)} onSubmit={addTask} />
    </>
  );
}

// ─── Card component (draggable) ─────────────────────────────────────
function KanbanCard({
  task, isDragging, onClick, onDragStart, onDragEnd,
}: { task: KanbanTask; isDragging: boolean; onClick: () => void; onDragStart: (e: React.DragEvent<HTMLDivElement>) => void; onDragEnd: () => void }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-lg border border-white/5 bg-white/5 p-3 text-left transition-all duration-200 ease-out-expo cursor-pointer select-none',
        'hover:border-cyan-400/30 hover:bg-white/[0.07] hover:-translate-y-0.5',
        'min-h-[80px]',
        isDragging && 'opacity-40 scale-[0.98]',
      )}
    >
      {/* Drag handle on the left */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none">
        <GripVertical className="h-3.5 w-3.5 text-text-tertiary" />
      </div>

      {/* Priority stripe */}
      <div className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full', priorityColors[task.priority])} />
      <div className="pl-2">
        <p className="text-sm font-medium text-text-primary line-clamp-2">{task.title}</p>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <Badge tone="default" className="font-mono text-[10px]">
            {task.assignee.split('-').slice(-1)[0]}
          </Badge>
          <span className="text-2xs text-text-tertiary ml-auto font-mono">
            {fmtRelative(task.createdAt)}
          </span>
        </div>
        {task.tags.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-text-tertiary">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Task Modal ────────────────────────────────────────────────
function AddTaskModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (task: KanbanTask) => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<TaskStatus>('ready');
  const [priority, setPriority] = useState<0 | 1 | 2>(1);
  const [assignee, setAssignee] = useState('mkt-content');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask: KanbanTask = {
      id: `t-${Date.now()}`,
      title: title.trim(),
      body: body.trim() || title.trim(),
      status,
      priority,
      assignee,
      workspace: 'default',
      createdAt: new Date().toISOString(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    onSubmit(newTask);
    // Reset form
    setTitle('');
    setBody('');
    setStatus('ready');
    setPriority(1);
    setAssignee('mkt-content');
    setTags('');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Task"
      description="Add a task to the kanban board."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="primary" disabled={!title.trim()}>
            <Plus className="h-3.5 w-3.5" /> Create task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Audit current OpenRouter credit usage"
            className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Description</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Optional details…"
            className="mt-1 w-full px-3 py-2 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                paddingRight: '28px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
              className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-2xs uppercase tracking-wider text-text-tertiary">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as 0 | 1 | 2)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                paddingRight: '28px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
              className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
            >
              <option value={0}>Low</option>
              <option value={1}>Medium</option>
              <option value={2}>High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Assignee</label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              paddingRight: '28px',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
            className="mt-1 w-full h-9 px-2 rounded-md border border-white/[0.08] bg-bg-elevated text-sm text-text-primary focus:border-cyan-400/50 focus:outline-none cursor-pointer"
          >
            <option value="mkt-content">mkt-content</option>
            <option value="mkt-poster">mkt-poster</option>
            <option value="outreach-scraper">outreach-scraper</option>
            <option value="outreach-emailer">outreach-emailer</option>
            <option value="seo-planner">seo-planner</option>
            <option value="ads-creative">ads-creative</option>
            <option value="dev-coding">dev-coding</option>
          </select>
        </div>
        <div>
          <label className="text-2xs uppercase tracking-wider text-text-tertiary">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="seo, audit, urgent"
            className="mt-1 w-full h-9 px-3 rounded-md border border-white/[0.08] bg-white/[0.04] text-sm text-text-primary placeholder:text-text-tertiary focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        {/* Hidden submit so Enter key submits the form */}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

export default function KanbanPage() {
  return <ClientShell><KanbanContent /></ClientShell>;
}
