import { NextResponse } from 'next/server';

type JwtPayload = {
  app_metadata?: {
    roles?: string[] | string | null;
  } | null;
  [key: string]: unknown;
};

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_ORIGIN || process.env.DEXTER_API_ORIGIN || 'https://api.dexter.cash').replace(/\/$/, '');
const HEALTH_TOKEN = process.env.HEALTH_PROBE_TOKEN || '';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

function parseRolesFromAuthHeader(header: string | null): string[] {
  if (!header) return [];
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return [];
  const parts = token.split('.');
  if (parts.length < 2) return [];
  try {
    const payloadJson = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const payload: JwtPayload = JSON.parse(payloadJson);
    const rawRoles = payload.app_metadata?.roles;
    if (Array.isArray(rawRoles)) return rawRoles.map(role => String(role).toLowerCase());
    if (typeof rawRoles === 'string') return [rawRoles.toLowerCase()];
    return [];
  } catch (err) {
    console.warn('[health/run] Failed to parse JWT roles', err);
    return [];
  }
}

export async function POST(request: Request) {
  if (!HEALTH_TOKEN) {
    return NextResponse.json({ ok: false, error: 'HEALTH_PROBE_TOKEN not configured' }, { status: 503 });
  }

  try {
    const headers: Record<string, string> = {
      'X-Health-Token': HEALTH_TOKEN,
    };

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const roles = parseRolesFromAuthHeader(authHeader);
    const isAdmin = roles.includes('admin') || roles.includes('superadmin');

    try {
      const snapshotResp = await fetch(`${API_ORIGIN}/api/health/deep?ts=${Date.now()}`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      });

      if (snapshotResp.ok) {
        const snapshotJson = await snapshotResp.json().catch(() => null);
        const timestamp = snapshotJson?.snapshot?.timestamp ?? snapshotJson?.timestamp ?? null;
        if (!isAdmin && typeof timestamp === 'string') {
          const lastRunDate = new Date(timestamp);
          if (!Number.isNaN(lastRunDate.getTime())) {
            const age = Date.now() - lastRunDate.getTime();
            if (age < FIFTEEN_MINUTES_MS) {
              const retryAfterMs = Math.max(FIFTEEN_MINUTES_MS - age, 5_000);
              return NextResponse.json(
                {
                  ok: false,
                  error: 'probe_rate_limited',
                  retry_after_ms: retryAfterMs,
                  last_run: timestamp,
                },
                { status: 429 }
              );
            }
          }
        }
      }
    } catch (snapshotError) {
      console.warn('[health/run] Failed to load snapshot before probe:', snapshotError);
      // If we cannot determine staleness, allow admins or proceed for others.
      if (!isAdmin) {
        // fall through and attempt probe
      }
    }

    const upstream = await fetch(`${API_ORIGIN}/api/health/full`, {
      method: 'POST',
      headers,
      cache: 'no-store',
    });

    const body = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';

    return new NextResponse(body, {
      status: upstream.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (error: any) {
    console.error('Error running deep health probe:', error);
    return NextResponse.json({ ok: false, error: 'probe_failed' }, { status: 500 });
  }
}
