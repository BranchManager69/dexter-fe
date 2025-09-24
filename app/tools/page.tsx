'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useAuth } from '../auth-context';
import { Collapsible } from '../components/Collapsible';

type McpTool = {
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  input_schema?: any;
  output_schema?: any;
  inputSchema?: any;
  outputSchema?: any;
  parameters?: any;
  category?: string;
  access?: string;
  _meta?: {
    category?: string;
    access?: string;
    tags?: string[];
    icon?: string;
  };
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
  tags: string[];
  icon: string;
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
  'knowledge-base': 'Knowledge Base',
  analytics: 'Analytics',
  'solana.trading': 'Solana · Trading',
  'solana.portfolio': 'Solana · Portfolio',
};

const ACCESS_LABELS: Record<AccessLevel, string> = {
  guest: 'Guest',
  pro: 'Pro',
  holders: 'Holders',
};

const ACCESS_MAP: Record<string, AccessLevel> = {
  public: 'guest',
  free: 'guest',
  demo: 'guest',
  open: 'guest',
  pro: 'pro',
  paid: 'pro',
  managed: 'pro',
  internal: 'holders',
  holder: 'holders',
  holders: 'holders',
  premium: 'holders',
};

const ACCESS_BADGE_STYLES: Record<AccessLevel, { background: string; border: string; color: string }> = {
  guest: { background: 'rgba(123, 139, 255, 0.12)', border: '1px solid rgba(123, 139, 255, 0.32)', color: '#cdd5ff' },
  pro: { background: 'linear-gradient(135deg, rgba(255, 200, 87, 0.28), rgba(255, 200, 87, 0.12))', border: '1px solid rgba(255, 200, 87, 0.4)', color: '#ffdc90' },
  holders: { background: 'linear-gradient(135deg, rgba(107, 212, 252, 0.28), rgba(123, 139, 255, 0.22))', border: '1px solid rgba(107, 212, 252, 0.5)', color: '#ade6ff' },
};

const TAG_STYLE: CSSProperties = {
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: 999,
  border: '1px solid rgba(123, 139, 255, 0.25)',
  background: 'rgba(123, 139, 255, 0.12)',
  color: '#cdd5ff',
};

const DEFAULT_ICON = '/assets/logos/logo_orange.png';

function titleCase(input: string) {
  if (!input) return 'General';
  return input
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatCategoryLabel(raw: string) {
  const parts = raw.split(/[.\-/]/).filter(Boolean);
  if (!parts.length) return titleCase(raw);
  return parts.map(titleCase).join(' · ');
}

function deriveCategory(tool: McpTool) {
  const metaCategory = tool._meta?.category;
  if (metaCategory) {
    const key = metaCategory.toLowerCase();
    const label = CATEGORY_LABEL_OVERRIDES[key] ?? formatCategoryLabel(metaCategory);
    return { key, label };
  }
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
  if (ACCESS_MAP[normalised]) return ACCESS_MAP[normalised];
  if (normalised.includes('holder')) return 'holders';
  if (normalised.includes('pro')) return 'pro';
  if (normalised.includes('guest') || normalised.includes('demo') || normalised.includes('public') || normalised.includes('free')) return 'guest';
  return null;
}

function deriveAccess(tool: McpTool): AccessLevel {
  const metaAccess = tool._meta?.access;
  if (metaAccess) {
    const mapped = ACCESS_MAP[metaAccess.toLowerCase()];
    if (mapped) return mapped;
  }
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
    tags: tool._meta?.tags ?? [],
    icon: tool._meta?.icon || DEFAULT_ICON,
  };
}

