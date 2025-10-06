import type { AccessLevel } from './types';
import { solid, withAlpha } from './utils';

export const ACCESS_LABELS: Record<AccessLevel, string> = {
  guest: 'Free',
  pro: 'Pro',
  holders: 'Holders',
  dev: 'Dev',
};

export const ACCESS_BADGE_STYLES: Record<AccessLevel, { background: string; border: string; color: string }> = {
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

export const TAG_STYLE = {
  fontSize: 11,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  padding: '3px 9px',
  borderRadius: 999,
  border: `1px solid ${withAlpha('--color-border-strong', 0.28)}`,
  background: withAlpha('--color-surface-glass', 0.7),
  color: solid('--color-neutral-100'),
} as const;

export const ACCESS_MAP: Record<string, AccessLevel> = {
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
