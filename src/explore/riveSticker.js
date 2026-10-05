// Rive overlay for a village sticker, using the canvas-lite (2D) runtime. We avoid the WebGL
// runtime because mobile Safari caps live WebGL contexts per page and Mapbox needs one of them.
//
// The .riv sits on top of the static PNG and draws only the moving parts (turbine blades,
// glow, water shimmer), so the PNG stays the source of truth for the look.
//
// Contract for every village .riv (see docs/STYLE_GUIDE.md):
//   artboard size = tier-3 canvas (320x256), state machine "Marker", boolean input "active".

const STATE_MACHINE = 'Marker';
const MIN_TIER_INDEX = 1; // the far-zoom icon (tier 1) stays static

let runtimePromise;
const loadRuntime = () => (runtimePromise ??= import('@rive-app/canvas-lite'));

export class RiveSticker {
  constructor(hostEl, src) {
    this.src = src;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'village__rive';
    hostEl.appendChild(this.canvas);
    this.instance = null;
    this.activeInput = null;
    this.wantAwake = false;
    this.wantActive = false;
    this.tierIndex = 0;
  }

  async ensureLoaded() {
    if (this.instance || this.loading) return this.loading;
    this.loading = loadRuntime().then(
      ({ Rive, Layout, Fit, Alignment }) =>
        new Promise((resolve) => {
          const r = new Rive({
            src: this.src,
            canvas: this.canvas,
            stateMachines: STATE_MACHINE,
            autoplay: false,
            layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
            onLoad: () => {
              r.resizeDrawingSurfaceToCanvas();
              this.activeInput = r.stateMachineInputs(STATE_MACHINE)?.find((i) => i.name === 'active') ?? null;
              this.instance = r;
              this.sync();
              resolve();
            },
            onLoadError: () => resolve(),
          });
        }),
    );
    return this.loading;
  }

  sync() {
    if (!this.instance) return;
    const visible = this.wantAwake && this.tierIndex >= MIN_TIER_INDEX;
    this.canvas.hidden = !visible;
    if (this.activeInput) this.activeInput.value = this.wantActive;
    if (visible) this.instance.play();
    else this.instance.pause();
  }

  resize(w, h, tierIndex) {
    this.tierIndex = tierIndex;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.instance?.resizeDrawingSurfaceToCanvas();
    this.sync();
  }

  wake() {
    this.wantAwake = true;
    this.ensureLoaded().then(() => this.sync());
  }

  sleep() {
    this.wantAwake = false;
    this.sync();
  }

  setActive(active) {
    this.wantActive = active;
    this.sync();
  }
}
