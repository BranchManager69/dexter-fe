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
  background: '#1A0702',
  foreground: '#FFF4E6',
  surface: {
    base: '#260D03',
    raised: '#321306',
    glass: '#3D1908',
  },
  header: {
    background: '#2A1005',
    border: '#FF7A00',
  },
  footer: {
    background: '#230B04',
    border: '#FF7A00',
  },
  borders: {
    subtle: '#4C1F07',
    strong: '#FF9A3B',
  },
  neutrals: {
    100: '#FFE9D5',
    200: '#FFCFAF',
    300: '#FFB588',
    400: '#FF9A61',
    500: '#F07D3F',
    600: '#CD6128',
    700: '#9F4517',
    800: '#712F0F',
    900: '#431B09',
  },
  accent: {
    info: '#3AAAF7',
    success: '#36D6A4',
    warn: '#FFC952',
    critical: '#FF5C7A',
  },
  primary: {
    base: '#FF7A00',
    bright: '#FFA53C',
    muted: '#FFD9A8',
  },
  flux: '#5BFFBA',
  iris: '#8C7BFF',
  focusRing: '#FF9F45',
  gradient: {
    warmSpot: '#FF8F2A',
    emberSpot: '#FF6100',
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
