'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth-context';
import { TurnstileWidget } from '../TurnstileWidget';
import { resolveEmailProvider } from '../../../lib/emailProviders';
import styles from './LoginMenu.module.css';

type LoginMenuProps = {
  siteKey: string;
};

export function LoginMenu({ siteKey }: LoginMenuProps) {
  const { session, loading, signOut, sendMagicLink } = useAuth();

  const [accountOpen, setAccountOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [magicLinkBusy, setMagicLinkBusy] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [turnstileVisible, setTurnstileVisible] = useState(() => Boolean(siteKey));
  const [turnstileReady, setTurnstileReady] = useState(false);

  const accountRef = useRef<HTMLDivElement | null>(null);
  const providerInfo = resolveEmailProvider(email);
  const inboxUrl = providerInfo?.inboxUrl ?? '';
  const isGuest = !session;

  useEffect(() => {
    if (!accountOpen && siteKey) {
      setCaptchaToken(null);
      setTurnstileVisible(Boolean(siteKey));
      setTurnstileReady(false);
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

  const deriveAccountLabel = () => {
    if (loading) return 'Checking…';
    const user = session?.user;
    if (!user) return 'Guest';
    const displayName = (user.user_metadata as any)?.full_name as string | undefined;
    if (displayName && displayName.trim()) return displayName.trim();
    const emailAddress = user.email;
    if (emailAddress && emailAddress.includes('@')) return emailAddress.split('@')[0];
    if (emailAddress) return emailAddress;
    return 'Guest';
  };

  const accountLabel = deriveAccountLabel();
  const initialsSource = (() => {
    if (session?.user?.user_metadata && (session.user.user_metadata as any)?.full_name) {
      return ((session.user.user_metadata as any).full_name as string)
        .split(' ')
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

  return (
    <div className={styles.accountMenu} ref={accountRef}>
      <button
        type="button"
        className={`${styles.trigger}${isGuest ? ` ${styles.triggerGuest}` : ''}`}
        onClick={() => setAccountOpen((open) => !open)}
        aria-expanded={accountOpen}
      >
        {!isGuest && <span className={styles.avatar} aria-hidden="true">{initials}</span>}
        <span className={`${styles.label}${isGuest ? ` ${styles.triggerGuestLabel}` : ''}`}>{isGuest ? 'Log in' : accountLabel}</span>
      </button>

      {accountOpen && (
        <div className={styles.dropdown}>
          {session ? (
            <div className={styles.section}>
              <div className={styles.headline}>Signed in</div>
              <div className={styles.value}>{session.user?.email ?? 'Dexter user'}</div>
              <button type="button" className={`${styles.action} ${styles.actionDanger}`} onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className={styles.section}>
                <label htmlFor="auth-email" className={styles.labelInline}>Email</label>
                <input
                  id="auth-email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={Boolean(siteKey) && !turnstileReady}
                />
              </div>

              {siteKey && (
                <div className={`${styles.section} ${styles.sectionGrid}`}>
                  {turnstileVisible ? (
                    <div className={`${styles.turnstileOuter}${turnstileReady ? ` ${styles.turnstileOuterReady}` : ''}`}>
                      <div className={styles.turnstilePlaceholder}>
                        <span className={styles.turnstileSpinner} aria-hidden />
                        <span>Authenticating…</span>
                      </div>
                      <TurnstileWidget
                        refreshKey={turnstileKey}
                        siteKey={siteKey}
                        onToken={(token) => setCaptchaToken(token)}
                        className={styles.turnstile}
                        theme="light"
                        onWidgetLoad={() => setTurnstileReady(true)}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.action}
                      onClick={() => {
                        setTurnstileVisible(true);
                        setTurnstileReady(false);
                        setTurnstileKey((key) => key + 1);
                      }}
                    >
                      Verify again
                    </button>
                  )}
                </div>
              )}

              <div className={styles.section}>
                <button
                  type="button"
                  className={`${styles.action} ${styles.actionPrimary}`}
                  onClick={handleSendMagicLink}
                  disabled={magicLinkBusy || (siteKey ? !turnstileReady : false)}
                >
                  {magicLinkBusy ? 'Sending…' : 'Email me a link'}
                </button>
              </div>

              {(authMessage || magicLinkSent) && (
                <div className={styles.message}>
                  <span>{authMessage}</span>
                  {magicLinkSent && (
                    <span className={styles.messageProviders}>
                      {inboxUrl ? (
                        <a href={inboxUrl} target="_blank" rel="noreferrer" className={styles.messageLink}>
                          Open {providerInfo?.label ?? 'inbox'} ↗
                        </a>
                      ) : (
                        <span className={styles.messageHint}>Try Gmail, Outlook, Proton, or check Spam</span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
