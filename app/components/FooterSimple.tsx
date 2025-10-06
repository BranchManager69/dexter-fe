import { SITE } from '../../lib/site';
import styles from './FooterSimple.module.css';

export function FooterSimple() {
  return (
    <div className={styles.wrapper}>
      <a href="https://branch.bet" className={styles.branchLink} target="_blank" rel="noreferrer">
        <svg width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="branchFooterStroke" x1="18" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgb(var(--color-primary-bright))" />
              <stop offset="1" stopColor="rgb(var(--color-primary))" />
            </linearGradient>
            <linearGradient id="branchFooterFill" x1="16" y1="16" x2="46" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgb(var(--color-primary-muted))" stopOpacity="0.85" />
              <stop offset="1" stopColor="rgb(var(--color-foreground))" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <path d="M20 12h12c10 0 16 5 16 13 0 5.6-3.2 9.7-8.6 11.5C43.4 38 48 42.6 48 49c0 7.8-6.2 13-15.8 13H20" stroke="url(#branchFooterStroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12h10c8.4 0 13 3.7 13 10.5 0 5.3-3 8.8-7.8 10.2" fill="none" stroke="url(#branchFooterFill)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>branch.bet</span>
      </a>

      <div className={styles.centerpiece} aria-hidden="true">
        <img
          src="/assets/icons/jup.svg"
          alt="Jupiter token"
          className={styles.centerpieceIcon}
        />
      </div>

      <nav className={styles.links} aria-label="Footer links">
        {SITE.footerLinks.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
    </div>
  );
}
