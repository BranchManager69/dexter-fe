'use client';

import { useState } from 'react';
import styles from './DexterMintBadge.module.css';

const PLACEHOLDER_MINT = 'So1anaMintAddressGoesHere111111111111111111111111';

export function DexterMintBadge() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PLACEHOLDER_MINT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy mint address', error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.badge} onClick={handleCopy} aria-label="Copy Dexter mint address">
        <span className={styles.label}>Mint</span>
        <span className={styles.value}>{PLACEHOLDER_MINT}</span>
        <svg className={styles.icon} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
          <rect x="4" y="4" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <span className={styles.status} aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </div>
  );
}
