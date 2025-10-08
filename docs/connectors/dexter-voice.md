# Dexter Voice

Dexter Voice is the flagship realtime surface for routing trades, logging evidence, and keeping operators in the flow without a keyboard. A single spoken directive is enough for Dexter to confirm the assets involved, execute across the managed wallet, and drop audit-ready receipts in the channels your team trusts.

## What you get out of the box

| Capability | What it does | Powered by |
|------------|--------------|------------|
| **Intent capture** | Live transcription with entity extraction for assets, quantity, side, counterparty, and follow-up tasks. | OpenAI Realtime API + Dexter prompt profiles |
| **Execution routing** | Fetches quotes, chooses the best Solana route, executes via managed wallet, and narrates fills aloud. | `dexter-api` trade services & MCP `solana_*` tools |
| **Compliance receipts** | Generates a structured recap (transcript, signature, fills, guardrails) and posts it to Supabase + your workspace webhook. | `dexter-api` receipts + automation webhooks |
| **Session memory** | Persists conversation context so users can ask “what did we do earlier?” or resume after a disconnect. | Supabase session store |
| **Supervision hooks** | Ties into the Chat supervisor for escalations, manual approvals, or fallback to typed mode. | `dexter-agents` supervisor config |

Latency from command to confirmation averages **700–900 ms** on Solana execution paths, even when transcripts run longer than one sentence. If a session detects adverse latency (network or execution), the UI surfaces an inline warning so the operator can fall back to typed mode.

---

## Prerequisites

Before turning on Dexter Voice for a workspace, line up the following:

1. **Supabase project access** – You need service-role credentials with the `profiles`, `sessions`, and `receipts` tables available. The frontend only ever sees the anon key; server-side jobs use the service key.
2. **Managed wallet inventory** – Make sure the user (or demo guest) has at least one managed wallet provisioned through `dexter-api`. Voice trading always executes against managed custody.
3. **OpenAI Realtime model** – Production uses `gpt-4o-realtime-preview-2024-08-06`. Update `OPENAI_REALTIME_MODEL` if you want a different release.
4. **Turnstile/Recaptcha** – The public beta requires a Cloudflare Turnstile site key to keep drive-by attacks out of the mic surface.
5. **MCP bearer** – The hosted MCP transport must recognise the JWT you pass from `dexter-api`. Set `TOKEN_AI_MCP_TOKEN` (for guests) and `MCP_JWT_SECRET` (for logged-in users).

### Environment flags

| Service | Variable | Purpose |
|---------|----------|---------|
| `dexter-api` | `OPENAI_REALTIME_API_KEY`, `OPENAI_REALTIME_MODEL`, `VOICE_TURNSTILE_SECRET` | Session minting |
| `dexter-fe` | `NEXT_PUBLIC_ENABLE_VOICE`, `NEXT_PUBLIC_API_ORIGIN`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | UX feature flags |
| `dexter-mcp` | `TOKEN_AI_MCP_TOOLSETS=wallet,solana,general`, `TOKEN_AI_MCP_TOKEN`, `MCP_JWT_SECRET` | Tool execution |

---

## Setup checklist

1. **Update environment**  
   - In `dexter-api/.env`, ensure the OpenAI key/model are set and that `VOICE_ENABLED=1`.  
   - In `dexter-fe/.env.local`, confirm `NEXT_PUBLIC_ENABLE_VOICE=true`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your key>`, and the API origin.

2. **Provision access in Supabase**  
   - Add the Dexter Voice callback URL (`https://beta.dexter.cash/voice`) to the Supabase allowed redirect list.  
   - Verify the profile row for each user includes a `tier` of `pro` or `internal` if you’re gating execution.

3. **Grant MCP access**  
   - In `dexter-mcp`, ensure the wallet and Solana toolsets are enabled.  
   - Add the bearer to `TOKEN_AI_MCP_TOKEN` for guest/testing flows. For production users, rely on the JWT minted by `dexter-api`.

4. **Smoke test locally**  
   - Run `npm run dev` in `dexter-fe`, sign in with Supabase (or guest mode), open `/voice`, and complete the mic permission prompt.  
   - Speak “Dexter, buy 0.5 SOL of BONK and send the receipts to email.” You should hear the confirmation and see the transcript appear alongside the live waveform.
   - Confirm an execution record shows up in the managed wallet, and that a receipt lands in Supabase + the configured webhook.

