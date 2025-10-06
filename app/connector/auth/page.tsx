'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../auth-context';
import { TurnstileWidget } from '../../components/TurnstileWidget';
import { resolveEmailProvider } from '../../../lib/emailProviders';
import styles from './styles.module.css';

type AuthRequestInfo = {
  client_id: string;
  redirect_uri: string;
  state: string | null;
  scope: string | null;
};

function ConnectorAuthContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('request_id');

  const { supabase, session, loading, error, sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [requestInfo, setRequestInfo] = useState<AuthRequestInfo | null>(null);
  const [status, setStatus] = useState<'init' | 'fetching' | 'waiting' | 'sending' | 'exchanging' | 'redirecting' | 'manual' | 'error'>('init');
  const [message, setMessage] = useState<string>('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicError, setMagicError] = useState<string>('');
  const [exchangeError, setExchangeError] = useState<string>('');
  const [exchangeAttempted, setExchangeAttempted] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const providerInfo = useMemo(() => resolveEmailProvider(email), [email]);

  useEffect(() => {
    setTurnstileReady(false);
  }, [turnstileKey]);

  useEffect(() => {
    if (!requestId) {
      setStatus('error');
      setMessage('Missing connector request identifier. Close this window and retry.');
      return;
    }
    setStatus('fetching');
    fetch(`/api/connector/oauth/request?request_id=${encodeURIComponent(requestId)}`)
      .then(async (resp) => {
        if (!resp.ok) {
          throw new Error('Request not found or expired. Close this window and reconnect.');
        }
        const data = await resp.json();
        setRequestInfo(data.request);
        setStatus('waiting');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err?.message || 'Unable to load connector request.');
      });
  }, [requestId]);

  useEffect(() => {
    setExchangeAttempted(false);
  }, [requestId]);

  useEffect(() => {
    if (!requestId || !requestInfo || !session || exchangeAttempted) return;
    const currentSession = session;
    let cancelled = false;
    async function exchange() {
      try {
        setExchangeError('');
        setStatus('exchanging');
        setExchangeAttempted(true);

        let workingSession = currentSession;
        let refreshToken = workingSession.refresh_token || null;

        if (supabase) {
          try {
            const { data, error } = await supabase.auth.getSession();
            if (!cancelled && !error && data?.session) {
              workingSession = data.session;
              refreshToken = data.session.refresh_token ?? refreshToken;
            }
          } catch (getErr) {
            console.warn('[connector/oauth] getSession failed', getErr);
          }

          if (!refreshToken) {
            try {
              const { data, error } = await supabase.auth.refreshSession();
              if (!cancelled && !error && data?.session?.refresh_token) {
                workingSession = data.session;
                refreshToken = data.session.refresh_token;
              }
            } catch (refreshErr) {
              console.warn('[connector/oauth] refreshSession failed', refreshErr);
            }
          }
        }

        if (!refreshToken) {
          throw new Error('Active Supabase session is missing a refresh token. Please sign out and try again.');
        }

        const resp = await fetch('/api/connector/oauth/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: requestId,
            refresh_token: refreshToken,
            access_token: workingSession?.access_token ?? null,
            supabase_user_id: workingSession?.user?.id ?? null,
          }),
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => null);
          throw new Error(data?.error || 'exchange_failed');
        }
        const data = await resp.json();
        const targetUrl = (typeof data.redirect_url === 'string' && data.redirect_url) || (() => {
          const fallback = new URL(data.redirect_uri);
          fallback.searchParams.set('code', data.code);
          if (data.state) fallback.searchParams.set('state', data.state);
          return fallback.toString();
        })();
        const mobileUrl = typeof data.mobile_redirect_url === 'string' && data.mobile_redirect_url ? data.mobile_redirect_url : null;
        setRedirectUrl(targetUrl);

        if (mobileUrl) {
          setStatus('redirecting');
          try {
            window.location.href = mobileUrl;
            setTimeout(() => {
              if (!cancelled) {
                window.open(mobileUrl, '_self');
              }
            }, 600);
          } catch (navErr) {
            console.warn('[connector/oauth] mobile navigation failed', navErr);
            window.open(mobileUrl, '_self');
          }

          // Secondary fallback to the official web callback
          setTimeout(() => {
            if (!cancelled) {
              window.open(targetUrl, '_self');
            }
          }, 2000);
        } else {
          setStatus('manual');
        }
      } catch (err: any) {
        if (!cancelled) {
          setExchangeError(err?.message || 'Unable to complete authorization.');
          setStatus('error');
          setExchangeAttempted(false);
        }
      }
    }
    exchange();
    return () => {
      cancelled = true;
    };
  }, [requestId, requestInfo, session, supabase, exchangeAttempted]);

  const fatalRequestError = status === 'error' && !requestInfo;

  const header = useMemo(() => {
    if (fatalRequestError) return 'Dexter connection expired';
    if (requestInfo?.scope?.includes('voice')) return 'Connect Dexter Voice';
    return 'Authorize Dexter Connector';
  }, [fatalRequestError, requestInfo]);

  const connectorName = useMemo(() => {
    if (!requestInfo) return 'Connector';
    const { client_id: clientId, redirect_uri: redirectUri } = requestInfo;
    if (clientId === 'cid_59e99d1247b444bca4631382ecff3e36') return 'Claude';
    if (clientId === 'cid_a859560609a6448aa2f3a1c29f6ab496') return 'ChatGPT';
    try {
      const host = new URL(redirectUri).hostname;
      if (host.includes('claude')) return 'Claude';
      if (host.includes('openai') || host.includes('chatgpt')) return 'ChatGPT';
      return host;
    } catch {
      return 'Connector';
    }
  }, [requestInfo]);

  const handleCopyLink = async () => {
    if (!redirectUrl) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(redirectUrl);
        setCopyState('copied');
        setTimeout(() => setCopyState('idle'), 2000);
        return;
      } catch (err) {
        console.warn('[connector/oauth] clipboard copy failed', err);
      }
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = redirectUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      console.warn('[connector/oauth] legacy clipboard copy failed', err);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const handleOpenLink = () => {
    if (!redirectUrl) return;
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSendMagicLink = async () => {
    if (siteKey && !captchaToken) {
      setMagicError('Complete the verification challenge to continue.');
      setStatus('waiting');
      return;
    }
    setMagicError('');
    setMagicLinkSent(false);
    setStatus('sending');
    const redirectPath = requestId ? `${window.location.origin}/connector/auth?request_id=${encodeURIComponent(requestId)}` : undefined;
    const result = await sendMagicLink(email.trim(), { redirectTo: redirectPath, captchaToken: captchaToken || undefined });
    if (result.success) {
      setMagicLinkSent(true);
    } else {
      setMagicError(result.message);
    }
    setStatus('waiting');
    if (siteKey) {
      setCaptchaToken(null);
      setTurnstileKey((key) => key + 1);
      setTurnstileReady(false);
    }
  };

  const renderLoginForm = () => (
    <div className={styles['login-form']}>
      <p className={styles['login-copy']}>
        Enter your email address and we’ll send a magic link so you can finish the connection in this window.
      </p>
      {siteKey && (
        <div className={styles['turnstile-shell']} data-ready={turnstileReady ? 'true' : 'false'}>
          {!turnstileReady && (
            <div className={styles['turnstile-placeholder']} role="status" aria-live="polite">
              <span className={styles['turnstile-spinner']} aria-hidden="true" />
              <span>Loading verification…</span>
            </div>
          )}
          <TurnstileWidget
            refreshKey={turnstileKey}
            siteKey={siteKey}
            onToken={(token) => {
              setCaptchaToken(token);
              if (token) setTurnstileReady(true);
            }}
            onWidgetLoad={() => setTurnstileReady(true)}
            className={styles['turnstile-frame']}
            theme="light"
            appearance="always"
          />
        </div>
      )}
      <div className={styles['login-row']}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles['email-input']}
        />
        <button
          type="button"
          onClick={handleSendMagicLink}
          disabled={!email.trim() || status === 'sending'}
          className={styles['send-btn']}
        >
          {status === 'sending' ? 'Sending…' : 'Send magic link'}
        </button>
      </div>
      {magicLinkSent && (
        <div className={styles['copy-block']}>
          <p className={styles['status-text']}>
            Magic link sent! Open it in this browser to continue.
          </p>
          {providerInfo && (
            <a
              className={styles['inbox-hint']}
              href={providerInfo.inboxUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open {providerInfo.label}
            </a>
          )}
        </div>
      )}
      {magicError && <p className={`${styles['status-text']} ${styles['status-error']}`}>{magicError}</p>}
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.heading}>{header}</h1>
          <p className={styles.subheading}>
            {fatalRequestError
              ? 'We couldn’t link your Dexter account.'
              : requestInfo
                ? 'Approve access so Dexter can work with your wallets and tools inside the connector.'
                : 'Preparing authorization…'}
          </p>
        </div>

        {fatalRequestError ? (
          <p className={`${styles.message} ${styles['message--error']}`}>
            Close this tab and retry the <strong>Connect to Dexter</strong> flow from the external app.
          </p>
        ) : (
          <>
            {error && <p className={`${styles.message} ${styles['message--error']}`}>{error}</p>}
            {message && <p className={`${styles.message} ${styles['message--error']}`}>{message}</p>}
          </>
        )}
        {!fatalRequestError && exchangeError && (
          <p className={`${styles.message} ${styles['message--error']}`}>{exchangeError}</p>
        )}
        {!fatalRequestError && status === 'redirecting' && redirectUrl && (
          <p className={styles['redirect-hint']}>
            Redirecting… If nothing happens, <a href={redirectUrl}>click here to continue</a>.
          </p>
        )}

        {status === 'manual' && redirectUrl && !fatalRequestError && (
          <div className={styles['manual-panel']}>
            <div>
              <h2 className={styles['manual-title']}>Finish in {connectorName}</h2>
              <p className={styles['manual-description']}>
                We couldn’t open {connectorName} automatically. Tap below to finish connecting, then return to the app.
              </p>
            </div>
            <button type="button" className={styles['manual-action']} onClick={handleOpenLink}>
              Open {connectorName}
            </button>
            <div className={styles['copy-block']}>
              <p className={styles['manual-description']}>Need to paste it manually?</p>
              <div className={styles['link-row']}>
                <code className={styles['link-chip']}>{redirectUrl}</code>
                <button type="button" className={styles['copy-btn']} onClick={handleCopyLink}>
                  {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!session && !loading && !fatalRequestError && renderLoginForm()}
        {loading && <p className={styles['status-text']}>Loading authentication…</p>}
        {session && requestInfo && status !== 'manual' && (
          <p className={styles['status-text']}>
            Signed in as <span className={styles.highlight}>{session.user?.email}</span>. Completing authorization…
          </p>
        )}
      </div>
    </div>
  );
}

export default function ConnectorAuthPage() {
  return (
    <Suspense fallback={(
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07080c',
        color: '#e6edf3',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
      }}>
        <p style={{ color: '#9fb2c8' }}>Preparing authorization…</p>
      </div>
    )}>
      <ConnectorAuthContent />
    </Suspense>
  );
}
