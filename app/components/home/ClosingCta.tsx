import Link from 'next/link';
import styles from './ClosingCta.module.css';

export function ClosingCta() {
  return (
    <aside className={styles.floating} aria-label="Launch Dexter beta">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.card} data-floating>
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
    </aside>
  );
}
