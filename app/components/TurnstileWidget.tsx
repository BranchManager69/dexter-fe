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
};

export function TurnstileWidget({ siteKey, onToken, action, cData, className, refreshKey }: TurnstileWidgetProps) {
  useEffect(() => {
    if (!siteKey) {
      onToken(null);
    }
  }, [siteKey, onToken]);

  if (!siteKey) return null;

  return (
    <Turnstile
      key={`${siteKey}:${refreshKey ?? 0}`}
      options={{ action, cData, theme: 'dark' }}
      siteKey={siteKey}
      className={className}
      onSuccess={(token) => onToken(token)}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
    />
  );
}
