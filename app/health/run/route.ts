import { NextResponse } from 'next/server';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_ORIGIN || process.env.DEXTER_API_ORIGIN || 'https://api.dexter.cash').replace(/\/$/, '');
const HEALTH_TOKEN = process.env.HEALTH_PROBE_TOKEN || '';

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
