# Asset Guidelines

Dexter’s static assets live under `public/assets/` so the build stays cache-friendly and predictable.

## Directory layout
- `public/assets/logos/` – Product marks, partner logos, favicon sources.
- `public/assets/icons/` – Reusable glyphs and UI chrome.
- `public/assets/illustrations/` – Marketing artwork, hero stills, and diagrams.
- `public/assets/marketing/` – Promo screenshots, launch decks, and campaign imagery.

Name files in kebab-case (`dexter-primary.svg`). Append variants when needed (`dexter-primary-dark.svg`).

## Referencing assets
- Use the public path from React/Next components: `<Image src="/assets/logos/dexter-primary.svg" … />`.
- Centralize repeated paths inside helpers under `lib/` when multiple components share the same media.
- Prefer SVG for flat artwork. Use optimized PNG or WebP for photographic content.

## Adding new media
1. Drop the source file in the correct folder under `public/assets/`.
2. Update components or docs that consume it.
3. Run `npx next lint` (and `npm run build` if code changed) before opening a PR.
4. If you introduce a new asset category, add a short note here so the structure stays discoverable.

Legacy media still in `public/media/` should be migrated opportunistically; remove items there once they are ported into the `assets` tree.
