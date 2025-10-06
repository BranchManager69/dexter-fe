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
  realtime: 'Dexter Voice (beta)',
  chatgpt: 'ChatGPT Connector',
  claude: 'Claude Connector',
  alexa: 'Alexa Skill',
};

type ReleaseTone = 'available' | 'development' | 'future';

const RELEASE_STATES: Record<string, { tone: ReleaseTone; text: string }> = {
  realtime: { tone: 'available', text: 'Available now' },
  chatgpt: { tone: 'development', text: 'In development' },
  claude: { tone: 'available', text: 'Available now' },
  alexa: { tone: 'future', text: 'Future release' },
};

const DOC_LINKS: Record<string, string> = {
  realtime: '/docs/#/connectors/dexter-voice',
  chatgpt: '/docs/#/connectors/chatgpt-connector',
  claude: '/docs/#/connectors/claude-connector',
  alexa: '/docs/#/connectors/alexa-skill',
};

const RELEASE_TONE_STYLE: Record<ReleaseTone, { background: string; color: string; borderTop: string; shadow: string }> = {
  available: {
    background: 'linear-gradient(120deg, rgba(36, 142, 88, 0.95), rgba(18, 109, 68, 0.85))',
    color: '#d8ffee',
    borderTop: '1px solid rgba(214, 255, 236, 0.55)',
    shadow: '0 -6px 18px rgba(18, 109, 68, 0.42)',
  },
  development: {
    background: 'linear-gradient(120deg, rgba(230, 162, 32, 0.96), rgba(192, 118, 14, 0.86))',
    color: '#fff5e1',
    borderTop: '1px solid rgba(255, 231, 189, 0.55)',
    shadow: '0 -6px 18px rgba(192, 118, 14, 0.38)',
  },
  future: {
    background: 'linear-gradient(120deg, rgba(204, 58, 58, 0.96), rgba(151, 33, 40, 0.9))',
    color: '#ffe4e4',
    borderTop: '1px solid rgba(255, 204, 204, 0.55)',
    shadow: '0 -6px 18px rgba(151, 33, 40, 0.45)',
  },
};

type ConnectorEntry = {
  key: string;
  label: string;
  status: ConnectorStatus;
  tone: ReleaseTone;
  releaseText: string;
  href: string | null;
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
    if (!snapshot) return [] as ConnectorEntry[];
    const connectors = snapshot.connectors ?? {};
    const orderedKeys = ['realtime', 'chatgpt', 'claude', 'alexa'];
    const entries: ConnectorEntry[] = [];

    for (const key of orderedKeys) {
      const status = key === 'realtime' ? snapshot.realtime : connectors[key];
      if (!status) continue;
      const release = RELEASE_STATES[key] ?? { tone: 'available' as ReleaseTone, text: 'Available now' };
      entries.push({
        key,
        label: CONNECTOR_LABELS[key] ?? key,
        status,
        tone: release.tone,
        releaseText: release.text,
        href: DOC_LINKS[key] ?? null,
      });
    }

    for (const [key, status] of Object.entries(connectors)) {
      if (orderedKeys.includes(key)) continue;
      if (!status) continue;
      const release = RELEASE_STATES[key] ?? { tone: 'available' as ReleaseTone, text: 'Available now' };
      entries.push({
        key,
        label: CONNECTOR_LABELS[key] ?? key,
        status,
        tone: release.tone,
        releaseText: release.text,
        href: DOC_LINKS[key] ?? null,
      });
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
            const lastRunLabel = typeof errorData.last_run === 'string' ? formatTimestamp(errorData.last_run) : null;
            message = lastRunLabel
              ? `Dexter Deep Health was refreshed less than 15 minutes ago (last checked ${lastRunLabel}). Please try again later.`
              : 'Dexter Deep Health was refreshed less than 15 minutes ago. Please try again later.';
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
      const message = lastRun
        ? `Dexter Deep Health was refreshed less than 15 minutes ago (last checked ${lastRun}). Please try again later.`
        : 'Dexter Deep Health was refreshed less than 15 minutes ago. Please try again later.';
      setRunError(message);
      setRefreshIndex(prev => prev + 1);
    }
  }, [canTriggerProbe, lastRun, loading, running, runDeepProbe]);

  return (
    <section
      className="deep-health-panel"
      style={{
        position: 'relative',
        marginBottom: 28,
        padding: '22px 28px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        color: '#2b1400',
      }}
    >
      <div aria-hidden style={{
        position: 'absolute',
        inset: '-16px',
        borderRadius: 24,
        background: 'linear-gradient(130deg, rgba(255, 138, 76, 0.12), rgba(255, 203, 148, 0.08))',
        boxShadow: '0 36px 64px rgba(255, 116, 28, 0.28)',
        filter: 'blur(0px)',
        opacity: 0.92,
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute',
        inset: '-26px',
        borderRadius: 36,
        background: 'radial-gradient(70% 90% at 50% 0%, rgba(255, 208, 173, 0.25), rgba(255, 142, 80, 0) 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                border: 'none',
                background: 'transparent',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusLight ok={entry.status.ok} />
                {entry.href ? (
                  <a
                    href={entry.href}
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#4c1d00',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {entry.label}
                    <span style={{ fontSize: 12, opacity: 0.7 }}>↗</span>
                  </a>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#4c1d00' }}>{entry.label}</span>
                )}
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Latency: {formatDuration(entry.status.duration_ms)}</div>
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
              {(() => {
                const toneStyle = RELEASE_TONE_STYLE[entry.tone];
                return (
                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '7px 0',
                      textAlign: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      color: toneStyle.color,
                      background: toneStyle.background,
                      borderTop: toneStyle.borderTop,
                      boxShadow: toneStyle.shadow,
                    }}
                  >
                    {entry.releaseText}
                  </div>
                );
              })()}
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
      <footer style={{
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gap: 16,
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: canTriggerProbe
                ? '1px solid rgba(134, 42, 0, 0.55)'
                : '1px solid rgba(134, 42, 0, 0.35)',
              background: canTriggerProbe
                ? 'linear-gradient(135deg, rgba(240, 108, 0, 0.95), rgba(186, 58, 0, 0.88))'
                : 'rgba(240, 108, 0, 0.26)',
              color: '#fff3e0',
              fontSize: 11,
              letterSpacing: '.11em',
              textTransform: 'uppercase',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            disabled={loading || running}
          >
            {loading || running ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', opacity: 0.65, textAlign: 'right' }}>
            Last checked
          </span>
          <span style={{ fontSize: 12, color: '#3c1900', fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'right' }}>{lastRun}</span>
        </div>
        {runError && (
          <div style={{ fontSize: 11, color: '#6b1600', gridColumn: '1 / -1' }}>{runError}</div>
        )}
      </footer>
      <style jsx>{`
        @media (max-width: 720px) {
          .deep-health-panel {
            padding: 18px 16px 16px;
          }
        }

        @media (max-width: 480px) {
          .deep-health-panel {
            padding: 16px 14px 14px;
          }
        }
      `}</style>
      </div>
    </section>
  );
}

export default HealthStatus;
