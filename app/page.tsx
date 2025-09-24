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
  { value: '≤2s', label: 'Avg voice turnaround' },
  { value: '20+ tools', label: 'Swaps · intel · wallets' },
  { value: 'Pump.fun aware', label: 'Understands live rooms' },
];

const promisePillars: PromisePillar[] = [
  {
    title: 'One console to trade and brief',
    description:
      'Speak the intent and Dexter handles quoting, swapping, settling, and narrating receipts while you watch it all land in the console.',
    bullets: ['Realtime swap and order routing with confirmations', 'Balances and positions surfaced mid-convo', 'Follow-up summaries voiced back in seconds'],
  },
  {
    title: 'Signal from Pump.fun and the market',
    description:
      'Dexter listens to live rooms, scrapes sentiment, and condenses what’s actually happening so you react before the timeline does.',
    bullets: ['Room-level rundowns beyond simple viewer counts', 'Token dossiers with social + on-chain indicators', 'Cross-exchange scanners for the next move'],
  },
  {
    title: 'Guardrails that travel with you',
    description:
      'Supabase identity, wallet scopes, and per-session transcripts keep trading accountable whether you’re guest, Pro, or holding $DEXTER.',
    bullets: ['Per-user wallet and approval flows', 'Guest · Pro · Holder access lanes', 'Tool receipts + session logs for every call'],
  },
];

const liveSurfaces: LiveSurface[] = [
  {
    label: 'Voice cockpit',
    title: 'Talk once, see it executed',
    description:
      'Waveforms, captions, and confirmations animate while Dexter completes swaps, pulls intel, or files follow-up tasks.',
  },
  {
    label: 'Agent timeline',
    title: 'Specialists with receipts',
    description:
      'Planner, trader, analyst — every handoff is logged with the tool output so you always know who did what.',
  },
  {
    label: 'Research board',
    title: 'Live market radar',
    description:
      'Track Pump.fun launches, token health, and news briefs without leaving the session.',
  },
];

const toolsets: Toolset[] = [
  {
    name: 'Execution',
    blurb: 'Swap, bridge, settle, and confirm in one breath while Dexter streams the receipts back to you.',
  },
  {
    name: 'Pump.fun Intel',
    blurb: 'Room summaries, influencer tracking, and sentiment so you know the play inside every stream.',
  },
  {
    name: 'Market Research',
    blurb: 'Token dossiers, OHLCV overlays, and curated web intel when you ask for the next move.',
  },
  {
    name: 'Knowledge Base',
    blurb: 'Search and retrieve the entire Dexter playbook mid-convo, then pin highlights for later.',
  },
  {
    name: 'Wallet Automation',
    blurb: 'Multi-wallet management, overrides, and approvals tailored to how you actually trade.',
  },
  {
    name: 'Builder Hooks',
    blurb: 'Soon: publish your own MCP bundles so Dexter can call into your stack on command.',
  },
];

const tiers: TierPlan[] = [
  {
    title: 'Guest',
    price: 'Free',
    description: 'Jump in, talk to Dexter, and see the live demo wallet in action.',
    perks: ['Voice sandbox with curated tools', 'Pump.fun room snapshots', 'Session transcripts emailed to you'],
  },
  {
    title: 'Pro',
    price: '$49/mo',
    description: 'Personal wallets, deeper research, and multiple portfolios coming online.',
    perks: ['Connect and rotate multiple wallets', 'Full market + Pump.fun intelligence', 'Priority realtime lanes and support', 'Early access to automation drops'],
  },
  {
    title: 'Dexter Holders',
    price: '≥1M $DEXTER',
    description: 'Hold the token and the platform opens up — no monthly invoice.',
    perks: ['All Pro privileges', 'Expanded usage limits*', 'Invite-only tool experiments', 'Influence roadmap decisions'],
  },
];

const holderFootnote = '*Unlimited sessions subject to generous, common-sense abuse protections.';

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
          <h1>Your voice is the command line.</h1>
          <p>
            Dexter is the do-it-all crypto console — speak once and it swaps, researches markets, briefs you on Pump.fun streams, and confirms every move in
            real time.
          </p>
          <div className="hero__actions">
            <Link href="https://beta.dexter.cash" className="button button--primary" target="_blank" rel="noreferrer">
              Launch Dexter
            </Link>
            <Link href="/tools" className="button">View capabilities</Link>
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
          <p>Dexter’s MCP catalog keeps expanding — voice sessions, future chat, and automations all inherit the same power.</p>
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
          <p>Start free, upgrade when you need personal wallets, or hold $DEXTER for practically unlimited access.</p>
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
        <p className="helper-text" style={{ marginTop: '24px' }}>{holderFootnote}</p>
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
          <h2>Ready when you are.</h2>
          <p className="text-muted">
            Fire up the beta, try the voice agent, and see how fast trading feels when Dexter runs point. Builders — wire in your MCP tools and watch them
            surface instantly.
          </p>
          <div className="hero__actions" style={{ justifyContent: 'center' }}>
            <Link href="https://beta.dexter.cash" className="button button--primary" target="_blank" rel="noreferrer">
              Launch Dexter
            </Link>
            <Link href="/tools" className="button">Explore capabilities</Link>
          </div>
        </div>
      </section>
    </>
  );
}
