'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '../lib/site';
import { useAuth } from './auth-context';
import { resolveEmailProvider } from '../lib/emailProviders';
import { DexterAnimatedCrest } from './components/DexterAnimatedCrest';

import { TurnstileWidget } from './components/TurnstileWidget';

export function Header() {
  const { session, loading, signOut, sendMagicLink } = useAuth();
  const pathname = usePathname();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  const [accountOpen, setAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [magicLinkBusy, setMagicLinkBusy] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [turnstileVisible, setTurnstileVisible] = useState(() => Boolean(siteKey));
  const accountRef = useRef<HTMLDivElement | null>(null);
  const providerInfo = resolveEmailProvider(email);
  const inboxUrl = providerInfo?.inboxUrl ?? '';

  useEffect(() => {
    if (!accountOpen && siteKey) {
      setCaptchaToken(null);
      setTurnstileVisible(Boolean(siteKey));
      setTurnstileKey((key) => key + 1);
    }
  }, [accountOpen, siteKey]);

  useEffect(() => {
    if (!accountOpen) return;
    function handleClick(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [accountOpen]);

  const navClass = (href: Route | string, external?: boolean) => {
    if (external) return 'site-header__nav-link';
    if (!pathname) return 'site-header__nav-link';
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return `site-header__nav-link${active ? ' site-header__nav-link--active' : ''}`;
  };

  const deriveAccountLabel = () => {
    if (loading) return 'Checking…';
    const user = session?.user;
    if (!user) return 'Guest';
    const displayName = (user.user_metadata as any)?.full_name as string | undefined;
    if (displayName && displayName.trim()) return displayName.trim();
    const email = user.email;
    if (email && email.includes('@')) return email.split('@')[0];
    if (email) return email;
    return 'Guest';
  };

  const accountLabel = deriveAccountLabel();

  const initialsSource = (() => {
    if (session?.user?.user_metadata && (session.user.user_metadata as any)?.full_name) {
      return ((session.user.user_metadata as any).full_name as string).
        split(' ')
        .filter(Boolean)
        .map((chunk) => chunk[0])
        .join('');
    }
    return session?.user?.email || 'Dexter';
  })();

  const initials = initialsSource[0]?.toUpperCase() ?? 'D';

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      setAuthMessage('Enter your email.');
      return;
    }
    if (siteKey && !captchaToken) {
      setAuthMessage('Complete the verification challenge to continue.');
      return;
    }
    setMagicLinkBusy(true);
    setMagicLinkSent(false);
    setAuthMessage('');

    const result = await sendMagicLink(email, { captchaToken: captchaToken || undefined });
    if (result.success) {
      setMagicLinkSent(true);
      setAuthMessage('Check your inbox for the sign-in link.');
      if (siteKey) {
        setCaptchaToken(null);
        setTurnstileVisible(false);
      }
    } else {
      setAuthMessage(result.message);
    }

    setMagicLinkBusy(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setAccountOpen(false);
    setEmail('');
    setAuthMessage('');
    setMagicLinkSent(false);
    if (siteKey) {
      setCaptchaToken(null);
      setTurnstileVisible(Boolean(siteKey));
      setTurnstileKey((key) => key + 1);
    }
  };

  const navItems = SITE.navigation;
  const isGuest = !session;

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
          <div className="account-menu" ref={accountRef}>
            <button
              type="button"
              className={`account-menu__trigger${isGuest ? ' account-menu__trigger--guest' : ''}`}
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
            >
              {!isGuest && <span className="account-menu__avatar" aria-hidden="true">{initials}</span>}
              <span className="account-menu__label">{isGuest ? 'Sign in' : accountLabel}</span>
            </button>

            {accountOpen && (
              <div className="account-menu__dropdown">
                {session ? (
                  <div className="account-menu__section">
                    <div className="account-menu__headline">Signed in</div>
                    <div className="account-menu__value">{session.user?.email ?? 'Dexter user'}</div>
                    <button type="button" className="account-menu__action account-menu__action--danger" onClick={handleSignOut}>
                      Sign out
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="account-menu__section">
                      <label htmlFor="auth-email" className="account-menu__label-inline">Email</label>
                      <input
                        id="auth-email"
                        type="email"
                        className="account-menu__input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                      <button
                        type="button"
                        className="account-menu__action account-menu__action--primary"
                        onClick={handleSendMagicLink}
                        disabled={magicLinkBusy}
                      >
                        {magicLinkBusy ? 'Sending…' : 'Email me a link'}
                      </button>
                    </div>

                    {(authMessage || magicLinkSent) && (
                      <div className="account-menu__message">
                        <span>{authMessage}</span>
                        {magicLinkSent && (
                          <span className="account-menu__message-providers">
                            {inboxUrl ? (
                              <a href={inboxUrl} target="_blank" rel="noreferrer" className="account-menu__message-link">
                                Open {providerInfo?.label ?? 'inbox'} ↗
                              </a>
                            ) : (
                              <span className="account-menu__message-hint">Try Gmail, Outlook, Proton, or check Spam</span>
                            )}
                          </span>
                        )}
                      </div>
                    )}

                    {siteKey && (
                      <div className="account-menu__section">
                        {turnstileVisible ? (
                          <TurnstileWidget
                            refreshKey={turnstileKey}
                            siteKey={siteKey}
                            onToken={(token) => setCaptchaToken(token)}
                            className="account-menu__turnstile"
                          />
                        ) : (
                          <button
                            type="button"
                            className="account-menu__action"
                            onClick={() => {
                              setTurnstileVisible(true);
                              setTurnstileKey((key) => key + 1);
                            }}
                          >
                            Verify again
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
