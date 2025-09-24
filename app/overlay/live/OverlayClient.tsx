'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './overlay.module.css';
import type { OverlayData, TopStream, ViewerTrendPoint } from '../../../lib/overlay/pumpstreams';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const TREND_TIME_ZONE = 'America/New_York';
const TREND_TIME_ZONE_LABEL = 'Times in Eastern Time (ET)';
const VIEWER_DELTA_HINT = 'vs last update';

export type OverlayClientProps = {
  initialData: OverlayData | null;
  refreshIntervalMs?: number;
};

type SortMode = 'marketCap' | 'viewers';

type OverlayState = {
  data: OverlayData | null;
  error: string | null;
  lastUpdated: Date | null;
  sortMode: SortMode;
  viewerDeltas: Record<string, number>;
};

function formatRelativeTime(from: Date | null, nowMs: number): string {
  if (!from) return '—';
  const deltaSeconds = Math.max(0, Math.floor((nowMs - from.getTime()) / 1000));
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  return `${deltaHours}h ago`;
}

function simplifyName(stream: TopStream): string {
  if (stream.name) return stream.name;
  if (stream.symbol) return stream.symbol;
  return stream.mintId.slice(0, 6).toUpperCase();
}

function formatMarketCap(stream: TopStream): string {
  const usd = stream.marketCapUsd ?? null;
  if (usd !== null && Number.isFinite(usd)) {
    if (usd >= 1_000_000_000) return `${(usd / 1_000_000_000).toFixed(1)}B`;
    if (usd >= 1_000_000) return `${(usd / 1_000_000).toFixed(1)}M`;
    if (usd >= 1_000) return `${(usd / 1_000).toFixed(1)}K`;
    return `$${numberFormatter.format(usd)}`;
  }
  const sol = stream.marketCapSol;
  return sol !== null && Number.isFinite(sol) ? `${sol.toFixed(1)} SOL` : '—';
}

function formatViewers(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return numberFormatter.format(value);
}