5. **Flip the feature flag**  
   - In production, set `NEXT_PUBLIC_ENABLE_VOICE=true` in the PM2 environment for `dexter-fe`.  
   - Update the home CTA if you want to promote the voice beta (handled by PM2 restart).

---

## How a session flows

1. **Client requests session**  
   `dexter-fe` calls `POST /realtime/sessions` on `dexter-api`, optionally passing the Supabase access token so the API can attach identity metadata.

2. **Token minting & tool allowlist**  
   `dexter-api` composes tool access based on the user tier, fetches a session from OpenAI’s Realtime API, and returns the ephemeral token + Dexter session metadata back to the browser.

3. **Mic activation**  
   The frontend obtains mic permission, opens the WebRTC connection to OpenAI, and begins streaming transcribed partials to the UI.

4. **Intent confirmation**  
   The Voice agent repeats entities back to the user: “Confirm: buy 12.5 SOL worth of JUP from the Treasury wallet?”  
   - Saying “Yes” (or the pre-configured hotkey) moves execution forward.  
   - Saying “Cancel” aborts the trade and drops a note in the transcript.

5. **Execution + narration**  
   The agent calls MCP `solana_swap_execute` (or the relevant tool), narrates route and fills, and keeps the typed transcript updated.

6. **Receipts**  
   Once the tool resolves, `dexter-api` writes the receipt to Supabase, triggers the webhook, and sends a structured summary back through the Realtime session so the UI can show the “Trade complete” card.

7. **Session wrap**  
   Users can ask follow-up questions (“What did we just pay in fees?”) before hanging up, or they can leave the mic open for the next command. Idle sessions auto-expire after **90 seconds** of silence.

---

## Operational controls

- **Mic hotkeys** – Press `Space` to toggle the mic. Holding `Space` records only while pressed (“push-to-talk” mode).  
- **Sensitivity slider** – Use the gear icon in the Voice UI to adjust noise gating if you’re in a loud environment.  
- **Fallback to chat** – If the network or OpenAI endpoint flaps, the UI prompts the operator to open `/chat` with the same context.  
- **Supervisor escalation** – Say “Escalate to supervisor” to pass control to the typed supervisor agent (handy for large or multi-leg trades).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| **“Mic locked by another app”** warning | Browser denied `getUserMedia` | Close other mic-using tabs/apps, refresh, accept permission prompt. |
| **Realtime session rejected (401)** | Missing or expired OpenAI session token | Ensure `dexter-api` has the correct realtime API key and that the client requested a fresh session (`/realtime/sessions`). |
| **Execution hangs after confirmation** | MCP transport unreachable or wallet lacks balance | Check `dexter-mcp` logs; verify the managed wallet has enough SOL and that MCP bearer/JWT is valid. |
| **Receipts not appearing** | Supabase row insert failed or webhook misconfigured | Inspect `dexter-api` logs, confirm Supabase service key in PM2 env, and re-run webhook tests (`npm run harness`). |
| **Operator hears duplicate confirmations** | Echo / mic sensitivity | Toggle “Noise Gate” in the Voice UI or ask the operator to use push-to-talk. |

---

## Launch checklist

1. ✅ Supabase redirect + env values set  
2. ✅ MCP toolsets enabled (`wallet`, `solana`, `general`)  
3. ✅ Managed wallet funded with at least 0.2 SOL for demo fallback  
4. ✅ Cloudflare Turnstile keys configured (site key + secret)  
5. ✅ Realtime session smoke test passed (buy + sell cycle)  
6. ✅ Receipts delivered to inbox/webhook recipients  
7. ✅ Ops runbook updated with support contact (voice@dexter.cash)  
8. ✅ PM2 environments reloaded (`pm2 restart dexter-fe --update-env`)  

Do not roll the feature to production users until the checklist is green. For internal dry runs, set `NEXT_PUBLIC_ENABLE_VOICE` only on the beta PM2 process (`dexter-fe-dev`).

---

## Learn more

- [Quick Start for Users](../welcome/quick-start-users.md) – onboarding flow with mic permissions and first trade.  
- [API Reference](../appendix/api-reference.md) – endpoints used during the voice session lifecycle.  
- [Troubleshooting Harness](../../cli/realtime-harness/README.md) – scripted flows that validate the voice surface before launches.

Need help? Drop a note in `#dexter-voice` or email support@dexter.cash with the session ID shown in the transcript footer. We use those IDs to pull the full MCP + realtime logs.  
