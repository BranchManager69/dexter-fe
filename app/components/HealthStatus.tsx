'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth-context';

type ConnectorStatus = {
  ok: boolean;
  duration_ms?: number | null;
  error?: string | null;
};

type DeepSnapshot = {
  ok: boolean;
  timestamp: string | null;
  duration_ms?: number | null;
  realtime?: ConnectorStatus & {
    session?: {
      id?: string;
      model?: string;
      expires_at?: number;
    } | null;
  };
  connectors?: Record<string, ConnectorStatus | undefined>;
};

type DeepResponse = {
  ok: boolean;
  cached?: boolean;
  snapshot?: DeepSnapshot;
  error?: string;
};

const CONNECTOR_LABELS: Record<string, string> = {
  realtime: 'Realtime Voice',
  alexa: 'Alexa Skill',
  chatgpt: 'ChatGPT Connector',
  claude: 'Claude Connector',
};

const ADMIN_ROLES = new Set(['admin', 'superadmin']);

function formatTimestamp(value: string | null | undefined) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    })}`;
  } catch {
    return value;
  }
}

function formatDuration(ms?: number | null) {
  if (typeof ms !== 'number' || Number.isNaN(ms)) return '—';
  return `${(ms / 1000).toFixed(2)} s`;
}

function StatusLight({ ok }: { ok: boolean }) {
  const color = ok ? '#5cf19e' : '#ff7878';
  const glow = ok ? 'rgba(92, 241, 158, 0.35)' : 'rgba(255, 120, 120, 0.32)';
  return (
    <span
      style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 16px ${glow}`,
      }}
      aria-hidden="true"
    />
  );
}

