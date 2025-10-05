'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './PortraitDemo.module.css';
import { VideoLightbox } from './VideoLightbox';
import { VideoLoadingOverlay } from './VideoLoadingOverlay';

export type DemoPoint = {
  title: string;
  body: string;
};

export type Demo = {
  id: string;
  label: string;
  mp4: string;
  webm?: string;
  poster: string;
  placeholder: string;
  points: DemoPoint[];
};

type PortraitDemoProps = {
  demos: Demo[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function PortraitDemo({ demos, activeIndex, onSelect }: PortraitDemoProps) {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  const demo = demos[activeIndex];

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
          {demos.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={`${styles.tab} ${index === activeIndex ? styles.tabActive : ''}`}
              onClick={() => onSelect(index)}
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
