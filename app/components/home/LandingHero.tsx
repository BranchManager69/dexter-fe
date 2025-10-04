import Link from 'next/link';
import styles from './LandingHero.module.css';

export function LandingHero() {
  return (
    <section className={`section ${styles.hero}`}>
      <div className={styles.layout}>
        <div className={styles.content}>
          <span className={styles.kicker}>Talk to Dexter. It handles your crypto desk.</span>
          <h1>Give a voice command, get the trade done.</h1>
          <p>
            Say what you need once. Dexter routes the orders, updates the team, and hands back a record without making
            you click through another dashboard.
          </p>
          <div className={styles.actions}>
            <Link href="/tools" className="button button--primary">
              See how Dexter works
            </Link>
          </div>
          <dl className={styles.metrics}>
            <div>
              <dt>Speed</dt>
              <dd>Orders placed and confirmed in under 3 seconds</dd>
            </div>
            <div>
              <dt>Coverage</dt>
              <dd>Supports Ethereum, Solana, and Base</dd>
            </div>
            <div>
              <dt>Receipts</dt>
              <dd>Every action logged and ready to share</dd>
            </div>
          </dl>
        </div>

        <div className={styles.console} aria-hidden="true">
          <span className={styles.consoleLabel}>Live command feed</span>
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
              <p>Dexter, sell 4 ETH for USDC and send the report.</p>
            </li>
            <li>
              <span className={styles.consoleSpeaker}>Dexter</span>
              <p>Order filled at the best price. Final confirmation in 2.6s.</p>
            </li>
            <li>
              <span className={styles.consoleSpeaker}>Dexter</span>
              <p>Trade summary and compliance log sent to your inbox.</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
