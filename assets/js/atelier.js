(() => {
  'use strict';
  const $ = (selector, root=document) => root.querySelector(selector);
  const sidebar = $('#sidebar');
  const menu = $('#mobileMenu');
  const search = $('#globalSearch');
  const palette = $('#commandPalette');
  const commandInput = $('#commandInput');
  const reduced = () => document.body.classList.contains('reduced-motion') ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // Keep mobile navigation usable without changing the module router.
  let overlay;
  const ensureOverlay = () => {
    if (!sidebar || overlay) return;
    overlay = document.createElement('button');
    overlay.type = 'button';
    overlay.className = 'atelier-sidebar-overlay';
    overlay.setAttribute('aria-label', 'Close navigation');
    overlay.addEventListener('click', closeSidebar);
    document.body.append(overlay);
  };
  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('visible');
    menu?.setAttribute('aria-expanded', 'false');
  };
  const openSidebar = () => {
    ensureOverlay();
    sidebar?.classList.add('open');
    overlay?.classList.add('visible');
    menu?.setAttribute('aria-expanded', 'true');
  };
  menu?.addEventListener('click', () => sidebar?.classList.contains('open') ? closeSidebar() : openSidebar());
  document.addEventListener('click', event => {
    if (event.target.closest('.sidebar .nav-link')) closeSidebar();
  });

  // The command launcher is also reachable via the visible shortcut button.
  document.querySelectorAll('[data-open-command-palette]').forEach(button => {
    button.addEventListener('click', () => search?.focus());
  });

  // Restore a useful repository context in the dashboard, using only locally selected data.
  const repoName = localStorage.getItem('nexus.github.repository');
  const repoLabel = $('#activeRepoName');
  if (repoLabel) repoLabel.textContent = repoName || 'No repository selected';
  const repoState = $('#activeRepoState');
  if (repoState) repoState.textContent = repoName ? 'LAST USED REPOSITORY' : 'GITHUB WORKSPACE';
  const repoAction = $('#activeRepoAction');
  repoAction?.addEventListener('click', () => {
    const navigate = window.NEXUSNavigate;
    if (navigate) navigate('github');
    else location.hash = '#github';
  });

  // Small tactile feedback on cards; only transforms and opacity are animated.
  const observeCards = () => {
    if (reduced() || !('IntersectionObserver' in window)) return;
    const cards = document.querySelectorAll('.stat-tile,.launch-card,.tool-list>a,.dashboard-panel');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('atelier-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold: .08});
    cards.forEach(card => observer.observe(card));
  };
  observeCards();

  // Respect the user's reduced-motion setting and system preference.
  window.addEventListener('nexus:preferences', event => {
    const prefs = event.detail || {};
    document.body.classList.toggle('reduced-motion', !!prefs.accessibilityReduceMotion || prefs.motion === 'reduced');
  });

  // Update the dashboard's selected repository label when switching from another module.
  window.addEventListener('storage', event => {
    if (event.key !== 'nexus.github.repository') return;
    const value = event.newValue || '';
    if (repoLabel) repoLabel.textContent = value || 'No repository selected';
    if (repoState) repoState.textContent = value ? 'LAST USED REPOSITORY' : 'GITHUB WORKSPACE';
  });
})();