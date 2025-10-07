import localFont from 'next/font/local';

export const satoshi = localFont({
  src: [
    {
      path: './files/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './files/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-satoshi',
});
