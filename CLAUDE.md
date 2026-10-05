# SovereignTree — project context

A standalone app, separate from Entree and LightStorm. It is a living, interactive global map
of eco-villages, intentional communities and new-earth festivals. Think Google Earth × Yelp ×
Facebook, with an economy built on service and skill reciprocity instead of money.
Motto: **"sacred reciprocity"**.

## Product decisions (locked)

- **Directory + ratings, not a marketplace.** No money moves through the app, so there is no
  payments or booking infrastructure. "Book a stay" means arranging an exchange of service or
  skills for a stay.
- Profiles list skills and offerings. A user's rating grows with how much they serve and levels
  them up (sprout → sapling → … → tree), building their "sovereignty".
- Service is framed as "the new economy": sharing gifts, wisdom and skills where they are
  wanted. Do not frame it as gig work or freelancing.

## Open questions (do not assume answers)

- Who can add or claim a village: self-serve or curated.
- Formal adoption of the scraped-content consent/claim flow. The recommended mitigation is
  already reflected in the prototype UI: scraped listings show as **"Unclaimed ·
  community-sourced"** with a "Claim or remove" action. Republishing scraped photos and videos
  carries real copyright and consent risk, so do not build a scraper that republishes media
  without the user signing off on this.
- Branding beyond the name "SovereignTree".

## Architecture (decided)

Two map layers that share one interaction pattern (tap → focus → bottom card):

1. **Explore layer**: an illustrated world on **Leaflet in `L.CRS.Simple`**. Villages are
   placed in art pixel coordinates, not GPS. Not Mapbox.
2. **Real layer**: **Mapbox GL** centred on the village's real GPS, with native tappable
   markers, reached through "Keep exploring". When `VITE_MAPBOX_TOKEN` is unset it falls back
   to Leaflet + OSM for development.
3. **Animation**: **Rive canvas-lite (2D)** for markers, never the WebGL runtime (mobile Safari
   caps WebGL contexts per page and Mapbox needs one). Only markers near the viewport centre
   animate (`MAX_AWAKE` in `src/explore/exploreMap.js`). Everything else stays static.
4. **Art pipeline**: Figma style-guide template → one transparent PNG per village with a
   baked shadow and soft edges, exported in 3 detail tiers. Contract: `docs/STYLE_GUIDE.md`.

Art-direction history, so it isn't retried: dark neon sci-fi (rejected) → painterly/Ghibli
(moved past) → **chunky toy-3D mobile-game world map** + mystic glow layer + permaculture layer
(locked). The pink cherry-blossom "gardens" variant was rejected.

## Code map

- `src/data/villages.js`: village data. `world` = art pixels and `geo` = GPS. Sample data only.
- `src/explore/exploreMap.js`: Leaflet Simple CRS setup, wake/sleep, focus/dive.
- `src/explore/villageMarker.js`: tier choice by rendered size, ground-anchor pinning, states.
- `src/explore/riveSticker.js`: lazy canvas-lite Rive overlay (state machine `Marker`, input `active`).
- `src/explore/ambient.js`: animated route lines and glow wells (inline SVG overlay).
- `src/real/realMap.js`: Mapbox GL / Leaflet-OSM real layer with spot pins.
- `src/ui/card.js`: the shared bottom card.

## Commands

- `npm install`, `npm run dev`, `npm run build`
- Optional: copy `.env.example` → `.env` and set `VITE_MAPBOX_TOKEN`.
