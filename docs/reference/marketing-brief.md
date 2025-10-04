# Brand & Marketing Brief

Dexter’s current public site is intentionally sparse: a single hard-edged CTA between the shared header and footer. Use this brief to keep new assets aligned with that tone.

## Palette
- **Background**: Deep espresso (`#0b0503` → `#170904` gradient).
- **Primary accent**: Ember orange (`#e56b18`) with brighter highlights (`#ff9138`).
- **Secondary accents**: Warm neutrals for copy and dividers (`#f2e1d1`, `#d9c0aa`).
- Avoid rounded shapes; lean into squared borders, thin keylines, and ribbon accents.

## CTA treatment
- 0px radius container with a 2px border using `rgb(var(--color-border-strong))`.
- Top ribbon gradient (primary → info → warn) spanning the full width.
- All-caps button label with a 2px stroke and no pill shape.

## Copy voice
- Plain speech. Describe what Dexter does in clear, concrete language.
- Lead with the result (“Give a voice command, get the trade done”).
- Support with one-sentence proof points (speed, coverage, logging).

## Asset checklist
When adding imagery back to the hero or deeper pages, keep it function-first:
1. Show the voice prompt and resulting execution log in the same frame.
2. Layer analytics or compliance badges only if they tie to active product features.
3. Provide light and dark variants if the asset will appear in other Dexter experiences.

Store exports under `public/assets/marketing/` with predictable names (for example `cta-ribbon@2x.png`).
