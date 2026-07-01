'use client';

import * as React from 'react';
import {
  Mail, Plus, RefreshCw, Settings, Trash2,
  Check, X, Info, Globe, AlertTriangle,
  Key, Shield, MailOpen, Lock, Activity,
  Zap, Server, Cpu, Database, Weight,
  Flame, Sparkles, CheckCircle2, Sliders,
} from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface SMTPAccount {
  slotNumber: number;
  email: string | null;
  name: string | null;
  dailyLimit: number;
  sentToday: number;
  status: 'connected' | 'reauth_needed' | 'disabled' | 'unconfigured';
  isActive: boolean;
  health: number;
  weight: number; // load weight
  provider: 'gmail' | 'smtp' | null;
}

const INITIAL_ACCOUNTS: SMTPAccount[] = [
  { slotNumber: 1, email: 'codebyvictor02@gmail.com', name: 'Victor Victor', dailyLimit: 500, sentToday: 112, status: 'connected', isActive: true, health: 99, weight: 1.0, provider: 'gmail' },
  { slotNumber: 2, email: 'harrycoleman361@gmail.com', name: 'Harry Coleman', dailyLimit: 500, sentToday: 48, status: 'connected', isActive: false, health: 97, weight: 0.8, provider: 'gmail' },
  { slotNumber: 3, email: 'nerissaholliford@gmail.com', name: 'Nerissa Holliford', dailyLimit: 500, sentToday: 12, status: 'connected', isActive: false, health: 100, weight: 1.2, provider: 'gmail' },
  { slotNumber: 4, email: 'mubzeysmith@gmail.com', name: 'Mubzey Smith', dailyLimit: 500, sentToday: 0, status: 'connected', isActive: false, health: 94, weight: 1.0, provider: 'gmail' },
  { slotNumber: 5, email: null, name: null, dailyLimit: 500, sentToday: 0, status: 'unconfigured', isActive: false, health: 0, weight: 1.0, provider: null },
  { slotNumber: 6, email: null, name: null, dailyLimit: 500, sentToday: 0, status: 'unconfigured', isActive: false, health: 0, weight: 1.0, provider: null },
];

function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent-cyan/30 bg-bg-elevated shadow-glow-cyan text-accent-cyan text-xs font-semibold">
      <Check className="h-3.5 w-3.5" /> {msg}
    </div>
  );
}

