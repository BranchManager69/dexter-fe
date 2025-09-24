export const VERSION_TAG = 'rev-2025-09-17-1';

import type { Route } from 'next';

type InternalNavItem = {
  label: string;
  href: Route;
  external?: false;
};

type ExternalNavItem = {
  label: string;
  href: string;
  external: true;
};

type NavItem = InternalNavItem | ExternalNavItem;

const navigation = [
  { label: 'Capabilities', href: '/tools' satisfies Route },
  { label: 'Docs', href: 'https://docs.dexter.cash', external: true },
  { label: 'Link', href: '/link' satisfies Route },
] satisfies NavItem[];

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
