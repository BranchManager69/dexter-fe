'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, any>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoadingPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${TURNSTILE_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Turnstile script.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile script.'));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  action?: string;
  cData?: string;
  className?: string;
};

export function TurnstileWidget({ siteKey, onToken, action, cData, className }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!siteKey) {
      onToken(null);
      return () => {
        isMounted = false;
      };
    }

    loadTurnstileScript()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            if (isMounted) onToken(token);
          },
          'expired-callback': () => {
            if (isMounted) onToken(null);
          },
          'error-callback': () => {
            if (isMounted) onToken(null);
          },
          action,
          cData,
        });
      })
      .catch(() => {
        if (isMounted) onToken(null);
      });

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    };
  }, [siteKey, action, cData, onToken]);

  return <div className={className} ref={containerRef} />;
}
