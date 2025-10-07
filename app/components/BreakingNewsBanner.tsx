'use client';

import { CSSProperties, useLayoutEffect, useMemo, useState } from 'react';
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
  const [stickyTop, setStickyTop] = useState('calc(72px + env(safe-area-inset-top, 0px))');

  useLayoutEffect(() => {
    if (!active) return;
    const computeOffset = () => {
      const header = document.querySelector<HTMLElement>('.site-header');
      if (header) {
        const height = header.getBoundingClientRect().height;
        setStickyTop(`calc(${height}px + env(safe-area-inset-top, 0px))`);
      }
    };

    computeOffset();
    window.addEventListener('resize', computeOffset);
    return () => window.removeEventListener('resize', computeOffset);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className={`${styles.banner} ${severityClass}`}
      role="status"
      aria-live="polite"
      style={{ '--banner-sticky-top': stickyTop } as CSSProperties}
    >
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
