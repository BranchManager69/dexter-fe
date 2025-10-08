import styles from './SupportPage.module.css';

export default function SupportPage() {
  return (
    <main className="main-content">
      <section className="section">
        <div className={styles.wrapper}>
          <div>
            <span className={styles.eyebrowAccent}>Need something?</span>
            <h1>Reach Branch</h1>
          </div>
          <div className={styles.contacts}>
            <div className={styles.contactRow}>
              <span className={styles.contactIcon} aria-hidden="true">
                <svg width="22" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3h20v12H2V3Zm0 0 10 7 10-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <a href="mailto:branch@branch.bet">branch@branch.bet</a>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactIcon} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 4h3.5l5.3 7.2L16.8 4H20l-6.7 8.9L20 20h-3.5l-5.1-6.9L7.2 20H4l6.6-8.8L4 4Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <a href="https://x.com/branchmanager69" rel="noreferrer" target="_blank">
                @branchmanager69
              </a>
            </div>
            <div className={styles.brandingHint}>
              <a href="/branding" className={styles.brandingLink}>
                Dexter branding
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
