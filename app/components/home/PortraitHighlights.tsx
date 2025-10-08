'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './PortraitHighlights.module.css';

type RoadmapItem = {
  order: number;
  title: string;
  body: string;
};

const RAW_ROADMAP_ITEMS = [
  {
    title: 'More venues, more chains',
    body: 'Expand swaps beyond Solana so voice commands cover Ethereum, Base, and the desks you already run.'
  },
  {
    title: 'Saved voice macros',
    body: 'Bookmark common playbooks—Dexter will replay the confirmation and execution exactly how you scripted it.'
  },
  {
    title: 'Alert-driven callouts',
    body: 'Set price or volume triggers and let Dexter ping you with a ready-to-run command when they fire.'
  },
  {
    title: 'Portfolio rebalancing',
    body: 'Schedule recurring adjustments so Dexter keeps allocations on target without manual babysitting.'
  },
  {
    title: 'Session search and recall',
    body: 'Full-text search across transcripts, fills, and annotations to answer “what did we say last time?” instantly.'
  },
  {
    title: 'Team handoffs',
    body: 'Share live sessions, route approvals, and let a teammate pick up the mic with the same context.'
  },
  {
    title: 'Compliance workspace',
    body: 'Centralise signed transcripts, receipts, and guardrail settings for auditors and ops leads.'
  },
  {
    title: 'Developer console',
    body: 'Self-serve keys, testing sandboxes, and docs so partners can wire Dexter tools into their own products.'
  },
  {
    title: 'Native mobile',
    body: 'Bring the realtime voice console to iOS and Android with the same sub-second execution loop.'
  },
  {
    title: 'Live performance board',
    body: 'Surface P&L, risk, and liquidity analytics alongside every session without leaving the console.'
  },
];

const ROADMAP_ITEMS: RoadmapItem[] = RAW_ROADMAP_ITEMS.map((item, index) => ({
  ...item,
  order: index,
}));

const STACK_VISIBLE = 3;
const ROTATE_INTERVALS = [3200, 4300];

export function PortraitHighlights() {
  const columns = useMemo(() => {
    const midpoint = Math.ceil(ROADMAP_ITEMS.length / 2);
    return [ROADMAP_ITEMS.slice(0, midpoint), ROADMAP_ITEMS.slice(midpoint)];
  }, []);

  const [activeIndexes, setActiveIndexes] = useState(() => columns.map(() => 0));

  useEffect(() => {
    const timers = columns.map((items, columnIndex) => {
      if (items.length <= 1) return null;
      const interval = window.setInterval(() => {
        setActiveIndexes(prev => {
          const next = [...prev];
          next[columnIndex] = (next[columnIndex] + 1) % items.length;
          return next;
        });
      }, ROTATE_INTERVALS[columnIndex % ROTATE_INTERVALS.length]);
      return interval;
    });

    return () => {
      timers.forEach(timer => {
        if (timer) window.clearInterval(timer);
      });
    };
  }, [columns]);

  const stacks = useMemo(() =>
    columns.map((items, columnIndex) => {
      if (!items.length) return [];
      const visible = Math.min(STACK_VISIBLE, items.length);
      return new Array(visible).fill(null).map((_, slot) => {
        const itemIndex = (activeIndexes[columnIndex] + slot) % items.length;
        const item = items[itemIndex];
        return {
          ...item,
          slot,
          key: `${columnIndex}-${item.order}`,
        };
      });
    }),
  [columns, activeIndexes]);

  return (
    <section className={styles.section} aria-label="Dexter roadmap">
      <div className={styles.intro}>
        <span className="eyebrow">The future of Dexter</span>
        <h3>Where we&apos;re headed next.</h3>
        <p>
          We ship fast, but the roadmap is even faster. Tell us which unlock you want first and we&apos;ll hand you early access.
        </p>
      </div>
      <div className={styles.columns}>
        {stacks.map((stack, columnIndex) => (
          <div key={`column-${columnIndex}`} className={styles.column} data-column={columnIndex}>
            <div className={styles.stack}>
              {stack.map(card => (
                <article
                  key={card.key}
                  className={styles.card}
                  data-slot={card.slot}
                  data-column={columnIndex}
                >
                  <span className={styles.index}>{String(card.order + 1).padStart(2, '0')}</span>
                  <h4>{card.title}</h4>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
