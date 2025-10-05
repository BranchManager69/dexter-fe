import styles from './VideoLoadingOverlay.module.css';

type VideoLoadingOverlayProps = {
  label?: string;
};

export function VideoLoadingOverlay({ label = 'Loading video' }: VideoLoadingOverlayProps) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label={label}>
      <span className={styles.spinner} aria-hidden="true" />
    </div>
  );
}
