'use client';

import { CSSProperties, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './DexterWordmark.module.css';

type DexterWordmarkProps = {
  animate?: boolean;
  className?: string;
  ariaLabel?: string;
  style?: CSSProperties;
};

const letters = ['D', 'E', 'X', 'T', 'E', 'R'];
const letterDelays = [0.05, 0.18, 0.26, 0.34, 0.42, 0.5];

const fallbackDelay = (index: number) => index * 0.04;

export function DexterWordmark({ animate = true, className = '', ariaLabel = 'Dexter wordmark', style }: DexterWordmarkProps) {
  const wrapperClass = `${styles.wrapper}${className ? ` ${className}` : ''}`;
  const [animationMode, setAnimationMode] = useState<'full' | 'partial' | 'none'>('none');

  useEffect(() => {
    if (!animate) {
      setAnimationMode('none');
      return;
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const mobile = window.innerWidth <= 720;
      if (motionQuery.matches) {
        setAnimationMode('none');
      } else if (mobile) {
        setAnimationMode('partial');
      } else {
        setAnimationMode('full');
      }
    };

    update();
    motionQuery.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      motionQuery.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, [animate]);

  const sectionTransition =
    animationMode === 'full'
      ? { duration: 0.75, ease: [0.19, 1.0, 0.22, 1.0] as const }
      : animationMode === 'partial'
        ? { duration: 0.65, ease: [0.25, 0.9, 0.3, 1.0] as const }
        : { duration: 0 };

  return (
    <motion.section
      className={wrapperClass}
      initial={animationMode === 'none' ? false : { opacity: 0, y: animationMode === 'full' ? 28 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={sectionTransition}
      aria-label={ariaLabel}
      style={style}
    >
      <motion.h1 className={styles.wordmark}>
        {letters.map((letter, index) => {
          let initialLetter;
          let letterTransition;

          if (animationMode === 'full') {
            initialLetter = { opacity: 0, y: index === 0 ? -18 : 14, scale: index === 0 ? 1.32 : 1 }; 
            letterTransition = { duration: index === 0 ? 0.42 : 0.3, delay: letterDelays[index], ease: 'easeOut' as const };
          } else if (animationMode === 'partial') {
            initialLetter = { opacity: 0, y: 12, scale: 1.08 };
            letterTransition = { duration: 0.28, delay: fallbackDelay(index), ease: 'easeOut' as const };
          } else {
            initialLetter = false;
            letterTransition = { duration: 0 };
          }

          return (
            <motion.span
              key={letter + index}
              className={`${styles.letter} ${index === 0 ? styles.leadLetter : styles.tailLetter}`}
              initial={initialLetter}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={letterTransition}
            >
              {letter}
            </motion.span>
          );
        })}
      </motion.h1>
    </motion.section>
  );
}
