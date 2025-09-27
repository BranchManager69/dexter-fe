import Link from 'next/link';
import styles from './ClosingCta.module.css';

export function ClosingCta() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.shell}>
        <div className={styles.copy}>
          <span className="eyebrow">Ready when you are</span>
          <h2>Launch Dexter now.</h2>
          <p>Hands-free voice beta in moments.</p>
        </div>
        <div className={styles.actions}>
          <Link href="https://beta.dexter.cash" className="button button--primary" target="_blank" rel="noreferrer">
            Open the beta
          </Link>
        </div>
      </div>
    </section>
  );
}
