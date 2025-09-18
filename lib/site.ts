import type { Route } from 'next';

export const VERSION_TAG = 'rev-2025-09-17-1';

const navigation = [
  { label: 'Voice', href: '/voice' },
  { label: 'Chat', href: '/chat' },
  { label: 'Tools', href: '/tools' },
  { label: 'Link', href: '/link' },
] satisfies Array<{ label: string; href: Route }>;

const footerLinks = [
  { label: 'Status', href: 'https://status.dexter.tools' },
  { label: 'Roadmap', href: 'https://dexter.tools/roadmap' },
  { label: 'Support', href: 'mailto:support@dexter.tools' },
] as const;

export const SITE = {
  name: 'Dexter',
  release: 'Alpha',
  navigation,
  footerLinks,
} as const;
