const DEFAULT_PUMPSTREAMS_BASE = process.env.NEXT_PUBLIC_PUMPSTREAMS_API_BASE?.replace(/\/$/, '')
  || 'https://pump.dexter.cash';

type FetchOptions = {
  cache?: RequestCache;
  signal?: AbortSignal;
};

async function fetchFromPumpstreams<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`${DEFAULT_PUMPSTREAMS_BASE}${path}`, {
      method: 'GET',
      cache: options.cache ?? 'no-store',
      signal: options.signal ?? controller.signal,
      headers: {
        accept: 'application/json',
        'user-agent': 'dexter-fe-overlay/1.1',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`PumpStreams request failed ${response.status}: ${body.slice(0, 200)}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

export type TopStream = {
  mintId: string;
  name: string | null;
  symbol: string | null;
  thumbnail: string | null;
  status: 'live' | 'disconnecting' | 'offline';
  viewers: number | null;
  marketCapUsd: number | null;
  marketCapSol: number | null;
  lastSnapshotAgeSeconds: number | null;
  dropCountdownSeconds: number | null;
};

type PumpStreamsLiveResponse = {
  generatedAt: string;
  windowMinutes: number;
  streams: Array<{
    mintId: string;
    name: string | null;
    symbol: string | null;
    thumbnail: string | null;
    status: 'live' | 'disconnecting';
    latestAt: string | null;
    dropCountdownSeconds: number | null;
    metrics: {
      lastSnapshotAgeSeconds: number | null;
      viewers: { current: number | null };
      marketCap: {
        current: number | null;
        usd: number | null;
        sol: number | null;
      };
    };
  }>;
  totals: {
    totalStreams: number;
    liveStreams: number;
    disconnectingStreams: number;
    totalLiveViewers: number;
    totalLiveMarketCap: number;
  };
  spotlights?: unknown;
  sort?: string;
};

type PumpStreamsTrendResponse = {
  windowMinutes: number;
  totalSamples: number;
  start: string | null;
  end: string | null;
  averages: {
    overall: number | null;
    daily: Array<{ date: string; avgViewers: number; change?: number; changePct?: number }>;
    hourly: Array<{ hour: string; avgViewers: number }>;
  };
  extrema: {
    min: { timestamp: string; totalViewers: number } | null;
    max: { timestamp: string; totalViewers: number } | null;
  };
};

type PlatformMetricsSample = {
  bucket: string;
  live_streams: number | null;
  total_viewers: number | null;
  total_market_cap: number | null;
};

type PumpStreamsMetricsResponse = {
  windowMinutes: number;
  samples: PlatformMetricsSample[];
};

export type OverlaySummary = {
  totalStreams: number;
  liveStreams: number;
  disconnectingStreams: number;
  totalLiveViewers: number;
  totalLiveMarketCap: number;
  windowMinutes: number;
  generatedAt: string;
};

export type ViewerTrendPoint = {
  hour: string;
  avgViewers: number;
};

export type MarketCapTrendPoint = {
  bucket: string;
  totalMarketCap: number;
};

export type OverlayData = {
  summary: OverlaySummary;
  streams: TopStream[];
  viewerTrend: ViewerTrendPoint[];
  marketCapTrend: MarketCapTrendPoint[];
  overallViewerAvg: number | null;
  extremes: PumpStreamsTrendResponse['extrema'];
};

function mapStreams(response: PumpStreamsLiveResponse): TopStream[] {
  return response.streams.map((stream) => ({
    mintId: stream.mintId,
    name: stream.name,
    symbol: stream.symbol,
    thumbnail: stream.thumbnail,
    status: stream.status ?? 'live',
    viewers: stream.metrics?.viewers?.current ?? null,
    marketCapUsd: stream.metrics?.marketCap?.usd ?? stream.metrics?.marketCap?.current ?? null,
    marketCapSol: stream.metrics?.marketCap?.sol ?? null,
    lastSnapshotAgeSeconds: stream.metrics?.lastSnapshotAgeSeconds ?? null,
    dropCountdownSeconds: stream.dropCountdownSeconds ?? null,
  }));
}

function buildViewerTrend(response: PumpStreamsTrendResponse): ViewerTrendPoint[] {
  return (response.averages?.hourly ?? [])
    .slice(-48)
    .map((point) => ({ hour: point.hour, avgViewers: point.avgViewers }));
}

function buildMarketCapTrend(samples: PlatformMetricsSample[]): MarketCapTrendPoint[] {
  const entries = samples
    .filter((sample) => sample.total_market_cap != null && Number.isFinite(sample.total_market_cap))
    .map((sample) => ({
      bucket: sample.bucket,
      totalMarketCap: Number(sample.total_market_cap),
    }));

  if (!entries.length) return [];
  if (entries.length === 1) {
    return entries;
  }

  const desiredPoints = Math.min(12, entries.length);
  if (desiredPoints === 1) {
    return [entries[entries.length - 1]];
  }

  const step = (entries.length - 1) / (desiredPoints - 1);
  const points: MarketCapTrendPoint[] = [];
  for (let i = 0; i < desiredPoints; i += 1) {
    const index = Math.round(i * step);
    const point = entries[Math.min(entries.length - 1, index)];
    points.push(point);
  }

  return points;
}

export async function fetchOverlayData(): Promise<OverlayData> {
  const [live, trend, metrics] = await Promise.all([
    fetchFromPumpstreams<PumpStreamsLiveResponse>('/api/live'),
    fetchFromPumpstreams<PumpStreamsTrendResponse>('/api/platform/viewer-trend?windowMinutes=2880'),
    fetchFromPumpstreams<PumpStreamsMetricsResponse>('/api/platform/metrics?windowMinutes=2880'),
  ]);

  const summary: OverlaySummary = {
    totalStreams: live.totals?.totalStreams ?? live.streams.length,
    liveStreams: live.totals?.liveStreams ?? live.streams.filter((s) => s.status === 'live').length,
    disconnectingStreams:
      live.totals?.disconnectingStreams ?? live.streams.filter((s) => s.status === 'disconnecting').length,
    totalLiveViewers:
      live.totals?.totalLiveViewers ?? live.streams.reduce((sum, stream) => sum + (stream.metrics?.viewers?.current ?? 0), 0),
    totalLiveMarketCap:
      live.totals?.totalLiveMarketCap ?? live.streams.reduce((sum, stream) => sum + (stream.metrics?.marketCap?.usd ?? stream.metrics?.marketCap?.current ?? 0), 0),
    windowMinutes: live.windowMinutes,
    generatedAt: live.generatedAt,
  };

  return {
    summary,
    streams: mapStreams(live),
    viewerTrend: buildViewerTrend(trend),
    marketCapTrend: buildMarketCapTrend(metrics?.samples ?? []),
    overallViewerAvg: trend.averages?.overall ?? null,
    extremes: trend.extrema ?? { min: null, max: null },
  };
}
