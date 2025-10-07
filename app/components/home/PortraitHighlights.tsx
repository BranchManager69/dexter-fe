'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './PortraitHighlights.module.css';
import type { DemoPoint } from './PortraitDemo';

type PortraitHighlightsProps = {
  points: DemoPoint[];
};

const ROTATE_MS = 3000;

export function PortraitHighlights({ points }: PortraitHighlightsProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [points]);

  useEffect(() => {
    if (points.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setActive(prev => (prev + 1) % points.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [points.length]);

  const deck = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((point, slot) => {
      const index = (slot + active) % points.length;
      const source = points[index];
      return { ...source, slot, key: `${source.title}-${index}` };
    });
  }, [points, active]);

  if (points.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Dexter portrait highlights">
      <h3>Dexter covers the critical steps for you.</h3>
      <div className={styles.deck}>
        {deck.map(card => (
          <article key={card.key} className={styles.card} data-slot={card.slot}>
            <h4>{card.title}</h4>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
