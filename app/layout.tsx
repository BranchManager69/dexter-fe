import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from './auth-context';
import { Header } from './header';
import { Footer } from './footer';
import { FlexFill } from './components/FlexFill';
import { activeThemeVariables, sunrisePalette } from '../lib/theme/palette';
import { orbitron, russoOne } from './fonts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http')
  ? process.env.NEXT_PUBLIC_SITE_URL
  : 'https://beta.dexter.cash';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Dexter • Intelligent agents at your fingertips',
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
    title: 'Dexter • Intelligent agents at your fingertips',
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
    title: 'Dexter • Intelligent agents at your fingertips',
    description: 'Realtime voice, multi-agent chat, and MCP tooling in a single adaptive crypto workspace.',
    site: '@dexter',
    creator: '@dexter',
    images: ['/assets/og/dexter-default.png'],
  },
  icons: {
    icon: '/assets/logos/logo_orange.png',
    apple: '/assets/logos/logo_orange.png',
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
      <body className={`${orbitron.variable} ${russoOne.variable}`}>
        <AuthProvider>
          <div className="page-shell">
            <Header />
            <main className="main-content">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
