'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './PortraitDemo.module.css';

const POINTS = [
  'Realtime voice orchestration driving a multi-venue swap.',
  'Dexter narrates fills aloud while Discord + email stay in sync.',
  'Proof packet autopublishes to your compliance workspace.'
];

export function PortraitDemo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
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
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <h3>Hands-free to hands-off.</h3>
        <p>
          A single voice command hands the desk to Dexter. Watch the call flow as it jumps from transcription to execution and
          finishes with proof on every channel.
        </p>
        <ul className={styles.list}>
          {POINTS.map(point => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
      <div className={styles.frame}>
        <div className={styles.phone}>
          <video
            ref={videoRef}
            className={ready ? styles.video : styles.hiddenVideo}
            playsInline
            muted
            loop
            preload="metadata"
            poster="/assets/video/portrait-demo-poster.jpg"
            onCanPlay={() => setReady(true)}
            onError={() => setReady(false)}
          >
            <source src="/assets/video/portrait-demo.mp4" type="video/mp4" />
            <source src="/assets/video/portrait-demo.webm" type="video/webm" />
          </video>
          {!ready && <div className={styles.placeholder}>Add portrait-demo assets</div>}
        </div>
      </div>
    </section>
  );
}
