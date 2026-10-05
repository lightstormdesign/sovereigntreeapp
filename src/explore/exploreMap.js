// Illustrated "explore" layer: Leaflet in Simple CRS (game-map style, no real GPS).
import L from 'leaflet';
import { WORLD } from '../data/villages.js';
import { VillageMarker } from './villageMarker.js';
import { addAmbientLayer } from './ambient.js';

// Maximum number of markers animating at once. Every other marker stays a static image.
const MAX_AWAKE = 6;

// Figma-style pixel (top-left origin) → Leaflet Simple CRS LatLng (bottom-left origin).
export const worldToLatLng = ({ x, y }) => L.latLng(WORLD.height - y, x);

export function createExploreMap(el, { villages, routes, onVillageTap }) {
  const bounds = L.latLngBounds([0, 0], [WORLD.height, WORLD.width]);

  const map = L.map(el, {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 1.5,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    maxBounds: bounds.pad(0.15),
    maxBoundsViscosity: 0.9,
    attributionControl: false,
    zoomControl: false,
  });

  L.imageOverlay(WORLD.image, bounds, { className: 'world-base' }).addTo(map);
  // Hero view: the board fills ~70% of the viewport height (on portrait phones this crops the
  // sides, which you pan to see). Zooming out is allowed only as far as the whole board.
  const fitZoom = map.getBoundsZoom(bounds);
  const heroZoom = Math.log2((map.getSize().y * 0.7) / WORLD.height);
  map.setMinZoom(fitZoom - 0.25);
  map.setView(bounds.getCenter(), Math.max(fitZoom, Math.round(heroZoom * 4) / 4));

  addAmbientLayer(map, { villages, routes, bounds });

  const markers = villages.map((village) => {
    const marker = new VillageMarker(village, worldToLatLng(village.world));
    marker.addTo(map);
    marker.onTap(() => onVillageTap(village));
    return marker;
  });

  const resize = () => markers.forEach((m) => m.updateSize(map.getZoom()));
  map.on('zoom', resize);
  resize();

  // Wake only the markers nearest the viewport centre; the rest stay static.
  const updateWake = () => {
    const viewport = map.getBounds().pad(0.1);
    const center = map.getCenter();
    const ranked = markers
      .filter((m) => viewport.contains(m.latLng))
      .sort((a, b) => map.distance(a.latLng, center) - map.distance(b.latLng, center));
    const awake = new Set(ranked.slice(0, MAX_AWAKE));
    markers.forEach((m) => (awake.has(m) ? m.wake() : m.sleep()));
  };
  map.on('moveend', updateWake);
  updateWake();

  const byId = new Map(markers.map((m) => [m.village.id, m]));

  return {
    map,
    focus(village) {
      const target = byId.get(village.id);
      markers.forEach((m) => m.setMode(m === target ? 'active' : 'calm'));
      // Fly with a vertical offset so the village sits above the bottom card.
      const zoom = Math.max(map.getZoom(), 0.5);
      const point = map.project(target.latLng, zoom).add([0, map.getSize().y * 0.18]);
      map.flyTo(map.unproject(point, zoom), zoom, { duration: 1.1 });
    },
    release() {
      markers.forEach((m) => m.setMode('idle'));
    },
    // Dive further in before handing off to the real map.
    dive(village, duration = 0.7) {
      map.flyTo(byId.get(village.id).latLng, map.getMaxZoom(), { duration });
    },
  };
}
