import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from './auth-context';
import { Header } from './header';
import { Footer } from './footer';
import { FlexFill } from './components/FlexFill';
import { BreakingNewsBanner } from './components/BreakingNewsBanner';
import { activeThemeVariables, sunrisePalette } from '../lib/theme/palette';
import { orbitron, russoOne } from './fonts';
import { satoshi } from './fonts/satoshi';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http')
  ? process.env.NEXT_PUBLIC_SITE_URL
  : 'https://beta.dexter.cash';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Dexter • Crypto agent that talks back',
  description: 'Dexter brings realtime voice, multi-agent chat, and MCP tools into one adaptive workspace.',
  applicationName: 'Dexter',
  category: 'technology',
  keywords: [
    'Dexter',
    'crypto trading agents',
    'voice trading',
    'OpenAI Realtime API',
    'multi-agent chat',
    'MCP tools',
  ],
  authors: [{ name: 'Dexter Team' }],
  creator: 'Dexter',
  publisher: 'Dexter',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Dexter • Crypto agent that talks back',
    description: 'Realtime voice, multi-agent chat, and MCP tooling in a single adaptive crypto workspace.',
    url: siteUrl,
    siteName: 'Dexter',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/og/dexter-default.png',
        width: 1200,
        height: 630,
        alt: 'Dexter hero tile with logo and realtime agents headline',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dexter • Crypto agent that talks back',
    description: 'Realtime voice, multi-agent chat, and MCP tooling in a single adaptive crypto workspace.',
    site: '@dexter',
    creator: '@dexter',
    images: ['/assets/og/dexter-default.png'],
  },
  icons: {
    icon: '/assets/logos/logo.svg',
    apple: '/assets/logos/logo.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: sunrisePalette.background,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={activeThemeVariables}>
      <body className={`${orbitron.variable} ${russoOne.variable} ${satoshi.variable} ${satoshi.className}`}>
        <AuthProvider>
          <div className="page-shell">
            <Header />
            <BreakingNewsBanner
              active
              severity="info"
              eyebrow="pre-launch"
              headline="Dexter is pre-launch. All information is subject to change ahead of token and product release."
            />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