export default function ToolsPage() {
  const { session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<any>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [filter, setFilter] = useState('');
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
    filteredCatalog.forEach(tool => {
      if (!map.has(tool.categoryKey)) {
        map.set(tool.categoryKey, { key: tool.categoryKey, label: tool.categoryLabel, tools: [] });
      }
      map.get(tool.categoryKey)!.tools.push(tool);
    });
    return Array.from(map.values())
      .map(group => ({
        ...group,
        tools: group.tools.slice().sort((a, b) => a.displayName.localeCompare(b.displayName)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredCatalog]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: '1 1 320px' }}>
          <h1 style={{ marginBottom: 4 }}>MCP Tools</h1>
          <p style={{ opacity: 0.8, margin: 0 }}>Explore the live Dexter catalog. Filter, inspect schemas, and jump between personal and demo inventories.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          {session && mode !== 'user' && (
            <button
              onClick={() => fetchTools('user', session.access_token)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #2c3242',
                background: '#1b2136',
                color: '#cdd5ff',
                fontSize: 12,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              }}
            >
              View my tools
            </button>
          )}
          {mode !== 'demo' && (
            <button
              onClick={() => fetchTools('demo')}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #2c3242',
                background: '#1b2136',
                color: '#cdd5ff',
                fontSize: 12,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
              }}
            >
              View demo tools
            </button>
          )}
        </div>
      </div>

      {mode === 'demo' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            margin: '8px 0 16px',
            padding: '12px 14px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(123, 139, 255, 0.18), rgba(107, 212, 252, 0.12))',
            border: '1px solid rgba(123, 139, 255, 0.42)',
            color: '#cdd5ff',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase' }}>Demo catalog</span>
            <span>You're viewing the shared demo inventory. Sign in to load wallet-scoped tools and premium bundles.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
        <input
          placeholder="Filter by name or description"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ flex: '1 1 auto', padding: '8px', background: '#0b0c10', color: '#e6edf3', border: '1px solid #2c3242', borderRadius: 4 }}
        />
      </div>

      {loading && <div>Loading…</div>}
      {error && (
        <div style={{ color: '#ff9f9f', border: '1px solid #5a2323', background: '#2b0e0e', padding: 8, borderRadius: 4, margin: '8px 0' }}>
          <div style={{ fontWeight: 600 }}>Error</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{error}</div>
          <div style={{ marginTop: 6, opacity: 0.8 }}>If you see 401/403, ensure TOKEN_AI_MCP_TOKEN is configured on the API.</div>
        </div>
      )}

      {!loading && !error && filteredCatalog.length === 0 && <div style={{ opacity: 0.8 }}>No tools found.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groupedCatalog.map(group => (
          <section key={group.key} style={{ border: '1px solid #2c3242', borderRadius: 8, padding: 16, background: '#05060d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, letterSpacing: '.16em', textTransform: 'uppercase', color: '#dde6ff' }}>{group.label}</span>
              <span style={{ fontSize: 12, opacity: 0.7, minWidth: 80, textAlign: 'right' }}>{group.tools.length} tool{group.tools.length === 1 ? '' : 's'}</span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 12,
                justifyContent: 'flex-start',
              }}
            >
              {group.tools.map(tool => (
                <div
                  key={tool.id}
                  style={{
                    border: '1px solid rgba(44, 50, 66, 0.85)',
                    borderRadius: 10,
                    padding: 16,
                    background: '#0b0c10',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    minHeight: 240,
                    maxWidth: 360,
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', background: 'rgba(44, 50, 66, 0.6)', flexShrink: 0 }}>
                        <img
                          src={tool.icon}
                          alt={`${tool.displayName} icon`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>{tool.displayName}</div>
                        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{tool.rawName}</div>
                      </div>
                    </div>
                    <AccessBadge level={tool.access} />
                  </div>
                  {tool.description ? <div style={{ opacity: 0.9 }}>{tool.description}</div> : null}
                  {tool.tags.length ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {tool.tags.map(tag => (
                        <span key={tag} style={TAG_STYLE}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <SchemaBlock title="Input Schema" value={tool.input} />
                    <SchemaBlock title="Output Schema" value={tool.output} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Collapsible title="Developers · View raw JSON" defaultOpen={false}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            background: '#0b0c10',
            color: '#9fb2c8',
            border: '1px solid #2c3242',
            borderRadius: 6,
            padding: 12,
            margin: 0,
          }}>
            {safeStringify(raw)}
          </pre>
        </Collapsible>
      </div>
    </div>
  );
}

function SchemaBlock({ title, value }: { title: string; value: any }) {
  const hasValue = value !== null && value !== undefined;
  return (
    <div style={{ marginTop: 12 }}>
      <Collapsible title={title} disabled={!hasValue} disabledLabel="N/A">
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            background: '#0b0c10',
            color: '#9fb2c8',
            border: '1px solid #2c3242',
            borderRadius: 6,
            padding: 10,
            margin: 0,
          }}
        >
          {safeStringify(value)}
        </pre>
      </Collapsible>
    </div>
  );
}

function safeStringify(v: any) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function AccessBadge({ level }: { level: AccessLevel }) {
  const style = ACCESS_BADGE_STYLES[level];
  return (
    <span
      style={{
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '.18em',
        padding: '4px 10px',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontWeight: 600,
        ...style,
      }}
    >
      {ACCESS_LABELS[level]}
    </span>
  );
}
