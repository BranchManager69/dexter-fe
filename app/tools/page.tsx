'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useAuth } from '../auth-context';
import { Collapsible } from '../components/Collapsible';
import { HealthStatus } from '../components/HealthStatus';

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

type AccessLevel = 'guest' | 'pro' | 'holders' | 'dev';

type AccessFilter = 'all' | AccessLevel;

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
  guest: 'Free',
  pro: 'Pro',
  holders: 'Holders',
  dev: 'Dev',
};

const ACCESS_MAP: Record<string, AccessLevel> = {
  public: 'guest',
  free: 'guest',
  demo: 'guest',
  open: 'guest',
  pro: 'pro',
  paid: 'pro',
  restricted: 'pro',
  managed: 'guest',
  internal: 'holders',
  holder: 'holders',
  holders: 'holders',
  premium: 'holders',
  dev: 'dev',
};

const solid = (token: string) => `rgb(var(${token}))`;
const withAlpha = (token: string, alpha: number) => `rgb(var(${token}) / ${alpha})`;

const ACCESS_BADGE_STYLES: Record<AccessLevel, { background: string; border: string; color: string }> = {
  guest: {
    background: `linear-gradient(135deg, ${withAlpha('--color-primary', 0.18)}, ${withAlpha('--color-primary-muted', 0.14)})`,
    border: `1px solid ${withAlpha('--color-border-strong', 0.35)}`,
    color: solid('--color-neutral-100'),
  },
  pro: {
    background: `linear-gradient(135deg, ${withAlpha('--color-focus-ring', 0.22)}, ${withAlpha('--color-primary', 0.14)})`,
    border: `1px solid ${withAlpha('--color-border-strong', 0.4)}`,
    color: solid('--color-neutral-100'),
  },
  holders: {
    background: `linear-gradient(135deg, ${withAlpha('--color-iris', 0.22)}, ${withAlpha('--color-iris', 0.12)})`,
    border: `1px solid ${withAlpha('--color-iris', 0.35)}`,
    color: solid('--color-neutral-100'),
  },
  dev: {
    background: `linear-gradient(135deg, ${withAlpha('--color-border-strong', 0.18)}, ${withAlpha('--color-neutral-800', 0.14)})`,
    border: `1px solid ${withAlpha('--color-border-strong', 0.45)}`,
    color: solid('--color-neutral-100'),
  },
};

const TAG_STYLE: CSSProperties = {
  fontSize: 11,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  padding: '3px 9px',
  borderRadius: 999,
  border: `1px solid ${withAlpha('--color-border-strong', 0.28)}`,
  background: withAlpha('--color-surface-glass', 0.7),
  color: solid('--color-neutral-100'),
};

