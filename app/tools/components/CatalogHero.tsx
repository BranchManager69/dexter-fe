'use client';

import type { CSSProperties, ChangeEvent } from 'react';
import { solid, withAlpha } from '../utils';
import type { AccessFilter, AccessLevel } from '../types';

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

function modeBadgeStyle(mode: 'user' | 'demo' | null): CSSProperties {
  const isDemo = mode === 'demo';
  const isUser = mode === 'user';
  return {
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
}

function accessFilterButtonStyle(active: boolean, tier: AccessFilter): CSSProperties {
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
    <>
    <section className="catalog-hero" style={heroContainerStyle}>
      <div className="catalog-hero__top" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="catalog-hero__intro" style={{ flex: '1 1 360px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: withAlpha('--color-neutral-200', 0.72) }}>Dexter MCP</span>
            <span style={modeBadgeStyle(mode)}>{modeLabel}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.01em', color: solid('--color-neutral-100') }}>Tool Catalog</h1>
          <p style={{ margin: 0, color: withAlpha('--color-neutral-100', 0.82), maxWidth: 520 }}>
            Browse the live tool inventory powering Dexter automations. Filter, inspect schemas, and queue actions straight into your workflows.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: withAlpha('--color-neutral-200', 0.76) }}>{modeHelper}</p>
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
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: withAlpha('--color-surface-base', 0.85),
              color: solid('--color-neutral-100'),
              border: `1px solid ${withAlpha('--color-border-subtle', 0.58)}`,
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
            background: withAlpha('--color-surface-glass', 0.72),
            border: `1px solid ${withAlpha('--color-border-subtle', 0.5)}`,
            color: withAlpha('--color-neutral-100', 0.82),
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
    </section>
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
    `}</style>
    </>
  );
}
