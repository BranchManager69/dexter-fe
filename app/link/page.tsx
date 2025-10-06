'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../auth-context';
import GradientPanel from '../components/GradientPanel';
import styles from './styles.module.css';

export default function LinkPage() {
  const { session } = useAuth();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('https://dexter.cash/mcp');
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (err) {
      console.warn('[link] copy failed', err);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  return (
    <div className={styles.wrapper}>
      <GradientPanel className={styles.card} grid>
        <h1 className={styles.heading}>Link your Dexter account externally</h1>
        {session ? (
          <p className={styles.copy}>
            You are signed in as <strong>{session.user?.email}</strong>. Connect Dexter to{' '}
            <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className={styles.link}>ChatGPT</a> or{' '}
            <a href="https://claude.ai" target="_blank" rel="noreferrer" className={styles.link}>Claude</a> by
            adding the MCP server and completing the built-in OAuth flow. No manual link codes are required anymore.
          </p>
        ) : (
          <p className={styles.copy}>
            Sign in with your email or Supabase magic link first. Once signed in, open{' '}
            <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className={styles.link}>ChatGPT</a> or{' '}
            <a href="https://claude.ai" target="_blank" rel="noreferrer" className={styles.link}>Claude</a>, add the
            Dexter connector, and approve the sign-in popup powered by Supabase.
          </p>
        )}
        <div className={styles.copyRow}>
          <code className={styles.copyUrl}>https://dexter.cash/mcp</code>
          <button type="button" className={styles.copyButton} onClick={handleCopy}>
            {copyState === 'copied' ? 'Copied!' : copyState === 'error' ? 'Copy failed' : 'Copy URL'}
          </button>
        </div>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepLabel}>ChatGPT</span> · Settings → Connectors → “Add” → paste the Dexter MCP server URL.
          </li>
          <li className={styles.step}>
            <span className={styles.stepLabel}>Claude</span> · Settings → Tools → “Add tool” → paste the Dexter MCP URL from your dashboard.
          </li>
          <li className={styles.step}>
            When the browser prompt appears, approve the Dexter OAuth popup. Wallet access syncs automatically after approval.
          </li>
        </ol>
        <p className={styles.footer}>
          Need help? Check the <Link href="/tools" className={styles.link}>Tools</Link> page or contact the team in
          Discord.
        </p>
      </GradientPanel>
    </div>
  );
}
