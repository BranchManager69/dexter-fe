'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './overlay.module.css';
import { LeaderboardColumn, type LeaderboardEntry } from './LeaderboardColumn';
import type {
  OverlayData,
  TopStream,
  ViewerTrendPoint,
  MarketCapTrendPoint,
} from '../../../lib/overlay/pumpstreams';

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const TREND_TIME_ZONE = 'America/New_York';
const TREND_TIME_ZONE_LABEL = 'Times in Eastern Time (ET)';
const VIEWER_DELTA_HINT = 'viewers vs last update';
const MARKET_DELTA_HINT = 'cap vs last update';

export type OverlayClientProps = {
  initialData: OverlayData | null;
  refreshIntervalMs?: number;
  layoutVariant?: 'balanced' | 'compact';
};

type OverlayState = {
  data: OverlayData | null;
  error: string | null;
  lastUpdated: Date | null;
  viewerDeltas: Record<string, number>;
  marketCapDeltas: Record<string, number>;
};

type SparklineSeriesPoint = {
  label: string;
  value: number;
  iso: string;
};

type Sparkline = {
  polyline: string;
  areaPath: string;
  points: Array<{ x: number; y: number; iso: string; label: string }>;
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

function formatUsdCompact(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${numberFormatter.format(Math.round(value))}`;
}

function formatMarketCap(stream: TopStream): string {
  const usd = stream.marketCapUsd ?? null;
  if (usd !== null && Number.isFinite(usd)) {
    return formatUsdCompact(usd);
  }
  const sol = stream.marketCapSol;
  return sol !== null && Number.isFinite(sol) ? `${sol.toFixed(1)} SOL` : '—';
}

function formatMarketDelta(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  if (abs >= 1) return `$${numberFormatter.format(Math.round(abs))}`;
  return '$0';
}

function formatViewers(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—';
  return numberFormatter.format(value);
}

function formatViewerDelta(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 10_000) return `${(abs / 1000).toFixed(0)}k`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}k`;
  return numberFormatter.format(abs);
}

function buildViewerSeries(trend: ViewerTrendPoint[]): SparklineSeriesPoint[] {
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

function buildMarketSeries(trend: MarketCapTrendPoint[]): SparklineSeriesPoint[] {
  if (!trend.length) return [];
  return trend.map((point) => {
    const date = new Date(point.bucket);
    const label = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true,
      timeZone: TREND_TIME_ZONE,
    });
    return { label, value: point.totalMarketCap, iso: point.bucket };
  });
}

