'use client';

import { useMemo } from 'react';
import styles from './BreakingNewsBanner.module.css';

type Severity = 'info' | 'positive' | 'negative';

type BreakingNewsBannerProps = {
  active?: boolean;
  severity?: Severity;
  eyebrow?: string;
  headline: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const SEVERITY_MAP: Record<Severity, string> = {
  info: styles.info,
  positive: styles.positive,
  negative: styles.negative,
};

export function BreakingNewsBanner({
  active = true,
  severity = 'info',
  eyebrow = 'update',
  headline,
  ctaLabel,
  ctaHref,
}: BreakingNewsBannerProps) {
  const severityClass = useMemo(() => SEVERITY_MAP[severity] ?? SEVERITY_MAP.info, [severity]);

  if (!active) return null;

  return (
    <div className={`${styles.banner} ${severityClass}`} role="status" aria-live="polite">
      <div className={styles.inner}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <p className={styles.headline}>{headline}</p>
        {ctaLabel && ctaHref && (
          <a className={styles.cta} href={ctaHref}>
            {ctaLabel} ↗
          </a>
        )}
      </div>
    </div>
  );
}
