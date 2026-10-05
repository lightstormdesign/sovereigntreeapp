// One village "sticker" on the explore layer.
//  - Picks a detail tier (1–3) from the rendered size rather than raw zoom thresholds.
//  - Pins the asset by its ground anchor so the baked shadow sits on the map.
//  - wake()/sleep() switches the idle animation (Rive or CSS) on or off.
//  - setMode('active' | 'calm' | 'idle') applies the tap focus state.
import L from 'leaflet';
import { RiveSticker } from './riveSticker.js';

const MIN_TAP_SIZE = 44; // px. The far-zoom icon never renders smaller than a tap target.

export class VillageMarker {
  constructor(village, latLng) {
    this.village = village;
    this.latLng = latLng;
    this.tierIndex = -1;
    this.awake = false;

    this.el = document.createElement('button');
    this.el.className = 'village';
    this.el.type = 'button';
    this.el.setAttribute('aria-label', village.name);
    this.el.innerHTML = `<span class="village__glow"></span><img class="village__art" alt="" draggable="false">`;
    this.img = this.el.querySelector('img');

    this.rive = village.art.rive ? new RiveSticker(this.el, village.art.rive) : null;

    // Zero-size divIcon: the wrapper sits exactly on the LatLng and we offset the art ourselves.
    this.marker = L.marker(latLng, {
      icon: L.divIcon({ className: 'village-anchor', iconSize: [0, 0], iconAnchor: [0, 0], html: '' }),
      keyboard: false,
      riseOnHover: true,
    });
    this.marker.on('add', () => this.marker.getElement().appendChild(this.el));
  }

  addTo(map) {
    this.marker.addTo(map);
    return this;
  }

  onTap(fn) {
    L.DomEvent.on(this.el, 'click', (e) => {
      L.DomEvent.stop(e);
      fn();
    });
  }

  updateSize(zoom) {
    const { tiers, worldWidth } = this.village.art;
    const rendered = Math.max(MIN_TAP_SIZE, worldWidth * Math.pow(2, zoom));

    // Smallest tier that is at least as wide as the rendered size, so we never upscale a lower tier.
    let index = tiers.findIndex((t) => t.width >= rendered);
    if (index === -1) index = tiers.length - 1;
    const tier = tiers[index];

    if (index !== this.tierIndex) {
      this.tierIndex = index;
      this.img.src = tier.src;
      this.el.dataset.tier = String(index + 1);
    }

    const scale = rendered / tier.width;
    const w = tier.width * scale;
    const h = tier.height * scale;
    Object.assign(this.el.style, {
      width: `${w}px`,
      height: `${h}px`,
      left: `${-tier.anchor[0] * scale}px`,
      top: `${-tier.anchor[1] * scale}px`,
    });
    this.rive?.resize(w, h, index);
  }

  wake() {
    if (this.awake) return;
    this.awake = true;
    this.el.classList.add('is-awake');
    this.rive?.wake();
  }

  sleep() {
    if (!this.awake) return;
    this.awake = false;
    this.el.classList.remove('is-awake');
    this.rive?.sleep();
  }

  setMode(mode) {
    this.el.classList.toggle('is-active', mode === 'active');
    this.el.classList.toggle('is-calm', mode === 'calm');
    this.rive?.setActive(mode === 'active');
    if (mode === 'active') this.marker.setZIndexOffset(1000);
    else this.marker.setZIndexOffset(0);
  }
}
