import type { CSSProperties } from 'react';

type SurfaceSet = {
  base: string;
  raised: string;
  glass: string;
};

type BoundarySet = {
  background: string;
  border: string;
};

type NeutralScale = {
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

type AccentSet = {
  info: string;
  success: string;
  warn: string;
  critical: string;
};

type PrimarySet = {
  base: string;
  bright: string;
  muted: string;
};

export interface ThemePalette {
  name: string;
  background: string;
  foreground: string;
  surface: SurfaceSet;
  header: BoundarySet;
  footer: BoundarySet;
  borders: {
    subtle: string;
    strong: string;
  };
  neutrals: NeutralScale;
  accent: AccentSet;
  primary: PrimarySet;
  flux: string;
  iris: string;
  focusRing: string;
  gradient: {
    warmSpot: string;
    emberSpot: string;
  };
}

const hexToRgb = (hex: string) => {
  const cleaned = hex.replace('#', '');
  if (cleaned.length !== 6) {
    throw new Error(`Expected 6-digit hex value, received ${hex}`);
  }
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
};

export const sunrisePalette: ThemePalette = {
  name: 'sunrise',
  background: '#0B0503',
  foreground: '#FAF3EB',
  surface: {
    base: '#160904',
    raised: '#1D0D06',
    glass: '#28140D',
  },
  header: {
    background: '#150A05',
    border: '#D9621C',
  },
  footer: {
    background: '#130905',
    border: '#D9621C',
  },
  borders: {
    subtle: '#2A1209',
    strong: '#FF8C3C',
  },
  neutrals: {
    100: '#F3E1D1',
    200: '#E5C4AE',
    300: '#D6A88E',
    400: '#C38C73',
    500: '#AD755C',
    600: '#915E47',
    700: '#744836',
    800: '#563226',
    900: '#3A2018',
  },
  accent: {
    info: '#4C9CD6',
    success: '#35B17A',
    warn: '#E9A24A',
    critical: '#E0535F',
  },
  primary: {
    base: '#E56B18',
    bright: '#FF9138',
    muted: '#F3C295',
  },
  flux: '#E79C46',
  iris: '#B67CD0',
  focusRing: '#FFB257',
  gradient: {
    warmSpot: '#BF4E1C',
    emberSpot: '#732912',
  },
};

export const paletteCssVariables = (palette: ThemePalette): CSSProperties => {
  const cssVariables: Record<string, string> = {
    '--color-background': hexToRgb(palette.background),
    '--color-foreground': hexToRgb(palette.foreground),
    '--color-surface-base': hexToRgb(palette.surface.base),
    '--color-surface-raised': hexToRgb(palette.surface.raised),
    '--color-surface-glass': hexToRgb(palette.surface.glass),
    '--color-header-bg': hexToRgb(palette.header.background),
    '--color-header-border': hexToRgb(palette.header.border),
    '--color-footer-bg': hexToRgb(palette.footer.background),
    '--color-footer-border': hexToRgb(palette.footer.border),
    '--color-border-subtle': hexToRgb(palette.borders.subtle),
    '--color-border-strong': hexToRgb(palette.borders.strong),
    '--color-primary': hexToRgb(palette.primary.base),
    '--color-primary-bright': hexToRgb(palette.primary.bright),
    '--color-primary-muted': hexToRgb(palette.primary.muted),
    '--color-accent-info': hexToRgb(palette.accent.info),
    '--color-accent-success': hexToRgb(palette.accent.success),
    '--color-accent-warn': hexToRgb(palette.accent.warn),
    '--color-accent-critical': hexToRgb(palette.accent.critical),
    '--color-flux': hexToRgb(palette.flux),
    '--color-iris': hexToRgb(palette.iris),
    '--color-focus-ring': hexToRgb(palette.focusRing),
    '--color-gradient-warm': hexToRgb(palette.gradient.warmSpot),
    '--color-gradient-ember': hexToRgb(palette.gradient.emberSpot),
  };

  Object.entries(palette.neutrals).forEach(([step, value]) => {
    cssVariables[`--color-neutral-${step}`] = hexToRgb(value);
  });

  return cssVariables as CSSProperties;
};

export const activeThemeVariables = paletteCssVariables(sunrisePalette);
