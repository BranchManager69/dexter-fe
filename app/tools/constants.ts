import type { AccessLevel } from './types';
import { solid, withAlpha } from './utils';

export const ACCESS_LABELS: Record<AccessLevel, string> = {
  guest: 'Free',
  pro: 'Pro',
  holders: 'Holders',
  dev: 'Dev',
};

export const CARD_THEMES: Record<AccessLevel, {
  background: string;
  border: string;
  text: string;
  muted: string;
  tagBg: string;
  tagBorder: string;
  tagColor: string;
  badgeColor: string;
  schemaBg: string;
  schemaBorder: string;
  schemaText: string;
}> = {
  guest: {
    background: 'linear-gradient(135deg, rgba(170, 38, 54, 0.92), rgba(230, 145, 40, 0.85))',
    border: '1px solid rgba(180, 52, 41, 0.45)',
    text: '#fff5ef',
    muted: 'rgba(255, 237, 226, 0.78)',
    tagBg: 'transparent',
    tagBorder: '1px solid transparent',
    tagColor: '#fff5ef',
    badgeColor: '#ffe9d2',
    schemaBg: 'rgba(110, 32, 28, 0.55)',
    schemaBorder: '1px solid rgba(235, 155, 80, 0.35)',
    schemaText: '#fff5ef',
  },
  pro: {
    background: 'linear-gradient(135deg, rgba(62, 114, 230, 0.9), rgba(32, 72, 182, 0.88))',
    border: '1px solid rgba(58, 110, 230, 0.45)',
    text: '#f4f8ff',
    muted: 'rgba(236, 243, 255, 0.75)',
    tagBg: 'rgba(255, 255, 255, 0.16)',
    tagBorder: '1px solid rgba(255, 255, 255, 0.28)',
    tagColor: '#f4f8ff',
    badgeColor: '#dbe8ff',
    schemaBg: 'rgba(18, 42, 100, 0.6)',
    schemaBorder: '1px solid rgba(120, 170, 255, 0.35)',
    schemaText: '#f4f8ff',
  },
  holders: {
    background: 'linear-gradient(135deg, rgba(40, 160, 110, 0.92), rgba(24, 128, 96, 0.85))',
    border: '1px solid rgba(30, 120, 90, 0.45)',
    text: '#f2fff8',
    muted: 'rgba(234, 255, 246, 0.75)',
    tagBg: 'rgba(236, 255, 247, 0.18)',
    tagBorder: '1px solid rgba(236, 255, 247, 0.28)',
    tagColor: '#f2fff8',
    badgeColor: '#effff6',
    schemaBg: 'rgba(18, 88, 60, 0.55)',
    schemaBorder: '1px solid rgba(180, 235, 210, 0.35)',
    schemaText: '#f2fff8',
  },
  dev: {
    background: 'linear-gradient(135deg, rgba(140, 8, 32, 0.9), rgba(98, 4, 22, 0.88))',
    border: '1px solid rgba(198, 48, 70, 0.5)',
    text: '#ffeef0',
    muted: 'rgba(255, 224, 226, 0.78)',
    tagBg: 'transparent',
    tagBorder: '1px solid transparent',
    tagColor: '#ffeef0',
    badgeColor: '#ffd7dd',
    schemaBg: 'rgba(78, 2, 20, 0.6)',
    schemaBorder: '1px solid rgba(198, 48, 70, 0.4)',
    schemaText: '#ffeef0',
  },
};


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
