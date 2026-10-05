# SovereignTree

*Sacred reciprocity.* A living map of eco-villages, intentional communities and new-earth
gatherings, where the currency is service.

This is the **pipeline-validation prototype**: one village asset wired end to end, before any
more art is produced.

```bash
npm install
npm run dev          # http://localhost:5173
```

Optional: `cp .env.example .env` and set `VITE_MAPBOX_TOKEN` to use Mapbox GL for the real-world
layer. Without it, the real layer uses Leaflet + OpenStreetMap tiles so the flow still works.

## What this prototype proves

| Pipeline step | Where |
|---|---|
| Illustrated base map on Leaflet Simple CRS, villages placed by Figma pixel coords | `src/explore/exploreMap.js`, `src/data/villages.js` |
| Detail-tier swapping (1 → 2 → 3) based on rendered size, never upscaling a lower tier | `src/explore/villageMarker.js` |
| Ground-anchor pinning so the baked shadow sits on the map at every zoom | `villageMarker.js` + `docs/STYLE_GUIDE.md` |
| Ambient life: pulsing route lines, breathing glow wells, drifting motes | `src/explore/ambient.js`, `src/ui/particles.js` |
| Wake/sleep: only markers near the view centre animate | `exploreMap.js` (`MAX_AWAKE`) |
| Tap → fly to village → it plays "active", others calm down → card slides up | `exploreMap.focus`, `src/ui/card.js` |
| "Keep exploring" → crossfade/zoom into the real map at the village GPS, with tappable pins → same card | `src/real/realMap.js` |
| Rive canvas-lite hook (lazy-loaded, off until a `.riv` exists) | `src/explore/riveSticker.js` |
| Unclaimed/community-sourced badge with a claim-or-remove entry point | `src/ui/card.js` |

All art in `public/assets` is **placeholder SVG** drawn to the export contract. To replace it,
drop in the Figma PNGs with the same canvas sizes and anchors, then update the file extensions
in `src/data/villages.js`.

## Next

1. Figma: lock the style-guide template (see `docs/STYLE_GUIDE.md`) and finish **one** village
   in 3 tiers, plus the base map.
2. Swap those files in here and check positioning, tier swaps and shadow blending on a real phone.
3. Then produce the rest of the villages against the proven template.

Project context and decisions are in [`CLAUDE.md`](CLAUDE.md).
