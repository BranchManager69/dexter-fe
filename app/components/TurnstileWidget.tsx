'use client';

import { useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

export type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  action?: string;
  cData?: string;
  className?: string;
};

export function TurnstileWidget({ siteKey, onToken, action, cData, className }: TurnstileWidgetProps) {
  useEffect(() => {
    if (!siteKey) {
      onToken(null);
    }
  }, [siteKey, onToken]);

  if (!siteKey) return null;

  return (
    <Turnstile
      key={siteKey}
      options={{ action, cData }}
      siteKey={siteKey}
      className={className}
      onSuccess={(token) => onToken(token)}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
    />
  );
}
