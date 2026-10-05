import 'leaflet/dist/leaflet.css';
import './styles.css';
import { villages, routes } from './data/villages.js';
import { createExploreMap } from './explore/exploreMap.js';
import { createRealMap } from './real/realMap.js';
import { createCard } from './ui/card.js';
import { addParticles } from './ui/particles.js';

const app = document.getElementById('app');
const backBtn = document.getElementById('back');
const realNotice = document.getElementById('real-notice');

let layer = 'explore'; // 'explore' | 'real'
let current = null;

const card = createCard(document.getElementById('card'), { onClose: closeCard });
const realMap = createRealMap(document.getElementById('real-map'));
const explore = createExploreMap(document.getElementById('explore-map'), {
  villages,
  routes,
  onVillageTap: openVillage,
});
addParticles(document.getElementById('particles'));

explore.map.on('click', () => card.isOpen && closeCard());
document.addEventListener('keydown', (e) => e.key === 'Escape' && card.isOpen && closeCard());
backBtn.addEventListener('click', backToExplore);

function openVillage(village) {
  current = village;
  explore.focus(village);
  card.showVillage(village, { onKeepExploring: keepExploring });
}

function closeCard() {
  card.close();
  if (layer === 'explore') explore.release();
}

function keepExploring(village) {
  card.close();
  explore.dive(village);
  // Crossfade a little after the dive starts so the zoom carries into the real map.
  setTimeout(() => {
    layer = 'real';
    app.dataset.layer = 'real';
    realNotice.hidden = realMap.usesMapbox;
    realMap.show(village, (spot) => {
      realMap.focus(spot);
      card.showSpot(spot, village);
    });
  }, 350);
}

function backToExplore() {
  card.close();
  layer = 'explore';
  app.dataset.layer = 'explore';
  if (current) openVillage(current);
}
