'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { shortenMint } from '../../../lib/format';
import styles from './DexterMintBadge.module.css';

const PLACEHOLDER_MINT = 'So1anaMintAddressGoesHere111111111111111111111111';
const TOKEN_CONFIG_ENDPOINT = '/api/token/config';

export function DexterMintBadge() {
  const [showToast, setShowToast] = useState(false);
  const [compact, setCompact] = useState(false);
  const [mint, setMint] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [marketCap, setMarketCap] = useState<string | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDexterToken = symbol ? symbol.toLowerCase() === 'dexter' : false;

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setCompact(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadMint = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(TOKEN_CONFIG_ENDPOINT, { cache: 'no-store' });
        if (!response.ok) throw new Error(`token_config_http_${response.status}`);
        const data = await response.json();
        const resolvedMint = data?.token?.mintAddress;
        const resolvedMarketCap = data?.token?.marketCap ?? data?.token?.marketcap;
        const resolvedPriceChange = data?.token?.priceChange24h ?? data?.token?.priceChange?.h24;
        const resolvedSymbol = data?.token?.symbol;
        const normalisedSymbol = typeof resolvedSymbol === 'string' ? resolvedSymbol.trim() : null;
        const isDexterSymbol = !!normalisedSymbol && normalisedSymbol.toLowerCase() === 'dexter';
        if (!cancelled) {
          setSymbol(normalisedSymbol);
          if (isDexterSymbol && resolvedMint && typeof resolvedMint === 'string') {
            setMint(resolvedMint);
            setError(null);
          } else {
            setMint(null);
            if (isDexterSymbol) {
              setError('Mint unavailable');
            } else {
              setError(null);
            }
          }
          if (isDexterSymbol && resolvedMarketCap != null) {
            setMarketCap(String(resolvedMarketCap));
          } else {
            setMarketCap(null);
          }
          if (isDexterSymbol && typeof resolvedPriceChange === 'number') {
            setPriceChange24h(resolvedPriceChange);
          } else {
            setPriceChange24h(null);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setMint(null);
          setError('Mint unavailable');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadMint();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    if (!mint || !isDexterToken) return;
    try {
      await navigator.clipboard.writeText(mint);
      setShowToast(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowToast(false), 3200);
    } catch (error) {
      console.error('Failed to copy mint address', error);
    }
  };

  const displayValue = (() => {
    if (loading) return 'Loading mint…';
    if (!isDexterToken) return '';
    const value = mint ?? PLACEHOLDER_MINT;
    return compact ? shortenMint(value, 6) : value;
  })();

  const formattedMarketCap = useMemo(() => {
    if (!marketCap) return null;
    const numeric = Number(marketCap);
    if (Number.isFinite(numeric)) {
      if (numeric >= 1_000_000_000) return `$${(numeric / 1_000_000_000).toFixed(2)}B`;
      if (numeric >= 1_000_000) return `$${(numeric / 1_000_000).toFixed(1)}M`;
      if (numeric >= 1_000) return `$${(numeric / 1_000).toFixed(1)}K`;
      return `$${numeric.toFixed(0)}`;
    }
    const trimmed = marketCap.trim();
    return trimmed ? `$${trimmed}` : null;
  }, [marketCap]);

  const formattedPriceChange = useMemo(() => {
    if (priceChange24h == null || Number.isNaN(priceChange24h)) return null;
    const value = typeof priceChange24h === 'string' ? parseFloat(priceChange24h) : priceChange24h;
    if (!Number.isFinite(value) || value <= 0) return null;
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }, [priceChange24h]);

  return (
    <div className={styles.wrapper}>
      {isDexterToken && (
        <button
          type="button"
          className={styles.badge}
          onClick={handleCopy}
          aria-label="Copy Dexter mint address"
          disabled={loading || !mint}
          data-disabled={loading || !mint}
        >
          <span className={styles.value}>{displayValue}</span>
          <svg className={styles.icon} width="16" height="16" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
            <rect x="4" y="4" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      )}
      <div role="status" aria-live="polite" className={`${styles.toast} ${showToast ? styles.toastVisible : ''}`.trim()}>
        Address copied.
      </div>
      {error && !loading && isDexterToken && <div className={styles.error}>{error}</div>}
      {!loading && isDexterToken && mint && (
        <div className={styles.metrics} aria-label="Token metrics">
          {formattedMarketCap && (
            <span className={styles.metric} data-kind="market-cap">
              <span className={styles.metricValue}>{formattedMarketCap}</span>
              <span className={styles.metricLabel}>MC</span>
            </span>
          )}
          {formattedPriceChange && (
            <span className={styles.metric} data-kind="price-change">
              <span className={styles.metricLabel}>24h</span>
              <span className={styles.metricValue}>{formattedPriceChange}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
