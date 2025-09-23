import Link from 'next/link';

type PromisePillar = {
  title: string;
  description: string;
  bullets: string[];
};

type LiveSurface = {
  label: string;
  title: string;
  description: string;
};

type Toolset = {
  name: string;
  blurb: string;
};

type TierPlan = {
  title: string;
  price: string;
  description: string;
  perks: string[];
};

type Differentiator = {
  heading: string;
  copy: string;
};

const heroHighlights = [
  { value: '≤2s', label: 'Avg. voice turnaround' },
  { value: '12+ tools', label: 'Crypto + research arsenal' },
  { value: 'Wallet-native', label: 'Trade with your own keys' },
];

const promisePillars: PromisePillar[] = [
  {
    title: 'Trade with your voice',
    description:
      'Dexter hears you, routes to the right agent, and executes wallet actions in real time — no tabs, no delays.',
    bullets: ['Instant market + limit orders', 'Live position updates', 'Visual confirmations on beta.dexter.cash'],
  },
  {
    title: 'Read markets before they move',
    description:
      'Ask for Pump.fun surges, token health, or curated web intel. Dexter pulls charts, on-chain context, and sentiment streams while you talk.',
    bullets: ['PumpStreams heat map', 'On-demand token dossiers', 'Web + social scouting'],
  },
  {
    title: 'Built-in guardrails',
    description:
      'Supabase identity plus Dexter-issued MCP tokens keep every call scoped to you. Guests stay in demo mode, holders unlock more firepower.',
    bullets: ['Supabase auth & activity logs', 'Guest vs. Pro vs. Holder tiers', 'Optional JWT-per-user tools'],
  },
];

const liveSurfaces: LiveSurface[] = [
  {
    label: 'Voice cockpit',
    title: 'Talk, see, and confirm in seconds',
    description:
      'Realtime captions, latency traces, and waveform playback keep you in control while Dexter executes trades or research tasks.',
  },
  {
    label: 'Agent timeline',
    title: 'Multi-agent chat with receipts',
    description:
      'Watch planners hand off to specialists for trading, wallet research, or report writing. Every tool call and MPC step lands in the timeline.',
  },
  {
    label: 'Research board',
    title: 'Crypto intel on tap',
    description:
      'Drop tokens into a watch list, stream Pump.fun liquidity, and pull live decks your community can act on.',
  },
];

const toolsets: Toolset[] = [
  {
    name: 'Wallet Ops',
    blurb: 'Create wallets, list balances, switch funding sources, and queue approvals via Dexter’s managed MPC bridge.',
  },
  {
    name: 'PumpStreams',
    blurb: 'Surface trending launches, track influencers, and catch liquidity spikes before they go viral.',
  },
  {
    name: 'Market Radar',
    blurb: 'Quote any token, fetch OHLCV, and overlay social + web sentiment to decide faster.',
  },
  {
    name: 'Web Scout',
    blurb: 'Targeted web + doc search that compiles summaries and links into shareable briefs.',
  },
  {
    name: 'Memory & Recall',
    blurb: 'Pin strategies, wallets, and call scripts so your agent remembers context next session.',
  },
  {
    name: 'Automation Hooks',
    blurb: 'Webhook callbacks and upcoming token-gated triggers wire Dexter into your trading stack.',
  },
];

const tiers: TierPlan[] = [
  {
    title: 'Guest',
    price: 'Free',
    description: 'Hands-on demo mode for curious explorers.',
    perks: ['Realtime voice sandbox', 'Shared demo wallet', 'Pump.fun watcher previews'],
  },
  {
    title: 'Pro',
    price: '$49/mo',
    description: 'Power users who need live wallets, deeper research, and faster limits.',
    perks: ['Connect personal wallets', 'Full PumpStreams + market radar', 'Priority realtime lanes', 'Early token feature drops'],
  },
  {
    title: 'Dexter Holders',
    price: 'Token gated',
    description: 'Stake enough $DEXTER to unlock practically unlimited access.',
    perks: ['All Pro benefits', 'Custom toolset slots', 'Governance over new automations', 'Higher trading caps & storage'],
  },
];

const differentiators: Differentiator[] = [
  {
    heading: 'Voice-native, not voice-added',
    copy: 'GPT Realtime powers conversational control, while our Agents stack routes tasks to specialists. No other platform ships this depth of crypto tooling over live audio.',
  },
  {
    heading: 'Per-user security baked in',
    copy: 'Supabase auth, Dexter-issued MCP JWTs, and wallet scopes mean every trade and fetch is attributable. Guests stay sandboxed; your keys only move when you say so.',
  },
  {
    heading: 'Extensible marketplace future',
    copy: 'Third-party builders can publish toolsets into Dexter MCP. Voice, chat, and automations instantly inherit new skills without you wiring anything.',
  },
];

