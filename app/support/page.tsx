import type { Route } from 'next';
import Link from 'next/link';
import GradientPanel from '../components/GradientPanel';
import styles from './SupportPage.module.css';

type ExternalQuickLink = {
  label: string;
  href: string;
  external: true;
};

type InternalQuickLink = {
  label: string;
  href: Route;
  external?: false;
};

const quickLinks: Array<ExternalQuickLink | InternalQuickLink> = [
  { label: 'Open a ticket', href: 'mailto:support@dexter.tools', external: true },
  { label: 'Status page', href: '/status' satisfies Route },
  { label: 'Roadmap', href: '/roadmap' satisfies Route },
];

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
          <GradientPanel className={styles.card}>
            <h2>Fastest path: email</h2>
            <p>
              Send context, wallet IDs, and screenshots to <a href="mailto:support@dexter.tools">support@dexter.tools</a>. Urgent production blockers should include “SEV1” in the subject line.
            </p>
            <p>
              We’re available 08:00–22:00 ET on weekdays, and on-call teams monitor voice incidents 24/7.
            </p>
          </GradientPanel>
          <div className={styles.links}>
            {quickLinks.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href} rel="noreferrer" className={styles.linkChip}>
                  {link.label}
                  <span aria-hidden>↗</span>
                </a>
              ) : (
                <Link key={link.href} href={link.href} className={styles.linkChip}>
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
