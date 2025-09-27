import styles from './SessionFlow.module.css';

type Step = {
  stage: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    stage: '01',
    title: 'Say the intent',
    description: 'Dexter checks risk, repeats the plan, and waits for your nod.',
  },
  {
    stage: '02',
    title: 'Specialists execute',
    description: 'Planner, trader, analyst, and compliance stay in one timeline with receipts.',
  },
  {
    stage: '03',
    title: 'Proof lands instantly',
    description: 'Orders clear, intel pins, and transcripts sync to everyone who needs them.',
  },
];

export function SessionFlow() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.intro}>
        <span className="eyebrow">Concierge in three beats</span>
        <h2>Three steps, no keyboard.</h2>
        <p>Speak, confirm, and let Dexter run it while you stay in stride.</p>
      </div>
      <ol className={styles.steps}>
        {steps.map((step) => (
          <li key={step.stage} className={styles.step}>
            <span className={styles.stage}>{step.stage}</span>
            <div className={styles.body}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
