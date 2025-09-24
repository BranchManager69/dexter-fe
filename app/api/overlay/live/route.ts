import { NextResponse } from 'next/server';
import { fetchOverlayData } from '../../../../lib/overlay/pumpstreams';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchOverlayData();
    return NextResponse.json(data, {
      headers: {
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[api/overlay/live] failed', error);
    return NextResponse.json({ error: (error as Error).message ?? 'overlay_fetch_failed' }, { status: 502 });
  }
}