const ACCESS_FILTER_OPTIONS: Array<{ id: AccessFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'guest', label: ACCESS_LABELS.guest },
  { id: 'pro', label: ACCESS_LABELS.pro },
  { id: 'holders', label: ACCESS_LABELS.holders },
  { id: 'dev', label: ACCESS_LABELS.dev },
];

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
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [mode, setMode] = useState<'user' | 'demo' | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const fetchTools = useCallback(
    async (nextMode: 'user' | 'demo', token?: string) => {
      try {
        setMode(nextMode);
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
    return catalog.filter(tool => {
      const matchesText = !q
        || tool.displayName.toLowerCase().includes(q)
        || tool.rawName.toLowerCase().includes(q)
        || tool.description.toLowerCase().includes(q);
      const matchesAccess = accessFilter === 'all' || tool.access === accessFilter;
      return matchesText && matchesAccess;
    });
  }, [catalog, filter, accessFilter]);

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

  const totalVisible = filteredCatalog.length;
  const totalCatalog = catalog.length;
  const hasSearchFilter = filter.trim().length > 0;
  const isDemo = mode === 'demo';
  const isUser = mode === 'user';
  const modeLabel = isDemo ? 'Shared demo catalog' : isUser ? 'My authorized tools' : 'Loading inventory…';
  const modeHelper = isDemo
    ? 'Sign in to load wallet-scoped tools and premium bundles.'
    : isUser
      ? 'These tools reflect your wallets and premium entitlements.'
      : 'Hang tight while we pull the latest inventory.';
  const modeBadgeStyle: CSSProperties = {
    fontSize: 11,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: 14,
    border: isDemo
      ? `1px solid ${withAlpha('--color-iris', 0.38)}`
      : isUser
        ? `1px solid ${withAlpha('--color-success', 0.4)}`
        : `1px solid ${withAlpha('--color-border-subtle', 0.4)}`,
    background: isDemo
      ? `linear-gradient(135deg, ${withAlpha('--color-iris', 0.22)}, ${withAlpha('--color-iris', 0.12)})`
      : isUser
        ? `linear-gradient(135deg, ${withAlpha('--color-success', 0.22)}, ${withAlpha('--color-success', 0.14)})`
        : withAlpha('--color-surface-glass', 0.5),
    color: isDemo || isUser ? solid('--color-neutral-100') : withAlpha('--color-neutral-200', 0.82),
  };
  const heroContainerStyle: CSSProperties = {
    borderRadius: 12,
    padding: '28px 28px 26px',
    background: `linear-gradient(135deg, ${withAlpha('--color-surface-base', 0.94)}, ${withAlpha('--color-surface-glass', 0.88)})`,
    border: `1px solid ${withAlpha('--color-border-subtle', 0.6)}`,
    boxShadow: '0 20px 48px rgba(20, 10, 6, 0.4)',
    marginBottom: 32,
  };
  const heroPrimaryButtonStyle: CSSProperties = {
    padding: '10px 16px',
    borderRadius: 8,
    border: `1px solid ${withAlpha('--color-border-strong', 0.5)}`,
    background: `linear-gradient(135deg, ${withAlpha('--color-primary', 0.26)}, ${withAlpha('--color-primary-bright', 0.22)})`,
    color: solid('--color-neutral-100'),
    fontSize: 12,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    fontWeight: 600,
    transition: 'opacity 0.2s ease',
  };
  const heroSecondaryButtonStyle: CSSProperties = {
    padding: '10px 16px',
    borderRadius: 8,
    border: `1px solid ${withAlpha('--color-border-subtle', 0.55)}`,
    background: `linear-gradient(135deg, ${withAlpha('--color-surface-glass', 0.85)}, ${withAlpha('--color-surface-base', 0.92)})`,
    color: withAlpha('--color-neutral-100', 0.82),
    fontSize: 12,
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    fontWeight: 600,
    transition: 'opacity 0.2s ease',
  };
  const totalDescriptor = hasSearchFilter || accessFilter !== 'all'
    ? `of ${totalCatalog.toLocaleString()} total`
    : 'available';
  const groupContainerStyle: CSSProperties = {
    borderRadius: 10,
    padding: '22px 22px 20px',
    background: `linear-gradient(135deg, ${withAlpha('--color-surface-base', 0.92)}, ${withAlpha('--color-surface-glass', 0.88)})`,
    border: `1px solid ${withAlpha('--color-border-subtle', 0.6)}`,
    boxShadow: '0 16px 32px rgba(20, 10, 6, 0.32)',
  };
  const groupGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 16,
    justifyContent: 'flex-start',
  };
  const groupLabelStyle: CSSProperties = {
    fontSize: 15,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    color: withAlpha('--color-neutral-100', 0.88),
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
  };
  const groupCountStyle: CSSProperties = {
    fontSize: 12,
    opacity: 0.72,
    minWidth: 86,
    textAlign: 'right',
    color: withAlpha('--color-neutral-200', 0.72),
  };
  const toolCardStyle: CSSProperties = {
    border: `1px solid ${withAlpha('--color-border-subtle', 0.55)}`,
    borderRadius: 8,
    padding: 18,
    background: `linear-gradient(135deg, ${withAlpha('--color-surface-raised', 0.92)}, ${withAlpha('--color-surface-glass', 0.88)})`,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minHeight: 240,
    maxWidth: 360,
    width: '100%',
    boxShadow: '0 12px 28px rgba(20, 10, 6, 0.3)',
  };
  const accessFilterButtonStyle = (active: boolean, tier: AccessFilter): CSSProperties => {
    const isAll = tier === 'all';
    const activeBackground = isAll
      ? `linear-gradient(135deg, ${withAlpha('--color-iris', 0.2)}, ${withAlpha('--color-iris', 0.14)})`
      : `linear-gradient(135deg, ${withAlpha('--color-success', 0.2)}, ${withAlpha('--color-success', 0.14)})`;
    const activeBorder = isAll
      ? `1px solid ${withAlpha('--color-iris', 0.4)}`
      : `1px solid ${withAlpha('--color-success', 0.42)}`;
    const activeColor = solid('--color-neutral-100');

    return {
      padding: '8px 12px',
      borderRadius: 14,
      border: active ? activeBorder : `1px solid ${withAlpha('--color-border-subtle', 0.5)}`,
      background: active ? activeBackground : withAlpha('--color-surface-glass', 0.65),
      color: active ? activeColor : withAlpha('--color-neutral-200', 0.78),
      fontSize: 12,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      transition: 'opacity 0.2s ease',
      cursor: 'pointer',
      outline: 'none',
      backgroundClip: 'padding-box',
    };
  };

  const toggleGroup = useCallback((key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);


  const buildHideLabel = (group: CatalogGroup) => {
    const baseLabel = group.label.toLowerCase();
    const noun = group.tools.length === 1 ? 'tool' : 'tools';
    return `Hide ${baseLabel} ${noun}`;
  };

  return (
    <div>
      <HealthStatus />
      <section className="catalog-hero" style={heroContainerStyle}>
        <div className="catalog-hero__top" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="catalog-hero__intro" style={{ flex: '1 1 360px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: withAlpha('--color-neutral-200', 0.72) }}>Dexter MCP</span>
              <span style={modeBadgeStyle}>{modeLabel}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.01em', color: solid('--color-neutral-100') }}>Tool Catalog</h1>
            <p style={{ margin: '4px 0 0', color: withAlpha('--color-neutral-100', 0.82), maxWidth: 520 }}>
              Browse the live tool inventory powering Dexter automations. Filter, inspect schemas, and queue actions straight into your workflows.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: withAlpha('--color-neutral-200', 0.76) }}>{modeHelper}</p>
          </div>
          <div className="catalog-hero__actions" style={{ flex: '0 0 auto', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: withAlpha('--color-neutral-200', 0.7), fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase' }}>
              <span>Catalog mode</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>{mode === 'user' ? 'Personal' : 'Demo'}</span>
            </div>
            <div className="catalog-hero__actions-buttons" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {session && mode !== 'user' && (
                <button onClick={() => fetchTools('user', session.access_token)} style={heroPrimaryButtonStyle}>
                  View my tools
                </button>
              )}
              {mode !== 'demo' && (
                <button onClick={() => fetchTools('demo')} style={heroSecondaryButtonStyle}>
                  View demo tools
                </button>
              )}
            </div>
          </div>
        </div>
          <div
            className="catalog-hero__controls"
            style={{
              marginTop: 26,
              paddingTop: 20,
              borderTop: `1px solid ${withAlpha('--color-border-subtle', 0.4)}`,
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
          <div className="catalog-hero__filter" style={{ flex: '1 1 360px', minWidth: 260 }}>
            <input
              placeholder="Filter by name or description"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: withAlpha('--color-surface-base', 0.85),
                color: solid('--color-neutral-100'),
                border: `1px solid ${withAlpha('--color-border-subtle', 0.58)}`,
                borderRadius: 8,
                fontSize: 14,
              }}
            />
          </div>
          <div className="catalog-hero__chip-row" style={{ flex: '1 1 320px', display: 'flex', gap: 12, alignItems: 'stretch', minWidth: 260, flexWrap: 'wrap' }}>
            <div
              className="catalog-hero__access"
              style={{
                flex: '1 1 auto',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: '4px 0',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                minWidth: 0,
              }}
            >
              {ACCESS_FILTER_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAccessFilter(option.id)}
                style={accessFilterButtonStyle(accessFilter === option.id, option.id)}
              >
                  {option.label}
                </button>
              ))}
            </div>
            <div
              className="catalog-hero__count"
              style={{
                flex: '1 1 220px',
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 999,
                border: `1px solid ${withAlpha('--color-border-subtle', 0.5)}`,
                background: withAlpha('--color-surface-glass', 0.6),
                color: withAlpha('--color-neutral-200', 0.82),
                fontSize: 13,
                textAlign: 'center',
                whiteSpace: 'normal',
                flexWrap: 'wrap',
                rowGap: 4,
              }}
            >
              <span>Showing</span>
              <strong style={{ fontSize: 16, color: solid('--color-neutral-100') }}>{totalVisible.toLocaleString()}</strong>
              <span>
                tool{totalVisible === 1 ? '' : 's'} {totalDescriptor}
              </span>
            </div>
          </div>
        </div>
      </section>

      {loading && <div>Loading…</div>}
      {error && (
        <div
          style={{
            color: solid('--color-accent-critical'),
            border: `1px solid ${withAlpha('--color-accent-critical', 0.42)}`,
            background: withAlpha('--color-accent-critical', 0.16),
            padding: 12,
            borderRadius: 10,
            margin: '8px 0',
          }}
        >
          <div style={{ fontWeight: 600 }}>Error</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{error}</div>
          <div style={{ marginTop: 6, color: withAlpha('--color-neutral-200', 0.75) }}>
            If you see 401/403, ensure TOKEN_AI_MCP_TOKEN is configured on the API.
          </div>
        </div>
      )}

      {!loading && !error && filteredCatalog.length === 0 && <div style={{ opacity: 0.8 }}>No tools found.</div>}

      <div className="tool-groups" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {groupedCatalog.map(group => (
          <section key={group.key} className="tool-group" style={groupContainerStyle}>
            {(() => {
              const expanded = openGroups[group.key] ?? false;
              const wrapperClass = `tool-group__grid-wrapper ${expanded ? 'tool-group__grid-wrapper--expanded' : 'tool-group__grid-wrapper--collapsed'}`;
              const overlayClass = `tool-group__overlay ${expanded ? 'tool-group__overlay--expanded' : 'tool-group__overlay--collapsed'}`;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={groupLabelStyle}>{group.label}</span>
                    <span style={groupCountStyle}>{group.tools.length} tool{group.tools.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className={wrapperClass}>
                    <div className="tool-group__grid" style={groupGridStyle}>
                      {group.tools.map(tool => (
                        <div
                          key={tool.id}
                          className="tool-card"
                          style={toolCardStyle}
                        >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: withAlpha('--color-surface-glass', 0.62), flexShrink: 0 }}>
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
                  {tool.description ? <div style={{ color: withAlpha('--color-neutral-100', 0.82), lineHeight: 1.5 }}>{tool.description}</div> : null}
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
                    <div className={overlayClass}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.key)}
                        className="tool-group__overlay-button"
                      >
                        {expanded ? buildHideLabel(group) : buildShowLabel(group)}
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </section>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Collapsible title="Developers · View raw JSON" defaultOpen={false}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            background: withAlpha('--color-surface-base', 0.88),
            color: withAlpha('--color-neutral-100', 0.82),
            border: `1px solid ${withAlpha('--color-border-subtle', 0.5)}`,
            borderRadius: 8,
            padding: 12,
            margin: 0,
          }}>
            {safeStringify(raw)}
          </pre>
        </Collapsible>
      </div>
      <style jsx>{`
        .catalog-hero__actions-buttons button {
          min-width: 148px;
        }

        @media (max-width: 992px) {
          .catalog-hero {
            padding: 24px 20px 22px;
          }
        }

        @media (max-width: 768px) {
          .catalog-hero {
            padding: 20px 16px 18px;
            border-radius: 10px;
          }

          .catalog-hero__top {
            flex-direction: column;
            gap: 8px;
          }

          .catalog-hero__intro {
            min-width: 100% !important;
          }

          .catalog-hero__actions {
            min-width: 100% !important;
            align-items: stretch !important;
            gap: 10px !important;
            margin-top: 0 !important;
          }

          .catalog-hero__actions-buttons {
            width: 100%;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .catalog-hero__actions-buttons button {
            flex: 1 1 160px;
            min-width: 0;
          }

          .catalog-hero__controls {
            flex-direction: column;
            align-items: stretch !important;
            gap: 10px;
            border-top: 1px solid rgb(var(--color-border-subtle) / 0.32);
            padding-top: 14px;
            margin-top: 18px;
          }

          .catalog-hero__filter {
            min-width: 100% !important;
            flex: 1 1 100% !important;
          }

          .catalog-hero__chip-row {
            width: 100%;
            align-items: center;
          }

          .catalog-hero__access {
            flex: 1 1 auto;
          }

          .catalog-hero__count {
            justify-content: center;
            border-radius: 18px;
            padding: 8px 14px;
          }

          .tool-group {
            padding: 18px 16px 16px !important;
            border-radius: 10px;
          }

          .tool-group__grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
          }

          .tool-card {
            max-width: none !important;
            padding: 16px !important;
            border-radius: 8px;
          }
        }

        @media (max-width: 480px) {
          .catalog-hero {
            padding: 18px 14px 16px;
          }

          .catalog-hero__actions-buttons {
            flex-direction: column;
          }

          .catalog-hero__actions-buttons button,
          .catalog-hero__access button {
            width: 100%;
            flex: 1 1 auto;
          }

          .catalog-hero__access {
            gap: 6px;
          }

          .catalog-hero__count {
            padding: 10px 14px;
            font-size: 12px;
          }
        }

        .catalog-hero__access::-webkit-scrollbar {
          display: none;
        }

        .tool-group__grid-wrapper {
          position: relative;
          overflow: hidden;
          transition: max-height 0.45s ease;
        }

        .tool-group__grid-wrapper--collapsed {
          max-height: 240px;
          border-radius: 12px;
        }

        .tool-group__grid-wrapper--expanded {
          max-height: 1600px;
          border-radius: 12px;
        }

        .tool-group__overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding-bottom: 18px;
          pointer-events: auto;
          transition: background 0.3s ease, height 0.3s ease, opacity 0.3s ease;
        }

        .tool-group__overlay--collapsed {
          height: 110px;
          background: linear-gradient(
            180deg,
            rgb(var(--color-background) / 0) 0%,
            rgb(var(--color-background) / 0.85) 45%,
            rgb(var(--color-surface-base) / 0.94) 100%
          );
        }

        .tool-group__overlay--expanded {
          height: 64px;
          background: none;
          padding-bottom: 12px;
        }

        .tool-group__overlay-button {
          border: none;
          background: transparent;
          color: rgb(var(--color-neutral-100));
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: none;
          transition: background 0.2s ease, transform 0.2s ease;
          pointer-events: auto;
        }

        .tool-group__overlay-button:hover {
          transform: translateY(-1px);
        }

        .tool-group__overlay-button:focus-visible {
          outline: 2px solid rgb(var(--color-border-strong) / 0.9);
          outline-offset: 2px;
        }

        @media (max-width: 768px) {
          .tool-group__grid-wrapper--collapsed {
            max-height: 260px;
          }
        }
      `}</style>
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
            background: withAlpha('--color-surface-base', 0.9),
            color: withAlpha('--color-neutral-100', 0.82),
            border: `1px solid ${withAlpha('--color-border-subtle', 0.5)}`,
            borderRadius: 8,
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
  const buildShowLabel = (group: CatalogGroup) => {
    const count = group.tools.length;
    const baseLabel = group.label.toLowerCase();
    const noun = count === 1 ? 'tool' : 'tools';
    return `Show ${count} ${baseLabel} ${noun}`;
  };