export default function OutreachAccountsPage() {
  const [accounts, setAccounts] = React.useState<SMTPAccount[]>(INITIAL_ACCOUNTS);
  const [toast, setToast] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<number | null>(null);
  
  // Modal fields
  const [inputName, setInputName] = React.useState('');
  const [inputEmail, setInputEmail] = React.useState('');
  const [isConnecting, setIsConnecting] = React.useState(false);
  const showToast = (msg: string) => setToast(msg);
  const dismissToast = React.useCallback(() => setToast(null), []);
  const activeAccount = accounts.find((a) => a.isActive);
  const activeEmail = activeAccount ? activeAccount.email : null;
  const handleMakeActive = (slotNumber: number) => {
    setAccounts((prev) =>
      prev.map((a) => ({
        ...a,
        isActive: a.slotNumber === slotNumber,
      }))
    );
    const target = accounts.find((a) => a.slotNumber === slotNumber);
    if (target && target.email) {
      showToast(target.email + ' deployed to HOT ROTATION pool');
    }
  };
  const handleWeightChange = (slotNumber: number, delta: number) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.slotNumber === slotNumber) {
          const nextW = Math.max(0.2, Math.min(2.0, Number((a.weight + delta).toFixed(1))));
          return { ...a, weight: nextW };
        }
        return a;
      })
    );
  };
  const handleConfigureClick = (slotNumber: number) => {
    const acc = accounts.find((a) => a.slotNumber === slotNumber);
    setSelectedSlot(slotNumber);
    if (acc && acc.email) {
      setInputName(acc.name || '');
      setInputEmail(acc.email);
    } else {
      setInputName('');
      setInputEmail('');
    }
    setModalOpen(true);
  };
  const handleDisconnect = (slotNumber: number) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.slotNumber === slotNumber
          ? { ...a, email: null, name: null, status: 'unconfigured', isActive: false, health: 0, weight: 1.0, provider: null }
          : a
      )
    );
    
    setAccounts((prev) => {
      const activeStillExists = prev.some((a) => a.isActive);
      if (!activeStillExists) {
        const firstConfigured = prev.find((a) => a.email !== null);
        if (firstConfigured) {
          return prev.map((a) =>
            a.slotNumber === firstConfigured.slotNumber ? { ...a, isActive: true } : a
          );
        }
      }
      return prev;
    });
    setModalOpen(false);
    showToast('Slot de-provisioned successfully');
  };
  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim() || !inputName.trim()) {
      showToast('Fields must not be empty');
      return;
    }
    if (!inputEmail.includes('@') || !inputEmail.endsWith('.com')) {
      showToast('Enter a valid email address');
      return;
    }
    setIsConnecting(true);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => {
          if (a.slotNumber === selectedSlot) {
            const noActiveExists = !prev.some((x) => x.isActive);
            return {
              ...a,
              email: inputEmail,
              name: inputName,
              status: 'connected',
              isActive: noActiveExists ? true : a.isActive,
              health: 100,
              weight: 1.0,
              provider: 'gmail',
            };
          }
          return a;
        })
      );
      
      setIsConnecting(false);
      setModalOpen(false);
      showToast('OAuth identity authenticated successfully');
    }, 1800);
  };

  // Compute pool aggregations
  const totalSent = accounts.reduce((sum, a) => sum + a.sentToday, 0);
  const totalCapacity = accounts.reduce((sum, a) => sum + (a.email ? a.dailyLimit : 0), 0);
  const configuredCount = accounts.filter((a) => a.email !== null).length;
  const poolHealth = configuredCount > 0 
    ? Math.round(accounts.reduce((sum, a) => sum + (a.email ? a.health : 0), 0) / configuredCount) 
    : 100;

  return (
    <ClientShell>
      <div className="flex flex-col gap-6">
        
        {/* Cyberpunk Telemetry Header Section */}
        <div className="flex items-start justify-between flex-wrap gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow-cyan text-black shrink-0">
                <Cpu className="h-4 w-4 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider text-text-primary uppercase bg-gradient-cyan bg-clip-text text-transparent">Rotation Engine</h1>
                <p className="text-[10px] text-text-tertiary font-mono tracking-widest uppercase">SMTP Node Pool Monitor</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {activeEmail && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 text-xs text-accent-cyan font-mono">
                <Activity className="h-3 w-3 animate-pulse" />
                <span className="text-[10px] text-text-tertiary font-sans font-semibold uppercase">Hot Node</span>
                <span>{activeEmail}</span>
              </div>
            )}
            <Button onClick={() => handleConfigureClick(accounts.find(a => !a.email)?.slotNumber || 5)} variant="primary" className="h-9 text-xs font-bold uppercase tracking-wider bg-gradient-accent text-white border-none shadow-glow-violet hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Provision Node
            </Button>
          </div>
        </div>

        {/* Engine status strip banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Rotation Status', val: 'HOT ACTIVE', desc: 'Pool rotation operational', color: 'text-status-success', icon: <Flame className="h-4 w-4 text-status-success" /> },
            { label: 'Sender Health', val: poolHealth + '% EXCELLENT', desc: 'Weighted pool score', color: 'text-accent-cyan', icon: <Shield className="h-4 w-4 text-accent-cyan" /> },
            { label: 'Aggregate Usage', val: totalSent + ' / ' + totalCapacity + ' Sent', desc: 'Daily delivery tracking', color: 'text-accent-violet', icon: <Activity className="h-4 w-4 text-accent-violet" /> },
            { label: 'Configured Slots', val: configuredCount + ' / ' + accounts.length + ' Nodes', desc: 'Active instances in pool', color: 'text-text-primary', icon: <Database className="h-4 w-4 text-text-secondary" /> },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 flex items-center justify-between border border-white/[0.06] bg-bg-elevated/40">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-text-tertiary font-semibold font-mono">{stat.label}</div>
                <div className={cn('text-sm font-bold font-mono mt-1', stat.color)}>{stat.val}</div>
                <div className="text-[10px] text-text-tertiary mt-0.5">{stat.desc}</div>
              </div>
              <div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* SMTP Cards upgraded grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {accounts.map((acc) => {
            const isConfigured = acc.email !== null;

            // Color maps based on slot state (matching campaign card system)
            const accentStripe = acc.isActive
              ? 'bg-gradient-to-r from-violet-500/0 via-violet-500 to-violet-500/0'
              : !isConfigured
              ? 'bg-gradient-to-r from-white/0 via-white/10 to-white/0'
              : acc.status === 'reauth_needed'
              ? 'bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0'
              : 'bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0';

            const gradientWash = acc.isActive
              ? 'from-violet-500/15 via-cyan-500/5 to-transparent'
              : !isConfigured
              ? 'from-white/[0.03] to-transparent'
              : acc.status === 'reauth_needed'
              ? 'from-amber-500/15 via-amber-500/5 to-transparent'
              : 'from-emerald-500/12 via-emerald-500/3 to-transparent';

            const borderColor = acc.isActive
              ? 'border-violet-500/50 hover:border-violet-500/70 shadow-lg shadow-violet-500/10'
              : !isConfigured
              ? 'border-dashed border-white/10 hover:border-accent-cyan/30'
              : acc.status === 'reauth_needed'
              ? 'border-amber-500/30 hover:border-amber-500/50'
              : 'border-white/[0.07] hover:border-emerald-500/30';

            const iconBg = acc.isActive
              ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
              : !isConfigured
              ? 'bg-white/[0.03] border-white/[0.08] text-text-tertiary'
              : acc.status === 'reauth_needed'
              ? 'bg-amber-500/15 border-amber-500/20 text-amber-400'
              : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400';

            const pulseDot = acc.isActive
              ? 'bg-violet-400'
              : !isConfigured
              ? 'bg-white/20'
              : acc.status === 'reauth_needed'
              ? 'bg-amber-400'
              : 'bg-emerald-400';

            const statusLabel = acc.isActive
              ? 'Hot Rotation'
              : !isConfigured
              ? 'Vacant'
              : acc.status === 'reauth_needed'
              ? 'Reauth Needed'
              : 'Standby';

            if (isConfigured) {
              return (
                <div
                  key={acc.slotNumber}
                  className={cn(
                    'group relative rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col min-h-[260px]',
                    borderColor
                  )}
                >
                  {/* Top accent stripe */}
                  <div className={cn('h-[2px] w-full shrink-0', accentStripe)} />

                  {/* Gradient wash */}
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70 pointer-events-none', gradientWash)} />

                  <div className="relative p-5 flex flex-col gap-4 flex-1">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] tracking-widest text-text-tertiary font-bold">[NODE 0{acc.slotNumber}]</span>
                        {/* Animated status dot + label */}
                        <span className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            {acc.isActive && (
                              <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', pulseDot)} />
                            )}
                            <span className={cn('relative inline-flex rounded-full h-2 w-2', pulseDot)} />
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">{statusLabel}</span>
                        </span>
                      </div>
                      <div className={cn('flex items-center gap-1 text-[10px] font-mono font-bold', acc.health >= 95 ? 'text-emerald-400' : acc.health >= 80 ? 'text-amber-400' : 'text-red-400')}>
                        <CheckCircle2 className="h-3 w-3" /> {acc.health}%
                      </div>
                    </div>

                    {/* Sender info */}
                    <div className="flex items-start gap-3">
                      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 transition-all', iconBg)}>
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text-primary text-sm truncate">{acc.name}</h3>
                        <p className="text-[11px] font-mono text-text-secondary truncate mt-0.5">{acc.email}</p>
                        <span className="inline-block mt-1.5 text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-text-tertiary">Gmail OAuth</span>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <div className="p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                        <div className="text-[9px] uppercase tracking-wider text-text-tertiary mb-1 font-mono">Capacity</div>
                        <div className="text-xs font-bold text-text-primary font-mono">{acc.sentToday} / {acc.dailyLimit}</div>
                        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1.5">
                          <div
                            className={cn('h-full rounded-full', acc.isActive ? 'bg-violet-400' : 'bg-emerald-400')}
                            style={{ width: (acc.sentToday / acc.dailyLimit) * 100 + '%' }}
                          />
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-text-tertiary font-mono">
                          <span>Weight</span>
                          <span className={cn('font-bold', acc.isActive ? 'text-violet-400' : 'text-emerald-400')}>{acc.weight}x</span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-2">
                          <button onClick={() => handleWeightChange(acc.slotNumber, -0.1)} className="h-6 w-6 rounded bg-white/[0.04] hover:bg-white/[0.1] text-text-secondary hover:text-text-primary text-[11px] font-bold font-mono transition-colors border border-white/[0.06] cursor-pointer flex items-center justify-center">-</button>
                          <button onClick={() => handleWeightChange(acc.slotNumber, 0.1)} className="h-6 w-6 rounded bg-white/[0.04] hover:bg-white/[0.1] text-text-secondary hover:text-text-primary text-[11px] font-bold font-mono transition-colors border border-white/[0.06] cursor-pointer flex items-center justify-center">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {acc.isActive ? (
                        <button
                          onClick={() => handleConfigureClick(acc.slotNumber)}
                          className="flex-1 flex items-center justify-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        >
                          <Settings className="h-3.5 w-3.5" /> Configure Node
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleMakeActive(acc.slotNumber)}
                            className="flex-1 flex items-center justify-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Deploy Node
                          </button>
                          <button
                            onClick={() => handleConfigureClick(acc.slotNumber)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all cursor-pointer shrink-0"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Unconfigured / vacant slot
            return (
              <div
                key={acc.slotNumber}
                className={cn(
                  'group relative rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col min-h-[260px]',
                  borderColor
                )}
              >
                {/* Top accent stripe */}
                <div className={cn('h-[2px] w-full shrink-0', accentStripe)} />

                {/* Subtle gradient wash */}
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none', gradientWash)} />

                <div className="relative p-5 flex flex-col gap-3 flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] tracking-widest text-text-tertiary font-bold">[NODE 0{acc.slotNumber}]</span>
                      <span className="flex items-center gap-1.5">
                        <span className={cn('relative inline-flex rounded-full h-2 w-2', pulseDot)} />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-text-tertiary">{statusLabel}</span>
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-text-tertiary uppercase">Provision Required</span>
                  </div>

                  {/* Center deploy button */}
                  <button
                    onClick={() => handleConfigureClick(acc.slotNumber)}
                    className="flex-1 my-2 flex flex-col items-center justify-center border border-dashed border-white/[0.08] hover:border-accent-cyan/25 bg-white/[0.01] hover:bg-accent-cyan/[0.02] rounded-xl text-xs text-text-secondary transition-all cursor-pointer p-4 gap-2.5"
                  >
                    <div className="h-10 w-10 rounded-xl border border-dashed border-white/10 group-hover:border-accent-cyan/20 flex items-center justify-center transition-colors">
                      <Plus className="h-4 w-4 text-text-tertiary group-hover:text-accent-cyan transition-colors" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-tertiary group-hover:text-text-secondary transition-colors">Deploy Google Identity</span>
                  </button>

                  {/* Footer button */}
                  <button
                    onClick={() => handleConfigureClick(acc.slotNumber)}
                    className="w-full h-9 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-dashed border-white/10 hover:border-accent-cyan/30 hover:bg-white/[0.02] text-text-secondary hover:text-accent-cyan transition-all cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Deploy Instance
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connection configuration Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { if (!isConnecting) setModalOpen(false); }}
        title={accounts.find((a) => a.slotNumber === selectedSlot)?.email ? 'Configure Node 0' + selectedSlot : 'Deploy Node Identity 0' + selectedSlot}
        description="Authenticate a Gmail sender profile using secure OAuth with your rotation pool."
        size="sm"
      >
        <form onSubmit={handleConnectSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold font-mono mb-1.5">
              Sender Identity Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Victor Victor"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              disabled={isConnecting}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-accent-cyan/40 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-text-secondary font-semibold font-mono mb-1.5">
              Gmail Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. codebyvictor02@gmail.com"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              disabled={isConnecting}
              className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-accent-cyan/40 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors"
            />
          </div>

          {/* Warning banner for OAuth scope safety */}
          <div className="flex gap-2.5 p-3 rounded-lg border border-accent-cyan/10 bg-accent-cyan/[0.02]">
            <Lock className="h-4 w-4 text-accent-cyan shrink-0 mt-0.5" />
            <p className="text-[10px] text-text-tertiary leading-relaxed font-mono">
              AUTHORIZE SCANNING: Connection requests google standard OAuth permission. Access token stays secure & encrypted within local telemetry container.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
            <div>
              {accounts.find((a) => a.slotNumber === selectedSlot)?.email && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isConnecting}
                  className="text-xs text-status-danger hover:bg-status-danger/10 hover:text-status-danger border border-transparent hover:border-status-danger/20 transition-all cursor-pointer h-9 px-3 uppercase tracking-wider font-mono font-bold"
                  onClick={() => handleDisconnect(selectedSlot!)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Purge Node
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isConnecting}
                className="h-9 text-xs cursor-pointer font-bold uppercase tracking-wider"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isConnecting}
                className="h-9 text-xs font-bold uppercase tracking-wider cursor-pointer bg-accent-cyan text-black hover:bg-accent-cyan/90 transition-all flex items-center justify-center gap-1.5 min-w-[150px] shadow-glow-cyan"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Syncing secure OAuth...
                  </>
                ) : (
                  <>Sign in with Google</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
      
      <Toast msg={toast} onDone={dismissToast} />
    </ClientShell>
  );
}