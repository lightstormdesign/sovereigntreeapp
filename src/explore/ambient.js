// Ambient motion over the static base art: pulsing energy-conduit routes between villages
// and slow-breathing glow wells. Drawn as one inline SVG overlay in world coordinates, so it
// pans and zooms with the map and costs no extra canvas or WebGL context.
import L from 'leaflet';
import { WORLD } from '../data/villages.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function addAmbientLayer(map, { villages, routes, bounds }) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${WORLD.width} ${WORLD.height}`);
  svg.classList.add('ambient');

  const byId = new Map(villages.map((v) => [v.id, v]));
  const paths = routes
    .map(([a, b]) => [byId.get(a)?.world, byId.get(b)?.world])
    .filter(([a, b]) => a && b)
    .map(([a, b]) => {
      // Arc each route upward a little so it reads as a flight path, not a ruler line.
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.18;
      return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
    });

  svg.innerHTML = `
    <defs>
      <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="well" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#ffe9a8" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${villages.map((v) => `<circle class="ambient__well" cx="${v.world.x}" cy="${v.world.y}" r="90" fill="url(#well)"/>`).join('')}
    <g filter="url(#route-glow)">
      ${paths.map((d) => `<path class="ambient__route-base" d="${d}"/><path class="ambient__route-pulse" d="${d}"/>`).join('')}
    </g>`;

  L.svgOverlay(svg, bounds, { interactive: false }).addTo(map);
}
