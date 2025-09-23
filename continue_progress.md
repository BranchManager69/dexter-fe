# Continue Progress: Landing Page Refresh

## Objective
- Reposition the Dexter FE homepage around the live voice-trading beta experience.
- Spotlight the core pillars (voice execution, market intel, guardrails) with supporting copy and visuals.
- Add sections for live surfaces, tool bundles, pricing tiers, and differentiators to align with upcoming marketing pushes.

## Current State
- pp/page.tsx renders the new layout backed by local data arrays (promisePillars, liveSurfaces, 	oolsets, 	iers, differentiators).
- Initial copy and CTA targets are in place but still first-draft; nothing is yet driven by upstream content.
- Supporting grid/card styles have been added to pp/globals.css (new classes start near line 498) and need design QA across breakpoints.

## Next Actions
1. Polish the copy and section headings; confirm the hero stats / CTAs and links are final.
2. Decide whether any sections should source live data (e.g. PumpStreams highlights) and wire them if required.
3. Browser QA (desktop + mobile) to tune spacing, gradients, and hover states for the new components.
4. Run 
pm run lint and 
pm run build; once checks pass, commit both files on main.