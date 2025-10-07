'use client';

import { useCallback, useRef, useState } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import styles from './BrandingStudio.module.css';
import { DexterAnimatedCrest } from '../DexterAnimatedCrest';
import { DexterWordmark } from '../home/DexterWordmark';
import { BRAND_CANVAS } from '../../../lib/branding';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const resetAnimation = (setKey: (updater: (k: number) => number) => void) => {
  setKey((key) => key + 1);
};

const withTransformReset = async (node: HTMLElement, cb: () => Promise<void>) => {
  const mutated: Array<{ element: HTMLElement; transform: string; origin: string }> = [];
  let current: HTMLElement | null = node;
  while (current && current !== document.body) {
    const computed = window.getComputedStyle(current);
    if (computed.transform && computed.transform !== 'none') {
      mutated.push({ element: current, transform: current.style.transform, origin: current.style.transformOrigin });
      current.style.transform = 'none';
      current.style.transformOrigin = 'top left';
    }
    current = current.parentElement;
  }

  try {
    await cb();
  } finally {
    mutated.forEach(({ element, transform, origin }) => {
      element.style.transform = transform;
      element.style.transformOrigin = origin;
    });
  }
};

export function BrandingStudio() {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef<HTMLDivElement | null>(null);

  const [headerKey, setHeaderKey] = useState(0);
  const [tokenKey, setTokenKey] = useState(0);
  const [isRecording, setRecording] = useState(false);

  const exportNode = useCallback(async (node: HTMLElement | null, filename: string, format: 'png' | 'webp' | 'jpeg') => {
    if (!node) return;
    const width = Number(node.getAttribute('data-width')) || node.getBoundingClientRect().width;
    const height = Number(node.getAttribute('data-height')) || node.getBoundingClientRect().height;
    const options = {
      width,
      height,
      pixelRatio: 1,
      canvasWidth: width,
      canvasHeight: height,
    };

    const run = async () => {
      try {
        if (format === 'png') {
          const dataUrl = await toPng(node, options);
          downloadDataUrl(dataUrl, `${filename}.png`);
        } else if (format === 'jpeg') {
          const dataUrl = await toJpeg(node, { ...options, quality: 0.92 });
          downloadDataUrl(dataUrl, `${filename}.jpg`);
        } else {
          const pngDataUrl = await toPng(node, options);
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = pngDataUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Unable to export WEBP');
          ctx.drawImage(img, 0, 0, width, height);
          const webpDataUrl = canvas.toDataURL('image/webp', 0.95);
          downloadDataUrl(webpDataUrl, `${filename}.webp`);
        }
      } catch (error) {
        console.error('Export failed', error);
        alert('Unable to export image. Try in desktop Chrome or disable blockers.');
      }
    };

    await withTransformReset(node, run);
  }, []);

  const handleRecordWebM = useCallback(async () => {
    if (isRecording) return;
    setRecording(true);
    resetAnimation(setHeaderKey);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
        },
        audio: false,
      });

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        downloadBlob(blob, 'dexter-twitter-header.webm');
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };

      recorder.start();

      // allow the user to share the window, then play the animation for 3 seconds
      setTimeout(() => {
        recorder.stop();
      }, 3500);
    } catch (error) {
      console.error('Recording failed', error);
      alert('Screen recording was cancelled or not supported.');
      setRecording(false);
    }
  }, [isRecording]);

  const tokenExport = useCallback(async () => {
    if (!tokenRef.current) return;
    await exportNode(tokenRef.current, 'dexter-token-still', 'png');
  }, [exportNode]);

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Twitter Header · 1500 × 500</h2>
            <p>Classic hero reveal with crest and wordmark. Export PNG/WEBP or capture a short WebM animation.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={() => exportNode(headerRef.current, 'dexter-twitter-header', 'png')}>PNG</button>
            <button onClick={() => exportNode(headerRef.current, 'dexter-twitter-header', 'webp')}>WEBP</button>
            <button disabled={isRecording} onClick={handleRecordWebM}>
              {isRecording ? 'Recording…' : 'Record WebM'}
            </button>
          </div>
        </div>
        <p className={styles.warning}>Tip: For animation capture, select the browser tab in the screen-share picker. Recording auto-stops after 3.5s.</p>
        <span className={styles.previewScaleNote}>Preview scaled for display. Exports render at full 1500×500.</span>
        <div className={styles.previewFrame}>
          <div
            key={headerKey}
            ref={headerRef}
            className={`${styles.canvasWrapper} ${styles.headerCanvas}`}
            data-width={BRAND_CANVAS.twitterHeader.width}
            data-height={BRAND_CANVAS.twitterHeader.height}
            style={{ width: BRAND_CANVAS.twitterHeader.width, height: BRAND_CANVAS.twitterHeader.height }}
          >
            <div className={styles.bannerBackground} />
            <div className={styles.bannerGlow} />
            <div className={styles.bannerContent}>
              <DexterAnimatedCrest size={220} />
              <div className={styles.bannerCopy}>
                <DexterWordmark animate ariaLabel="Dexter banner wordmark" />
                <p>Realtime agents for trading desks, broadcast crews, and command centers.</p>
              </div>
              <span className={styles.bannerCTA}>Launch Sequence ↗</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Twitter Avatar · 400 × 400</h2>
            <p>Centered crest with subtle glow and badge typography.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={() => exportNode(avatarRef.current, 'dexter-avatar', 'png')}>PNG</button>
            <button onClick={() => exportNode(avatarRef.current, 'dexter-avatar', 'webp')}>WEBP</button>
          </div>
        </div>
        <span className={styles.previewScaleNote}>Preview scaled for display. Exports render at full 400×400.</span>
        <div className={styles.previewFrame}>
          <div
            ref={avatarRef}
            className={`${styles.canvasWrapper} ${styles.avatarCanvas}`}
            data-width={BRAND_CANVAS.twitterAvatar.width}
            data-height={BRAND_CANVAS.twitterAvatar.height}
            style={{ width: BRAND_CANVAS.twitterAvatar.width, height: BRAND_CANVAS.twitterAvatar.height }}
          >
            <div className={styles.avatarBackground} />
            <div className={styles.avatarContent}>
              <DexterAnimatedCrest size={220} />
              <p className={styles.avatarTagline}>DEXTER AGENTS</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Token Animation · 600 × 600</h2>
            <p>Pulse and orbit built for token metadata. Export a still or capture animation via screen recording.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={tokenExport}>PNG</button>
            <button onClick={() => exportNode(tokenRef.current, 'dexter-token', 'webp')}>WEBP</button>
            <button onClick={() => resetAnimation(setTokenKey)}>Restart Animation</button>
          </div>
        </div>
        <span className={styles.previewScaleNote}>Animation loops every 4s. For animated WebP, record via the header capture flow.</span>
        <div className={styles.previewFrame}>
          <div
            key={tokenKey}
            ref={tokenRef}
            className={`${styles.canvasWrapper} ${styles.tokenCanvas}`}
            data-width={BRAND_CANVAS.tokenAnimation.width}
            data-height={BRAND_CANVAS.tokenAnimation.height}
            style={{ width: BRAND_CANVAS.tokenAnimation.width, height: BRAND_CANVAS.tokenAnimation.height }}
          >
            <div className={styles.tokenBackground} />
            <div className={styles.tokenContent}>
              <TokenOrbit />
            </div>
          </div>
        </div>
        <p className={styles.tokenCaption}>Dexter Token · Pre-launch</p>
      </section>
    </div>
  );
}

function TokenOrbit() {
  return (
    <div style={{ position: 'relative', width: '80%', height: '80%' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid rgba(255,244,232,0.35)',
          boxShadow: '0 0 60px rgba(32,180,131,0.4)',
          animation: 'token-spin 12s linear infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '18%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,244,232,0.95) 0%, rgba(255,112,76,0.5) 75%, transparent 100%)',
          filter: 'blur(6px)',
          opacity: 0.7,
          animation: 'token-pulse 4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '14%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(209,63,0,0.95), rgba(255,180,44,0.95))',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 20px 60px rgba(12,5,3,0.55)',
        }}
      >
        <DexterAnimatedCrest size={160} />
      </div>
      <style jsx>{`
        @keyframes token-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes token-pulse {
          0%, 100% { transform: scale(1); opacity: 0.65; }
          50% { transform: scale(1.12); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
