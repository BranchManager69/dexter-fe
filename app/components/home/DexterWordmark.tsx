'use client';

import { CSSProperties } from 'react';
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
  return (
    <motion.section
      className={wrapperClass}
      initial={animate ? { opacity: 0, y: 32 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={animate ? { duration: 0.8, ease: [0.19, 1.0, 0.22, 1.0] } : { duration: 0 }}
      aria-label={ariaLabel}
      style={style}
    >
      <motion.h1 className={styles.wordmark}>
        {letters.map((letter, index) => (
          <motion.span
            key={letter + index}
            className={`${styles.letter} ${index === 0 ? styles.leadLetter : styles.tailLetter}`}
            initial={animate ? { opacity: 0, y: index === 0 ? -16 : 14, scale: index === 0 ? 1.3 : 1 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={animate ? { duration: index === 0 ? 0.5 : 0.34, delay: letterDelays[index], ease: [0.19, 1.0, 0.22, 1.0] } : { duration: 0 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h1>
    </motion.section>
  );
}
