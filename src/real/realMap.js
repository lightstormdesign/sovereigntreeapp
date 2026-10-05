// "Keep exploring" layer: the real-world map around a village, with native tappable pins.
// Uses Mapbox GL when VITE_MAPBOX_TOKEN is set. Without a token it falls back to Leaflet with
// OpenStreetMap tiles, so the pin → card flow still works in development.
// Both engines are created lazily on first use and reused afterwards.
import L from 'leaflet';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function pinElement(spot, onTap) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'spot-pin';
  el.setAttribute('aria-label', spot.name);
  el.innerHTML = `<span class="spot-pin__dot"></span>`;
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onTap(spot);
  });
  return el;
}

async function createMapboxEngine(container) {
  const { default: mapboxgl } = await import('mapbox-gl');
  await import('mapbox-gl/dist/mapbox-gl.css');
  mapboxgl.accessToken = TOKEN;
  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [0, 0],
    zoom: 2,
    attributionControl: true,
  });
  let pins = [];
  return {
    name: 'mapbox',
    show(village, onSpotTap) {
      pins.forEach((p) => p.remove());
      pins = village.spots.map((spot) =>
        new mapboxgl.Marker({ element: pinElement(spot, onSpotTap), anchor: 'bottom' })
          .setLngLat([spot.lng, spot.lat])
          .addTo(map),
      );
      map.resize();
      map.jumpTo({ center: [village.geo.lng, village.geo.lat], zoom: village.geo.zoom - 3, pitch: 0 });
      map.flyTo({ center: [village.geo.lng, village.geo.lat], zoom: village.geo.zoom, pitch: 45, duration: 1600 });
    },
    focus(spot) {
      map.easeTo({ center: [spot.lng, spot.lat], offset: [0, -window.innerHeight * 0.18], duration: 700 });
    },
  };
}

function createLeafletEngine(container) {
  const map = L.map(container, { zoomControl: false, attributionControl: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);
  const pinLayer = L.layerGroup().addTo(map);
  return {
    name: 'leaflet-osm',
    show(village, onSpotTap) {
      map.invalidateSize();
      map.setView([village.geo.lat, village.geo.lng], village.geo.zoom - 3, { animate: false });
      pinLayer.clearLayers();
      village.spots.forEach((spot) => {
        const icon = L.divIcon({ className: 'spot-pin-anchor', iconSize: [0, 0], html: '' });
        const m = L.marker([spot.lat, spot.lng], { icon });
        m.on('add', () => m.getElement().appendChild(pinElement(spot, onSpotTap)));
        m.addTo(pinLayer);
      });
      map.flyTo([village.geo.lat, village.geo.lng], village.geo.zoom, { duration: 1.4 });
    },
    focus(spot) {
      const z = map.getZoom();
      const p = map.project([spot.lat, spot.lng], z).add([0, map.getSize().y * 0.18]);
      map.panTo(map.unproject(p, z));
    },
  };
}

export function createRealMap(container) {
  let enginePromise;
  const engine = () =>
    (enginePromise ??= TOKEN ? createMapboxEngine(container) : Promise.resolve(createLeafletEngine(container)));

  return {
    usesMapbox: Boolean(TOKEN),
    async show(village, onSpotTap) {
      (await engine()).show(village, onSpotTap);
    },
    async focus(spot) {
      (await engine()).focus(spot);
    },
  };
}
