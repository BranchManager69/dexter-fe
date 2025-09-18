# Dexter Marketing Asset Brief

## Brand Alignment
- **Palette anchors**: Keep the hero rooted in deep navy/ink (use `#05060d` base) with electric accents (`#7b8bff`, `#6bd4fc`, `#ffc857`). Avoid harsh pure whites; lean into cool neutrals.
- **Lighting**: Use soft rim light and volumetric glow to echo the radial gradients used in the layout background.
- **Texture**: Prefer glossy glass panels, subtle particle trails, and holographic UI elements. Avoid skeuomorphic chrome.

## Asset Requirements
| Slot | Description | Dimensions | Format | Notes |
| ---- | ----------- | ---------- | ------ | ----- |
| Hero visual | Cinematic render of Dexter control room with voice + tool telemetry | 1440×900 (or larger) | Layered PNG/WebP (alpha) | Should tolerate parallax/potential Lottie overlay. Keep foreground UI readable on dark background. |
| Product screenshot | High-res capture of multi-agent chat console | ≥1280×880 | PNG or WebP | Use production UI data, no PII. Highlight streaming tokens and MCP tool cards. |
| MCP montage | Illustration showing connectors orbiting Dexter core glyph | ≥1200×900 | SVG preferred (or transparent PNG) | Use brand iconography; can animate later. |
| Badge strip (optional) | Small credibility logos (beta partners, security badges) | 320×120 | SVG or monochrome PNG | Keep to max 4 logos; supply light/dark variants. |

Place final exports in `public/media` with predictable names:
```
public/media/hero-control-room.png
public/media/chat-console.png
public/media/mcp-montage.svg
public/media/badge-strip.svg
```

## Motion & Future Enhancements
- Provide layered PSD/AI/FIG files so we can slice key elements for scroll-based animation.
- If producing motion (MP4/WebM/Lottie), keep hero animation under 8 seconds, 24–30fps, background loopable, encoded with transparency if possible.

## Typography & Iconography
- Headline font weight: 700; match Inter or similar geometric sans.
- Generate icon sprites (64×64) for features (voice, tools, automation) as SVG. Keep stroke width consistent (2px at 1× scale).

## Delivery Checklist
1. Export hero render + still frame.
2. Export screen mockups at 1× and 2×.
3. Provide raw design source (Figma file or layered PSD) with color tokens noted.
4. Include a short usage note per asset (lighting, gradients, recommended blend modes).

Ping the frontend team once assets are staged so we can swap placeholders in `app/page.tsx`.
