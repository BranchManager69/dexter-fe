'use client';

import type { CSSProperties, ChangeEvent } from 'react';
import type { AccessFilter } from '../types';

export type AccessFilterOption = {
  id: AccessFilter;
  label: string;
};

export type CatalogHeroProps = {
  mode: 'user' | 'demo' | null;
  modeLabel: string;
  modeHelper: string;
  totalVisible: number;
  totalDescriptor: string;
  filter: string;
  onFilterChange: (value: string) => void;
  accessFilter: AccessFilter;
  onAccessFilterChange: (value: AccessFilter) => void;
  accessOptions: AccessFilterOption[];
  onViewUserCatalog?: () => void;
  onViewDemoCatalog?: () => void;
  canViewUser: boolean;
  canViewDemo: boolean;
  loading: boolean;
};

const TEXT_PRIMARY = 'var(--page-text-primary)';
const TEXT_MUTED = 'var(--page-text-muted)';
const TEXT_SOFT = 'var(--page-text-soft)';
const BORDER_SOFT = 'rgba(11, 6, 3, 0.12)';

const heroPrimaryButtonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  border: '1px solid rgba(24, 128, 96, 0.35)',
  background: 'linear-gradient(135deg, rgba(32, 180, 131, 0.95), rgba(18, 140, 102, 0.88))',
  color: '#fff4ea',
  fontSize: 12,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
  transition: 'opacity 0.2s ease',
};

const heroSecondaryButtonStyle: CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  border: `1px solid ${BORDER_SOFT}`,
  background: 'rgba(255, 255, 255, 0.86)',
  color: TEXT_PRIMARY,
  fontSize: 12,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
  transition: 'opacity 0.2s ease',
};

function modeBadgeStyle(mode: 'user' | 'demo' | null): CSSProperties {
  const isDemo = mode === 'demo';
  const isUser = mode === 'user';
  const base: CSSProperties = {
    fontSize: 11,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: 14,
  };

  if (isDemo) {
    return {
      ...base,
      border: '1px solid rgba(24, 92, 175, 0.35)',
      background: 'rgba(24, 92, 175, 0.16)',
      color: TEXT_PRIMARY,
    };
  }

  if (isUser) {
    return {
      ...base,
      border: '1px solid rgba(24, 128, 96, 0.32)',
      background: 'rgba(24, 128, 96, 0.16)',
      color: TEXT_PRIMARY,
    };
  }

  return {
    ...base,
    border: `1px solid ${BORDER_SOFT}`,
    background: 'rgba(255, 255, 255, 0.72)',
    color: TEXT_MUTED,
  };
}

function accessFilterButtonStyle(active: boolean, tier: AccessFilter): CSSProperties {
  const activeBackground = tier === 'all' ? 'rgba(24, 92, 175, 0.18)' : 'rgba(24, 128, 96, 0.18)';
  const activeBorder = tier === 'all' ? '1px solid rgba(24, 92, 175, 0.35)' : '1px solid rgba(24, 128, 96, 0.32)';

  return {
    padding: '8px 12px',
    borderRadius: 14,
    border: active ? activeBorder : `1px solid ${BORDER_SOFT}`,
    background: active ? activeBackground : 'rgba(255, 255, 255, 0.7)',
    color: active ? TEXT_PRIMARY : TEXT_MUTED,
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
}

export function CatalogHero({
  mode,
  modeLabel,
  modeHelper,
  totalVisible,
  totalDescriptor,
  filter,
  onFilterChange,
  accessFilter,
  onAccessFilterChange,
  accessOptions,
  onViewUserCatalog,
  onViewDemoCatalog,
  canViewUser,
  canViewDemo,
  loading,
}: CatalogHeroProps) {
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilterChange(event.target.value);
  };

  return (
    <div className="catalog-hero">
      <div className="catalog-hero__top" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="catalog-hero__intro" style={{ flex: '1 1 360px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: TEXT_MUTED }}>Dexter MCP</span>
            <span style={{ flex: 1 }} />
            <span style={modeBadgeStyle(mode)}>{modeLabel}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.01em', color: TEXT_PRIMARY }}>Tool Catalog</h1>
          <p style={{ margin: 0, color: TEXT_MUTED, maxWidth: 520 }}>
            Browse the live tool inventory powering Dexter automations. Filter, inspect schemas, and queue actions straight into your workflows.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: TEXT_SOFT }}>{modeHelper}</p>
        </div>
        <div className="catalog-hero__actions" style={{ flex: '0 0 auto', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <div className="catalog-hero__actions-buttons" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {canViewUser && (
              <button type="button" onClick={onViewUserCatalog} style={heroPrimaryButtonStyle} disabled={loading}>
                View my tools
              </button>
            )}
            {canViewDemo && (
              <button type="button" onClick={onViewDemoCatalog} style={heroSecondaryButtonStyle} disabled={loading}>
                View demo tools
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className="catalog-hero__controls"
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${BORDER_SOFT}`,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div className="catalog-hero__filter" style={{ flex: '1 1 360px', minWidth: 260 }}>
          <input
            placeholder="Filter by name or description"
            value={filter}
            onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  color: TEXT_PRIMARY,
                  border: `1px solid ${BORDER_SOFT}`,
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                }}
              />
        </div>
        <div className="catalog-hero__chip-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="catalog-hero__access" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {accessOptions.map(option => (
              <button
                key={option.id}
                type="button"
                style={accessFilterButtonStyle(accessFilter === option.id, option.id)}
                onClick={() => onAccessFilterChange(option.id)}
                disabled={loading && accessFilter === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="catalog-hero__count" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.7)',
            border: `1px solid ${BORDER_SOFT}`,
            color: TEXT_PRIMARY,
            fontSize: 12,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            minWidth: 148,
            justifyContent: 'center',
          }}>
            <span>{loading ? 'Loading…' : `${totalVisible.toLocaleString()} tools`}</span>
            {!loading && <span style={{ opacity: 0.6 }}>({totalDescriptor})</span>}
          </div>
        </div>
      </div>
      <style jsx>{`
        .catalog-hero {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 32px;
          color: ${TEXT_PRIMARY};
        }

        .catalog-hero__actions-buttons button {
          min-width: 148px;
        }

        @media (max-width: 992px) {
          .catalog-hero__actions-buttons button {
            flex: 1 1 160px;
            min-width: 0;
          }
        }

        @media (max-width: 768px) {
          .catalog-hero__top {
            flex-direction: column;
            gap: 12px;
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

          .catalog-hero__controls {
            flex-direction: column;
            align-items: stretch !important;
            gap: 10px;
            border-top: 1px solid ${BORDER_SOFT};
            padding-top: 8px;
            margin-top: 8px;
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
        }

        @media (max-width: 480px) {
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
      `}</style>
    </div>
  );
}

export default CatalogHero;
