'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './LandingHero.module.css';
import { StartConversationButton } from '../StartConversationButton';
import { DexterAnimatedCrest } from '../DexterAnimatedCrest';

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

  return (
    <section className={`section ${styles.hero}`}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.kickerRow}>
            <span className={styles.kicker}>Voice command · trading desk</span>
            <span className={styles.badge}>Realtime beta</span>
          </div>
          <h1>Issue one command. Dexter does the rest.</h1>
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
