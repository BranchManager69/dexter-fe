"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const BREATH_DURATION = 5.2;

type DexterAnimatedCrestProps = {
  size?: number;
  className?: string;
};

export function DexterAnimatedCrest({ size = 64, className }: DexterAnimatedCrestProps) {
  const containerSize = `${size}px`;
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className ?? ""}`.trim()}
      style={{ width: containerSize, height: containerSize }}
      initial={{ scale: 0.99 }}
      animate={{ scale: [0.99, 1.02, 0.99] }}
      transition={{ duration: BREATH_DURATION, repeat: Infinity, ease: [0.6, 0, 0.4, 1] }}
    >
      <Image
        src="/assets/logos/logo.svg"
        alt="Dexter"
        role="presentation"
        width={Math.round(size * 0.87)}
        height={Math.round(size * 0.87)}
        priority
      />
    </motion.div>
  );
}

export default DexterAnimatedCrest;
