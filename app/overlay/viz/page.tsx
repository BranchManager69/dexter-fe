import { OverlayBodyClass } from '../live/OverlayBodyClass';
import { DexterWordmark } from '../../components/home/DexterWordmark';
import { DexterMintBadge } from '../../components/home/DexterMintBadge';
import { AudioVizClient } from './AudioVizClient';
import styles from './viz.module.css';

export const dynamic = 'force-dynamic';

export default function AudioVizOverlayPage() {
  return (
    <div className={styles.stage}>
      <OverlayBodyClass />
      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.wordmark}>
            <DexterWordmark animate={false} ariaLabel="Dexter wordmark" />
          </div>
          <DexterMintBadge />
        </header>

        <AudioVizClient />

        <footer className={styles.footer}>
          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>Now Streaming</span>
            <span className={styles.footerValue}>dexter.cash</span>
          </div>
          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>Set</span>
            <span className={styles.footerValue}>Launch Night Bangers</span>
          </div>
          <div className={styles.footerColumn}>
            <span className={styles.footerLabel}>Energy</span>
            <span className={styles.footerValue}>Maximal</span>
          </div>
        </footer>
      </div>
      <div className={styles.glowOverlay} aria-hidden />
    </div>
  );
}
