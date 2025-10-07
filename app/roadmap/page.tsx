import styles from './RoadmapPage.module.css';

type Milestone = {
  title: string;
  description: string;
};

type TimelineEntry = {
  id: string;
  label: string;
  summary: string;
  milestones: Milestone[];
};

const timeline: TimelineEntry[] = [
  {
    id: 'oct-2025',
    label: 'October 2025',
    summary: 'Launch month. Core co-pilots and voice proof land during the token debut week.',
    milestones: [
      {
        title: 'Agent co-pilots in chat',
        description: 'Let multiple Dexter agents collaborate in a single thread with role-specific tools.',
      },
      {
        title: 'Voice session transcripts',
        description: 'Ship recording, summary, and ledger receipts to your ops stack within minutes.',
      },
      {
        title: 'Launch checklist + token visibility',
        description: 'Add swap links, circuit breakers, and homepage callouts tied to the DEXTER token rollout.',
      },
    ],
  },
  {
    id: 'nov-2025',
    label: 'November 2025',
    summary: 'Stabilize the desks, add guardrails, and tighten the feedback loops after launch.',
    milestones: [
      {
        title: 'Portfolio guardrails',
        description: 'Policy-based controls that cap position sizing, slippage, and counterparty risk per wallet.',
      },
      {
        title: 'Realtime status subscriptions',
        description: 'Webhook + digest pings any time a service blips or maintenance window is scheduled.',
      },
      {
        title: 'Feedback heatmap',
        description: 'Lightweight voting on prompts + tool combos so we know what to double down on.',
      },
    ],
  },
  {
    id: 'dec-2025',
    label: 'December 2025',
    summary: 'Year-end polish before the holidays—reporting kits and self-serve onboarding flows.',
    milestones: [
      {
        title: 'Playbooks & starter packs',
        description: 'Preset MCP tool bundles for common branches so new users can get live without DMing us.',
      },
      {
        title: 'Year-end reporting kit',
        description: 'Export ledger summaries, voice receipts, and token via onboarding-safe templates.',
      },
      {
        title: 'Support backlog cleanup',
        description: 'Catch up on DM + email threads, publish best-of answers straight into Docs.',
      },
    ],
  },
  {
    id: '2026',
    label: '2026',
    summary: 'Longer-term bets once the launch dust settles.',
    milestones: [
      {
        title: 'Marketplace tooling',
        description: 'Third-party agent packs with vetted MCP integrations and revenue share.',
      },
      {
        title: 'Dexter mobile',
        description: 'Hands-free voice trading companion with biometric unlocks and on-device hotkeys.',
      },
      {
        title: 'Pro tier experiments',
        description: 'Pricing, analytics, and automation layers for the desks that stick around.',
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
            <span className={styles.eyebrowAccent}>What&apos;s planned</span>
            <h1>Dexter Roadmap</h1>
          </div>

          <div className={styles.timeline}>
            {timeline.map((entry) => (
              <article key={entry.id} className={styles.entry} aria-labelledby={`${entry.id}-label`}>
                <header className={styles.entryHeader}>
                  <div>
                    <h2 id={`${entry.id}-label`}>{entry.label}</h2>
                    <p className={styles.summary}>{entry.summary}</p>
                  </div>
                </header>
                <ul className={styles.milestones}>
                  {entry.milestones.map((milestone) => (
                    <li key={milestone.title} className={styles.milestone}>
                      <strong>{milestone.title}</strong>
                      <p>{milestone.description}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
