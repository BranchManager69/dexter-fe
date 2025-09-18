import type { Route } from 'next';
import Link from 'next/link';

const stats = [
  { value: '2.4s', label: 'Median voice turnaround' },
  { value: '4 tools', label: 'MCP services wired in' },
  { value: 'multi-agent', label: 'Chat orchestrates specialist agents' },
];

type CapabilityCard = {
  title: string;
  description: string;
  href: Route;
  chips: string[];
};

const capabilityCards: CapabilityCard[] = [
  {
    title: 'Realtime Voice Console',
    description: 'Launch GPT Realtime with a single click. Dexter streams audio in both directions with frame-level logging and diagnostics.',
    href: '/voice',
    chips: ['Ephemeral tokens', 'Live captions', 'Latency traces'],
  },
  {
    title: 'Multi-agent Chatwork',
    description: 'Prototype task routing between planners, solvers, and MCP tools. Structured output and event stream debugging come for free.',
    href: '/chat',
    chips: ['Agent graphs', 'Streaming events', 'Tool telemetry'],
  },
  {
    title: 'Connector Observatory',
    description: 'Audit the MCP catalog before you deploy. Filter schemas, confirm auth, and watch request/response pairs in real time.',
    href: '/tools',
    chips: ['Schema diffing', 'Health checks', 'OAuth-ready'],
  },
];

type MediaItem = {
  label: string;
  title: string;
  details: string;
  chips: string[];
};

const mediaGallery: MediaItem[] = [
  {
    label: 'Hero visual',
    title: 'Realtime control room render',
    details: 'Preferred: layered 3D render or cinematic screenshot (transparent PNG or WebP) at 1440×900. Think glass dashboard with waveforms + tool telemetry.',
    chips: ['Primary canvas', 'Dark background', 'Subtle motion ready'],
  },
  {
    label: 'Product screenshot',
    title: 'Multi-agent chat timeline',
    details: 'High-res UI capture (min 1280×880) showing multi-agent conversation, streaming events, tool invocations. Clean chrome, no personal data.',
    chips: ['Show tool calls', 'Include timestamps', 'Use brand palette'],
  },
  {
    label: 'Illustration slot',
    title: 'MCP integrations montage',
    details: 'Vector illustration or collage (min 1200×900 SVG/PNG) highlighting connectors (GitHub, Linear, Notion, etc.) orbiting Dexter core glyph.',
    chips: ['Iconography', 'Constellation motif', 'Export SVG'],
  },
];

const howItWorks = [
  {
    label: 'Step 01',
    title: 'Authenticate in one tap',
    description: 'Use a Supabase magic link to activate your workspace. Dexter issues the credentials needed for both chat and voice sessions.',
  },
  {
    label: 'Step 02',
    title: 'Pick your modality',
    description: 'Jump into realtime voice for ambient conversations or open the multi-agent console for structured workflows—it’s the same brain underneath.',
  },
  {
    label: 'Step 03',
    title: 'Extend with MCP',
    description: 'Dexter registers your MCP server so every agent can reach into your proprietary tools. Observability panels keep you confident in production.',
  },
];

export default function Home() {
  return (
    <>
      <section className="section hero">
        <div className="hero__copy">
          <div className="hero-chip-row">
            <div className="hero-chip">Realtime · Voice · Chat · MCP</div>
            <div className="hero-chip">Alpha program now enrolling</div>
          </div>
          <h1>Build the agent workspace your team actually uses.</h1>
          <p>
            Dexter blends realtime voice, fast multi-agent chat, and first-class MCP integrations into one adaptive cockpit. Design conversations, ship
            automations, and watch every frame as it happens.
          </p>
          <div className="hero__actions">
            <Link href="/chat" className="button button--primary">Launch Dexter</Link>
            <Link href="/voice" className="button">Hear the Realtime demo</Link>
          </div>
          <div className="stats-bar">
            {stats.map((item) => (
              <div key={item.label} className="stat">
                <span>{item.value}</span>
                <span className="text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero-chip-row">
            <div className="hero-chip">Live session</div>
            <div className="hero-chip">GPT Realtime · alloy voice</div>
          </div>
          <div className="media-placeholder media-placeholder--hero">
            <div className="media-placeholder__label">Hero visual slot</div>
            <div className="media-placeholder__title">Realtime control room render</div>
            <div className="media-placeholder__details">
              1440×900 PNG/WebP · transparent background · layered if possible. Keep lighting moody with vibrant accents on waveforms and tool cards.
            </div>
            <div className="media-placeholder__chips">
              <div className="media-placeholder__chip">Supports parallax</div>
              <div className="media-placeholder__chip">Use brand blues</div>
              <div className="media-placeholder__chip">Light highlights</div>
            </div>
          </div>
          <div className="hero-activity">
            <div className="hero-activity__row">
              <strong>Agent</strong>
              <span>“Ready when you are.”</span>
            </div>
            <div className="hero-activity__row">
              <strong>User</strong>
              <span>“Draft a customer follow-up and schedule the call.”</span>
            </div>
            <div className="hero-activity__row">
              <strong>Tools</strong>
              <span>calendar.schedule() · crm.lookup()</span>
            </div>
            <div className="hero-activity__row">
              <strong>Latency</strong>
              <span>1.9s round trip</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Everything your agents need, in one cockpit.</h2>
          <p>No more hopping between debug UIs. Dexter wraps voice, chat, and tooling in a cohesive, instrumented surface designed for iteration.</p>
        </div>
        <div className="grid-cards">
          {capabilityCards.map((card) => (
            <div key={card.title} className="card">
              <div className="hero-chip-row">
                {card.chips.map((chip) => (
                  <div key={chip} className="chip">{chip}</div>
                ))}
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <Link href={card.href} className="button button--ghost" style={{ justifySelf: 'flex-start' }}>
                Open {card.title.split(' ')[0]}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Asset wishlist for the design crew.</h2>
          <p>Drop these exports into <code>public/media</code> with matching file names. We can wire them into the hero and galleries as soon as they land.</p>
        </div>
        <div className="media-gallery">
          {mediaGallery.map((item) => (
            <div key={item.title} className="media-gallery__item">
              <div className="media-placeholder media-placeholder--wide">
                <div className="media-placeholder__label">{item.label}</div>
                <div className="media-placeholder__title">{item.title}</div>
                <div className="media-placeholder__details">{item.details}</div>
                <div className="media-placeholder__chips">
                  {item.chips.map((chip) => (
                    <div key={chip} className="media-placeholder__chip">{chip}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>How Dexter slots into your stack.</h2>
          <p>From first login to production tools, the workflow stays predictable. Bring your own MCP server and Dexter keeps the wiring tidy.</p>
        </div>
        <div className="timeline">
          {howItWorks.map((step) => (
            <div key={step.title} className="timeline-step">
              <strong>{step.label}</strong>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="final-cta">
          <h2>Ready to see Dexter in action?</h2>
          <p className="text-muted">
            Request access, plug in your MCP server, and start testing realtime voice or multi-agent chat in minutes.
          </p>
          <div className="hero__actions" style={{ justifyContent: 'center' }}>
            <Link href="/link" className="button button--primary">Connect your account</Link>
            <Link href="/tools" className="button">Browse MCP tools</Link>
          </div>
        </div>
      </section>
    </>
  );
}
