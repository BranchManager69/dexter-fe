'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './LandingHero.module.css';
import { StartConversationButton } from '../StartConversationButton';
import { DexterAnimatedCrest } from '../DexterAnimatedCrest';
import { useState } from 'react';

const metrics = [
  {
    label: 'Speed',
    value: 'Voice to execution in ≈2.5s',
  },
  {
    label: 'Coverage',
    value: 'Ethereum · Solana · Base',
  },
  {
    label: 'Receipts',
    value: 'Every action logged + shipped',
  },
];

export function LandingHero() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const mintPlaceholder = 'So1anaMintAddressGoesHere111111111111111111111111';

  const handleCopyMint = async () => {
    try {
      await navigator.clipboard.writeText(mintPlaceholder);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error('Mint copy failed', error);
    }
  };

  return (
    <section className={`section ${styles.hero}`}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.kickerRow}>
            <span className={styles.kicker}>Voice command · trading desk</span>
            <span className={styles.badge}>Realtime beta</span>
          </div>
          <h1>Issue one command. Dexter does the rest.</h1>
          <button type="button" className={styles.mintCopy} onClick={handleCopyMint} aria-label="Copy Dexter mint address">
            <span>{mintPlaceholder}</span>
            <svg className={styles.mintCopyIcon} width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
              <rect x="4" y="4" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <span className={styles.mintCopyStatus} aria-live="polite">
              {copied ? 'Copied' : ''}
            </span>
          </button>
          <p>
            Dexter is the desk operator that never sleeps: it joins your huddle, captures intent, executes across chains,
            and drops receipts back where your team already lives.
          </p>

          <div className={styles.primaryAction}>
            <div className={styles.primaryButton}>
              <StartConversationButton onClick={() => router.push('/voice')} />
            </div>
            <div className={styles.primaryCopy}>
              <h2>Launch Dexter now</h2>
              <p>
                The voice agent boots in seconds. Say it once—Dexter handles trading, notifications, and summaries with
                zero dashboard hopping.
              </p>
              <Link href="/support" className={styles.secondaryLink}>
                View onboarding &rarr;
              </Link>
            </div>
          </div>

          <dl className={styles.metrics}>
            {metrics.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className={styles.console} aria-labelledby="hero-demo-title">
          <div className={styles.consoleHeader}>
            <DexterAnimatedCrest className={styles.consoleCrest} size={68} />
            <div>
              <span id="hero-demo-title" className={styles.consoleLabel}>
                Live voice session
              </span>
              <p className={styles.consoleDescription}>Sample flow from the trading floor.</p>
            </div>
          </div>
          <div className={styles.waveform}>
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <ul className={styles.consoleLog}>
            <li>
              <span className={styles.consoleSpeaker}>Operator</span>
              <p>Dexter, offload 4 ETH to USDC and notify finance.</p>
            </li>
            <li>
              <span className={styles.consoleSpeaker}>Dexter</span>
              <p>Routing to best venue… execution cleared in 2.4 seconds.</p>
            </li>
            <li>
              <span className={styles.consoleSpeaker}>Dexter</span>
              <p>Invoice and compliance log delivered to shared channel.</p>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default LandingHero;
