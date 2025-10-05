'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './PortraitDemo.module.css';
import { VideoLightbox } from './VideoLightbox';
import { VideoLoadingOverlay } from './VideoLoadingOverlay';

type DemoPoint = {
  title: string;
  body: string;
};

type Demo = {
  id: string;
  label: string;
  mp4: string;
  webm?: string;
  poster: string;
  placeholder: string;
  points: DemoPoint[];
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
      {
        title: 'Route orders right inside ChatGPT',
        body: 'Voice relay hands Dexter the instructions without leaving the GPT thread.',
      },
      {
        title: 'Stay focused while Dexter talks fills',
        body: 'You stay in the conversation while Dexter narrates every execution in real time.',
      },
      {
        title: 'Compliance packet shows up instantly',
        body: 'Transcript, receipts, and approvals file themselves the moment the trade lands.',
      },
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
      {
        title: 'Claude drafts, Dexter confirms',
        body: 'Claude tees up the execution plan while Dexter reads back size, venue, and guardrails aloud.',
      },
      {
        title: 'Updates hit every channel',
        body: 'Slack, email, and the blotter light up the moment the swap completes.',
      },
      {
        title: 'Return to research with proof attached',
        body: 'Claude stays in flow while Dexter drops the transcript, fills, and receipts back into the chat.',
      },
    ],
  },
];

export function PortraitDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const demo = DEMOS[activeIndex];

  // Reset readiness whenever demo changes
  useEffect(() => {
    setReady(false);
    setLightboxOpen(false);
    setHighlightIndex(0);
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

  useEffect(() => {
    if (points.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % points.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [points.length]);

  const orderedPoints = useMemo(() => {
    const total = points.length;
    return points.map((point, slot) => {
      const pointIndex = (slot + highlightIndex) % total;
      const source = points[pointIndex];
      return {
        ...source,
        slot,
        key: `${source.title}-${pointIndex}`,
      };
    });
  }, [points, highlightIndex]);

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
          {orderedPoints.map(point => (
            <li key={point.key} data-slot={point.slot}>
              <span className={styles.listTitle}>{point.title}</span>
              <p>{point.body}</p>
            </li>
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