function formatDelta(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10_000) return `${(abs / 1000).toFixed(0)}k`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}k`;
  return numberFormatter.format(abs);
}

function buildTrendSeries(
  trend: ViewerTrendPoint[]
): Array<{ label: string; value: number; iso: string }> {
  if (!trend.length) return [];
  return trend
    .slice(-12)
    .map((point) => {
      const date = new Date(point.hour);
      const label = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
        timeZone: TREND_TIME_ZONE,
      });
      return { label, value: point.avgViewers, iso: point.hour };
    });
}

export function OverlayClient({ initialData, refreshIntervalMs = 15_000 }: OverlayClientProps) {
  const [state, setState] = useState<OverlayState>(() => ({
    data: initialData,
    error: null,
    lastUpdated: initialData ? new Date(initialData.summary.generatedAt) : null,
    sortMode: 'marketCap',
    viewerDeltas: {},
  }));
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      data: initialData,
      error: null,
      lastUpdated: initialData ? new Date(initialData.summary.generatedAt) : prev.lastUpdated,
      viewerDeltas: {},
    }));
  }, [initialData]);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const response = await fetch('/api/overlay/live', { cache: 'no-store' });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Overlay refresh failed ${response.status}`);
        }
        const payload = (await response.json()) as OverlayData;
        if (!cancelled) {
          setState((prev) => {
            const previousStreams = prev.data?.streams ?? [];
            const previousViewers = new Map(
              previousStreams.map((stream) => [stream.mintId, stream.viewers ?? null])
            );

            const viewerDeltas: Record<string, number> = {};
            for (const stream of payload.streams) {
              const current = stream.viewers ?? 0;
              const previous = previousViewers.get(stream.mintId);
              viewerDeltas[stream.mintId] =
                previous === undefined || previous === null ? 0 : current - previous;
            }

            const nextSort: SortMode = prev.sortMode === 'marketCap' ? 'viewers' : 'marketCap';

            return {
              data: payload,
              error: null,
              lastUpdated: new Date(payload.summary.generatedAt),
              sortMode: nextSort,
              viewerDeltas,
            };
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            error: (error as Error).message ?? 'overlay_refresh_failed',
          }));
        }
      }
    }

    tick();
    const id = setInterval(tick, refreshIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refreshIntervalMs]);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data, error, lastUpdated, sortMode, viewerDeltas } = state;

  const trendSeries = useMemo(
    () => buildTrendSeries(data?.viewerTrend ?? []),
    [data?.viewerTrend]
  );

  const sparkline = useMemo(() => {
    if (!trendSeries.length) {
      return {
        polyline: '',
        areaPath: '',
        points: [] as Array<{ x: number; y: number; iso: string; label: string }>,
      };
    }
    const values = trendSeries.map((point) => point.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = Math.max(max - min, 1);

    const points = trendSeries.map((point, index) => {
      const x = trendSeries.length === 1 ? 50 : (index / (trendSeries.length - 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return { x, y, iso: point.iso, label: point.label };
    });

    const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
    const first = points[0];
    const last = points[points.length - 1];
    const areaPath = `M ${first.x} 100 L ${first.x} ${first.y} ${polyline} L ${last.x} 100 Z`;

    return { polyline, areaPath, points };
  }, [trendSeries]);

  const sortedStreams = useMemo(() => {
    if (!data) return [] as TopStream[];
    const copy = [...data.streams];
    if (sortMode === 'viewers') {
      copy.sort((a, b) => (b.viewers ?? -Infinity) - (a.viewers ?? -Infinity));
    } else {
      copy.sort((a, b) => (b.marketCapUsd ?? -Infinity) - (a.marketCapUsd ?? -Infinity));
    }
    return copy.slice(0, 6);
  }, [data, sortMode]);

  const sortLabel = sortMode === 'marketCap' ? 'Sorted by Market Cap' : 'Sorted by Live Viewers';

  return (
    <div className={styles.overlayShell}>
      <div className={styles.overlayContent}>
        <div className={styles.overlayHeader}>
          <div className={styles.overlayBrand}>
            <div className={styles.overlayBrandTitle}>Dexter Live</div>
            <div className={styles.overlayBrandSubtitle}>
              Realtime pulse of PumpStreams and Dexter agents
            </div>
          </div>
          <div className={styles.overlayMeta}>
            <span className={styles.overlayMetaPill}>ON AIR</span>
            <span>Updated {formatRelativeTime(lastUpdated, nowMs)}</span>
            {error ? <span style={{ color: '#f87171' }}>Refresh error: {error}</span> : null}
          </div>
        </div>

        {data ? (
          <>
            <section className={styles.overlaySummary}>
              <article className={styles.summaryCard}>
                <span className={styles.summaryCardLabel}>Live Streams</span>
                <span className={styles.summaryCardValue}>
                  {numberFormatter.format(data.summary.liveStreams)}
                </span>
                <span className={styles.summaryCardHint}>
                  Tracking {data.summary.totalStreams} over the last {Math.round(data.summary.windowMinutes / 60)}h
                </span>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryCardLabel}>Viewers Now</span>
                <span className={styles.summaryCardValue}>
                  {numberFormatter.format(data.summary.totalLiveViewers)}
                </span>
                <span className={styles.summaryCardHint}>
                  Avg {data.overallViewerAvg ? numberFormatter.format(Math.round(data.overallViewerAvg)) : '—'} viewers (48h)
                </span>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryCardLabel}>Live Market Cap</span>
                <span className={styles.summaryCardValue}>
                  {currencyFormatter.format(Math.round(data.summary.totalLiveMarketCap))}
                </span>
                <span className={styles.summaryCardHint}>Dexter feed monitored continuously</span>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryCardLabel}>Highlights</span>
                <span className={styles.summaryCardValue}>
                  {data.extremes?.max ? numberFormatter.format(data.extremes.max.totalViewers) : '—'}
                </span>
                <span className={styles.summaryCardHint}>
                  Peak viewers{' '}
                  {data.extremes?.max
                    ? new Date(data.extremes.max.timestamp).toLocaleString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZone: TREND_TIME_ZONE,
                      })
                    : '—'}
                </span>
              </article>
            </section>

            <section className={styles.overlayMain}>
              <div>
                <header className={styles.topStreamsHeader}>
                  <span className={styles.topStreamsTitle}>Top Streams</span>
                  <span className={styles.topStreamsSort}>{sortLabel}</span>
                </header>
                <div className={styles.topStreams}>
                  {sortedStreams.map((stream, index) => {
                    const delta = viewerDeltas[stream.mintId] ?? 0;
                    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
                    return (
                      <article key={stream.mintId} className={styles.topStreamCard}>
                        <span className={styles.topStreamRank}>#{index + 1}</span>
                        {stream.thumbnail ? (
                          <div
                            className={styles.topStreamThumbnail}
                            style={{ backgroundImage: `url(${stream.thumbnail})` }}
                            aria-hidden
                          />
                        ) : null}
                        <header className={styles.topStreamHeader}>
                          <div className={styles.topStreamIdentity}>
                            <span className={styles.topStreamName}>{simplifyName(stream)}</span>
                            <span className={styles.topStreamSymbol}>{stream.symbol ?? '—'}</span>
                          </div>
                          <span
                            className={`${styles.topStreamBadge} ${
                              stream.status === 'live'
                                ? styles.topStreamBadgeLive
                                : styles.topStreamBadgeDropping
                            }`}
                          >
                            {stream.status === 'live' ? 'Live' : 'Dropping'}
                          </span>
                        </header>
                        <div className={styles.topStreamMetric}>{formatViewers(stream.viewers)} viewers</div>
                        <div className={styles.topStreamMeta}>
                          <span>Cap {formatMarketCap(stream)}</span>
                          <span>
                            {stream.lastSnapshotAgeSeconds !== null
                              ? `Updated ${Math.max(0, Math.round(stream.lastSnapshotAgeSeconds))}s ago`
                              : 'Fresh data'}
                          </span>
                        </div>
                        <div className={styles.topStreamDelta} data-trend={trend}>
                          {trend === 'flat'
                            ? '• steady'
                            : `${trend === 'up' ? '▲' : '▼'} ${formatDelta(delta)}`}
                          <span className={styles.topStreamDeltaHint}>{VIEWER_DELTA_HINT}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
              <aside className={styles.trendPanel}>
                <header className={styles.trendHeader}>
                  <span className={styles.trendTitle}>Viewer Trend · 48h</span>
                  <span className={styles.trendAverage}>
                    {data.overallViewerAvg
                      ? `${numberFormatter.format(Math.round(data.overallViewerAvg))} avg`
                      : '—'}
                  </span>
                </header>
                {sparkline.points.length ? (
                  <div className={styles.trendChart}>
                    <svg
                      className={styles.trendSparkline}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      role="img"
                    >
                      <title>Viewer trend over the last 48 hours</title>
                      <defs>
                        <linearGradient id="overlayTrendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(123, 139, 255, 0.45)" />
                          <stop offset="100%" stopColor="rgba(123, 139, 255, 0.05)" />
                        </linearGradient>
                      </defs>
                      <path className={styles.trendArea} d={sparkline.areaPath} />
                      <polyline className={styles.trendLine} points={sparkline.polyline} />
                      {sparkline.points.map((point) => (
                        <circle
                          key={point.iso}
                          className={styles.trendDot}
                          cx={point.x}
                          cy={point.y}
                          r={1.2}
                        />
                      ))}
                    </svg>
                    <div className={styles.trendAxis}>
                      {sparkline.points.map((point) => (
                        <span key={`${point.iso}-label`} className={styles.trendAxisLabel}>
                          {point.label}
                        </span>
                      ))}
                    </div>
                    <footer className={styles.trendTimezoneNote}>{TREND_TIME_ZONE_LABEL}</footer>
                  </div>
                ) : (
                  <div className={styles.overlayEmpty}>Waiting for trend data…</div>
                )}
              </aside>
            </section>
          </>
        ) : (
          <div className={styles.overlayEmpty}>Loading live stream data…</div>
        )}
      </div>
      <footer className={styles.overlayFooter}>
        <span className={styles.overlayFooterStatus}>
          <span className={styles.statusIndicator} aria-hidden /> Dexter stack telemetry
        </span>
        <span className={styles.overlayFooterCta}>dexter.cash</span>
      </footer>
    </div>
  );
}
