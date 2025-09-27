'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './LiveConversation.module.css';

type Speaker = 'user' | 'dexter';

type ConversationMessage = {
  speaker: Speaker;
  label?: string;
  text: string;
};

type ConversationScript = {
  id: string;
  messages: ConversationMessage[];
};

const speakerLabels: Record<Speaker, string> = {
  user: 'You',
  dexter: 'Dexter',
};

const conversations: ConversationScript[] = [
  {
    id: 'pump-fun',
    messages: [
      {
        speaker: 'user',
        text: 'Let\'s put 1 SOL on a wild Pump.fun live stream.',
      },
      {
        speaker: 'dexter',
        text: 'RANSEM is heating up — 69 viewers, a dev waving a small dog at the Vegas Sphere, market cap at $250K.',
      },
      {
        speaker: 'user',
        text: 'Do it with half my $WIN bag. I forget what it\'s called, just make it happen.',
      },
      {
        speaker: 'dexter',
        text: 'Swapped 1.25M $WIN for $RANSEM, logged the receipt, and the dog looks relieved.',
      },
    ],
  },
];

export function LiveConversation() {
  const [activeConversationIndex, setActiveConversationIndex] = useState(0);
  const [rotationCycle, setRotationCycle] = useState(0);

  const totalConversations = conversations.length;

  const activeConversation = useMemo(
    () => conversations[activeConversationIndex] ?? conversations[0],
    [activeConversationIndex],
  );

  useEffect(() => {
    if (totalConversations <= 1) {
      return undefined;
    }

    const rotationInterval = window.setInterval(() => {
      setActiveConversationIndex((prev) => {
        const nextIndex = (prev + 1) % totalConversations;

        if (nextIndex === 0) {
          setRotationCycle((cycle) => cycle + 1);
        }

        return nextIndex;
      });
    }, 12000);

    return () => window.clearInterval(rotationInterval);
  }, [totalConversations]);

  const feedKey = `${activeConversation.id}-${rotationCycle}-${activeConversationIndex}`;

  return (
    <section className={`section ${styles.wrapper}`}>
      <div className={styles.intro}>
        <span className="eyebrow">Hear it in action</span>
        <h2>Voice trading, live.</h2>
      </div>
      <div key={feedKey} className={styles.feed}>
        {activeConversation.messages.map((message, index) => {
          const speakerLabel = message.label ?? speakerLabels[message.speaker];
          const alignmentClass = message.speaker === 'user' ? styles.right : styles.left;
          const toneClass = message.speaker === 'user' ? styles.user : styles.dexter;
          const animationDelay = `${index * 0.35}s`;

          return (
            <article
              key={`${activeConversation.id}-${index}`}
              className={`${styles.bubble} ${toneClass} ${alignmentClass}`}
              style={{ animationDelay }}
            >
              <header>
                <span>{speakerLabel}</span>
              </header>
              <p>{message.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
