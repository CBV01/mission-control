'use client';

import * as React from 'react';
import {
  Users, Search, Plus, Filter, Mail, Phone, ExternalLink, ShieldCheck,
  Upload, FileText, X, Check, AlertCircle, RefreshCw, FileSpreadsheet,
  File, UserPlus, Layers
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

export interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'nurturing' | 'unqualified';
  listName?: string; // Segment / List Name
}

const DEFAULT_LEADS: Lead[] = [
  { id: '1', name: 'Alexander Wright', role: 'CTO & Co-founder', company: 'SaaSify Global', email: 'alex@saasify.io', phone: '+1 (555) 234-5678', score: 94, status: 'qualified', listName: 'SaaS Founders' },
  { id: '2', name: 'Elena Rostova', role: 'Head of Growth', company: 'DataPulse', email: 'elena.r@datapulse.tech', phone: '+44 20 7946 0958', score: 87, status: 'new', listName: 'Growth Leaders' },
  { id: '3', name: 'Marcus Chen', role: 'VP of Engineering', company: 'CloudScale Inc', email: 'm.chen@cloudscale.com', phone: '+1 (555) 876-5432', score: 79, status: 'contacted', listName: 'Tech Leads v2' },
  { id: '4', name: 'Sarah Jenkins', role: 'Chief Executive Officer', company: 'OmniFlow Solutions', email: 'sarah.jenkins@omniflow.co', phone: '+1 (555) 345-6789', score: 92, status: 'nurturing', listName: 'SaaS Founders' },
  { id: '5', name: 'Takashi Sato', role: 'Founder & Managing Director', company: 'Nippon AI', email: 'sato@nippon.ai', phone: '+81 3 5555 0123', score: 65, status: 'unqualified', listName: 'Asia Outbound' },
  { id: '6', name: 'Laura Martinez', role: 'Director of Product', company: 'LogiLink', email: 'l.martinez@logilink.net', phone: '+34 91 123 4567', score: 81, status: 'qualified', listName: 'Growth Leaders' },
];

