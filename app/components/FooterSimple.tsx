"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SITE } from '../../lib/site';
import styles from './FooterSimple.module.css';

function JupiterIcon() {
  return (
    <svg
      className={styles.centerpieceIcon}
      width="24"
      height="24"
      viewBox="0 0 800 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="400" cy="400" r="400" fill="#141726" />
      <defs>
        <linearGradient
          id="jupGradient1"
          x1="574.926"
          y1="134.127"
          x2="248.526"
          y2="657.687"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.16" stopColor="#C6F462" />
          <stop offset="0.89" stopColor="#33D9FF" />
        </linearGradient>
        <linearGradient
          id="jupGradient2"
          x1="572.59"
          y1="132.67"
          x2="246.2"
          y2="656.23"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.16" stopColor="#C6F462" />
          <stop offset="0.89" stopColor="#33D9FF" />
        </linearGradient>
        <linearGradient
          id="jupGradient3"
          x1="577.015"
          y1="135.433"
          x2="250.625"
          y2="658.993"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.16" stopColor="#C6F462" />
          <stop offset="0.89" stopColor="#33D9FF" />
        </linearGradient>
        <linearGradient
          id="jupGradient4"
          x1="569.027"
          y1="130.448"
          x2="242.627"
          y2="654.008"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.16" stopColor="#C6F462" />
          <stop offset="0.89" stopColor="#33D9FF" />
        </linearGradient>
        <linearGradient
          id="jupGradient5"
          x1="571.697"
          y1="132.108"
          x2="245.297"
          y2="655.668"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.16" stopColor="#C6F462" />
          <stop offset="0.89" stopColor="#33D9FF" />
        </linearGradient>
        <linearGradient
          id="jupGradient6"
          x1="579.038"
          y1="136.689"
          x2="252.648"
          y2="660.249"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.16" stopColor="#C6F462" />
          <stop offset="0.89" stopColor="#33D9FF" />
        </linearGradient>
      </defs>
      <path
        d="M536 568.9c-66.8-108.5-166.4-170-289.4-195.6-43.5-9-87.2-8.9-129.4 7.7-28.9 11.4-33.3 23.4-19.7 53.7 92.4-21.9 178.4-1.5 258.9 45 81.1 46.9 141.6 112.2 169.1 205 38.6-11.8 43.6-18.3 34.3-54.2-5.3-18.4-12.2-40.4-23.6-58.9Z"
        fill="url(#jupGradient1)"
      />
      <path
        d="M609.1 480.6c-85.8-125-207.3-194.9-355.8-218.3-39.3-6.2-79.4-4.5-116.2 14.3-17.6 9-33.2 20.5-37.4 44.9 115.8-31.9 219.7-3.7 317.5 53 98.3 57 175.1 133.5 205 251.1 20.8-18.4 24.5-41 19.1-62-7.4-28.8-15.8-59.1-32.2-83Z"
        fill="url(#jupGradient2)"
      />
      <path
        d="M105 488.6c7.3 16.2 12.1 34.5 23 47.6 5.5 6.7 22.2 4.1 33.8 5.7 1.8.2 3.6.5 5.4.7 102.9 15.3 184.1 65.1 242.1 152 3.4 5.1 8.9 12.7 13.4 12.7 17.4-.1 34.9-2.8 52.5-4.5C449 557.5 232.8 438.3 105 488.6Z"
        fill="url(#jupGradient3)"
      />
      <path
        d="M656.6 366.7C599.9 287.4 521.7 234.6 432.9 197c-61.5-26.1-125.2-41.8-192.8-33.7-23.4 2.8-45.3 9.5-63.4 24.7 230.9 5.8 404.6 105.8 524 303.3.2-13.1 2.2-27.7-2.6-39.5-12-29.3-23.4-59.8-41.5-85.1Z"
        fill="url(#jupGradient4)"
      />
      <path
        d="M709.8 325.3c-47-178.9-238-265-379.2-221.4 152.1 30 276.9 102.5 379.2 221.4Z"
        fill="url(#jupGradient5)"
      />
      <path
        d="M155.4 583.9c54.6 69.3 124 109.7 213 122.8-34-63.5-153.8-132.2-213-122.8Z"
        fill="url(#jupGradient6)"
      />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    href: 'https://branch.bet',
    label: 'Branch.bet',
    icon: (
      <svg width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="branchFooterStroke" x1="18" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#40e7af" />
            <stop offset="1" stopColor="#16c98c" />
          </linearGradient>
          <linearGradient id="branchFooterFill" x1="16" y1="16" x2="46" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgba(22, 201, 140, 0.76)" />
            <stop offset="1" stopColor="rgba(255, 255, 255, 0.65)" />
          </linearGradient>
        </defs>
        <path
          d="M20 12h12c10 0 16 5 16 13 0 5.6-3.2 9.7-8.6 11.5C43.4 38 48 42.6 48 49c0 7.8-6.2 13-15.8 13H20"
          stroke="url(#branchFooterStroke)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 12h10c8.4 0 13 3.7 13 10.5 0 5.3-3 8.8-7.8 10.2"
          fill="none"
          stroke="url(#branchFooterFill)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: 'https://github.com/BranchManager69',
    label: 'Dexter on GitHub',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2c5.52 0 10 4.48 10 10 0 4.42-2.87 8.17-6.84 9.5-.5.09-.68-.22-.68-.48 0-.24.01-.87.01-1.7 0-.58-.2-.95-.43-1.14 2.23-.25 4.57-1.1 4.57-4.95 0-1.1-.39-2-.1-2.7 0 0-.84-.27-2.75 1.03-.8-.22-1.64-.33-2.48-.33-.84 0-1.68.11-2.47.33-1.91-1.3-2.75-1.03-2.75-1.03-.55 1.38-.2 2.4-.1 2.7-.61.66-.97 1.51-.97 2.56 0 3.84 2.34 4.7 4.57 4.95-.29.25-.54.73-.63 1.41-.57.26-2 .69-2.88-.83-.19-.31-.75-1.07-1.54-1.05-.85.01-1.37.81-1.37.81-.46.94-.06 1.62.1 1.88.3.46.98.8 1.98.57.02.81.01 1.37.01 1.56 0 .26-.18.58-.68.48C4.87 20.17 2 16.42 2 12 2 6.48 6.48 2 12 2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: 'https://x.com/dexteragents',
    label: 'Dexter on X',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M17.53 3H20L14.47 9.46 21.2 21H15.64L11.54 14.22 6.8 21H4.12l5.91-7.61L2.8 3h5.73l3.71 6.24L17.53 3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    href: 'https://dexter.cash',
    label: 'Dexter home',
    icon: (
      <svg width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="dexterGlyph" x1="18" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#16c98c" />
            <stop offset="1" stopColor="#40e7af" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="27" stroke="url(#dexterGlyph)" strokeWidth="4" opacity="0.8" />
        <path
          d="M22 19h12c8.5 0 14 4.4 14 12 0 7-5.3 12-13.3 12H28.4L42 45.2"
          stroke="url(#dexterGlyph)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function FooterSimple() {
  const [showToast, setShowToast] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleToast = () => {
    setShowToast(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setShowToast(false), 4000);
  };

  const handleToastKey = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToast();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.leftTray}>
        {SOCIAL_LINKS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={styles.iconLink}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
          >
            {item.icon}
          </a>
        ))}
      </div>

      <div className={styles.centerpiece}>
        <span
          role="button"
          tabIndex={0}
          className={styles.centerpieceTrigger}
          onClick={handleToast}
          onKeyDown={handleToastKey}
        >
          <span className="sr-only">Jupiter token status</span>
          <JupiterIcon />
        </span>
        <div
          role="status"
          aria-live="polite"
          className={`${styles.toast} ${showToast ? styles.toastVisible : ''}`.trim()}
        >
          DEXTER token has not launched yet.
        </div>
      </div>

      <nav className={styles.links} aria-label="Footer links">
        {SITE.footerLinks.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
