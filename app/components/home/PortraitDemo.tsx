'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './PortraitDemo.module.css';
import { VideoLightbox } from './VideoLightbox';
import { VideoLoadingOverlay } from './VideoLoadingOverlay';

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
    id: 'chatgpt',
    label: 'ChatGPT',
    mp4: '/assets/video/portrait-demo.mp4',
    webm: '/assets/video/portrait-demo.webm',
    poster: '/assets/video/portrait-demo-poster.jpg',
    placeholder: 'Add ChatGPT portrait demo assets',
    points: [
      'Voice relay instructs Dexter to route orders directly from ChatGPT.',
      'User switches back to GPT while Dexter narrates fills in real time.',
      'Transcript, receipts, and compliance packet sync automatically.',
    ],
  },
  {
    id: 'claude',
    label: 'Claude',
    mp4: '/assets/video/portrait-demo-alt.mp4',
    webm: '/assets/video/portrait-demo-alt.webm',
    poster: '/assets/video/portrait-demo-alt-poster.jpg',
    placeholder: 'Add Claude portrait demo assets',
    points: [
      'Claude briefs the execution plan; Dexter confirms parameters aloud.',
      'Swap executes while Slack + email updates trail instantly.',
      'Voice wrap-up leaves the analyst back in Claude with receipts attached.',
    ],
  },
];

export function PortraitDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  const demo = DEMOS[activeIndex];

  // Reset readiness whenever demo changes
  useEffect(() => {
    setReady(false);
    setLightboxOpen(false);
    if (videoEl) {
      videoEl.load();
    }
  }, [demo.id, videoEl]);

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

  useEffect(() => {
    if (!videoEl) {
      return;
    }

    if (isLightboxOpen) {
      videoEl.pause();
      return;
    }

    if (ready) {
      videoEl.play().catch(() => undefined);
    }
  }, [isLightboxOpen, ready, videoEl]);

  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    if (!node) {
      setVideoEl(null);
      return;
    }
    setVideoEl(node);
    node.load();
  }, []);

  const points = useMemo(() => demo.points, [demo]);

  const handleExpand = () => {
    if (!ready) {
      return;
    }
    setLightboxOpen(true);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = event => {
    if ((event.key === 'Enter' || event.key === ' ') && ready) {
      event.preventDefault();
      setLightboxOpen(true);
    }
  };

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
        <div
          className={styles.visual}
          role="button"
          tabIndex={0}
          aria-label={`Expand ${demo.label} demo`}
          onClick={handleExpand}
          onKeyDown={handleKeyDown}
          data-interactive
        >
          <video
            key={demo.id}
            ref={handleVideoRef}
            className={ready ? styles.video : styles.hiddenVideo}
            playsInline
            muted
            loop
            preload="auto"
            poster={demo.poster}
            onLoadedMetadata={() => setReady(true)}
            onError={() => setReady(false)}
          >
            <source src={demo.mp4} type="video/mp4" />
            {demo.webm && <source src={demo.webm} type="video/webm" />}
          </video>
          {!ready && <VideoLoadingOverlay label={`${demo.label} demo loading`} />}
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
      <VideoLightbox
        open={isLightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={`${demo.label} portrait demo`}
        poster={demo.poster}
        sources={[
          { src: demo.mp4, type: 'video/mp4' },
          ...(demo.webm ? [{ src: demo.webm, type: 'video/webm' }] : []),
        ]}
      />
    </section>
  );
}
