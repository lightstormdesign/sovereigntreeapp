// Drifting light motes in screen space, above the map and below the UI.
// Pure CSS animation on a few DOM nodes, so there is no canvas and no per-frame JS.
// Respects prefers-reduced-motion (see styles.css).

const COUNT = 28;

export function addParticles(el) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'mote';
    const size = 2 + Math.random() * 4;
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${Math.random() * 100}%`,
      `width:${size}px`,
      `height:${size}px`,
      `animation-duration:${14 + Math.random() * 18}s,${3 + Math.random() * 4}s`,
      `animation-delay:${-Math.random() * 30}s,${-Math.random() * 6}s`,
    ].join(';');
    frag.appendChild(p);
  }
  el.appendChild(frag);
}
