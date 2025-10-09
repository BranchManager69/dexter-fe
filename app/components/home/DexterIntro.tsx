'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './DexterIntro.module.css';

const HIGHLIGHTS = [
  {
    title: 'Voice + agents + crypto',
    body: 'Realtime speech recognition pipes straight into controllable agents and on-chain execution. No scripts required—just talk.'
  },
  {
    title: 'Token-backed roadmap',
    body: 'The Dexter token underpins access and future governance. Early holders help steer which tools and venues we wire in next.'
  },
  {
    title: 'Pace yourself',
    body: 'This is early software. We expect bugs, latency hiccups, and awkward edges. Try with discretionary amounts and help us harden it.'
  }
] as const;

export function DexterIntro() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const highlightItems = useMemo(() => HIGHLIGHTS.map((item, index) => (
    <li
      key={item.title}
      className={`${styles.highlightItem} ${visible ? styles.highlightItemVisible : ''}`}
      style={{ transitionDelay: visible ? `${index * 90 + 140}ms` : undefined }}
    >
      <strong>{item.title}</strong>
      <p>{item.body}</p>
    </li>
  )), [visible]);

  return (
    <section ref={sectionRef} className={`${styles.section} ${visible ? styles.sectionVisible : ''}`}>
      <header className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Introducing Dexter</span>
        <h2>Introducing the Dexter Project.</h2>
      </header>
      <div className={styles.sectionGrid}>
        <div className={styles.leadBlock}>
          <p className={styles.lead}>
            <strong>The Dexter token and platform are our experiment in blending crypto infrastructure with agentic, voice-first automation.</strong>
          </p>
          <p>
            We are shipping bleeding-edge tech that stitches together realtime speech, autonomous agents, and Solana-native execution.
            The goal is a new kind of trading loop—one where natural language drives swaps, and the proof follows right behind.
          </p>
          <p>
            Dexter is still a beta. The token is emerging, the tooling evolves weekly, and the voice stack will stumble on day one.
            Please only connect capital you are comfortable putting under an experimental agent&apos;s control.
          </p>
          <p>
            If that excites you, we would love for you to kick the tires with small amounts, stress the flows, and tell us where to focus next.
          </p>
        </div>
        <div className={styles.spotlight}>
          <div className={`${styles.card} ${visible ? styles.cardVisible : ''}`}>
            <div className={styles.cardLead}>
              <span className={styles.cardTag}>What it unlocks</span>
              <ul className={styles.highlightList}>{highlightItems}</ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
