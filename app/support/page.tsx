import Link from 'next/link';
import styles from './SupportPage.module.css';

const quickLinks = [
  { label: 'Open a ticket', href: 'mailto:support@dexter.tools', external: true },
  { label: 'Status page', href: '/status' },
  { label: 'Roadmap', href: '/roadmap' },
] as const;

export default function SupportPage() {
  return (
    <main className="main-content">
      <section className="section">
        <div className={styles.wrapper}>
          <div>
            <span className="eyebrow">Need help?</span>
            <h1>Dexter support.</h1>
            <p>
              Reach us anytime for account changes, incident reports, or bespoke trading desks. We reply within one business day (faster for holders).
            </p>
          </div>
          <article className={styles.card}>
            <h2>Fastest path: email</h2>
            <p>
              Send context, wallet IDs, and screenshots to <a href="mailto:support@dexter.tools">support@dexter.tools</a>. Urgent production blockers should include “SEV1” in the subject.
            </p>
            <p>
              We’re available 08:00–22:00 ET on weekdays, and on-call teams monitor voice incidents 24/7.
            </p>
          </article>
          <div className={styles.links}>
            {quickLinks.map((link) => (
              link.external ? (
                <a key={link.href} href={link.href} rel="noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              )
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
