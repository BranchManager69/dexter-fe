'use client';

import type { CSSProperties } from 'react';
import { Collapsible } from '../../components/Collapsible';
import { ACCESS_LABELS, CARD_THEMES } from '../constants';
import { safeStringify, solid, withAlpha } from '../utils';
import type { CatalogGroup, CatalogTool, AccessLevel } from '../types';

const groupContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  padding: '18px 4px 16px',
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
  color: solid('--color-neutral-900'),
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
};

const groupCountStyle: CSSProperties = {
  fontSize: 12,
  opacity: 0.72,
  minWidth: 86,
  textAlign: 'right',
  color: solid('--color-neutral-900'),
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
        height: 96px;
        background: linear-gradient(
          180deg,
          rgb(var(--color-background) / 0) 0%,
          rgb(var(--color-background) / 0.55) 40%,
          rgb(var(--color-surface-base) / 0.5) 100%
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
          color: rgba(42, 22, 11, 0.82);
          font-size: 12px;
          letter-spacing: .18em;
          text-transform: uppercase;
          font-weight: 600;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          box-shadow: none;
          transition: background 0.2s ease, transform 0.2s ease;
          pointer-events: auto;
        }

      .tool-group__overlay-button:hover {
        transform: translateY(-1px);
        background: transparent;
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
          grid-template-columns: minmax(280px, 1fr) !important;
          justify-items: center;
          gap: 12px !important;
        }

        .tool-card {
          width: min(320px, 100%) !important;
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

type CardTheme = typeof CARD_THEMES[keyof typeof CARD_THEMES];

function ToolCard({ tool }: { tool: CatalogTool }) {
  const theme = CARD_THEMES[tool.access];
  const cardStyle: CSSProperties = {
    border: theme.border,
    borderRadius: 10,
    padding: 18,
    background: theme.background,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    minHeight: 240,
    maxWidth: 360,
    width: '100%',
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.26)',
    color: theme.text,
  };

  return (
    <div className="tool-card" style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: withAlpha('--color-surface-glass', 0.62), flexShrink: 0 }}>
            <img src={tool.icon} alt={`${tool.displayName} icon`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16, color: theme.text }}>{tool.displayName}</div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{tool.rawName}</div>
          </div>
        </div>
        <AccessBadge level={tool.access} />
      </div>
      {tool.description ? (
        <div style={{ color: theme.text, opacity: 0.9, lineHeight: 1.6 }}>{tool.description}</div>
      ) : null}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
        <SchemaBlock title="Input Schema" value={tool.input} theme={theme} />
        <SchemaBlock title="Output Schema" value={tool.output} theme={theme} />
      </div>
    </div>
  );
}

function AccessBadge({ level }: { level: AccessLevel }) {
  const theme = CARD_THEMES[level];
  return (
    <span
      style={{
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '.18em',
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 600,
        color: theme.badgeColor,
      }}
    >
      {ACCESS_LABELS[level]}
    </span>
  );
}

function SchemaBlock({ title, value, theme }: { title: string; value: any; theme: CardTheme }) {
  const hasValue = value !== null && value !== undefined;
  return (
    <div style={{ marginTop: 12 }}>
      <Collapsible title={title} disabled={!hasValue} disabledLabel="N/A">
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            background: theme.schemaBg,
            color: theme.schemaText,
            border: theme.schemaBorder,
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
