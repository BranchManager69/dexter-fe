import { fetchOverlayData } from '../../../lib/overlay/pumpstreams';
import { OverlayClient } from './OverlayClient';
import { OverlayBodyClass } from './OverlayBodyClass';
import styles from './overlay.module.css';

export const dynamic = 'force-dynamic';

type OverlaySearchParams = { [key: string]: string | string[] | undefined };

function resolveLayoutVariant(searchParams?: OverlaySearchParams): 'balanced' | 'compact' {
  const raw = typeof searchParams?.layout === 'string' ? searchParams.layout.toLowerCase() : '';
  return raw === 'compact' ? 'compact' : 'balanced';
}

export default async function OverlayLivePage({
  searchParams,
}: {
  searchParams?: Promise<OverlaySearchParams>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialData = await fetchOverlayData().catch(() => null);
  const layoutVariant = resolveLayoutVariant(resolvedParams);
  const layoutClass =
    layoutVariant === 'compact' ? styles.overlayLayoutCompact : styles.overlayLayoutBalanced;

  return (
    <div className={`${styles.overlayLayout} ${layoutClass}`}>
      <OverlayBodyClass />
      <OverlayClient
        initialData={initialData}
        refreshIntervalMs={15_000}
        layoutVariant={layoutVariant}
      />
    </div>
  );
}
