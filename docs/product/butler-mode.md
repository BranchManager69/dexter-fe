# Live Session Butler Mode

Butler Mode is Dexter’s persistent session for desks that want a shared agent standing by. Instead of firing one-off trades, you keep an open channel that can:

- **Listen continuously** for new directives from any authorized operator.
- **Chain tasks** such as executing the trade, posting a market brief, and updating CRM notes.
- **Hand off context** to human teammates by pushing digest emails or Slack summaries.

## Typical session flow
1. Rotate to the Butler tab in the web client or connect via the dedicated voice line.
2. Issue a directive: “Rotate 10% of wallet delta into hedged BTC and pin the recap.”
3. Dexter confirms the plan, executes across the configured venues, and narrates the outcome.
4. Compliance packet, market recap, and log exports are delivered to the configured sinks.

## Configuration knobs
- **Venues** – Choose which chains and DEXes the Butler session can touch.
- **Tooling** – Attach MCP endpoints for portfolio rebalancing, data enrichment, or ticketing.
- **Notifications** – Define who gets email, Slack, or webhook updates per command.

The Butler UX uses the same component stack that ships in `dexter-fe`; customize copy or visuals here if you change the product narrative.
