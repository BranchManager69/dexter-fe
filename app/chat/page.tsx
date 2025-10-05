'use client';

import { useCallback, useRef, useState } from 'react';

export default function ChatPage() {
  const [input, setInput] = useState('Say hello');
  const [stream, setStream] = useState('');
  const [busy, setBusy] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const stop = useCallback(() => {
    try { esRef.current?.close(); } catch {}
    esRef.current = null;
    setBusy(false);
  }, []);

  const run = useCallback(() => {
    try { esRef.current?.close(); } catch {}
    setStream('');
    setBusy(true);
    const url = `/api/chat/stream?q=${encodeURIComponent(input)}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.type === 'text') {
          setStream(prev => prev + msg.data);
        } else if (msg?.type === 'event') {
          // Show full event JSON for high visibility (tools, items, etc.)
          setStream(prev => prev + `\n[event] ${JSON.stringify(msg.event)}`);
        } else if (msg?.type === 'done') {
          stop();
        } else if (msg?.type === 'error') {
          setStream(prev => prev + `\n[error] ${msg.error}`);
          stop();
        }
      } catch {
        setStream(prev => prev + ev.data);
      }
    };
    es.onerror = () => { stop(); };
  }, [input, stop]);

  return (
    <div>
      <h1>Chat (Agents, streaming)</h1>
      <div style={{display:'flex', gap:8}}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            flex: '1 1 auto',
            padding: '8px',
            background: 'rgba(var(--color-surface-base), 0.85)',
            color: 'rgb(var(--color-text-primary))',
            border: '1px solid rgba(var(--color-border-strong), 0.4)',
            borderRadius: 4,
          }}
        />
      {!busy ? (
        <button onClick={run} style={{padding:'8px 12px'}}>Run</button>
      ) : (
        <button onClick={stop} style={{padding:'8px 12px'}}>Stop</button>
      )}
      </div>
      <pre
        style={{
          marginTop: 12,
          whiteSpace: 'pre-wrap',
          background: 'rgba(var(--color-surface-base), 0.82)',
          color: 'rgb(var(--color-text-secondary))',
          border: '1px solid rgba(var(--color-border-strong), 0.35)',
          borderRadius: 4,
          padding: 12,
          minHeight: 180,
        }}
      >
        {stream}
      </pre>
      <p style={{opacity:.8}}>Streams from /api/chat/stream using Agents Runner. MCP tools are attached when authorized.</p>
    </div>
  );
}
