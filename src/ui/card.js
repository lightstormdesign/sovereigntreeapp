// Bottom card. Villages on the explore layer and spots on the real map use the same card,
// so tapping works the same way on both layers.

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const chips = (items) => `<ul class="chips">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

export function createCard(el, { onClose }) {
  const body = el.querySelector('.card__body');
  el.querySelector('.card__close').addEventListener('click', () => onClose());

  // Swipe down to dismiss.
  let startY = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, video')) return;
    startY = e.clientY;
  });
  window.addEventListener('pointerup', (e) => {
    if (startY !== null && e.clientY - startY > 60) onClose();
    startY = null;
  });

  const open = (html, actions = []) => {
    body.innerHTML = html;
    actions.forEach(({ selector, handler }) => body.querySelector(selector)?.addEventListener('click', handler));
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    body.scrollTop = 0;
  };

  return {
    get isOpen() {
      return el.classList.contains('is-open');
    },

    showVillage(village, { onKeepExploring }) {
      const r = village.reciprocity;
      const unclaimed = village.listing.status === 'unclaimed';
      const canExplore = Boolean(village.geo);
      open(
        `
        <header class="card__head">
          <p class="card__kicker">${esc(village.kind)} · ${esc(village.region)}</p>
          <h2 class="card__title">${esc(village.name)}</h2>
          ${unclaimed ? `<p class="badge badge--unclaimed" title="Community-sourced listing, not yet claimed by the village">Unclaimed · community-sourced</p>` : ''}
        </header>
        ${village.video ? `<video class="card__video" src="${esc(village.video)}" controls playsinline preload="none"></video>` : `<div class="card__video card__video--empty">Video coming once the village shares one</div>`}
        <p class="card__mission">${esc(village.mission)}</p>
        ${r ? `<div class="card__stats"><div><strong>${esc(r.level)}</strong><span>sovereignty</span></div><div><strong>${r.served}</strong><span>exchanges served</span></div><div><strong>${r.rating}★</strong><span>${r.reviews} reflections</span></div></div>` : ''}
        ${village.needs.length ? `<h3>Gifts they're calling in</h3>${chips(village.needs)}` : ''}
        ${village.offers.length ? `<h3>What they offer in return</h3>${chips(village.offers)}` : ''}
        <div class="card__actions">
          ${canExplore ? `<button class="btn btn--primary" data-act="explore" type="button">Keep exploring</button>` : ''}
          ${unclaimed ? `<button class="btn btn--ghost" data-act="claim" type="button">Is this your village? Claim or remove</button>` : ''}
        </div>`,
        [
          { selector: '[data-act="explore"]', handler: () => onKeepExploring(village) },
          { selector: '[data-act="claim"]', handler: () => alert('Claim / edit / remove flow goes here. Not built yet.') },
        ],
      );
    },

    showSpot(spot, village) {
      open(`
        <header class="card__head">
          <p class="card__kicker">${esc(spot.kind)} · ${esc(village.name)}</p>
          <h2 class="card__title">${esc(spot.name)}</h2>
        </header>
        <p class="card__mission">${esc(spot.blurb)}</p>`);
    },

    close() {
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
    },
  };
}
