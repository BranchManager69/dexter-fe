"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './ClosingCta.module.css';

export function ClosingCta() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${styles.floating}${collapsed ? ` ${styles.collapsed}` : ''}`}
      aria-label="Launch Dexter beta"
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card} data-floating>
        <button
          type="button"
          className={styles.dismiss}
          onClick={() => setCollapsed(true)}
          aria-label="Minimize Dexter Voice beta callout"
        >
          ×
        </button>
        <div className={styles.copy}>
          <h2>
            Dexter Voice <span className={styles.betaMarker}>beta</span>
          </h2>
          <p>Crypto's first talking agent.</p>
        </div>
        <div className={styles.actions}>
          <Link
            href="https://beta.dexter.cash"
            className={`button ${styles.primaryButton}`}
            target="_blank"
            rel="noreferrer"
          >
            Try now
          </Link>
        </div>
      </div>
      <button
        type="button"
        className={styles.chip}
        onClick={() => setCollapsed(false)}
        aria-hidden={!collapsed}
        tabIndex={collapsed ? 0 : -1}
        aria-label="Reopen Dexter Voice beta callout"
      >
        Dexter Voice beta ↗
      </button>
    </aside>
  );
}
