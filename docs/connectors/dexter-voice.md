# Dexter Voice

Dexter’s baseline voice flow is built around three phases that happen inside a single command window.

1. **Intent capture** – Operator gives a short directive such as “Sell 4 ETH to USDC and email compliance.” Dexter records the transcript and confirms key entities (asset, amount, side, optional follow-up).
2. **Execution** – The trading adapter fans out across configured venues (Ethereum, Solana, Base to start), selects the best path, and runs the orders. Mid-flight updates are spoken aloud and streamed to the web console.
3. **Receipts** – Once the trade settles, Dexter drops a summary in the operator’s workspace, syncs the ledger packet, and notifies any subscribed teammates.

### Feature snapshot
- Works with live voice capture in the browser or PSTN handoff.
- Uses MCP tools for venue quotes, compliance logging, and knowledge lookups.
- Response latency holds under three seconds for common swaps.
- Every action is logged so you can replay or share with auditors.

Want to see this in motion? Trigger the CTA on the homepage (`Open the beta`) to open the shared demo tenant, or request production access from the ops team.

_TODO: Add configuration steps, API hooks, and launch checklist._
