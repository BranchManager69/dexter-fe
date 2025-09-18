'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SITE, VERSION_TAG } from '../lib/site';
import { useAuth } from './auth-context';
import { resolveEmailProvider } from '../lib/emailProviders';

export function Header() {
  const { session, loading, signOut, sendMagicLink, signInWithTwitter, signInWithSolanaWallet } = useAuth();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [email, setEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [magicLinkBusy, setMagicLinkBusy] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  const providerInfo = resolveEmailProvider(email);
  const inboxUrl = providerInfo?.inboxUrl ?? '';

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      setAuthMessage('Enter your email.');
      return;
    }
    setMagicLinkBusy(true);
    setMagicLinkSent(false);
    setAuthMessage('');

    const result = await sendMagicLink(email);
    if (result.success) {
      setMagicLinkSent(true);
      setAuthMessage('Check your inbox for the sign-in link.');
    } else {
      setAuthMessage(result.message);
    }

    setMagicLinkBusy(false);
  };

  const handleTwitterLogin = async () => {
    setAuthMessage('');
    setOauthBusy(true);
    const result = await signInWithTwitter();
    if (!result.success && result.message) {
      setAuthMessage(result.message);
    }
    setOauthBusy(false);
  };

  const handleSolanaLogin = async () => {
    setAuthMessage('');
    setOauthBusy(true);
    const result = await signInWithSolanaWallet();
    if (!result.success && result.message) {
      setAuthMessage(result.message);
    }
    setOauthBusy(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowAuthModal(false);
    setEmail('');
    setAuthMessage('');
    setMagicLinkSent(false);
  };

  const navClass = (href: string) => {
    if (!pathname) return 'nav-link';
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return `nav-link${active ? ' active' : ''}`;
  };

  const initials = (session?.user?.email || 'U')[0]?.toUpperCase() ?? 'U';

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brandmark">
          <strong>Dexter</strong>
          <span>{SITE.release} · {VERSION_TAG}</span>
        </Link>

        <nav className="site-nav">
          {SITE.navigation.map((item) => (
            <Link key={item.href} href={item.href} className={navClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-actions">
          {loading && <span className="text-muted">Loading…</span>}

          {!loading && !session && (
            <>
              <button className="button button--ghost" onClick={() => setShowAuthModal((open) => !open)}>
                Request Access
              </button>
              {showAuthModal && (
                <div className="auth-popover">
                  <div className="form-field" style={{ gap: '8px' }}>
                    <button
                      className="button button--primary"
                      onClick={handleTwitterLogin}
                      disabled={oauthBusy}
                    >
                      {oauthBusy ? 'Starting…' : 'Continue with Twitter'}
                    </button>
                    <button
                      className="button button--ghost"
                      onClick={handleSolanaLogin}
                      disabled={oauthBusy}
                    >
                      {oauthBusy ? 'Starting…' : 'Sign in with Solana wallet'}
                    </button>
                  </div>

                  <div className="form-field">
                    <label htmlFor="auth-email" className="form-label">Email</label>
                    <input
                      id="auth-email"
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {authMessage && <div className="helper-text">{authMessage}</div>}

                  <div className="auth-popover__actions">
                    <button
                      className="button button--primary"
                      onClick={handleSendMagicLink}
                      disabled={magicLinkBusy}
                    >
                      {magicLinkBusy ? 'Sending…' : 'Email me a link'}
                    </button>
                    <button className="button" onClick={() => setShowAuthModal(false)}>
                      Close
                    </button>
                  </div>

                  {magicLinkSent && providerInfo && inboxUrl && (
                    <div className="helper-text">
                      <span>Open your {providerInfo.label} inbox</span>{' '}
                      <a href={inboxUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                        ({inboxUrl.replace('https://', '')})
                      </a>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!loading && session && (
            <div className="site-actions__auth">
              <button className="button button--ghost" onClick={() => setShowAuthModal((open) => !open)}>
                <span className="avatar-chip">{initials}</span>
                <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {session.user?.email || 'User'}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {showAuthModal && (
                <div className="auth-popover">
                  <div className="helper-text">You are signed in as <strong>{session.user?.email}</strong>.</div>
                  <div className="auth-popover__actions">
                    <button className="button" onClick={() => setShowAuthModal(false)}>
                      Close
                    </button>
                    <button className="button button--primary" onClick={handleSignOut}>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
