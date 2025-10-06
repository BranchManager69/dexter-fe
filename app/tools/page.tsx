'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth-context';
import { Collapsible } from '../components/Collapsible';
import { HealthStatus } from '../components/HealthStatus';
import { CatalogHero, type AccessFilterOption } from './components/CatalogHero';
import { ToolCatalog } from './components/ToolCatalog';
import { ACCESS_LABELS, ACCESS_MAP } from './constants';
import { safeStringify, solid, withAlpha } from './utils';
import type { AccessFilter, AccessLevel, CatalogGroup, CatalogTool } from './types';

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

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  pumpstream: 'Pump.fun & Streams',
  wallets: 'Wallet Ops',
  auth: 'Diagnostics',
  'knowledge-base': 'Knowledge Base',
  analytics: 'Analytics',
  'solana.trading': 'Solana · Trading',
  'solana.portfolio': 'Solana · Portfolio',
};

const ACCESS_FILTER_OPTIONS: AccessFilterOption[] = [
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
  const totalDescriptor = hasSearchFilter || accessFilter !== 'all'
    ? `of ${totalCatalog.toLocaleString()} total`
    : 'available';
  const toggleGroup = useCallback((key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);



  return (
    <div>
      <HealthStatus />
      <CatalogHero
        mode={mode}
        modeLabel={modeLabel}
        modeHelper={modeHelper}
        totalVisible={totalVisible}
        totalDescriptor={totalDescriptor}
        filter={filter}
        onFilterChange={setFilter}
        accessFilter={accessFilter}
        onAccessFilterChange={setAccessFilter}
        accessOptions={ACCESS_FILTER_OPTIONS}
        onViewUserCatalog={session && mode !== 'user' ? () => fetchTools('user', session.access_token) : undefined}
        onViewDemoCatalog={mode !== 'demo' ? () => fetchTools('demo') : undefined}
        canViewUser={Boolean(session) && mode !== 'user'}
        canViewDemo={mode !== 'demo'}
        loading={loading}
      />

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

      <ToolCatalog
        groups={groupedCatalog}
        openGroups={openGroups}
        onToggleGroup={toggleGroup}
      />

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

    </div>
  );
}
