'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './ScrollDemo.module.css';
import { VideoLightbox } from './VideoLightbox';
import { VideoLoadingOverlay } from './VideoLoadingOverlay';

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

export function CommandScrollDemo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationRef = useRef<number>(1);
  const rafRef = useRef<number | null>(null);
  const [isVideoReady, setVideoReady] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    videoRef.current?.load();
  }, []);

  const onLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    durationRef.current = video.duration || 1;
    setVideoReady(true);
    setActiveStep(0);
    video.play().catch(() => undefined);
  };
  const onVideoError = () => {
    setVideoReady(false);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isLightboxOpen) {
      video.pause();
      return;
    }

    if (isVideoReady) {
      video.play().catch(() => undefined);
    }
  }, [isLightboxOpen, isVideoReady]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateStep = () => {
      if (!video || isLightboxOpen) return;
      const duration = durationRef.current || video.duration || 1;
      if (!duration) return;
      const cycle = STEPS.length * 5;
      const position = video.currentTime % cycle;
      const stepIndex = Math.min(
        STEPS.length - 1,
        Math.floor(position / 5)
      );
      setActiveStep(prev => (prev === stepIndex ? prev : stepIndex));
      rafRef.current = requestAnimationFrame(updateStep);
    };

    const stopTimer = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const startTracking = () => {
      if (rafRef.current === null && !isLightboxOpen) {
        rafRef.current = requestAnimationFrame(updateStep);
      }
    };

    const observer = new IntersectionObserver(
      entries => {
        const isVisible = entries[0]?.isIntersecting;
        if (isVisible && !isLightboxOpen) {
          video.play().catch(() => undefined);
          startTracking();
        } else {
          video.pause();
          stopTimer();
        }
      },
      { threshold: 0.35 }
    );
    const handlePlay = () => {
      startTracking();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', stopTimer);
    observer.observe(video);
    if (!video.paused && !isLightboxOpen) {
      startTracking();
    }

    return () => {
      stopTimer();
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', stopTimer);
      observer.disconnect();
    };
  }, [isVideoReady, isLightboxOpen]);

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

  const handleExpand = () => {
    if (!isVideoReady) return;
    setLightboxOpen(true);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && isVideoReady) {
      event.preventDefault();
      setLightboxOpen(true);
    }
  };

  return (
    <section className={styles.section}>
      <div
        className={styles.frame}
        role="button"
        tabIndex={0}
        aria-label="Expand command demo video"
        onClick={handleExpand}
        onKeyDown={handleKeyDown}
        data-interactive
      >
        <video
          ref={videoRef}
          className={isVideoReady ? styles.video : styles.videoHidden}
          playsInline
          muted
          loop
          preload="auto"
          poster="/assets/video/command-demo-poster.jpg"
          onLoadedMetadata={onLoadedMetadata}
          onError={onVideoError}
        >
          <source src="/assets/video/command-demo.mp4" type="video/mp4" />
          <source src="/assets/video/command-demo.webm" type="video/webm" />
        </video>
        {!isVideoReady && <VideoLoadingOverlay label="Command demo loading" />}
      </div>
      <div className={styles.copy}>
        <h2>Watch a trade execute in real time.</h2>
        <p>
          The full command runs end-to-end—Dexter hears the instruction, routes the work across desks, and returns proof without
          the dashboards.
        </p>
        <div className={styles.steps}>{stepElements}</div>
      </div>
      <VideoLightbox
        open={isLightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title="Dexter command demo"
        poster="/assets/video/command-demo-poster.jpg"
        sources={[
          { src: '/assets/video/command-demo.mp4', type: 'video/mp4' },
          { src: '/assets/video/command-demo.webm', type: 'video/webm' },
        ]}
      />
    </section>
  );
}
