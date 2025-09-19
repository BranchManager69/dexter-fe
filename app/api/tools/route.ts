import { NextResponse } from 'next/server';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_ORIGIN || process.env.DEXTER_API_ORIGIN || 'https://api.dexter.cash').replace(/\/$/, '');
const MCP_TOKEN = process.env.NEXT_PUBLIC_TOKEN_AI_MCP_TOKEN || process.env.TOKEN_AI_MCP_TOKEN || process.env.MCP_BEARER_TOKEN || '';

export async function GET(request: Request) {
  try {
    const upstreamUrl = `${API_ORIGIN}/tools`;
    const headers: Record<string, string> = {};

    if (MCP_TOKEN) {
      headers['Authorization'] = `Bearer ${MCP_TOKEN}`;
    }

    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['cookie'] = cookie;
    }

    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const body = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (error) {
    console.error('Error proxying /api/tools:', error);
    return NextResponse.json({ ok: false, error: 'mcp_tools_proxy_failed' }, { status: 500 });
  }
}
