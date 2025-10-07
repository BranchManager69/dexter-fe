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
          <span className={styles.subtitle}>Realtime desk companion</span>
          <h2>
            Dexter Voice <span className={styles.betaMarker}>beta</span>
          </h2>
          <p>Spin up the voice operator that routes trades, logs receipts, and updates every channel without dashboards.</p>
        </div>
        <div className={styles.actions}>
          <Link
            href="https://beta.dexter.cash"
            className={`button ${styles.primaryButton}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles.ctaIcon} aria-hidden="true">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 6H3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 6H7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9 6H11" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 6H17" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
            <span>Try now</span>
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
        Voice beta ↗
      </button>
    </aside>
  );
}
