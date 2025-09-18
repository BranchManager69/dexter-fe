'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../auth-context';

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

  const header = useMemo(() => {
    if (requestInfo?.scope?.includes('voice')) return 'Connect Dexter Voice';
    return 'Authorize Dexter Connector';
  }, [requestInfo]);

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
    setMagicError('');
    setMagicLinkSent(false);
    setStatus('sending');
    const redirectPath = requestId ? `${window.location.origin}/connector/auth?request_id=${encodeURIComponent(requestId)}` : undefined;
    const result = await sendMagicLink(email.trim(), { redirectTo: redirectPath });
    if (result.success) {
      setMagicLinkSent(true);
      setStatus('waiting');
    } else {
      setMagicError(result.message);
      setStatus('waiting');
    }
  };

  const renderLoginForm = () => (
    <div style={{ marginTop: 24 }}>
      <p style={{ lineHeight: 1.5 }}>
        Enter the email associated with your Dexter account and we will send a sign-in link. Open it in the same browser,
        then return to this window.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(102,126,234,0.35)', background: 'rgba(17,19,26,0.8)', color: '#e6edf3' }}
        />
        <button
          onClick={handleSendMagicLink}
          disabled={!email.trim() || status === 'sending'}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: '#667eea',
            color: '#fff',
            fontWeight: 600,
            cursor: status === 'sending' ? 'wait' : 'pointer',
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send Link'}
        </button>
      </div>
      {magicLinkSent && (
        <p style={{ marginTop: 12, color: '#7aa2f7' }}>
          Magic link sent! Check your inbox and open the link in this browser to continue.
        </p>
      )}
      {magicError && (
        <p style={{ marginTop: 12, color: '#f37f97' }}>{magicError}</p>
      )}
    </div>
  );

  return (
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
      <div style={{ maxWidth: 520, width: '100%', background: '#11131a', borderRadius: 18, padding: 32, border: '1px solid rgba(102,126,234,0.25)', boxShadow: '0 30px 70px rgba(0,0,0,0.45)' }}>
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>{header}</h1>
        {requestInfo ? (
          <p style={{ marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
            Approve access so that Dexter can interact with your wallets and tools inside the connector.
          </p>
        ) : (
          <p style={{ lineHeight: 1.5 }}>Preparing authorization…</p>
        )}

        {error && (
          <p style={{ color: '#f37f97', marginBottom: 16 }}>{error}</p>
        )}
        {message && (
          <p style={{ color: '#f37f97', marginBottom: 16 }}>{message}</p>
        )}
        {exchangeError && (
          <p style={{ color: '#f37f97', marginBottom: 16 }}>{exchangeError}</p>
        )}
        {status === 'redirecting' && redirectUrl && (
          <p style={{ color: '#7aa2f7', marginBottom: 16 }}>
            Redirecting… If nothing happens,{' '}
            <a
              href={redirectUrl}
              style={{ color: '#9fb2ff', textDecoration: 'underline' }}
            >
              click here to continue
            </a>
            .
          </p>
        )}

        {status === 'manual' && redirectUrl && (
          <div style={{
            marginTop: 24,
            background: 'rgba(8, 10, 14, 0.85)',
            borderRadius: 12,
            padding: 20,
            border: '1px solid rgba(102,126,234,0.3)',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>Finish in {connectorName}</h2>
            <p style={{ marginTop: 0, marginBottom: 16, lineHeight: 1.5, color: '#9fb2c8' }}>
              We couldn’t open {connectorName} automatically. Tap below to finish connecting, then return to the app to
              continue.
            </p>
            <button
              onClick={handleOpenLink}
              style={{
                padding: '12px 18px',
                borderRadius: 10,
                border: 'none',
                background: '#7aa2f7',
                color: '#07080c',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Open {connectorName}
            </button>
            <div style={{ marginTop: 16 }}>
              <p style={{ marginBottom: 8, color: '#9fb2c8' }}>Need to paste it manually?</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{
                  flex: 1,
                  fontSize: 12,
                  lineHeight: 1.4,
                  background: '#0b0c10',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(102,126,234,0.25)',
                  overflowWrap: 'anywhere',
                }}>
                  {redirectUrl}
                </code>
                <button
                  onClick={handleCopyLink}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(102,126,234,0.45)',
                    background: 'rgba(12, 14, 20, 0.9)',
                    color: '#e6edf3',
                    cursor: 'pointer',
                  }}
                >
                  {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!session && !loading && renderLoginForm()}
        {loading && (
          <p style={{ color: '#9fb2c8' }}>Loading authentication…</p>
        )}
        {session && requestInfo && status !== 'manual' && (
          <div style={{ marginTop: 16 }}>
            <p style={{ color: '#7aa2f7' }}>
              Signed in as <strong>{session.user?.email}</strong>. Completing authorization…
            </p>
          </div>
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
