'use client';

import { useEffect } from 'react';

export function OverlayBodyClass() {
  useEffect(() => {
    const className = 'overlay-mode';
    document.body.classList.add(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, []);

  return null;
}

