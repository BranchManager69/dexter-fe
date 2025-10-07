'use client';

import { motion } from 'framer-motion';
import styles from './DexterWordmark.module.css';
import { DexterAnimatedCrest } from '../DexterAnimatedCrest';

const letterDelays = [0.18, 0.26, 0.32, 0.38, 0.44];

export function DexterWordmark() {
  const letters = ['E', 'X', 'T', 'E', 'R'];

  return (
    <motion.section
      className={styles.wrapper}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.19, 1.0, 0.22, 1.0] }}
      aria-label="Dexter wordmark"
    >
      <div className={styles.inner}>
        <motion.span
          className={styles.crest}
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1.0, 0.22, 1.0] }}
        >
          <DexterAnimatedCrest size={84} />
        </motion.span>

        <motion.h1 className={styles.wordmark}>
          <motion.span
            className={styles.leadLetter}
            initial={{ opacity: 0, scale: 1.4, y: -18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.19, 1.0, 0.22, 1.0] }}
          >
            D
          </motion.span>
          {letters.map((letter, index) => (
            <motion.span
              key={letter + index}
              className={styles.tailLetter}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: letterDelays[index], ease: [0.19, 1.0, 0.22, 1.0] }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>
      </div>
    </motion.section>
  );
}