export function HealthStatus() {
  const { session } = useAuth();
  const [snapshot, setSnapshot] = useState<DeepSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const isAdmin = useMemo(() => {
    const user = session?.user;
    if (!user) return false;
    const appMeta: any = user.app_metadata || {};
    const rawRoles = appMeta.roles;
    const roles: string[] = Array.isArray(rawRoles)
      ? rawRoles.map((role: unknown) => String(role).toLowerCase())
      : typeof rawRoles === 'string'
        ? [rawRoles.toLowerCase()]
        : [];
    return roles.some(role => ADMIN_ROLES.has(role));
  }, [session]);

  const loadSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/health/deep?ts=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 404) {
          setSnapshot(null);
          setError('Run the deep health probe to populate results.');
          return;
        }
        const text = await response.text();
        throw new Error(`${response.status} ${response.statusText} — ${text.slice(0, 200)}`);
      }
      const data: DeepResponse = await response.json();
      const nextSnapshot = data.snapshot ?? (data as unknown as DeepSnapshot);
      setSnapshot(nextSnapshot ?? null);
    } catch (err: any) {
      setError(err?.message || 'Unable to load health snapshot.');
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnapshot();
  }, [loadSnapshot, refreshIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshIndex(prev => prev + 1);
    }, 90_000);
    return () => clearInterval(interval);
  }, []);

  const connectorEntries = useMemo(() => {
    if (!snapshot) return [] as Array<{ key: string; label: string; status: ConnectorStatus }>;
    const entries: Array<{ key: string; label: string; status: ConnectorStatus }> = [];
    const realtime = snapshot.realtime;
    if (realtime) {
      entries.push({ key: 'realtime', label: CONNECTOR_LABELS.realtime, status: realtime });
    }
    const connectors = snapshot.connectors ?? {};
    for (const key of ['alexa', 'chatgpt', 'claude']) {
      const status = connectors[key];
      if (!status) continue;
      entries.push({ key, label: CONNECTOR_LABELS[key], status });
    }
    // include any other connectors dynamically
    for (const [key, status] of Object.entries(connectors)) {
      if (['alexa', 'chatgpt', 'claude'].includes(key)) continue;
      entries.push({ key, label: CONNECTOR_LABELS[key] ?? key, status: status ?? { ok: false } });
    }
    return entries;
  }, [snapshot]);

  const overallOk = snapshot?.ok ?? false;
  const lastRunTimestamp = snapshot?.timestamp ?? null;
  const lastRunDate = lastRunTimestamp ? new Date(lastRunTimestamp) : null;
  const lastRun = formatTimestamp(lastRunTimestamp);
  const fifteenMinutes = 15 * 60 * 1000;
  const isStale = !lastRunDate || Date.now() - lastRunDate.getTime() > fifteenMinutes;
  const canTriggerProbe = isAdmin || isStale;

  const runDeepProbe = useCallback(async () => {
    try {
      setRunning(true);
      setRunError(null);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/health/run', {
        method: 'POST',
        headers,
        cache: 'no-store',
        credentials: 'include',
      });
      const text = await response.text();
      if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(text);
          if (errorData?.error === 'probe_rate_limited') {
            const retryMs = Number(errorData.retry_after_ms) || 0;
            const retryMinutes = Math.ceil(retryMs / 60000);
            message = retryMinutes > 0
              ? `Probe recently ran. Try again in about ${retryMinutes} minute${retryMinutes === 1 ? '' : 's'}.`
              : 'Probe recently ran. Try again soon.';
          } else if (typeof errorData?.error === 'string') {
            message = errorData.error;
          }
        } catch {
          // ignore JSON parse errors and fall back to default message
        }
        setRunError(message);
        return;
      }
      const data: DeepResponse = JSON.parse(text);
      const nextSnapshot = data.snapshot ?? (data as unknown as DeepSnapshot);
      setSnapshot(nextSnapshot ?? null);
      setRefreshIndex(prev => prev + 1);
    } catch (err: any) {
      setRunError(err?.message || 'Failed to run deep probe.');
    } finally {
      setRunning(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (loading || running) return;
    if (canTriggerProbe) {
      runDeepProbe();
    } else {
      setRefreshIndex(prev => prev + 1);
    }
  }, [canTriggerProbe, loading, running, runDeepProbe]);

  return (
    <section
      style={{
        marginBottom: 28,
        borderRadius: 12,
        padding: '22px 24px 20px',
        background: 'linear-gradient(135deg, rgba(255, 122, 18, 0.22), rgba(255, 177, 82, 0.2))',
        border: '1px solid rgba(255, 173, 96, 0.45)',
        boxShadow: '0 24px 48px rgba(255, 108, 24, 0.28)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        color: '#2b1400',
      }}
    >
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusLight ok={overallOk} />
          <div>
            <div style={{ fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.65 }}>Dexter Deep Health</div>
            <div style={{ fontSize: 22, color: '#311400', fontWeight: 600 }}>
              {loading ? 'Checking…' : overallOk ? 'All systems operational' : 'Attention required'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Last run · <span style={{ color: '#3c1900', fontWeight: 600 }}>{lastRun}</span>
          </div>
          {runError && (
            <div style={{ fontSize: 11, color: '#6b1600' }}>{runError}</div>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: canTriggerProbe
                ? '1px solid rgba(255, 214, 153, 0.55)'
                : '1px solid rgba(255, 173, 96, 0.35)',
              background: canTriggerProbe
                ? 'linear-gradient(135deg, rgba(255, 229, 180, 0.35), rgba(255, 188, 120, 0.28))'
                : 'rgba(255, 240, 224, 0.32)',
              color: '#4c1d00',
              fontSize: 12,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}
            disabled={loading || running}
          >
            {loading || running ? 'Refreshing…' : 'Refresh status'}
          </button>
        </div>
      </header>

      {error ? (
        <div style={{
          padding: '14px 16px',
          borderRadius: 10,
          border: '1px solid rgba(255, 146, 120, 0.45)',
          background: 'linear-gradient(135deg, rgba(255, 179, 140, 0.35), rgba(255, 122, 18, 0.22))',
          color: '#5c1a00',
          fontSize: 13,
        }}>
          {error}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {connectorEntries.map(entry => (
            <div
              key={entry.key}
              style={{
                borderRadius: 10,
                border: '1px solid rgba(255, 189, 128, 0.4)',
                background: 'rgba(255, 238, 216, 0.55)',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#4c1d00' }}>{entry.label}</div>
                <StatusLight ok={entry.status.ok} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Duration: {formatDuration(entry.status.duration_ms)}</div>
              {entry.status.error && (
                <div style={{
                  fontSize: 12,
                  color: '#6b1600',
                  background: 'rgba(255, 180, 140, 0.16)',
                  border: '1px solid rgba(255, 160, 120, 0.35)',
                  borderRadius: 8,
                  padding: '8px 10px',
                }}>
                  {entry.status.error}
                </div>
              )}
            </div>
          ))}
          {!connectorEntries.length && !loading && (
            <div style={{
              gridColumn: '1 / -1',
              fontSize: 13,
              opacity: 0.7,
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid rgba(255, 189, 128, 0.4)',
              background: 'rgba(255, 238, 216, 0.55)',
            }}>
              No deep-health snapshot recorded yet.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default HealthStatus;