export default function Home() {
  return (
    <>
      <section className="section hero">
        <div className="hero__copy">
          <div className="hero-chip-row">
            <div className="hero-chip">Voice trading · Crypto copilots</div>
            <div className="hero-chip">Beta now live on beta.dexter.cash</div>
          </div>
          <h1>Voice-first trading for the crypto obsessed.</h1>
          <p>
            Dexter hears you, calls the right specialist, and moves money in real time. Speak the order, get intel, and watch the console confirm trades,
            charts, and wallets in seconds.
          </p>
          <div className="hero__actions">
            <Link href="https://beta.dexter.cash" className="button button--primary" target="_blank" rel="noreferrer">
              Launch Beta Console
            </Link>
            <Link href="/voice" className="button">Preview the voice surface</Link>
          </div>
          <div className="stats-bar">
            {heroHighlights.map((item) => (
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
            <div className="hero-chip">GPT Realtime · wallet control</div>
          </div>
          <div className="media-placeholder media-placeholder--hero">
            <div className="media-placeholder__label">Preview</div>
            <div className="media-placeholder__title">Voice cockpit & agent timeline</div>
            <div className="media-placeholder__details">
              Swap this block for your favourite beta.dexter.cash capture — waveform playback, wallet balances, and PumpStreams charts all look 🔥 here.
            </div>
            <div className="media-placeholder__chips">
              <div className="media-placeholder__chip">1440×900 PNG/WebP</div>
              <div className="media-placeholder__chip">Dark UI · neon accents</div>
              <div className="media-placeholder__chip">Supports subtle motion</div>
            </div>
          </div>
          <div className="hero-activity">
            <div className="hero-activity__row">
              <strong>You</strong>
              <span>“Buy 3 ETH worth of the latest Pump.fun rocket and show me the chart.”</span>
            </div>
            <div className="hero-activity__row">
              <strong>Dexter</strong>
              <span>Routes trade → fetches PumpStreams intel → confirms wallet balances.</span>
            </div>
            <div className="hero-activity__row">
              <strong>Latency</strong>
              <span>1.7s round trip</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Why traders love Dexter</h2>
          <p>Every surface is tuned for fast crypto decisions, whether you’re farming alpha or running a community.</p>
        </div>
        <div className="pillar-grid">
          {promisePillars.map((pillar) => (
            <div key={pillar.title} className="pillar-card">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <ul>
                {pillar.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Live surfaces shipping in beta</h2>
          <p>Dexter Agents power the experiences on <strong>beta.dexter.cash</strong>. Here’s what you get today.</p>
        </div>
        <div className="surface-grid">
          {liveSurfaces.map((surface) => (
            <div key={surface.title} className="surface-card">
              <span className="surface-card__label">{surface.label}</span>
              <h3>{surface.title}</h3>
              <p>{surface.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>The tool arsenal keeps growing</h2>
          <p>Dexter MCP hosts battle-tested bundles. Voice, chat, and automations can tap them instantly.</p>
        </div>
        <div className="tool-grid">
          {toolsets.map((tool) => (
            <div key={tool.name} className="tool-card">
              <strong>{tool.name}</strong>
              <p>{tool.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--tiers">
        <div className="section-heading">
          <h2>Choose your lane</h2>
          <p>Start free, upgrade when you need personal wallets, or stake $DEXTER for limitless sessions.</p>
        </div>
        <div className="tier-grid">
          {tiers.map((tier) => (
            <div key={tier.title} className="tier-card">
              <div className="tier-card__header">
                <span className="pill">{tier.title}</span>
                <span className="tier-card__price">{tier.price}</span>
              </div>
              <p>{tier.description}</p>
              <ul>
                {tier.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="section-heading">
          <h2>What makes Dexter different</h2>
          <p>It’s not just another chat bot — it’s a full stack built for crypto execution.</p>
        </div>
        <div className="differentiator-grid">
          {differentiators.map((item) => (
            <div key={item.heading} className="differentiator-card">
              <h3>{item.heading}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section final-section">
        <div className="final-cta">
          <h2>Your voice is all you need.</h2>
          <p className="text-muted">
            Open the beta console, connect a wallet, and feel what conversational trading is supposed to be. Builders — bring your own toolsets and Dexter
            will make them sing.
          </p>
          <div className="hero__actions" style={{ justifyContent: 'center' }}>
            <Link href="https://beta.dexter.cash" className="button button--primary" target="_blank" rel="noreferrer">
              Enter beta.dexter.cash
            </Link>
            <Link href="/tools" className="button">Preview MCP catalog</Link>
          </div>
        </div>
      </section>
    </>
  );
}