// --- File Drop & Manual Add Modal ---
function AddLeadsModal({ open, onClose, onImport }: {
  open: boolean;
  onClose: () => void;
  onImport: (leads: Lead[], listName: string) => void;
}) {
  const [activeMode, setActiveMode] = React.useState<'import' | 'manual'>('import');
  const [listName, setListName] = React.useState('');
  
  // Bulk import state
  const [isDragging, setIsDragging] = React.useState(false);
  const [droppedFile, setDroppedFile] = React.useState<File | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Manual entry state
  const [manualName, setManualName] = React.useState('');
  const [manualEmail, setManualEmail] = React.useState('');
  const [manualCompany, setManualCompany] = React.useState('');
  const [manualRole, setManualRole] = React.useState('');
  const [manualPhone, setManualPhone] = React.useState('');

  const ACCEPTED_EXT = ['.csv', '.xlsx', '.xls', '.json'];
  const ACCEPTED_MIME = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
  ];

  const isValidFile = (file: File) =>
    ACCEPTED_MIME.includes(file.type) ||
    ACCEPTED_EXT.some(ext => file.name.toLowerCase().endsWith(ext));

  const handleFile = (file: File) => {
    if (!isValidFile(file)) {
      setError('Unsupported file type. Please use CSV, Excel (.xlsx / .xls), or JSON.');
      setDroppedFile(null);
      return;
    }
    setError(null);
    setDroppedFile(file);
    // Suggest list name based on file name if empty
    if (!listName) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setListName(nameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    if (!droppedFile) return;
    setImporting(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.floor(Math.random() * 18) + 8;
        if (next >= 100) { clearInterval(interval); return 100; }
        return next;
      });
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Generate some simulated imported leads
      const count = Math.floor(Math.random() * 5) + 3;
      const finalListName = listName.trim() || 'Imported List';
      const simulatedLeads: Lead[] = Array.from({ length: count }).map((_, i) => ({
        id: `imported-${Date.now()}-${i}`,
        name: `Imported Prospect ${i + 1}`,
        email: `prospect.${i + 1}@example.com`,
        company: finalListName,
        role: 'Executive / Decision Maker',
        phone: `+1 (555) 909-000${i}`,
        score: Math.floor(Math.random() * 20) + 75,
        status: 'new',
        listName: finalListName
      }));

      setTimeout(() => {
        onImport(simulatedLeads, finalListName);
        handleReset();
        onClose();
      }, 400);
    }, 1800);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualEmail) {
      setError('Name and Email are required.');
      return;
    }
    const finalListName = listName.trim() || 'General List';
    const newLead: Lead = {
      id: `manual-${Date.now()}`,
      name: manualName,
      email: manualEmail,
      company: manualCompany || 'Self-Employed',
      role: manualRole || 'Founder',
      phone: manualPhone || '+1 (555) 000-0000',
      score: Math.floor(Math.random() * 25) + 70,
      status: 'new',
      listName: finalListName
    };

    onImport([newLead], finalListName);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setDroppedFile(null);
    setImporting(false);
    setProgress(0);
    setError(null);
    setIsDragging(false);
    setListName('');
    setManualName('');
    setManualEmail('');
    setManualCompany('');
    setManualRole('');
    setManualPhone('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileText className="h-6 w-6 text-emerald-400" />;
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="h-6 w-6 text-cyan-400" />;
    if (ext === 'json') return <File className="h-6 w-6 text-violet-400" />;
    return <FileText className="h-6 w-6 text-text-secondary" />;
  };

  return (
    <Modal
      open={open}
      onClose={() => { if (!importing) { handleReset(); onClose(); } }}
      title="Add Leads to Directory"
      description="Create list segments by assigning list names to new leads."
      size="md"
    >
      <div className="space-y-4">
        {/* Toggle Mode */}
        {!importing && (
          <div className="flex bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl shrink-0">
            <button
              onClick={() => { setActiveMode('import'); setError(null); }}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5',
                activeMode === 'import' ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              <Upload className="h-3.5 w-3.5" /> Bulk Import File
            </button>
            <button
              onClick={() => { setActiveMode('manual'); setError(null); }}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5',
                activeMode === 'manual' ? 'bg-white/10 text-white' : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              <UserPlus className="h-3.5 w-3.5" /> Add Manually
            </button>
          </div>
        )}

        {/* Common List Selector */}
        {!importing && (
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold font-mono">
              Target List / Segment Name
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input
                type="text"
                placeholder="e.g. Q3 SaaS Target List"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none transition-all placeholder:text-text-tertiary"
              />
            </div>
            <p className="text-[9px] text-text-tertiary leading-relaxed">
              * Assigning a name automatically segments these leads. They will still appear in the general list directory.
            </p>
          </div>
        )}

        {/* Tab 1: Bulk File Import */}
        {activeMode === 'import' && (
          <>
            {/* Drop zone */}
            {!droppedFile && !importing && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer py-10 px-6 text-center select-none',
                  isDragging
                    ? 'border-cyan-500/60 bg-cyan-500/[0.06] scale-[1.01]'
                    : 'border-white/[0.1] hover:border-white/[0.2] bg-white/[0.01] hover:bg-white/[0.025]'
                )}
              >
                {isDragging && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/5 pointer-events-none" />
                )}

                <div className={cn(
                  'h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-200',
                  isDragging
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/[0.04] border-white/[0.08] text-text-tertiary'
                )}>
                  <Upload className="h-6 w-6" />
                </div>

                <div>
                  <p className={cn('text-xs font-semibold transition-colors', isDragging ? 'text-cyan-400' : 'text-text-primary')}>
                    {isDragging ? 'Release to upload' : 'Drag & drop your file here'}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-1">
                    or{' '}
                    <span className="text-accent-cyan underline underline-offset-2 cursor-pointer">browse to upload</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {['CSV', 'XLSX', 'JSON'].map((ext) => (
                    <span key={ext} className="px-2 py-0.5 rounded text-[8px] font-bold border bg-white/5 border-white/10 text-text-secondary">
                      {ext}
                    </span>
                  ))}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            )}

            {/* File preview card */}
            {droppedFile && !importing && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <div className="h-12 w-12 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center shrink-0">
                  {getFileIcon(droppedFile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{droppedFile.name}</p>
                  <p className="text-xs text-text-tertiary font-mono mt-0.5">{formatSize(droppedFile.size)}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-red-500/10 hover:border-red-500/20 text-text-tertiary hover:text-red-400 transition-all cursor-pointer shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Import progress */}
            {importing && droppedFile && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04]">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    {getFileIcon(droppedFile.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{droppedFile.name}</p>
                    <p className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      Importing leads... {Math.min(progress, 100)}%
                    </p>
                  </div>
                  <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-200"
                    style={{ width: Math.min(progress, 100) + '%' }}
                  />
                </div>
              </div>
            )}

            {/* Column hint */}
            {!importing && (
              <div className="p-3 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                <p className="text-[9px] text-text-tertiary font-mono leading-relaxed">
                  <span className="text-text-secondary font-bold block mb-1">Expected columns:</span>
                  <span className="text-accent-cyan">name</span> &middot;{' '}
                  <span className="text-accent-cyan">email</span> &middot;{' '}
                  <span className="text-accent-cyan">company</span> &middot;{' '}
                  <span className="text-accent-cyan">role</span> &middot;{' '}
                  <span className="text-accent-cyan">phone</span>
                </p>
              </div>
            )}
          </>
        )}

        {/* Tab 2: Manual Add Entry */}
        {activeMode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-bold text-text-tertiary font-mono">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-bold text-text-tertiary font-mono">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@company.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-bold text-text-tertiary font-mono">Company</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-bold text-text-tertiary font-mono">Job Role</label>
                <input
                  type="text"
                  placeholder="e.g. VP of Product"
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold text-text-tertiary font-mono">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 123-4567"
                value={manualPhone}
                onChange={(e) => setManualPhone(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none transition-colors"
              />
            </div>
          </form>
        )}

        {/* Error Notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.05]">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Action Panel */}
        {!importing && (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => { handleReset(); onClose(); }}
              className="h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              Cancel
            </button>
            {activeMode === 'import' ? (
              <button
                onClick={handleImport}
                disabled={!droppedFile}
                className={cn(
                  'h-9 px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all',
                  droppedFile
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'
                    : 'bg-white/[0.04] border border-white/[0.08] text-text-tertiary cursor-not-allowed opacity-50'
                )}
              >
                <Upload className="h-3.5 w-3.5" />
                Import Leads
              </button>
            ) : (
              <button
                onClick={handleManualSubmit}
                className="h-9 px-5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Lead
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// --- Toast ---
function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold shadow-xl">
      <Check className="h-4 w-4" /> {msg}
    </div>
  );
}

// --- Page ---
export default function LeadsListPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // Initialize from LocalStorage or Fallback Mock Data
  React.useEffect(() => {
    const stored = localStorage.getItem('mc_leads');
    if (stored) {
      try {
        setLeads(JSON.parse(stored));
      } catch (e) {
        setLeads(DEFAULT_LEADS);
        localStorage.setItem('mc_leads', JSON.stringify(DEFAULT_LEADS));
      }
    } else {
      setLeads(DEFAULT_LEADS);
      localStorage.setItem('mc_leads', JSON.stringify(DEFAULT_LEADS));
    }
  }, []);

  const saveLeads = (updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem('mc_leads', JSON.stringify(updated));
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.listName && lead.listName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleImport = (newLeads: Lead[], segmentName: string) => {
    const updated = [...newLeads, ...leads];
    saveLeads(updated);
    setToast(
      newLeads.length === 1
        ? `Added lead "${newLeads[0].name}" to segment "${segmentName}"`
        : `Successfully imported ${newLeads.length} leads to segment "${segmentName}"`
    );
  };

  return (
    <ClientShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Leads Directory"
          description="Access and filter your qualified prospects. Send outreach sequences or trigger cold-call flows."
          icon={<Users className="h-4 w-4 text-white" />}
          actions={
            <Button variant="primary" size="sm" onClick={() => setShowImportModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Leads
            </Button>
          }
        />

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card innerGlow>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">Total Directory</div>
                <div className="font-mono text-2xl font-bold mt-1 text-text-primary">{leads.length}</div>
              </div>
              <div className="h-10 w-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card innerGlow>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">Highly Qualified</div>
                <div className="font-mono text-2xl font-bold mt-1 text-status-success">
                  {leads.filter(l => l.score >= 90).length}
                </div>
              </div>
              <div className="h-10 w-10 bg-status-success/10 rounded-lg flex items-center justify-center text-status-success">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card innerGlow>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">Outreach Queue</div>
                <div className="font-mono text-2xl font-bold mt-1 text-accent-violet">124</div>
              </div>
              <div className="h-10 w-10 bg-accent-violet/10 rounded-lg flex items-center justify-center text-accent-violet">
                <Mail className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card innerGlow>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-2xs uppercase tracking-wider text-text-tertiary">Pending Cold-Call</div>
                <div className="font-mono text-2xl font-bold mt-1 text-status-warning">48</div>
              </div>
              <div className="h-10 w-10 bg-status-warning/10 rounded-lg flex items-center justify-center text-status-warning">
                <Phone className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card innerGlow className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search leads, lists, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-4 py-1.5 text-sm text-text-primary focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 font-sans">
              <Filter className="h-3.5 w-3.5 text-text-tertiary mr-1 flex-shrink-0" />
              {['all', 'new', 'contacted', 'qualified', 'nurturing', 'unqualified'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all uppercase tracking-wider text-[10px] cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-gradient-accent text-white border-transparent shadow-glow-cyan'
                      : 'bg-transparent border-white/[0.08] text-text-secondary hover:bg-white/5'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Leads Table */}
        <Card innerGlow className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Lead Info</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Company</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Segment List</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary font-mono">Contact</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary text-center">AI Score</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-medium text-sm">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Name / Role */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-text-primary font-semibold">{lead.name}</span>
                          <span className="text-2xs text-text-tertiary">{lead.role}</span>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="p-4 text-text-secondary">{lead.company}</td>

                      {/* Segment List */}
                      <td className="p-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
                          {lead.listName || 'General List'}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4">
                        <div className="flex flex-col text-xs font-mono">
                          <span className="text-text-secondary flex items-center gap-1">
                            <Mail className="h-3 w-3 text-text-tertiary" /> {lead.email}
                          </span>
                          <span className="text-text-tertiary flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-text-tertiary" /> {lead.phone}
                          </span>
                        </div>
                      </td>

                      {/* AI Score */}
                      <td className="p-4 text-center">
                        <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                          lead.score >= 90
                            ? 'bg-status-success/10 text-status-success border border-status-success/20'
                            : lead.score >= 80
                            ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                            : 'bg-white/5 text-text-secondary'
                        }`}>
                          {lead.score}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <StatusDot
                            status={
                              lead.status === 'qualified' ? 'success'
                              : lead.status === 'new' ? 'live'
                              : lead.status === 'contacted' ? 'idle'
                              : lead.status === 'nurturing' ? 'warning'
                              : 'danger'
                            }
                          />
                          <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
                            {lead.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm"><Mail className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm"><Phone className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-tertiary italic">
                      No leads match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <AddLeadsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      <Toast msg={toast} onDone={() => setToast(null)} />
    </ClientShell>
  );
}
