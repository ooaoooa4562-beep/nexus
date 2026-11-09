(() => {
  'use strict';
  const gsap = window.gsap;
  if (!gsap) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || document.body.classList.contains('reduced-motion')) return;

  const animatePage = (root) => {
    if (!root || root.hidden) return;
    const targets = root.querySelectorAll('.metric-card,.panel,.module-card,.settings-card,.profile-card,.friends-card,.code-ide,.terminal-window,.flow-workspace');
    if (!targets.length) return;
    gsap.killTweensOf(targets);
    gsap.fromTo(targets,
      { y: 12, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: .38, stagger: .035, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }
    );
  };

  const home = document.querySelector('#overview');
  const modulePage = document.querySelector('#modulePage');
  if (home) animatePage(home);

  if (modulePage) {
    const observer = new MutationObserver(() => {
      if (!modulePage.hidden) requestAnimationFrame(() => animatePage(modulePage));
    });
    observer.observe(modulePage, { childList: true, subtree: false, attributes: true, attributeFilter: ['hidden'] });
  }

  document.addEventListener('pointerover', event => {
    const card = event.target.closest('.module-card,.quick-card');
    if (!card || card.contains(event.relatedTarget)) return;
    gsap.to(card, { y: -2, duration: .16, ease: 'power2.out', overwrite: true });
  });
  document.addEventListener('pointerout', event => {
    const card = event.target.closest('.module-card,.quick-card');
    if (!card || card.contains(event.relatedTarget)) return;
    gsap.to(card, { y: 0, duration: .2, ease: 'power2.out', overwrite: true });
  });
  window.addEventListener('nexus:motion-refresh', () => {
    if (!document.body.classList.contains('reduced-motion')) animatePage(modulePage && !modulePage.hidden ? modulePage : home);
  });
})();