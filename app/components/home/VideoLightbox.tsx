'use client';

import { useEffect, useRef } from 'react';
import styles from './VideoLightbox.module.css';

type VideoSource = {
  src: string;
  type: string;
};

type VideoLightboxProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  sources: VideoSource[];
  poster?: string;
};

export function VideoLightbox({ open, onClose, title, sources, poster }: VideoLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = () => {
    onClose();
  };

  const handleContentClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
  };

  return (
    <div className={styles.backdrop} role="presentation" onClick={handleBackdropClick}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} video playback expanded view`}
        onClick={handleContentClick}
      >
        <button ref={closeButtonRef} type="button" onClick={onClose} className={styles.closeButton} aria-label="Close video">
          ×
        </button>
        {title && <div className={styles.title}>{title}</div>}
        <video className={styles.video} controls autoPlay playsInline poster={poster}>
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} />
          ))}
        </video>
      </div>
    </div>
  );
}
