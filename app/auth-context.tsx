'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

const HOST_REDIRECT_OVERRIDES: Record<string, string> = {
  'beta.branch.bet': 'https://beta.dexter.cash',
  'www.beta.branch.bet': 'https://beta.dexter.cash',
  'branch.bet': 'https://dexter.cash',
  'www.branch.bet': 'https://dexter.cash',
};

const stripTrailingSlash = (value?: string | null) => (value ? value.replace(/\/+$/, '') : undefined);

const normaliseAbsoluteUrl = (raw?: string | null, base?: string) => {
  if (!raw) return undefined;
  try {
    return new URL(raw).toString();
  } catch {
    if (!base) return undefined;
    try {
      return new URL(raw, `${base}/`).toString();
    } catch {
      return undefined;
    }
  }
};

const deriveRedirectBase = () => {
  if (typeof window !== 'undefined') {
    try {
      const current = new URL(window.location.href);
      const override = HOST_REDIRECT_OVERRIDES[current.hostname];
      return stripTrailingSlash(override ?? current.origin);
    } catch {
      // Ignore and fall through to env fallback
    }
  }
  return stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL ?? undefined);
};

const computeRedirectTo = (explicit?: string) => {
  const base = deriveRedirectBase();

  const pick = (candidate?: string | null) => normaliseAbsoluteUrl(candidate, base);

  const explicitUrl = pick(explicit);
  if (explicitUrl) return explicitUrl;

  if (typeof window !== 'undefined') {
    try {
      const current = new URL(window.location.href);
      const paramCandidate =
        current.searchParams.get('redirect_to') ||
        current.searchParams.get('redirect') ||
        current.searchParams.get('return_to');
      const paramUrl = pick(paramCandidate);
      if (paramUrl) return paramUrl;
    } catch {
      // Ignore query parsing errors and fall back to base
    }
  }

  return base ?? undefined;
};

function apiUrl(path: string) {
  // Always use relative URLs to go through Next.js rewrites
  return path;
}

interface AuthContextType {
  supabase: SupabaseClient | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  sendMagicLink: (email: string, options?: { redirectTo?: string; captchaToken?: string }) => Promise<{ success: boolean; message: string }>;
  signInWithTwitter: (options?: { redirectTo?: string; captchaToken?: string }) => Promise<{ success: boolean; message: string }>;
  signInWithSolanaWallet: (options?: { redirectTo?: string; captchaToken?: string }) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType>({
  supabase: null,
  session: null,
  loading: true,
  error: null,
  signOut: async () => {},
  sendMagicLink: async () => ({ success: false, message: 'Not initialized' }),
  signInWithTwitter: async () => ({ success: false, message: 'Not initialized' }),
  signInWithSolanaWallet: async () => ({ success: false, message: 'Not initialized' }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(apiUrl('/auth/config'), { cache: 'no-store' });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok || !data.supabaseUrl || !data.supabaseAnonKey) {
          throw new Error('Supabase configuration missing.');
        }
        if (cancelled) return;

        const client = createClient(data.supabaseUrl, data.supabaseAnonKey, {
          auth: { persistSession: true, autoRefreshToken: true },
        });

        const { data: initial } = await client.auth.getSession();
        if (cancelled) return;

        setSession(initial?.session ?? null);

        const { data: listener } = client.auth.onAuthStateChange((_event, newSession) => {
          setSession(newSession ?? null);
        });

        unsubscribe = () => listener?.subscription?.unsubscribe?.();
        setSupabase(client);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Unable to load authentication config.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  const sendMagicLink = async (email: string, options?: { redirectTo?: string; captchaToken?: string }): Promise<{ success: boolean; message: string }> => {
    if (!supabase) return { success: false, message: 'Authentication not initialized' };

    const trimmed = email.trim();
    if (!trimmed) {
      return { success: false, message: 'Enter your email.' };
    }

    try {
      const redirectTo = computeRedirectTo(options?.redirectTo);
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
          captchaToken: options?.captchaToken,
        },
      } as any);
      if (error) throw error;
      return { success: true, message: 'Check your email for the sign-in link.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Unable to send magic link.' };
    }
  };

  const resolveRedirectTo = (explicit?: string) => computeRedirectTo(explicit);

  const signInWithTwitter = async (options?: { redirectTo?: string; captchaToken?: string }) => {
    if (!supabase) return { success: false, message: 'Authentication not initialized' };
    try {
      const redirectTo = resolveRedirectTo(options?.redirectTo);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: { redirectTo, skipBrowserRedirect: true, captchaToken: options?.captchaToken },
      } as any);
      if (error) throw error;
      if (data?.url) {
        if (typeof window !== 'undefined') {
          window.location.assign(data.url);
        }
        return { success: true, message: '' };
      }
      return { success: false, message: 'Twitter login did not return a redirect URL.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Unable to sign in with Twitter.' };
    }
  };

  const signInWithSolanaWallet = async (options?: { redirectTo?: string; captchaToken?: string }) => {
    if (!supabase) return { success: false, message: 'Authentication not initialized' };
    try {
      const redirectTo = resolveRedirectTo(options?.redirectTo);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'wallet' as any,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          additionalQueryParams: { chain: 'solana' } as any,
          captchaToken: options?.captchaToken,
        },
      } as any);
      if (error) throw error;
      if (data?.url) {
        if (typeof window !== 'undefined') {
          window.location.assign(data.url);
        }
        return { success: true, message: '' };
      }
      return { success: false, message: 'Wallet login did not return a redirect URL.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Unable to sign in with Solana wallet.' };
    }
  };

  return (
    <AuthContext.Provider value={{ supabase, session, loading, error, signOut, sendMagicLink, signInWithTwitter, signInWithSolanaWallet }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
