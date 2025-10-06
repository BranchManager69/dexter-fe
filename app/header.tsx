'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '../lib/site';
import { DexterAnimatedCrest } from './components/DexterAnimatedCrest';
import { LoginMenu } from './components/header/LoginMenu';

export function Header() {
  const pathname = usePathname();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  const navClass = (href: Route | string, external?: boolean) => {
    if (external) return 'site-header__nav-link';
    if (!pathname) return 'site-header__nav-link';
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return `site-header__nav-link${active ? ' site-header__nav-link--active' : ''}`;
  };
  const navItems = SITE.navigation;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__left-tray">
          <nav className="site-header__nav" aria-label="Primary">
            {navItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  className={navClass(item.href, true)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className={navClass(item.href)}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <Link href="/" className="site-header__crest" aria-label="Dexter home">
          <span className="site-header__crest-ring">
            <DexterAnimatedCrest size={72} />
          </span>
        </Link>

        <div className="site-header__right">
          <LoginMenu siteKey={siteKey} />
        </div>
      </div>
    </header>
  );
}
