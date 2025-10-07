import styles from './SupportPage.module.css';

export default function SupportPage() {
  return (
    <main className="main-content">
      <section className="section">
        <div className={styles.wrapper}>
          <div>
            <span className={styles.eyebrowAccent}>Need something?</span>
            <h1>Reach Branch</h1>
            <p>
              No ticket systems, no bots—just send a note or a DM and I&apos;ll see it when I can.
            </p>
          </div>
          <div className={styles.contacts}>
            <div className={styles.contactCard}>
              <h2>Email</h2>
              <a href="mailto:branch@branch.bet">branch@branch.bet</a>
              <p>Anything goes. Screenshots help, but not required.</p>
            </div>
            <div className={styles.contactCard}>
              <h2>X (Twitter)</h2>
              <a href="https://x.com/branchmanager69" rel="noreferrer" target="_blank">
                @branchmanager69
              </a>
              <p>DMs are open if you&apos;re already scrolling.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
