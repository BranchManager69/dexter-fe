'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from './viz.module.css';

const BAR_COUNT = 48;

function computeHeight(base: number, noise: number) {
  const clamped = Math.max(0, Math.min(1, base + noise));
  // Keep a small floor so bars never disappear completely.
  return 0.12 + clamped * 0.88;
}

export function AudioVizClient() {
  const barRefs = useRef<HTMLDivElement[]>([]);

  const randomSeeds = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const now = performance.now();

      barRefs.current.forEach((bar, index) => {
        if (!bar) return;
        const phase = randomSeeds[index];
        const baseWave = Math.sin(now / 520 + index * 0.33 + phase) * 0.5 + 0.5;
        const secondaryWave = Math.sin(now / 1470 + index * 0.17 + phase) * 0.5 + 0.5;
        const noise = (Math.random() - 0.5) * 0.12;
        const height = computeHeight(0.55 * baseWave + 0.45 * secondaryWave, noise);
        bar.style.setProperty('--bar-scale', height.toFixed(3));
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [randomSeeds]);

  return (
    <div className={styles.visualizer}>
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <div
          key={index}
          ref={(element) => {
            if (element) {
              barRefs.current[index] = element;
            }
          }}
          className={styles.bar}
          style={{ animationDelay: `${index * -0.08}s` }}
        />
      ))}
    </div>
  );
}

