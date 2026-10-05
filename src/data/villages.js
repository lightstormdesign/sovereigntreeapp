// SAMPLE DATA ONLY. "Sprout Hollow" is fictional, and its GPS points are placeholders.
// The other three entries reuse its art to exercise wake/sleep, calming and route lines,
// and are marked `placeholder: true`.
//
// Coordinate systems:
//   world: {x, y}  pixels on the base-map canvas (top-left origin, same as Figma)
//   geo:   {lat, lng}  real GPS, used only by the "keep exploring" real-world layer

export const WORLD = {
  width: 2048,
  height: 1024,
  image: '/assets/world/base-map.svg',
};

// Every village sticker uses this canvas spec (see docs/STYLE_GUIDE.md).
// `anchor` is the ground point (centre of the baked shadow) in that tier's own pixels.
const STANDARD_TIERS = (dir) => [
  { src: `${dir}/tier-1.svg`, width: 64, height: 64, anchor: [32, 56] },
  { src: `${dir}/tier-2.svg`, width: 160, height: 128, anchor: [80, 109] },
  { src: `${dir}/tier-3.svg`, width: 320, height: 256, anchor: [160, 218] },
];

const sproutArt = {
  tiers: STANDARD_TIERS('/assets/villages/sprout-hollow'),
  // Width of the island's footprint in world pixels. Tier choice follows the rendered size.
  worldWidth: 120,
  // Path to a .riv file (state machine "Marker", boolean input "active").
  // null keeps the CSS breathing-glow fallback.
  rive: null,
};

export const villages = [
  {
    id: 'sprout-hollow',
    name: 'Sprout Hollow',
    kind: 'Eco-village',
    region: 'Central Coast, California (sample)',
    listing: { status: 'unclaimed', source: 'community-sourced' },
    world: { x: 372, y: 318 },
    art: sproutArt,
    geo: { lat: 36.2704, lng: -121.8081, zoom: 15 },
    mission:
      'A regenerative hillside village growing a food forest, catching every drop of rain, and holding space for anyone ready to learn with their hands.',
    video: null,
    needs: ['Permaculture design', 'Cob & natural building', 'Childcare circle', 'Solar maintenance'],
    offers: ['Stay in a tiny cabin (3–14 nights)', 'Shared meals from the garden', 'Morning sits & sound baths'],
    reciprocity: { level: 'Sapling', served: 42, reviews: 17, rating: 4.8 },
    spots: [
      { id: 'commons', name: 'Commons Kitchen', kind: 'Gathering', lat: 36.2711, lng: -121.8090, blurb: 'Shared meals at sunset. Kitchen-crew service shifts start here.' },
      { id: 'food-forest', name: 'Food Forest Terraces', kind: 'Garden', lat: 36.2696, lng: -121.8068, blurb: 'Seven-layer food forest. Volunteer mornings Tue / Thu / Sat.' },
      { id: 'catchment', name: 'Rain Catchment Pond', kind: 'Water', lat: 36.2689, lng: -121.8094, blurb: '40k gallon catchment and greywater wetland.' },
      { id: 'dome', name: 'Geodesic Greenhouse', kind: 'Greenhouse', lat: 36.2716, lng: -121.8063, blurb: 'Seed library and nursery. Ask for Mara.' },
    ],
  },
  placeholder('placeholder-europe', 'Placeholder · Europe', { x: 1010, y: 262 }),
  placeholder('placeholder-africa', 'Placeholder · Africa', { x: 1072, y: 610 }),
  placeholder('placeholder-oceania', 'Placeholder · Oceania', { x: 1664, y: 706 }),
];

function placeholder(id, name, world) {
  return {
    id,
    name,
    placeholder: true,
    kind: 'Placeholder',
    region: 'Reuses Sprout Hollow art to test the pipeline',
    listing: { status: 'unclaimed', source: 'community-sourced' },
    world,
    art: sproutArt,
    geo: null,
    mission: 'Stand-in marker. It checks marker wake/sleep, calming and route lines with more than one village on the map.',
    video: null,
    needs: [],
    offers: [],
    reciprocity: null,
    spots: [],
  };
}

// Glowing energy-conduit routes drawn between villages on the explore layer.
export const routes = [
  ['sprout-hollow', 'placeholder-europe'],
  ['placeholder-europe', 'placeholder-africa'],
  ['placeholder-africa', 'placeholder-oceania'],
];
