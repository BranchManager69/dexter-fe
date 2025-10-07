'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './DexterMintBadge.module.css';

const PLACEHOLDER_MINT = 'So1anaMintAddressGoesHere111111111111111111111111';

export function DexterMintBadge() {
  const [showToast, setShowToast] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PLACEHOLDER_MINT);
      setShowToast(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setShowToast(false), 3200);
    } catch (error) {
      console.error('Failed to copy mint address', error);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.badge} onClick={handleCopy} aria-label="Copy Dexter mint address">
        <span className={styles.value}>{PLACEHOLDER_MINT}</span>
        <svg className={styles.icon} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
          <rect x="4" y="4" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <div role="status" aria-live="polite" className={`${styles.toast} ${showToast ? styles.toastVisible : ''}`.trim()}>
        Address copied.
      </div>
    </div>
  );
}
