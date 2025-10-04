'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ScrollDemo.module.css';

const STEPS = [
  {
    title: 'Voice intent captured',
    body: 'Operator speaks a single directive. Dexter transcripts, tags assets, and confirms the plan.'
  },
  {
    title: 'Execution in motion',
    body: 'Routes across connected venues, reports fills aloud, and keeps every side-channel in sync.'
  },
  {
    title: 'Receipts delivered',
    body: 'Trade packet, compliance log, and notifications dispatch instantly to your workspace.'
  }
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function CommandScrollDemo() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const boundsRef = useRef({ start: 0, end: 1, height: 1 });
  const durationRef = useRef<number>(1);
  const [activeStep, setActiveStep] = useState(0);

  const updateBounds = () => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const start = scrollTop + rect.top - window.innerHeight * 0.25;
    const height = rect.height + window.innerHeight * 0.5;
    boundsRef.current = {
      start,
      end: start + height,
      height
    };
  };

  useEffect(() => {
    updateBounds();
    window.addEventListener('resize', updateBounds, { passive: true });
    return () => {
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  const handleFrame = () => {
    const { start, end } = boundsRef.current;
    const scrollY = window.scrollY || window.pageYOffset;
    const progress = clamp((scrollY - start) / (end - start), 0, 1);
    const video = videoRef.current;
    if (video && durationRef.current > 0) {
      const targetTime = durationRef.current * progress;
      if (Math.abs(video.currentTime - targetTime) > 0.05) {
        video.currentTime = targetTime;
      }
    }
    const stepIndex = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
    setActiveStep(stepIndex);
    rafRef.current = requestAnimationFrame(handleFrame);
  };

  useEffect(() => {
    rafRef.current = requestAnimationFrame(handleFrame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onLoadedMetadata = () => {
    if (videoRef.current?.duration) {
      durationRef.current = videoRef.current.duration;
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const stepElements = useMemo(() => (
    STEPS.map((step, index) => (
      <div
        key={step.title}
        className={`${styles.step} ${index === activeStep ? styles.stepActive : ''}`}
      >
        <span className={styles.stepNumber}>0{index + 1}</span>
        <div className={styles.stepCopy}>
          <strong>{step.title}</strong>
          <span>{step.body}</span>
        </div>
      </div>
    ))
  ), [activeStep]);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.frame}>
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          muted
          preload="metadata"
          poster="/assets/video/command-demo-poster.jpg"
          onLoadedMetadata={onLoadedMetadata}
        >
          <source src="/assets/video/command-demo.mp4" type="video/mp4" />
          <source src="/assets/video/command-demo.webm" type="video/webm" />
        </video>
      </div>
      <div className={styles.copy}>
        <h2>See a trade execute as you scroll.</h2>
        <p>
          Scroll to scrub through a live command—Dexter hears the instruction, spins up execution across desks, and hands back
          proof without clicking into dashboards.
        </p>
        <div className={styles.steps}>{stepElements}</div>
      </div>
    </section>
  );
}
