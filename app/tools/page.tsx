'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth-context';

type McpTool = {
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  input_schema?: any;
  output_schema?: any;
  inputSchema?: any;
  outputSchema?: any;
  parameters?: any; // alternative field name in some MCP servers
  category?: string;
  access?: string;
};

type AccessLevel = 'guest' | 'pro' | 'holders';

type CatalogTool = {
  id: string;
  rawName: string;
  displayName: string;
  description: string;
  categoryKey: string;
  categoryLabel: string;
  access: AccessLevel;
  input: any;
  output: any;
};

type CatalogGroup = {
  key: string;
  label: string;
  tools: CatalogTool[];
};

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  pumpstream: 'Pump.fun & Streams',
  wallets: 'Wallet Ops',
  auth: 'Diagnostics',
};

const ACCESS_OVERRIDES: Record<string, AccessLevel> = {
  pumpstream_live_summary: 'pro',
  resolve_wallet: 'pro',
  list_my_wallets: 'pro',
  set_session_wallet_override: 'holders',
  auth_info: 'holders',
};

const ACCESS_LABELS: Record<AccessLevel, string> = {
  guest: 'Guest',
  pro: 'Pro',
  holders: 'Holders',
};

const ACCESS_BADGE_STYLES: Record<AccessLevel, { background: string; border: string; color: string }> = {
  guest: { background: 'rgba(123, 139, 255, 0.12)', border: '1px solid rgba(123, 139, 255, 0.32)', color: '#cdd5ff' },
  pro: { background: 'linear-gradient(135deg, rgba(255, 200, 87, 0.28), rgba(255, 200, 87, 0.12))', border: '1px solid rgba(255, 200, 87, 0.4)', color: '#ffdc90' },
  holders: { background: 'linear-gradient(135deg, rgba(107, 212, 252, 0.28), rgba(123, 139, 255, 0.22))', border: '1px solid rgba(107, 212, 252, 0.5)', color: '#ade6ff' },
};

