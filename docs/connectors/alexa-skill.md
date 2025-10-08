# Alexa Skill

Dexter’s Alexa Skill acts as a voice “concierge” for managed-wallet holders who want quick portfolio checks or to trigger pre-approved actions from any Alexa-enabled device. It does **not** execute open-ended trades; instead it surfaces account state, routes simple rebalance macros, and hands off to Dexter Voice for anything that needs the trading desk.

---

## Capabilities

| Category | Examples | Notes |
|----------|----------|-------|
| **Portfolio insight** | “Alexa, ask Dexter how much SOL I have.” | Returns balances using the same MCP wallet resolver as the web app. |
| **Price checks** | “Alexa, ask Dexter for the price of JUP.” | Quotes are sourced from the `solana_resolve_token` + price endpoints and cached for 30 seconds. |
| **Alerts** | “Alexa, tell Dexter to notify me if BONK drops 10 percent.” | Registers an alert in `dexter-api`; notifications go to email + push when configured. |
| **Rebalance macros** | “Alexa, instruct Dexter to run the Friday rebalance.” | Executes pre-authored macros (buy/sell sets) that were approved in Dexter Voice or the web console. |
| **Session handoff** | “Alexa, open Dexter Voice.” | Sends a push link to the operator’s phone or launches the `/voice` session on supported devices. |

Anything not whitelisted triggers a polite “Let me connect you to Dexter Voice” fallback.

---

## Requirements

1. **Alexa developer account** with a published skill (household deployment can stay in beta).  
2. **Dexter account** with at least one managed wallet and the Alexa channel enabled.  
3. **Supabase user** flagged with `channels.alexa = true`. Toggle via the `profiles` table or the admin tool in `dexter-ops`.  
4. **OAuth client** (Login with Amazon) configured to point at `https://api.dexter.cash/oauth/alexa/callback`.  
5. **MCP bearer** or JWT so the skill can call `dexter-api` on behalf of the authenticated user.

---

## Configure the skill

1. **Create the skill shell**  
   - Log into the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask).  
   - Choose **Custom** skill type → **Provision your own** backend.  
   - Set the default language(s) you support (we ship with EN-US voice prompts).

2. **Link Dexter as the account provider**  
   - Under **Build → Account Linking**, set Authorization Grant type.  
   - Authorization URI: `https://api.dexter.cash/oauth/alexa/authorize`  
   - Access Token URI: `https://api.dexter.cash/oauth/alexa/token`  
   - Client ID/Secret: generate via `dexter-api` (`node scripts/create-oauth-client.mjs alexa`).  
   - Scope: `wallet:read wallet:macro alerts:write profile`.

3. **Install the intent schema**  
   - Copy `/docs/assets/alexa/intents.json` (generated from `cli/alexa/generate-intents.mjs`).  
   - Import the sample utterances to cover base phrases like “ask Dexter…”, “tell Dexter…”, etc.

4. **Deploy the Lambda (or HTTPS endpoint)**  
   - We host the skill backend inside `dexter-api` under `/lambda/alexa`. If you prefer AWS Lambda, deploy `cli/alexa/lambda.zip` and set the endpoint there.  
   - Environment variables required:  
     ```
     ALEXA_SKILL_ID=<skill-id>
     ALEXA_SIGNING_SECRET=<secret for request validation>
     ALEXA_EVENT_WEBHOOK=<optional Slack/Discord webhook>
     ```

5. **Enable a test account**  
   - In the Alexa console, under **Test**, switch to `Development` and enable the skill for your Amazon account.  
   - On your Alexa device (or the Alexa app), link the skill using the OAuth flow. You’ll sign in with your Dexter email and approve the scopes.

---

## Certification checklist

Amazon certification expects the following before a public launch:

1. **Privacy & data use statement** – Publish a short page (we use `https://dexter.cash/legal/alexa`) describing what data you store and how to delete the account.  
2. **Sample dialogues** – Supply 5–7 sample utterances with expected responses in the Certification form.  
3. **Account linking video** – Record a screen capture of the Dexter OAuth flow, from “Link account” to the confirmation screen.  
4. **Error handling** – Verify that invalid intents, microphone failures, or downed services return friendly responses (“I’m having trouble reaching Dexter right now. Try again in a few minutes.”).  
5. **Regional availability** – If you only support EN-US, disable other locales in the console.

Use the certification sandbox to rerun the smoke tests: portfolio readouts, price quotes, macro trigger, and escalation to Dexter Voice.

---

## Voice prompts you should test

- **Balance check** – “Alexa, ask Dexter how much SOL I have in the treasury wallet.”  
- **Price check** – “Alexa, tell Dexter to give me the price of RENDER.”  
- **Alert registration** – “Alexa, ask Dexter to alert me if SOL drops below ninety dollars.”  
- **Macro execution** – “Alexa, ask Dexter to run the hedging macro.”  
- **Unsupported action** – “Alexa, ask Dexter to buy BONK right now.” (should hand off to Dexter Voice)

The CLI harness includes an emulator for these prompts: `npm run harness -- --scenario alexa`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Skill replies “I can’t find your Dexter account.” | Confirm the linked email matches a Supabase user with `channels.alexa = true`. |
| “401 Unauthorized” in CloudWatch logs | Check that the OAuth client secret in Alexa matches the one provisioned in `dexter-api`. Regenerate if in doubt. |
| Delayed or missing portfolio data | `dexter-api` caches wallet snapshots for one minute. Force refresh by calling `POST /api/wallets/refresh` (requires internal token). |
| Macro triggers but no trades | Ensure the macro was approved in Dexter Voice and has remaining quota. See `dexter-api` → `/automations/run`. |
| Certification rejection (privacy policy) | Confirm the published privacy URL includes Alexa-specific data handling language. Template lives in `docs/internal/legal`. |

---

## Retirement and support

If you sunset the skill, disable account linking in the Alexa console, then call `DELETE /oauth/clients/:id` in `dexter-api` to invalidate remaining refresh tokens. Users can remove the skill from their Alexa app at any time.

For support, email **voice@dexter.cash** or ping `#dexter-voice` with the Alexa request ID reported in the logs.  
