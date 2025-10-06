'use client';

import type { CSSProperties } from 'react';
import { Collapsible } from '../../components/Collapsible';
import { ACCESS_BADGE_STYLES, ACCESS_LABELS, TAG_STYLE } from '../constants';
import { safeStringify, solid, withAlpha } from '../utils';
import type { CatalogGroup, CatalogTool, AccessLevel } from '../types';

const groupContainerStyle: CSSProperties = {
  borderRadius: 12,
  padding: '22px 22px 20px',
  background: `linear-gradient(135deg, ${withAlpha('--color-surface-base', 0.92)}, ${withAlpha('--color-surface-glass', 0.88)})`,
  border: `1px solid ${withAlpha('--color-border-subtle', 0.6)}`,
  boxShadow: '0 16px 32px rgba(20, 10, 6, 0.32)',
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
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

export type ToolCatalogProps = {
  groups: CatalogGroup[];
  openGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
};

export function ToolCatalog({ groups, openGroups, onToggleGroup }: ToolCatalogProps) {
  if (!groups.length) return null;

  return (
    <>
    <div className="tool-groups" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {groups.map(group => {
        const expanded = openGroups[group.key] ?? false;
        const wrapperClass = `tool-group__grid-wrapper ${expanded ? 'tool-group__grid-wrapper--expanded' : 'tool-group__grid-wrapper--collapsed'}`;
        const overlayClass = `tool-group__overlay ${expanded ? 'tool-group__overlay--expanded' : 'tool-group__overlay--collapsed'}`;
        const countLabel = `${group.tools.length} tool${group.tools.length === 1 ? '' : 's'}`;

        return (
          <section key={group.key} className="tool-group" style={groupContainerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={groupLabelStyle}>{group.label}</span>
              <span style={groupCountStyle}>{countLabel}</span>
            </div>
            <div className={wrapperClass}>
              <div className="tool-group__grid" style={groupGridStyle}>
                {group.tools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
              <div className={overlayClass}>
                <button
                  type="button"
                  onClick={() => onToggleGroup(group.key)}
                  className="tool-group__overlay-button"
                >
                  {expanded ? buildHideLabel(group) : buildShowLabel(group)}
                </button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
    <style jsx>{`
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

        .tool-group__grid-wrapper--collapsed {
          max-height: 260px;
        }
      }
    `}</style>
    </>
  );
}

function buildHideLabel(group: CatalogGroup) {
  const baseLabel = group.label.toLowerCase();
  const noun = group.tools.length === 1 ? 'tool' : 'tools';
  return `Hide ${baseLabel} ${noun}`;
}

function buildShowLabel(group: CatalogGroup) {
  const count = group.tools.length;
  const baseLabel = group.label.toLowerCase();
  const noun = count === 1 ? 'tool' : 'tools';
  return `Show ${count} ${baseLabel} ${noun}`;
}

function ToolCard({ tool }: { tool: CatalogTool }) {
  return (
    <div className="tool-card" style={toolCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: withAlpha('--color-surface-glass', 0.62), flexShrink: 0 }}>
            <img src={tool.icon} alt={`${tool.displayName} icon`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{tool.displayName}</div>
            <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{tool.rawName}</div>
          </div>
        </div>
        <AccessBadge level={tool.access} />
      </div>
      {tool.description ? (
        <div style={{ color: withAlpha('--color-neutral-100', 0.82), lineHeight: 1.5 }}>{tool.description}</div>
      ) : null}
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
  );
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
