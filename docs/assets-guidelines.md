# Static Asset Guidelines

## Directory layout
- `public/assets/logos/` – brand marks, partner logos, favicon source files.
- `public/assets/icons/` – reusable 1:1 glyphs shared across the app.
- `public/assets/illustrations/` – marketing or onboarding artwork.
- `public/assets/marketing/` – landing images, demos, and promo stills.

Keep filenames kebab-cased (`brand-primary.png`), and append variants when needed (`brand-primary-dark.svg`).

## How to reference assets
- Use the public URL path from React/Next (`<Image src="/assets/logos/brand-primary.png" … />`).
- For repeated usage, centralize the path in a helper (e.g., `lib/mediaPaths.ts`).
- Prefer SVG for flat artwork when available; fall back to optimized PNG/WebP for raster.

## Adding new media
1. Place the source file in the correct `public/assets/<category>/` folder.
2. Update any components or documentation that need the new asset path.
3. Run `npm run lint` (and `npm run build` if TypeScript/JS code changed) to verify imports.
4. When new categories are required, add a short note here so the structure stays discoverable.

Historical files that remain under `public/media/` can stay until refactored; migrate them opportunistically into the buckets above.
