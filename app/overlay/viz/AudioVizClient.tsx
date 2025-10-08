'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from './viz.module.css';

const BAR_COUNT = 48;
const EVENT_NAME = 'dexter:audio-reactive';
const STALE_TIMEOUT_MS = 1500;

type AudioReactivePayload = {
  bars: number[];
  level: number;
  timestamp: number;
  stale?: boolean;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function AudioVizClient() {
  const barRefs = useRef<HTMLDivElement[]>([]);
  const targetRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));
  const currentRef = useRef<Float32Array>(new Float32Array(BAR_COUNT));
  const lastDataAtRef = useRef(0);
  const staleRef = useRef(true);
  const levelRef = useRef(0);

  const randomSeeds = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => Math.random() * Math.PI * 2),
    [],
  );

  useEffect(() => {
    const handleEvent = (event: Event) => {
      const detail = (event as CustomEvent<AudioReactivePayload>).detail;
      if (!detail || !Array.isArray(detail.bars)) return;

      const now = performance.now();
      staleRef.current = Boolean(detail.stale);
      if (!detail.stale) {
        lastDataAtRef.current = now;
      }
      const amplitude = clamp01(detail.level ?? 0);
      levelRef.current = levelRef.current * 0.25 + amplitude * 0.75;

      if (detail.stale) {
        for (let index = 0; index < BAR_COUNT; index += 1) {
          targetRef.current[index] *= 0.4;
        }
        return;
      }

      const boost = 0.12 + amplitude * 1.25;
      for (let index = 0; index < BAR_COUNT; index += 1) {
        const source =
          detail.bars[index] ??
          detail.bars[detail.bars.length - 1] ??
          0;
        const shaped = Math.pow(clamp01(source), 0.82);
        targetRef.current[index] = clamp01(shaped * boost);
      }
    };

    window.addEventListener(EVENT_NAME, handleEvent as EventListener);
    return () => {
      window.removeEventListener(EVENT_NAME, handleEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      const now = performance.now();
      const hasFreshData = !staleRef.current && now - lastDataAtRef.current <= STALE_TIMEOUT_MS;

      barRefs.current.forEach((bar, index) => {
        if (!bar) return;
        const phase = randomSeeds[index];
        const baseWave = Math.sin(now / 520 + index * 0.33 + phase) * 0.5 + 0.5;
        const secondaryWave = Math.sin(now / 1470 + index * 0.17 + phase) * 0.5 + 0.5;
        const fallback = clamp01(0.55 * baseWave + 0.45 * secondaryWave) * 0.12;
        const desired = hasFreshData ? targetRef.current[index] : fallback;

        const previous = currentRef.current[index];
        const smoothing = hasFreshData
          ? previous > desired
            ? 0.38
            : 0.62
          : 0.24;
        const eased = previous + (desired - previous) * smoothing;
        currentRef.current[index] = eased;

        const jitterRange = hasFreshData ? 0.008 : 0.024;
        const jitter = (Math.random() - 0.5) * jitterRange * (0.5 + levelRef.current * 1.1);
        const levelLift = levelRef.current * (hasFreshData ? 0.03 : 0.05);
        const finalHeight = clamp01(Math.max(0, eased + levelLift + jitter));
        const baseline = hasFreshData ? 0.005 : 0.015;
        const span = 0.995 - baseline;
        bar.style.setProperty('--bar-scale', (baseline + finalHeight * span).toFixed(3));
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
