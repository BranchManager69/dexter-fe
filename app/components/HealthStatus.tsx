'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
  if (ms < 1000) return `${ms} ms`;
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
  const [snapshot, setSnapshot] = useState<DeepSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const loadSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/health/deep', {
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
        throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 200)}`);
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
  const lastRun = formatTimestamp(snapshot?.timestamp ?? null);

  return (
    <section
      style={{
        marginBottom: 28,
        borderRadius: 12,
        padding: '22px 24px 20px',
        background: 'linear-gradient(135deg, rgba(6, 12, 26, 0.9), rgba(18, 36, 63, 0.86))',
        border: '1px solid rgba(123, 139, 255, 0.26)',
        boxShadow: '0 20px 44px rgba(5, 10, 24, 0.54)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusLight ok={overallOk} />
          <div>
            <div style={{ fontSize: 13, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.7 }}>Dexter Deep Health</div>
            <div style={{ fontSize: 22, color: '#f4f7ff', fontWeight: 600 }}>
              {loading ? 'Checking…' : overallOk ? 'All systems operational' : 'Attention required'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, opacity: 0.72 }}>
            Last run · <span style={{ color: '#dce5ff' }}>{lastRun}</span>
          </div>
          <button
            type="button"
            onClick={() => setRefreshIndex(prev => prev + 1)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid rgba(123, 139, 255, 0.34)',
              background: 'rgba(10, 18, 42, 0.74)',
              color: '#dce5ff',
              fontSize: 12,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {error ? (
        <div style={{
          padding: '14px 16px',
          borderRadius: 10,
          border: '1px solid rgba(255, 153, 153, 0.45)',
          background: 'linear-gradient(135deg, rgba(255, 120, 120, 0.18), rgba(76, 20, 20, 0.24))',
          color: '#ffe3e3',
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
                border: '1px solid rgba(123, 139, 255, 0.22)',
                background: 'rgba(8, 16, 32, 0.76)',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f5ff' }}>{entry.label}</div>
                <StatusLight ok={entry.status.ok} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Duration: {formatDuration(entry.status.duration_ms)}</div>
              {entry.status.error && (
                <div style={{
                  fontSize: 12,
                  color: '#ffd4d4',
                  background: 'rgba(255, 120, 120, 0.08)',
                  border: '1px solid rgba(255, 120, 120, 0.28)',
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
              border: '1px solid rgba(123, 139, 255, 0.2)',
              background: 'rgba(10, 18, 38, 0.6)',
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
