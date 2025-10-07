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
          <span className={styles.subtitle}>Voice trading beta</span>
          <h2>
            Dexter Voice <span className={styles.betaMarker}>beta</span>
          </h2>
          <p>Talk in plain language—Dexter answers back in under a second and moves the trade while you’re still mid-sentence.</p>
        </div>
        <div className={styles.actions}>
          <Link
            href="https://beta.dexter.cash"
            className={`button ${styles.primaryButton}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles.ctaIcon} aria-hidden="true">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline
                  points="1 9 4 5 7 11 10 3 13 10 16 6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Launch beta</span>
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
