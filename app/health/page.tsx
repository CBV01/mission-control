'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, MemoryStick, HardDrive, Server, RefreshCw, MessageSquare, Wifi, Clock } from 'lucide-react';
import { ClientShell } from '@/components/shell/client-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { api } from '@/lib/api';
import { fmtBytes, fmtDuration, fmtPct, fmtRelative } from '@/lib/utils';

function HealthContent() {
  const { data, isLoading, refetch, isFetching } = useQuery({ queryKey: ['health'], queryFn: api.health, refetchInterval: 10_000 });

  return (
    <>
      <PageHeader
        title="System & VPS Health"
        description="Live snapshot of gateway, platforms, and infrastructure."
        icon={<Activity className="h-4 w-4 text-white" />}
        actions={
          <Button onClick={() => refetch()} loading={isFetching}>
            <RefreshCw className="h-3.5 w-3.5" /> Run Health Check
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* VPS Health Panel */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2"><Server className="h-4 w-4 text-accent-cyan" /><CardTitle>VPS</CardTitle></div>
            <Badge tone="success" dot>Operational</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64" /> : data ? (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="CPU Load (1m)" value={data.vps.cpu.load1.toFixed(2)} />
                  <Stat label="RAM Usage" value={fmtPct(data.vps.ram.pct, 0)} />
                  <Stat label="Disk Usage" value={fmtPct(data.vps.disk.pct, 0)} />
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-2xs">
                      <span className="text-text-secondary flex items-center gap-1.5"><MemoryStick className="h-3 w-3" /> RAM</span>
                      <span className="font-mono text-text-primary">{data.vps.ram.used.toFixed(1)} / {data.vps.ram.total} GB</span>
                    </div>
                    <Progress value={data.vps.ram.pct * 100} tone={data.vps.ram.pct > 0.9 ? 'danger' : 'cyan'} showLabel />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-2xs">
                      <span className="text-text-secondary flex items-center gap-1.5"><HardDrive className="h-3 w-3" /> Disk</span>
                      <span className="font-mono text-text-primary">{data.vps.disk.used} / {data.vps.disk.total} GB</span>
                    </div>
                    <Progress value={data.vps.disk.pct * 100} tone="violet" showLabel />
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 p-3 grid grid-cols-2 gap-3 text-2xs">
                  <div>
                    <div className="text-text-tertiary">Uptime</div>
                    <div className="font-mono text-text-primary">{fmtDuration(data.vps.uptime * 1000)}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary">CPU Cores</div>
                    <div className="font-mono text-text-primary">{data.vps.cpu.cores}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary">Net In</div>
                    <div className="font-mono text-text-primary">{fmtBytes(data.vps.network.bytesIn)}</div>
                  </div>
                  <div>
                    <div className="text-text-tertiary">Net Out</div>
                    <div className="font-mono text-text-primary">{fmtBytes(data.vps.network.bytesOut)}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Gateway & Services */}
        <Card innerGlow>
          <CardHeader>
            <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-accent-violet" /><CardTitle>Gateway & Services</CardTitle></div>
            <StatusDot status={data?.gateway.state === 'running' ? 'live' : 'danger'} label />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64" /> : data ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">ArkiloStudios Gateway</span>
                    <Badge tone="success" dot>Running</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                    <div><span className="text-text-tertiary">PID:</span> <span className="text-text-primary">{data.gateway.pid}</span></div>
                    <div><span className="text-text-tertiary">Uptime:</span> <span className="text-text-primary">{fmtDuration(data.gateway.uptime * 1000)}</span></div>
                    <div><span className="text-text-tertiary">Memory:</span> <span className="text-text-primary">{data.gateway.memoryMb} MB</span></div>
                    <div><span className="text-text-tertiary">Restarts:</span> <span className="text-text-primary">{data.gateway.restartCount}</span></div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-accent-violet" /> Discord
                    </span>
                    <Badge tone="success" dot>Connected</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                    <div><span className="text-text-tertiary">Guild:</span> <span className="text-text-primary">{data.platforms.discord.guild}</span></div>
                    <div><span className="text-text-tertiary">Channels:</span> <span className="text-text-primary">{data.platforms.discord.channels}</span></div>
                    <div><span className="text-text-tertiary">Latency:</span> <span className="text-text-primary">{data.platforms.discord.latencyMs}ms</span></div>
                    <div><span className="text-text-tertiary">Last error:</span> <span className="text-status-success">none</span></div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-status-info" /> Telegram
                    </span>
                    <Badge tone="success" dot>Connected</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                    <div><span className="text-text-tertiary">Chat ID:</span> <span className="text-text-primary">{data.platforms.telegram.chatId}</span></div>
                    <div><span className="text-text-tertiary">Last msg:</span> <span className="text-text-primary">{fmtRelative(data.platforms.telegram.lastMessageAt)}</span></div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                  <div className="text-2xs uppercase tracking-wider text-text-tertiary mb-2">Service Dependencies</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['SQLite', 'OpenRouter', 'Telegram API', 'Discord API', 'Vapi', 'OpenAI Whisper'].map((s) => (
                      <div key={s} className="flex items-center gap-1.5"><StatusDot status="success" /><span className="text-text-secondary">{s}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function HealthPage() {
  return <ClientShell><HealthContent /></ClientShell>;
}