function buildSparkline(series: SparklineSeriesPoint[]): Sparkline {
  if (!series.length) {
    return { polyline: '', areaPath: '', points: [] };
  }

  const values = series.map((point) => point.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);

  const points = series.map((point, index) => {
    const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100;
    const y = 100 - ((point.value - min) / range) * 100;
    return { x, y, iso: point.iso, label: point.label };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `M ${first.x} 100 L ${first.x} ${first.y} ${polyline} L ${last.x} 100 Z`;

  return { polyline, areaPath, points };
}

function formatSnapshotAge(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return 'Updated —';
  if (seconds < 5) return 'Updated just now';
  if (seconds < 60) return `Updated ${Math.max(1, Math.round(seconds))}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `Updated ${hours}h ago`;
}

function formatDropCountdown(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `Drop ${minutes}:${secs.toString().padStart(2, '0')}`;
}

function resolveStatusTone(stream: TopStream): { label: string; tone: 'live' | 'warning' | 'offline' } {
  if (stream.status === 'live') return { label: 'LIVE', tone: 'live' };
  if (stream.status === 'disconnecting') return { label: 'DROP', tone: 'warning' };
  return { label: 'OFF', tone: 'offline' };
}

export function OverlayClient({
  initialData,
  refreshIntervalMs = 15_000,
  layoutVariant = 'balanced',
}: OverlayClientProps) {
  const variant = layoutVariant === 'compact' ? 'compact' : 'balanced';
  const [state, setState] = useState<OverlayState>(() => ({
    data: initialData,
    error: null,
    lastUpdated: initialData ? new Date(initialData.summary.generatedAt) : null,
    viewerDeltas: {},
    marketCapDeltas: {},
  }));
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      data: initialData,
      error: null,
      lastUpdated: initialData ? new Date(initialData.summary.generatedAt) : prev.lastUpdated,
      viewerDeltas: {},
      marketCapDeltas: {},
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
            const previousMarketCaps = new Map(
              previousStreams.map((stream) => [stream.mintId, stream.marketCapUsd ?? null])
            );

            const viewerDeltas: Record<string, number> = {};
            const marketCapDeltas: Record<string, number> = {};

            for (const stream of payload.streams) {
              const currentViewers = stream.viewers ?? 0;
              const prevViewers = previousViewers.get(stream.mintId);
              viewerDeltas[stream.mintId] =
                prevViewers === undefined || prevViewers === null ? 0 : currentViewers - prevViewers;

              const currentCap = stream.marketCapUsd ?? null;
              const prevCap = previousMarketCaps.get(stream.mintId);
              marketCapDeltas[stream.mintId] =
                prevCap === undefined || prevCap === null || currentCap === null ? 0 : currentCap - prevCap;
            }

            return {
              data: payload,
              error: null,
              lastUpdated: new Date(payload.summary.generatedAt),
              viewerDeltas,
              marketCapDeltas,
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

  const { data, error, lastUpdated, viewerDeltas, marketCapDeltas } = state;

  const viewerSeries = useMemo(() => buildViewerSeries(data?.viewerTrend ?? []), [data?.viewerTrend]);
  const marketSeries = useMemo(() => buildMarketSeries(data?.marketCapTrend ?? []), [data?.marketCapTrend]);
  const viewerSparkline = useMemo(() => buildSparkline(viewerSeries), [viewerSeries]);
  const marketSparkline = useMemo(() => buildSparkline(marketSeries), [marketSeries]);

  const latestMarketCap = marketSeries.length ? marketSeries[marketSeries.length - 1].value : null;

  const shellClassName = [
    styles.overlayShell,
    variant === 'compact' ? styles.overlayVariantCompact : styles.overlayVariantBalanced,
  ].join(' ');

  const viewerLeaderboard: LeaderboardEntry[] = useMemo(() => {
    if (!data) return [];
    return [...data.streams]
      .sort((a, b) => (b.viewers ?? -Infinity) - (a.viewers ?? -Infinity))
      .slice(0, 10)
      .map((stream, index) => {
        const delta = viewerDeltas[stream.mintId] ?? 0;
        const deltaTrend: 'up' | 'down' | 'flat' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
        const { label: statusLabel, tone: statusTone } = resolveStatusTone(stream);
        return {
          rank: index + 1,
          key: `${stream.mintId}-viewers`,
          name: simplifyName(stream),
          symbol: stream.symbol ?? '—',
          statusLabel,
          statusTone,
          primaryStat: `Viewers ${formatViewers(stream.viewers)}`,
          secondaryStat: `Cap ${formatMarketCap(stream)}`,
          deltaLabel:
            deltaTrend === 'flat'
              ? 'STEADY'
              : `${deltaTrend === 'up' ? '▲' : '▼'} ${formatViewerDelta(delta)}`,
          deltaTrend,
          deltaHint: VIEWER_DELTA_HINT,
          lastUpdated: formatSnapshotAge(stream.lastSnapshotAgeSeconds),
          extraLabel: formatDropCountdown(stream.dropCountdownSeconds),
        } satisfies LeaderboardEntry;
      });
  }, [data, viewerDeltas]);

  const marketLeaderboard: LeaderboardEntry[] = useMemo(() => {
    if (!data) return [];
    return [...data.streams]
      .sort((a, b) => (b.marketCapUsd ?? -Infinity) - (a.marketCapUsd ?? -Infinity))
      .slice(0, 10)
      .map((stream, index) => {
        const delta = marketCapDeltas[stream.mintId] ?? 0;
        const deltaTrend: 'up' | 'down' | 'flat' = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
        const { label: statusLabel, tone: statusTone } = resolveStatusTone(stream);
        return {
          rank: index + 1,
          key: `${stream.mintId}-market`,
          name: simplifyName(stream),
          symbol: stream.symbol ?? '—',
          statusLabel,
          statusTone,
          primaryStat: `Cap ${formatMarketCap(stream)}`,
          secondaryStat: `Viewers ${formatViewers(stream.viewers)}`,
          deltaLabel:
            deltaTrend === 'flat'
              ? 'STEADY'
              : `${deltaTrend === 'up' ? '▲' : '▼'} ${formatMarketDelta(delta)}`,
          deltaTrend,
          deltaHint: MARKET_DELTA_HINT,
          lastUpdated: formatSnapshotAge(stream.lastSnapshotAgeSeconds),
          extraLabel: formatDropCountdown(stream.dropCountdownSeconds),
        } satisfies LeaderboardEntry;
      });
  }, [data, marketCapDeltas]);

  return (
    <div className={shellClassName}>
      <div className={styles.overlayContent}>
        <div className={styles.overlayHeader}>
          <div className={styles.overlayBrand}>
            <div className={styles.overlayBrandTitle}>Dexter Live</div>
            <div className={styles.overlayBrandSubtitle}>Realtime pulse of PumpStreams and Dexter agents</div>
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
                <span className={styles.summaryCardValue}>{numberFormatter.format(data.summary.liveStreams)}</span>
                <span className={styles.summaryCardHint}>
                  Tracking {data.summary.totalStreams} over the last {Math.round(data.summary.windowMinutes / 60)}h
                </span>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryCardLabel}>Viewers Now</span>
                <span className={styles.summaryCardValue}>{numberFormatter.format(data.summary.totalLiveViewers)}</span>
                <span className={styles.summaryCardHint}>
                  Avg {data.overallViewerAvg ? numberFormatter.format(Math.round(data.overallViewerAvg)) : '—'} viewers (48h)
                </span>
              </article>
              <article className={styles.summaryCard}>
                <span className={styles.summaryCardLabel}>Live Market Cap</span>
                <span className={styles.summaryCardValue}>
                  {formatUsdCompact(Math.round(data.summary.totalLiveMarketCap))}
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
              <div className={styles.leaderboards}>
                <LeaderboardColumn
                  title="Top Streams"
                  subtitle="By Live Viewers"
                  entries={viewerLeaderboard}
                />
                <LeaderboardColumn
                  title="Top Streams"
                  subtitle="By Market Cap"
                  entries={marketLeaderboard}
                />
              </div>

              <aside className={styles.trendPanel}>
                <div className={styles.trendBlock}>
                  <header className={styles.trendBlockHeader}>
                    <span className={styles.trendBlockTitle}>Viewer Trend · 48h</span>
                    <span className={styles.trendBlockStat}>
                      {data.overallViewerAvg
                        ? `${numberFormatter.format(Math.round(data.overallViewerAvg))} avg`
                        : '—'}
                    </span>
                  </header>
                  {viewerSparkline.points.length ? (
                    <div className={styles.trendChart}>
                      <svg
                        className={styles.trendSparkline}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        role="img"
                      >
                        <title>Viewer trend over the last 48 hours</title>
                        <defs>
                          <linearGradient id="overlayViewerTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(123, 139, 255, 0.45)" />
                            <stop offset="100%" stopColor="rgba(123, 139, 255, 0.05)" />
                          </linearGradient>
                        </defs>
                        <path className={styles.trendArea} d={viewerSparkline.areaPath} fill="url(#overlayViewerTrendFill)" />
                        <polyline className={styles.trendLine} points={viewerSparkline.polyline} />
                        {viewerSparkline.points.map((point) => (
                          <circle key={`${point.iso}-viewer`} className={styles.trendDot} cx={point.x} cy={point.y} r={1.2} />
                        ))}
                      </svg>
                      <div className={styles.trendAxis}>
                        {viewerSparkline.points.map((point) => (
                          <span key={`${point.iso}-viewer-label`} className={styles.trendAxisLabel}>
                            {point.label}
                          </span>
                        ))}
                      </div>
                      <footer className={styles.trendTimezoneNote}>{TREND_TIME_ZONE_LABEL}</footer>
                    </div>
                  ) : (
                    <div className={styles.overlayEmpty}>Waiting for trend data…</div>
                  )}
                </div>

                <div className={styles.trendBlock}>
                  <header className={styles.trendBlockHeader}>
                    <span className={styles.trendBlockTitle}>Market Cap Trend · 48h</span>
                    <span className={styles.trendBlockStat}>
                      {latestMarketCap !== null ? formatUsdCompact(latestMarketCap) : '—'} latest
                    </span>
                  </header>
                  {marketSparkline.points.length ? (
                    <div className={styles.trendChart}>
                      <svg
                        className={styles.trendSparkline}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        role="img"
                      >
                        <title>Market cap trend over the last 48 hours</title>
                        <defs>
                          <linearGradient id="overlayMarketTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255, 138, 76, 0.4)" />
                            <stop offset="100%" stopColor="rgba(255, 138, 76, 0.05)" />
                          </linearGradient>
                        </defs>
                        <path className={styles.trendArea} d={marketSparkline.areaPath} fill="url(#overlayMarketTrendFill)" />
                        <polyline className={styles.trendLine} points={marketSparkline.polyline} />
                        {marketSparkline.points.map((point) => (
                          <circle key={`${point.iso}-market`} className={styles.trendDot} cx={point.x} cy={point.y} r={1.2} />
                        ))}
                      </svg>
                      <div className={styles.trendAxis}>
                        {marketSparkline.points.map((point) => (
                          <span key={`${point.iso}-market-label`} className={styles.trendAxisLabel}>
                            {point.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.overlayEmpty}>Waiting for market data…</div>
                  )}
                </div>
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
