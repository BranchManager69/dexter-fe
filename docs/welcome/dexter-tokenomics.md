# Dexter Tokenomics

> **Status:** Draft. The DEXTER token is slated for launch alongside the public Voice GA. Everything below reflects the current internal plan; numbers may shift before the TGE. Always refer to the most recent governance post for final terms.

---

## Summary

- **Ticker:** `DEXTER`  
- **Chain:** Solana  
- **Max supply:** **100,000,000 DEXTER** (hard-capped)  
- **Launch type:** Liquidity bootstrap auction (LBA) followed by open trading on Jupiter  
- **Primary utility:** Voice execution credits, connector entitlements, staking for managed-wallet limits, governance

DEXTER aligns long-term operators and liquidity providers with the way the platform earns revenue. Instead of charging per-seat SaaS fees, we grant increased usage and discounts to teams that stake DEXTER or use it to pay for execution.

---

## Allocation

| Allocation | % of supply | Vesting | Notes |
|------------|-------------|---------|-------|
| **Community LBA** | 30% | Unlocked at TGE | Distributed to auction participants; forms initial liquidity. |
| **Liquidity & Market Making** | 10% | Unlocked at TGE | Managed by the DAO treasury for CEX/DEX liquidity. |
| **Core Contributors** | 18% | 12‑month cliff, then 30-month linear | Engineers, designers, ops—subject to offboarding clawbacks. |
| **Ecosystem Grants** | 12% | 6‑month cliff, then discretionary unlocks | Connector builders, analytics partners, media. |
| **Customer Rewards** | 15% | Streamed as usage rebates | Earned automatically via voice volume and automated macro usage. |
| **Treasury Reserve** | 10% | Governance controlled | Future acquisitions, strategic partnerships. |
| **Advisors** | 5% | 6‑month cliff, then 18-month linear | Industry mentors, compliance advisors. |

The **Community LBA** and **Liquidity** buckets are the only tranches liquid at launch (~40% of supply). Everything else drips out over time.

---

## Emissions & unlock schedule

![Unlock chart](../assets/tokenomics/unlock-chart.png)

- Months 0–6: only LBA participants and liquidity providers have liquid tokens.  
- Month 6: ecosystem grants begin unlocking for approved projects; advisor vesting starts.  
- Month 12: core contributor cliff ends; 1/30th unlocks monthly thereafter.  
- Customer rewards stream continuously to a vesting contract and can be claimed weekly.

We publish a detailed CSV in the DAO repository (`tokenomics/unlock-schedule.csv`) for on-chain verification.

---

## Utility & sinks

### 1. Voice Execution Credits
- Paying execution fees in DEXTER reduces per-trade cost by up to **40%**.  
- Teams can preload DEXTER into their workspace wallet; the system debits credits as trades settle.  
- Fiat/SOL payments are still accepted but lack the discount.

### 2. Connector Entitlements
- Certain connectors (ChatGPT, Claude, Alexa) require a minimum staked balance to unlock premium features.  
- Example: staking **2,500 DEXTER** enables unlimited macro runs for ChatGPT users within a workspace.

### 3. Managed Wallet Limits
- Staking DEXTER increases the notional cap for voice trades.  
- Each staked token increases the cap by **$0.50** (subject to governance).  
- Unstaking triggers a 7-day cooldown; caps drop after the cooldown ends.

### 4. Governance
- Token holders propose and vote on roadmap items, connector funding, and fee parameters.  
- Vote weight is proportional to **staked** DEXTER (not liquid balance).  
- A proposal requires 1% quorum and passes with a simple majority.

### 5. Treasury sink
- Dexter buys back DEXTER using a portion of execution fees and redistributes it to usage pools, effectively offsetting emissions.

---

## Staking mechanics

Staking uses a non-custodial program on Solana:

1. Deposit DEXTER (minimum 500).  
2. Choose a lock period: 30, 90, or 180 days. Longer locks earn higher reward multipliers.  
3. Receive **sDEXTER** representing your staked balance + multiplier.  
4. Rewards accrue weekly; claim or compound anytime.  
5. Early unstake incurs a 25% penalty routed to the treasury pool.

Staking contracts are audited and open-sourced at `https://github.com/BranchManager69/dexter-staking`.

---

## Governance workflow

1. Drafts live in `https://forum.dexter.cash`.  
2. When ready, a proposer locks **10,000 sDEXTER** as proposal collateral.  
3. Voting window: 5 days.  
4. If passed, the multisig (rotating core contributors + community reps) executes on-chain changes.  
5. If rejected, collateral unlocks immediately.

---

## Roadmap

- **Beta (Now):** Emissions disabled, internal tracking only.  
- **T‑30 days:** Publish audited staking contracts + faucet for testnet.  
- **T‑14 days:** Launch LBA documentation, open allowlist.  
- **TGE:** Enable Voice execution discounts, release governance portal.  
- **Post‑TGE:** Roll out cross-connector entitlements, add analytics revenue share.

Stay tuned to the [Dexter Status page](https://status.dexter.cash) and [governance forum](https://forum.dexter.cash) for milestone updates.

---

## FAQ

**Will DEXTER be listed on centralized exchanges?**  
We’re focusing on Solana DEX liquidity first. CEX listings will happen after governance votes on market makers.

**Is there an airdrop?**  
Usage-based rewards begin accruing now, but they vest at TGE. No retroactive airdrop outside the rewards bucket.

**What happens if I lose access to my staking wallet?**  
Treat it like any on-chain asset. We can’t recover keys. Consider multisig custody for treasury-sized stakes.

Need more information? Ping `#dexter-tokenomics` or email **token@dexter.cash**.  
