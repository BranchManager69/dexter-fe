import styles from './Testimonials.module.css';

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote: '“It feels like we hired a voice-native desk assistant. Trades clear faster, and the proof shows up in everyone’s inbox automatically.”',
    name: 'Aria Chen',
    role: 'Operator, Velocity Labs',
  },
  {
    quote: '“Dexter keeps our team in rhythm—analysts feed intel, compliance sees the logs, and the trader just talks. It is the only bot we trust with size.”',
    name: 'Marcus Hale',
    role: 'Partner, Nightwave Capital',
  },
];

export function Testimonials() {
  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.intro}>
        <span className="eyebrow">Operators in beta</span>
        <h2>Desks that rely on Dexter.</h2>
      </div>
      <div className={styles.grid}>
        {testimonials.map((testimonial) => (
          <figure key={testimonial.name} className={styles.card}>
            <blockquote>
              <p>{testimonial.quote}</p>
            </blockquote>
            <figcaption>
              <span className={styles.name}>{testimonial.name}</span>
              <span className={styles.role}>{testimonial.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
