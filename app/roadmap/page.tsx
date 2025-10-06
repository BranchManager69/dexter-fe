import GradientPanel from '../components/GradientPanel';
import styles from './RoadmapPage.module.css';

const roadmap = [
  {
    phase: 'Now',
    meta: 'In active development · Target October 2025',
    items: [
      {
        title: 'Agent co-pilots in chat',
        description: 'Let multiple Dexter agents collaborate in a single thread with role-specific tools.',
      },
      {
        title: 'Voice session transcripts',
        description: 'Ship recording, summary, and ledger receipts to your ops stack within minutes.',
      },
    ],
  },
  {
    phase: 'Next',
    meta: 'Planning · Target Q4 2025',
    items: [
      {
        title: 'Portfolio guardrails',
        description: 'Policy-based controls that cap position sizing, slippage, and counterparty risk per wallet.',
      },
      {
        title: 'Realtime status subscriptions',
        description: 'Webhook + email digests any time a service blips or maintenance window is scheduled.',
      },
    ],
  },
  {
    phase: 'Later',
    meta: 'Exploration · Target 2026',
    items: [
      {
        title: 'Marketplace tooling',
        description: 'Third-party agent packs with vetted MCP integrations and revenue share.',
      },
      {
        title: 'Dexter mobile',
        description: 'Hands-free voice trading companion with biometric unlocks and on-device hotkeys.',
      },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main className="main-content">
      <section className="section">
        <div className={styles.wrapper}>
          <div className={styles.intro}>
            <span className="eyebrow">What&apos;s coming</span>
            <h1>Dexter roadmap.</h1>
            <p>
              Here’s how we’re sequencing the next wave of automation: what’s shipping now, what’s queued next, and what’s still in research.
            </p>
          </div>
          <div className={styles.columns}>
            {roadmap.map((bucket) => (
              <GradientPanel key={bucket.phase} className={styles.column} tight>
                <header className={styles.header}>
                  <span className={styles.phase}>{bucket.phase}</span>
                  <span className={styles.meta}>{bucket.meta}</span>
                </header>
                <div className={styles.list}>
                  {bucket.items.map((item) => (
                    <div key={item.title} className={styles.item}>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </div>
              </GradientPanel>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
