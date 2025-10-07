import { Orbitron, Russo_One } from 'next/font/google';

export const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const russoOne = Russo_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-russo-one',
  display: 'swap',
});
