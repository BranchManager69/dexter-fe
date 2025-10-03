import Link from 'next/link';
import styles from './LandingHero.module.css';

export function LandingHero() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.copy}>
        <span className="eyebrow">Voice-native crypto butler</span>
        <h1>Speak, and I obey.</h1>
        <span className={styles.tagline}>Realtime Agents for DeFi</span>
        <p>Dexter hears the command, runs the trade, pulls the intel, and leaves the receipts—no screens, no typing.</p>
        <div className={styles.actions}>
          <Link href="https://beta.dexter.cash" className="button button--primary" target="_blank" rel="noreferrer">
            Launch Dexter
          </Link>
          <Link href="/link" className="button button--ghost">
            See it in action
          </Link>
        </div>
      </div>
    </section>
  );
}
