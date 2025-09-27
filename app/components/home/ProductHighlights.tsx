import styles from './ProductHighlights.module.css';

type Highlight = {
  title: string;
  description: string;
};

const highlights: Highlight[] = [
  {
    title: 'Voice console',
    description: 'Push-to-talk, captions, and waveforms keep commands clear even off-screen.',
  },
  {
    title: 'Specialist timeline',
    description: 'Every agent step is logged with tool output and timing you can audit.',
  },
  {
    title: 'Market radar',
    description: 'Launches, depth, and watchlists refresh beside the conversation in real time.',
  },
  {
    title: 'Memory board',
    description: 'Pins, transcripts, and tasks stay voice-searchable for later recall.',
  },
];

export function ProductHighlights() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.intro}>
        <span className="eyebrow">What lights up</span>
        <h2>Surfaces built for your voice.</h2>
        <p>Execution, research, and records sit in the same console you speak into.</p>
      </div>
      <div className={styles.grid}>
        {highlights.map((highlight) => (
          <article key={highlight.title} className={styles.card}>
            <h3>{highlight.title}</h3>
            <p>{highlight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
