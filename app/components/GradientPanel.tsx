'use client';

import type { PropsWithChildren, CSSProperties } from 'react';
import styles from './GradientPanel.module.css';

export type GradientPanelProps = PropsWithChildren & {
  className?: string;
  style?: CSSProperties;
  padding?: string;
  compact?: boolean;
  tight?: boolean;
  grid?: boolean;
};

export function GradientPanel({
  className = '',
  style,
  padding,
  compact = false,
  tight = false,
  grid = false,
  children,
}: GradientPanelProps) {
  const classes = [
    styles.panel,
    compact ? styles.panelCompact : null,
    tight ? styles.panelTight : null,
    grid ? styles.panelGrid : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={padding ? { ...style, padding } : style}>
      {children}
    </div>
  );
}

export default GradientPanel;
