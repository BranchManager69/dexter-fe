import { fetchOverlayData } from '../../../lib/overlay/pumpstreams';
import { OverlayClient } from './OverlayClient';
import { OverlayBodyClass } from './OverlayBodyClass';
import styles from './overlay.module.css';

export const dynamic = 'force-dynamic';

export default async function OverlayLivePage() {
  const initialData = await fetchOverlayData().catch(() => null);
  return (
    <div className={styles.overlayLayout}>
      <OverlayBodyClass />
      <OverlayClient initialData={initialData} refreshIntervalMs={15_000} />
    </div>
  );
}