function titleCase(input: string) {
  if (!input) return 'General';
  return input
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function deriveCategory(tool: McpTool) {
  if (tool.category) {
    const key = tool.category.toLowerCase();
    return { key, label: CATEGORY_LABEL_OVERRIDES[key] ?? titleCase(tool.category) };
  }
  const raw = tool.name ?? '';
  const prefix = raw.includes('.') ? raw.split('.')[0] : raw;
  const key = prefix ? prefix.toLowerCase() : 'general';
  const label = CATEGORY_LABEL_OVERRIDES[key] ?? titleCase(prefix || 'general');
  return { key, label };
}

function normaliseAccess(value?: string): AccessLevel | null {
  if (!value) return null;
  const normalised = value.toLowerCase();
  if (normalised.includes('holder')) return 'holders';
  if (normalised.includes('pro')) return 'pro';
  if (normalised.includes('guest') || normalised.includes('demo') || normalised.includes('public')) return 'guest';
  return null;
}

function deriveAccess(tool: McpTool): AccessLevel {
  const name = tool.name ?? '';
  const override = ACCESS_OVERRIDES[name];
  if (override) return override;
  const explicit = normaliseAccess(tool.access);
  return explicit ?? 'guest';
}

function toCatalogTool(tool: McpTool, index: number): CatalogTool {
  const { key, label } = deriveCategory(tool);
  const access = deriveAccess(tool);
  const rawName = tool.name ?? tool.title ?? `tool-${index}`;
  return {
    id: `${rawName}:${index}`,
    rawName,
    displayName: tool.title || tool.name || 'Untitled tool',
    description: tool.description || tool.summary || '',
    categoryKey: key,
    categoryLabel: label,
    access,
    input: (tool as any).inputSchema ?? tool.input_schema ?? tool.parameters ?? null,
    output: (tool as any).outputSchema ?? tool.output_schema ?? null,
  };
}

export default function ToolsPage() {
  const { session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<any>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [filter, setFilter] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [mode, setMode] = useState<'user' | 'demo' | null>(null);

  const fetchTools = useCallback(
    async (nextMode: 'user' | 'demo', token?: string) => {
      try {
        setLoading(true);
        setError(null);
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch('/api/tools', {
          credentials: 'include',
          cache: 'no-store',
          headers,
        });
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        if (!response.ok) {
          setError(`${response.status} ${response.statusText} — ${text.slice(0, 400)}`);
          setRaw(text);
          setTools([]);
          setMode(null);
          return;
        }
        let data: any;
        try {
          data = contentType.includes('json') ? JSON.parse(text) : JSON.parse(text);
        } catch {
          data = { raw: text };
        }
        setRaw(data);
        const arr: McpTool[] = Array.isArray(data?.tools)
          ? data.tools
          : Array.isArray(data)
            ? data
            : [];
        setTools(arr);
        setMode(nextMode);
      } catch (e: any) {
        setError(e?.message || String(e));
        setTools([]);
        setMode(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (authLoading) return;
    const nextMode: 'user' | 'demo' = session ? 'user' : 'demo';
    fetchTools(nextMode, session?.access_token);
  }, [authLoading, session, fetchTools]);

  const catalog = useMemo(() => tools.map((tool, index) => toCatalogTool(tool, index)), [tools]);

  const filteredCatalog = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(tool =>
      tool.displayName.toLowerCase().includes(q) ||
      tool.rawName.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q)
    );
  }, [catalog, filter]);

  const groupedCatalog = useMemo<CatalogGroup[]>(() => {
    const map = new Map<string, CatalogGroup>();
    filteredCatalog.forEach((tool) => {
      if (!map.has(tool.categoryKey)) {
        map.set(tool.categoryKey, { key: tool.categoryKey, label: tool.categoryLabel, tools: [] });
      }
      map.get(tool.categoryKey)!.tools.push(tool);
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredCatalog]);

  return (
    <div>
      <h1>MCP Tools</h1>
      <p style={{opacity:.8}}>Fetched from /api/tools (proxied to dexter-mcp). Shows name, description, and schemas for quick visibility.</p>

      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', margin:'8px 0'}}>
        <span style={{opacity:.7}}>
          Viewing: {mode === 'user' ? 'your authenticated tool catalog' : mode === 'demo' ? 'demo tool catalog (shared bearer)' : '—'}
        </span>
        <div style={{marginLeft:'auto', display:'flex', gap:8}}>
          {session && mode !== 'user' && (
            <button onClick={() => fetchTools('user', session.access_token)} style={{padding:'8px 12px'}}>
              View my tools
            </button>
          )}
          {mode !== 'demo' && (
            <button onClick={() => fetchTools('demo')} style={{padding:'8px 12px'}}>
              View demo tools
            </button>
          )}
        </div>
      </div>

      {mode === 'demo' && !session && (
        <div style={{margin:'8px 0', padding:8, borderRadius:4, background:'#0b0c10', border:'1px solid #2c3242', color:'#9fb2c8'}}>
          You are browsing the demo catalog. Sign in to see tools tailored to your account and wallet access.
        </div>
      )}

      <div style={{display:'flex', gap:8, alignItems:'center', margin:'8px 0'}}>
        <input
          placeholder="Filter by name or description"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{flex:'1 1 auto', padding:'8px', background:'#0b0c10', color:'#e6edf3', border:'1px solid #2c3242', borderRadius:4}}
        />
        <button onClick={() => setShowRaw(v => !v)} style={{padding:'8px 12px'}}>{showRaw ? 'Hide Raw' : 'Show Raw'}</button>
      </div>

      {loading && <div>Loading…</div>}
      {error && (
        <div style={{color:'#ff9f9f', border:'1px solid #5a2323', background:'#2b0e0e', padding:8, borderRadius:4, margin:'8px 0'}}>
          <div style={{fontWeight:600}}>Error</div>
          <div style={{whiteSpace:'pre-wrap'}}>{error}</div>
          <div style={{marginTop:6, opacity:.8}}>If you see 401/403, ensure TOKEN_AI_MCP_TOKEN is configured on the API.</div>
        </div>
      )}

      {!loading && !error && filteredCatalog.length === 0 && (
        <div style={{opacity:.8}}>No tools found.</div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap:16}}>
        {groupedCatalog.map(group => (
          <section key={group.key} style={{border:'1px solid #2c3242', borderRadius:8, padding:16, background:'#05060d'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12}}>
              <div style={{display:'flex', flexDirection:'column', gap:4}}>
                <span style={{fontSize:12, letterSpacing:'.24em', textTransform:'uppercase', color:'rgba(226, 231, 255, 0.5)'}}>{group.label}</span>
                <strong style={{fontSize:18}}>{group.tools.length} tool{group.tools.length === 1 ? '' : 's'}</strong>
              </div>
              <span style={{fontSize:12, opacity:.7}}>Auto-derived from tool prefixes</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:12}}>
              {group.tools.map(tool => (
                <div key={tool.id} style={{border:'1px solid rgba(44, 50, 66, 0.85)', borderRadius:10, padding:14, background:'#0b0c10', display:'flex', flexDirection:'column', gap:10}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12}}>
                    <div>
                      <div style={{fontWeight:600, fontSize:16}}>{tool.displayName}</div>
                      <div style={{fontSize:12, opacity:.65, marginTop:2}}>{tool.rawName}</div>
                    </div>
                    <AccessBadge level={tool.access} />
                  </div>
                  {tool.description ? (
                    <div style={{opacity:.9}}>{tool.description}</div>
                  ) : null}
                  <SchemaBlock title="Input Schema" value={tool.input} />
                  <SchemaBlock title="Output Schema" value={tool.output} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {showRaw && (
        <div style={{marginTop:12}}>
          <div style={{fontSize:12, opacity:.8, marginBottom:4}}>Raw response</div>
          <pre style={{whiteSpace:'pre-wrap', background:'#0b0c10', color:'#9fb2c8', border:'1px solid #2c3242', borderRadius:4, padding:12}}>
            {safeStringify(raw)}
          </pre>
        </div>
      )}
    </div>
  );
}

function SchemaBlock({ title, value }: { title: string; value: any }) {
  if (!value) return null;
  return (
    <div style={{marginTop:8}}>
      <div style={{fontSize:12, opacity:.8, marginBottom:4}}>{title}</div>
      <pre style={{whiteSpace:'pre-wrap', background:'#0b0c10', color:'#9fb2c8', border:'1px solid #2c3242', borderRadius:4, padding:10, maxHeight:220, overflow:'auto'}}>
        {safeStringify(value)}
      </pre>
    </div>
  );
}

function safeStringify(v: any) {
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

function AccessBadge({ level }: { level: AccessLevel }) {
  const style = ACCESS_BADGE_STYLES[level];
  return (
    <span
      style={{
        fontSize:11,
        textTransform:'uppercase',
        letterSpacing:'.18em',
        padding:'4px 10px',
        borderRadius:999,
        display:'inline-flex',
        alignItems:'center',
        gap:6,
        fontWeight:600,
        ...style,
      }}
    >
      {ACCESS_LABELS[level]}
    </span>
  );
}
