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

export function DexterWordmark({ animate = true, className = '', ariaLabel = 'Dexter wordmark', style }: DexterWordmarkProps) {
  const wrapperClass = `${styles.wrapper}${className ? ` ${className}` : ''}`;
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!animate) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const mobile = window.innerWidth <= 720;
      setShouldAnimate(!motionQuery.matches && !mobile);
    };

    update();
    motionQuery.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      motionQuery.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, [animate]);

  const initial = animate && shouldAnimate ? { opacity: 0, y: 32 } : false;
  const sectionTransition = animate && shouldAnimate ? { duration: 0.8, ease: 'easeInOut' as const } : { duration: 0 };

  return (
    <motion.section
      className={wrapperClass}
      initial={initial}
      animate={{ opacity: 1, y: 0 }}
      transition={sectionTransition}
      aria-label={ariaLabel}
      style={style}
    >
      <motion.h1 className={styles.wordmark}>
        {letters.map((letter, index) => {
          const letterTransition =
            animate && shouldAnimate
              ? { duration: index === 0 ? 0.5 : 0.34, delay: letterDelays[index], ease: 'easeOut' as const }
              : { duration: 0 };

          const initialLetter =
            animate && shouldAnimate ? { opacity: 0, y: index === 0 ? -16 : 14, scale: index === 0 ? 1.3 : 1 } : false;

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
