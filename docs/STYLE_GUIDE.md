# Village asset style guide & export contract

Every village sticker is made separately but has to look like it belongs on the same board.
This file is the contract between Figma and the code. If an asset follows it, it drops into
`src/data/villages.js` with no code changes.

The placeholder SVGs in `public/assets/villages/sprout-hollow/` follow this spec. Use them as a
reference for canvas size, anchor point and shadow placement, not for final art quality.

## Locked art direction (summary)

Chunky, toy-rendered 3D, in the style of mobile-game world maps (Township, Royal Match, Clash
island maps), with two extra layers:

1. **Mystic / ancient-future glow.** Soft bioluminescent rim-glow, faint sacred-geometry linework,
   and magic-hour light (teal → violet → gold).
2. **Permaculture / regenerative.** Wind turbines, solar, greenhouses and domes, terraced
   food-forest, rain-catchment ponds, cob and living-roof buildings. Use earthy, varied greens.

Do not use pink cherry-blossom "garden" treatments (rejected) or a dark neon sci-fi look (rejected).

## Fixed rules (all assets)

| Rule | Value |
|---|---|
| Light direction | From the **upper-left** (about 10 o'clock, 45° elevation) |
| Shadow | Baked into the PNG as a soft ellipse falling **lower-right**. Colour `#1b2a3f` at about 45% opacity, blur about 3% of canvas width |
| Projection | Isometric-ish 2:1 top face (about 26.6°). Same camera for every asset |
| Outline | `#2b1f3a` at about 60% opacity. **3px at tier 3**, 2.5px at tier 2, 2px at tier 1 (do not scale one outline down) |
| Edges | Soft, irregular island silhouette. Never a hard rectangle or perfect circle cut-out |
| Background | Fully transparent |
| Colour grade | Use the palette below. Highlights lean warm gold, shadows lean violet-teal |
| Glow | Keep any glow inside the canvas, with at least 8px of transparent padding |

### Palette tokens

| Token | Hex | Use |
|---|---|---|
| teal | `#1f6f78` | sky top, deep water |
| violet | `#5b4b8a` | sky mid, shadow tint |
| gold | `#e8b04a` | sky bottom, highlights, primary buttons |
| glow | `#ffe9a8` | bioluminescence, particles, routes |
| ink | `#2b1f3a` | outlines, text |
| grass-light / grass-dark | `#a6dc78` / `#5f9f45` | island tops |
| earth-light / earth-dark | `#b98457` / `#6e4630` | cliff sides, trunks |
| water-light / water-dark | `#8fe3e0` / `#3a9fb4` | ponds |

## Detail tiers

Export each village **three times**, redrawn for each size (simplified, not scaled down). The app
chooses the smallest tier that is at least as wide as the on-screen size, so a lower tier is
never upscaled.

| Tier | Purpose | Canvas @1x | Ground anchor @1x | What to keep |
|---|---|---|---|---|
| `tier-1` | far zoom icon | 64 × 64 | (32, 56) | One silhouette with one hero element (e.g. the tree). No small detail |
| `tier-2` | mid zoom | 160 × 128 | (80, 109) | Island, 2–4 key structures, simplified shapes |
| `tier-3` | close zoom | 320 × 256 | (160, 218) | Full detail |

- **Ground anchor** is the centre of the baked shadow ellipse, the point that "touches the map".
  The code pins this pixel to the village's map coordinate. Keep it at the same relative
  position in all three tiers.
- Export PNG at **@2x** (128², 320×256, 640×512) and keep the @1x numbers above in
  `villages.js`. The browser downsamples the @2x file.
- File layout: `public/assets/villages/<village-id>/tier-{1,2,3}.png`.

## Rive overlay (optional, per village)

The PNG is the look and Rive adds the motion. A village's `.riv` draws **only the moving parts**
(turbine blades, glow pulse, water shimmer, smoke) on a transparent artboard that sits exactly
over the PNG.

- Artboard: **320 × 256** (the tier-3 canvas), with the same anchor.
- State machine named **`Marker`**, with a boolean input **`active`**:
  - `active = false` → idle loop (slow breathing glow, blades turning)
  - `active = true` → "selected" loop (brighter pulse, a small celebratory motion)
- Built for the **canvas-lite** runtime, so avoid features that need the WebGL renderer
  (e.g. mesh-heavy deformation). Check it in Rive's canvas preview.
- Rive only plays at tier 2 and 3, and only for markers near the centre of the view.
  Tier 1 icons stay static.

File: `public/assets/villages/<village-id>/marker.riv`, referenced as `art.rive` in `villages.js`.

## Base map

- Canvas **2048 × 1024 @1x** (export @2x: 4096 × 2048). Village `world: {x, y}` values are
  pixels on this canvas, measured from the top-left exactly as Figma shows them.
- Static art only, with **no sky rectangle**. The sky gradient is the page background, so the
  board floats with no hard edge. Ambient motion (routes, glow wells, particles) is drawn
  by the code on top.
- Use the same light direction, outline and palette as the villages.
