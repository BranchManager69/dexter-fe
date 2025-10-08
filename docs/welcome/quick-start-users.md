# Quick Start (Users)

Welcome to Dexter. This guide walks new operators through the first 30 minutes—from logging in to running the first voice trade and wiring alerts. Follow the checklist in order. Each step links to deeper docs if you need more detail.

---

## 1. Sign in & secure your account

1. Visit **https://beta.dexter.cash**.  
2. Complete the Turnstile challenge and request a magic link with your work email.  
3. Click the link within 10 minutes; you’ll be redirected back into Dexter with a Supabase session.  
4. Open **Settings → Security** and enable:  
   - **Passkey or TOTP backup** (recommended)  
   - **Session alerts** so ops sees when new devices log in.

> **Tip:** The session drawer (top-right avatar → “Devices”) shows every browser currently logged in. Sign out anything you don’t recognise.

---

## 2. Confirm managed wallets

1. Navigate to **Wallets** from the sidebar.  
2. You should see at least one managed wallet (“Treasury”, “Vault”, etc.).  
3. If a wallet is missing, ping your admin—they can provision one via `dexter-api`.  
4. Click a wallet to view balances and recent receipts. This confirms MCP access works.

---

## 3. Enable connectors you care about

You can use the web UI exclusively, but most teams link at least one connector.

- **Dexter Voice:** Toggle “Enable Voice” in the footer CTA, grant microphone permissions, and run the onboarding tutorial.  
- **ChatGPT:** Follow the [ChatGPT connector guide](../connectors/chatgpt-connector.md) and ensure the GPT shows up under Saved GPTs.  
- **Claude:** Add the MCP server in Claude Workbench per the [Claude connector guide](../connectors/claude-connector.md).  
- **Alexa:** Optional, for hands-free status checks—see the [Alexa Skill guide](../connectors/alexa-skill.md).

You can enable multiple connectors; each one shares the same managed wallets and alert settings.

---

## 4. Run the voice tutorial

1. Open **/voice** and choose **“Run warm-up tutorial.”**  
2. Dexter walks through:  
   - Mic sensitivity calibration  
   - A mock confirmation cycle  
   - A simulated swap with fake amounts  
3. The tutorial ends with a checklist confirming audio, transcription, and confirmation all passed.

If any section fails, follow the troubleshooting prompts or file a ticket in `#dexter-support`.

---

## 5. Execute a live trade (demo mode)

1. Still on **/voice**, click **Use demo wallet**.  
2. Say: “Buy 0.1 SOL of JUP from the demo wallet and send me the receipt.”  
3. Dexter will confirm the intent, execute on Solana, and speak the result.  
4. Verify:  
   - A receipt card appears in the UI.  
   - `/wallets/demo` shows the updated balance.  
   - You received an email recap (if configured).

You can repeat the flow in `/chat` to see the same execution in text form.

---

## 6. Configure alerts & macros

1. Open **Automations → Alerts**. Add at least one price alert (e.g., “SOL < $90”).  
2. Switch to **Automations → Macros**. Import the starter macro pack or create your own multi-step workflow.  
3. For any macro that should be voice-triggered, toggle “Allow voice execution.” Dexter will then recognise phrases such as “run the hedging macro.”

---

## 7. Lock down notifications

1. Head to **Settings → Notifications**.  
2. Choose your delivery channels: email, Slack/Discord webhook, or in-app only.  
3. Set quiet hours if you’re part of a follow-the-sun desk. During quiet hours, Dexter escalates to your backup contact.

---

## 8. Learn the guardrails

Dexter enforces a few defaults:

- **Size guard** – Trades over your configured notional require supervisor approval.  
- **Panic phrases** – Saying “cancel” or “pause trading” halts all open macros until re-enabled.  
- **Compliance copy** – Every voice session auto-forwards to compliance@dexter.cash.

You can review or override guardrails under **Settings → Guardrails**.

---

## 9. Know where to get help

- **In-product:** click the question mark icon → “Report an issue”.  
- **Slack:** `#dexter-support` (24/5 coverage).  
- **Email:** support@dexter.cash.  
- **Status:** https://status.dexter.cash for realtime uptime.

When reporting a problem, include:

- Session ID (bottom of the transcript).  
- Time and connector used (Voice, ChatGPT, etc.).  
- What you expected vs. what happened.

---

## Checklist recap

- [x] Logged in and secured the account  
- [x] Confirmed managed wallet access  
- [x] Enabled desired connectors  
- [x] Completed voice tutorial  
- [x] Ran first demo trade  
- [x] Configured alerts/macros  
- [x] Tuned notifications and guardrails  
- [x] Stored support contacts

Once you’ve ticked those boxes you’re ready to trade live with Dexter. Next, explore the [Voice deep dive](../connectors/dexter-voice.md) or the [Tokenomics overview](dexter-tokenomics.md) to understand where the platform is headed.  
