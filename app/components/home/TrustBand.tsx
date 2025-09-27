import styles from './TrustBand.module.css';

type Signal = {
  title: string;
  description: string;
};

const signals: Signal[] = [
  {
    title: 'Supabase scopes',
    description: 'Sessions inherit wallet limits so guests stay sandboxed and desks stay accountable.',
  },
  {
    title: 'MCP JWT fences',
    description: 'Each tool call is signed and expires fast—nothing runs beyond what you approved.',
  },
  {
    title: 'Receipts on autopilot',
    description: 'Transcripts and on-chain proofs ship to ops and compliance as the session ends.',
  },
];

export function TrustBand() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.shell}>
        <div className={styles.intro}>
          <span className="eyebrow">Guardrails included</span>
          <h2>Guardrails for voice control.</h2>
          <p>Auth, scopes, and logs stay tied to every spoken command.</p>
        </div>
        <div className={styles.grid}>
          {signals.map((signal) => (
            <article key={signal.title} className={styles.card}>
              <h3>{signal.title}</h3>
              <p>{signal.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
