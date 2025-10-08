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

  const basePalette = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, index) => {
        const ratio = index / Math.max(1, BAR_COUNT - 1);
        const baseHue = 122 - ratio * 14;
        return {
          hue: baseHue,
          accent: baseHue - (12 + ratio * 4),
          depth: baseHue - (26 + ratio * 6),
        };
      }),
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

        const palette = basePalette[index];
        const energy = finalHeight;
        const hue = Math.max(24, palette.hue - energy * 78);
        const accentHue = Math.max(18, palette.accent - energy * 72);
        const depthHue = Math.max(12, palette.depth - energy * 68);
        const saturation = Math.min(100, 82 + energy * 10);
        const topLight = Math.min(92, 74 - energy * 4);
        const midLight = Math.max(26, 52 - energy * 20);
        const bottomLight = Math.max(20, 38 - energy * 22);
        bar.style.setProperty('--bar-color-top', `hsl(${hue.toFixed(1)} ${saturation}% ${topLight}%)`);
        bar.style.setProperty('--bar-color-mid', `hsl(${accentHue.toFixed(1)} ${Math.min(100, saturation + 8)}% ${midLight}%)`);
        bar.style.setProperty('--bar-color-bottom', `hsl(${depthHue.toFixed(1)} ${Math.min(100, saturation + 12)}% ${bottomLight}%)`);
        bar.style.setProperty('--bar-glow', `hsla(${(hue + 4).toFixed(1)}, ${Math.min(100, saturation + 6)}%, ${Math.min(60, 44 + energy * 20)}%, 0.36)`);
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
              const palette = basePalette[index];
              element.style.setProperty('--bar-color-top', `hsl(${palette.hue.toFixed(1)} 78% 68%)`);
              element.style.setProperty('--bar-color-mid', `hsl(${palette.accent.toFixed(1)} 82% 46%)`);
              element.style.setProperty('--bar-color-bottom', `hsl(${palette.depth.toFixed(1)} 86% 34%)`);
              element.style.setProperty('--bar-glow', `hsla(${palette.hue.toFixed(1)}, 82%, 42%, 0.34)`);
            }
          }}
          className={styles.bar}
          style={{ animationDelay: `${index * -0.08}s` }}
        />
      ))}
    </div>
  );
}
