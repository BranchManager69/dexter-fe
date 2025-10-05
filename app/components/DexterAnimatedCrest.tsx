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
  const innerSize = `${Math.round(size * 0.71)}px`;

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className ?? ""}`.trim()}
      style={{ width: containerSize, height: containerSize }}
      initial={{ scale: 0.98 }}
      animate={{ scale: [0.99, 1.04, 0.99] }}
      transition={{ duration: BREATH_DURATION * 0.8, repeat: Infinity, ease: [0.6, 0, 0.4, 1] }}
    >
      <motion.span
        className="pointer-events-none absolute inset-[-10px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(254,251,244,0.32) 0%, rgba(242,62,1,0) 72%)",
        }}
        animate={{ opacity: [0.42, 0.12, 0.32], scale: [0.9, 1.35, 1.65] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />

      <motion.span
        className="pointer-events-none absolute inset-0 rounded-full border border-[#FEFBF4]/30"
        animate={{ opacity: [0.4, 0.6, 0.45] }}
        transition={{ duration: BREATH_DURATION, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.span
        className="pointer-events-none absolute inset-[6%] rounded-full"
        style={{
          background: "conic-gradient(from 0deg, rgba(254,251,244,0.0) 0deg, rgba(254,251,244,0.35) 120deg, rgba(254,251,244,0.0) 240deg)",
        }}
        animate={{ rotate: 360, opacity: 0.3 }}
        transition={{ rotate: { duration: 4, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.35 } }}
      />

      <motion.div
        className="relative flex items-center justify-center rounded-full shadow-[inset_0_0_10px_rgba(24,5,0,0.25)]"
        style={{
          width: innerSize,
          height: innerSize,
          background: "radial-gradient(circle at 30% 30%, #FEFBF4 6%, #F26B1A 52%, #F23E01 100%)",
        }}
        animate={{ scale: [0.995, 1.02, 0.995] }}
        transition={{ duration: BREATH_DURATION * 0.85, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
      >
        <motion.div
          className="flex items-center justify-center"
          animate={{
            filter: [
              "drop-shadow(0 0 0px rgba(254,251,244,0))",
              "drop-shadow(0 0 10px rgba(254,251,244,0.3))",
              "drop-shadow(0 0 0px rgba(254,251,244,0))",
            ],
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: BREATH_DURATION, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
        >
          <Image
            src="/assets/logos/logo_orange_round.svg"
            alt="Dexter"
            role="presentation"
            width={Math.round(size * 0.87)}
            height={Math.round(size * 0.87)}
            priority
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default DexterAnimatedCrest;
