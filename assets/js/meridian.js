/* NEXUS Meridian motion and interaction polish */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.dataset.interface = 'meridian';
  if (reduce) return;
  const reveal = document.querySelectorAll('.dashboard-panel,.launch-card,.stat-tile,.dashboard-tools,.module-page .panel,.module-page .metric-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('meridian-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .08, rootMargin: '0px 0px -24px 0px'});
    reveal.forEach((el, index) => {
      el.classList.add('meridian-reveal');
      el.style.setProperty('--meridian-delay', Math.min(index % 5, 4) * 45 + 'ms');
      observer.observe(el);
    });
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    button.classList.remove('meridian-tap');
    requestAnimationFrame(() => {
      button.classList.add('meridian-tap');
      window.setTimeout(() => button.classList.remove('meridian-tap'), 260);
    });
  }, {passive:true});
  const palette = document.getElementById('commandPalette');
  if (palette) palette.addEventListener('click', event => {
    if (event.target === palette) palette.hidden = true;
  });
})();
