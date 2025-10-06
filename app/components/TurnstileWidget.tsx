'use client';

import { useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

export type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  action?: string;
  cData?: string;
  className?: string;
  refreshKey?: number;
  theme?: 'light' | 'dark' | 'auto';
  appearance?: 'always' | 'execute' | 'interaction-only';
  onWidgetLoad?: (widgetId: string) => void;
};

export function TurnstileWidget({
  siteKey,
  onToken,
  action,
  cData,
  className,
  refreshKey,
  theme = 'dark',
  appearance = 'always',
  onWidgetLoad,
}: TurnstileWidgetProps) {
  useEffect(() => {
    if (!siteKey) {
      onToken(null);
    }
  }, [siteKey, onToken]);

  if (!siteKey) return null;

  return (
    <Turnstile
      key={`${siteKey}:${refreshKey ?? 0}`}
      options={{ action, cData, theme, appearance }}
      siteKey={siteKey}
      className={className}
      onWidgetLoad={onWidgetLoad}
      onSuccess={(token) => onToken(token)}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
    />
  );
}
