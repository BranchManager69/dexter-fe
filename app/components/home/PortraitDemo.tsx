'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './PortraitDemo.module.css';

type Demo = {
  id: string;
  label: string;
  mp4: string;
  webm?: string;
  poster: string;
  placeholder: string;
  points: string[];
};

const DEMOS: Demo[] = [
  {
    id: 'command',
    label: 'Command Flow',
    mp4: '/assets/video/portrait-demo.mp4',
    webm: '/assets/video/portrait-demo.webm',
    poster: '/assets/video/portrait-demo-poster.jpg',
    placeholder: 'Add portrait-demo.mp4/.webm + poster',
    points: [
      'Realtime voice orchestration driving a multi-venue swap.',
      'Dexter narrates fills aloud while Discord + email stay in sync.',
      'Proof packet autopublishes to your compliance workspace.',
    ],
  },
  {
    id: 'handoff',
    label: 'Desk Handoff',
    mp4: '/assets/video/portrait-demo-alt.mp4',
    webm: '/assets/video/portrait-demo-alt.webm',
    poster: '/assets/video/portrait-demo-alt-poster.jpg',
    placeholder: 'Add portrait-demo-alt assets',
    points: [
      'Operator summons Dexter from an iOS lock screen.',
      'Voice confirmation routes the playbook to the trading desk.',
      'Slack + email update the team while compliance receives proof.',
    ],
  },
];

export function PortraitDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  const demo = DEMOS[activeIndex];

  // Reset readiness whenever demo changes
  useEffect(() => {
    setReady(false);
  }, [demo.id]);

  // Auto play/pause when in view
  useEffect(() => {
    const video = videoEl;
    if (!video) return;
    const observer = new IntersectionObserver(
      entries => {
        const isVisible = entries[0]?.isIntersecting;
        if (isVisible) {
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [videoEl, demo.id]);

  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    setVideoEl(node);
  }, []);

  const points = useMemo(() => demo.points, [demo]);

  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <h3>Hands-free to hands-off.</h3>
        <p>
          A single voice command hands the desk to Dexter. Watch the call flow as it jumps from transcription to execution and
          finishes with proof on every channel.
        </p>
        <ul className={styles.list}>
          {points.map(point => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div className={styles.visualGroup}>
        <div className={styles.visual}>
          <video
            key={demo.id}
            ref={handleVideoRef}
            className={ready ? styles.video : styles.hiddenVideo}
            playsInline
            muted
            loop
            preload="metadata"
            poster={demo.poster}
            onCanPlay={() => setReady(true)}
            onError={() => setReady(false)}
          >
            <source src={demo.mp4} type="video/mp4" />
            {demo.webm && <source src={demo.webm} type="video/webm" />}
          </video>
          {!ready && <div className={styles.placeholder}>{demo.placeholder}</div>}
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Portrait demo selector">
          {DEMOS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={`${styles.tab} ${index === activeIndex ? styles.tabActive : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
