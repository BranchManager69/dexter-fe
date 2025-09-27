import styles from './WhyDexter.module.css';

type Slice = {
  title: string;
  description: string;
};

const slices: Slice[] = [
  {
    title: 'Trades by voice',
    description: 'Say the swap, hear the confirmation, and move on—no wallets or dashboards required.',
  },
  {
    title: 'Memory on tap',
    description: 'Ask Dexter what happened last session or which token you pinned—it recalls instantly.',
  },
  {
    title: 'Intel in-stream',
    description: 'Sentiment, dossiers, and alerts arrive mid-conversation so you never break focus.',
  },
];

export function WhyDexter() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.intro}>
        <span className="eyebrow">Why keep Dexter on call</span>
        <h2>Your voice-first crypto butler.</h2>
        <p>Dexter listens, acts, and logs so you stay hands-free and accountable.</p>
      </div>
      <div className={styles.grid}>
        {slices.map((slice) => (
          <article key={slice.title} className={styles.card}>
            <h3>{slice.title}</h3>
            <p>{slice.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
