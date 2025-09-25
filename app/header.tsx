'use client';

import Image from 'next/image';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '../lib/site';
import { useAuth } from './auth-context';
import { resolveEmailProvider } from '../lib/emailProviders';
import { TurnstileWidget } from './components/TurnstileWidget';

export function Header() {
  const {
    session,
    loading,
    signOut,
    sendMagicLink,
    signInWithTwitter,
    signInWithSolanaWallet,
  } = useAuth();
  const pathname = usePathname();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  const [accountOpen, setAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [magicLinkBusy, setMagicLinkBusy] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<'twitter' | 'solana' | null>(null);
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

  const accountLabel = loading
    ? 'Checking…'
    : session?.user?.email ?? 'Guest';

  const initials = (session?.user?.email || 'Dexter')[0]?.toUpperCase() ?? 'D';

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

  const handleTwitterLogin = async () => {
    setAuthMessage('');
    if (siteKey && !captchaToken) {
      setAuthMessage('Complete the verification challenge to continue.');
      return;
    }
    setOauthBusy('twitter');
    const result = await signInWithTwitter({ captchaToken: captchaToken || undefined });
    if (!result.success && result.message) {
      setAuthMessage(result.message);
    }
    setOauthBusy(null);
    if (siteKey) {
      setCaptchaToken(null);
      setTurnstileVisible(Boolean(siteKey));
      setTurnstileKey((key) => key + 1);
    }
  };

  const handleSolanaLogin = async () => {
    setAuthMessage('');
    if (siteKey && !captchaToken) {
      setAuthMessage('Complete the verification challenge to continue.');
      return;
    }
    setOauthBusy('solana');
    const result = await signInWithSolanaWallet({ captchaToken: captchaToken || undefined });
    if (!result.success && result.message) {
      setAuthMessage(result.message);
    }
    setOauthBusy(null);
    if (siteKey) {
      setCaptchaToken(null);
      setTurnstileVisible(Boolean(siteKey));
      setTurnstileKey((key) => key + 1);
    }
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

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__cluster">
          <Link href="/" className="site-header__brand" aria-label="Dexter home">
            <span className="site-header__brand-logo">
              <Image src="/assets/logos/logo_orange.png" alt="Dexter" width={36} height={36} priority />
            </span>
            <span className="site-header__brand-copy">
              <span className="site-header__brand-name">Dexter</span>
              <span className="site-header__brand-tagline">Realtime Agents for DeFi</span>
            </span>
          </Link>
          <span className="site-header__divider" aria-hidden="true" />
          <nav className="site-header__nav" aria-label="Primary">
            {SITE.navigation.map((item) =>
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
              )
            )}
          </nav>
        </div>

        <div className="site-header__cluster site-header__cluster--actions">
          <Link
            href="https://beta.dexter.cash"
            className="site-header__launch"
            target="_blank"
            rel="noreferrer"
            prefetch={false}
          >
            Launch Dexter
          </Link>

          <div className="account-menu" ref={accountRef}>
            <button
              type="button"
              className="account-menu__trigger"
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
            >
              <span className="account-menu__avatar" aria-hidden="true">{initials}</span>
              <span className="account-menu__label">{accountLabel}</span>
              <svg
                className={`account-menu__chevron${accountOpen ? ' account-menu__chevron--open' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
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
                    <div className="account-menu__section account-menu__section--grid">
                      <button
                        type="button"
                        className="account-menu__action"
                        onClick={handleTwitterLogin}
                        disabled={oauthBusy !== null}
                      >
                        {oauthBusy === 'twitter' ? 'Starting…' : 'Continue with Twitter'}
                      </button>
                      <button
                        type="button"
                        className="account-menu__action"
                        onClick={handleSolanaLogin}
                        disabled={oauthBusy !== null}
                      >
                        {oauthBusy === 'solana' ? 'Starting…' : 'Sign in with Solana wallet'}
                      </button>
                    </div>

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
