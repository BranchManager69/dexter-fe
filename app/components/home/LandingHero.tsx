import Link from 'next/link';
import styles from './LandingHero.module.css';

type TimelineEvent = {
  speaker: string;
  message: string;
};

const timeline: TimelineEvent[] = [
  { speaker: 'You', message: '“Rotate 4 ETH into Rocket Labs and pin the intel.”' },
  { speaker: 'Dexter · Trader', message: 'Quotes venues, routes the swap, confirms fills aloud.' },
  { speaker: 'Dexter · Analyst', message: 'Pins the brief, tags the watchlist, emails the log.' },
];

export function LandingHero() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.copy}>
        <span className="eyebrow">Voice-native crypto butler</span>
        <h1>Speak, and I obey.</h1>
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
      <div className={styles.visual} aria-hidden="true">
        <div className={styles.annotation}>Live session — Butler mode</div>
        <div className={styles.panel}>
          <div className={styles.panelHeadline}>One voice command, the entire desk in motion.</div>
          <div className={styles.timeline}>
            {timeline.map((event) => (
              <div key={event.message} className={styles.timelineItem}>
                <span>{event.speaker}</span>
                <p>{event.message}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footer}>Drop your product footage here when you’re ready.</div>
      </div>
    </section>
  );
}
