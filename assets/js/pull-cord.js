(() => {
  const root = document.getElementById('pullCordSwitch');
  const handle = document.getElementById('pullHandle');
  const rope = document.getElementById('pullRopePath');
  const lamp = root && root.querySelector('.pull-lamp');
  const themeButton = document.getElementById('themeButton');
  if (!root || !handle || !rope || !themeButton) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pointer = null;
  let pullY = 0;
  let pullX = 0;
  let resting = true;

  function syncTheme() {
    const light = document.documentElement.dataset.theme === 'light' ||
      getComputedStyle(document.documentElement).colorScheme === 'light';
    root.classList.toggle('is-lit', light);
    handle.setAttribute('aria-pressed', String(light));
    handle.setAttribute('aria-label', light
      ? 'Pull cord to switch to dark theme'
      : 'Pull cord to switch to light theme');
  }

  function draw(x = pullX, y = pullY) {
    const endY = 25 + y;
    rope.setAttribute('d', `M22 0 Q${22 + x * .55} ${10 + y * .45} ${22 + x} ${endY}`);
    handle.style.transform = `translate(-50%, ${y}px)`;
    if (lamp) lamp.style.transform = `rotate(${Math.max(-.22, Math.min(.22, x * .012))}rad)`;
  }

  function release() {
    resting = true;
    root.classList.remove('is-pulling');
    handle.classList.remove('is-held');
    handle.style.transition = reduceMotion ? 'none' : 'transform 420ms cubic-bezier(.18,.82,.2,1.12)';
    rope.style.transition = reduceMotion ? 'none' : 'd 420ms cubic-bezier(.18,.82,.2,1.12)';
    if (lamp) lamp.style.transition = reduceMotion ? 'none' : 'transform 500ms cubic-bezier(.18,.82,.2,1.12)';
    pullX = 0;
    pullY = 0;
    draw();
    window.setTimeout(() => {
      handle.style.transition = '';
      rope.style.transition = '';
      if (lamp) lamp.style.transition = '';
    }, reduceMotion ? 0 : 520);
  }

  function toggle() {
    themeButton.click();
    requestAnimationFrame(syncTheme);
    window.setTimeout(syncTheme, 80);
  }

  handle.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    pointer = { id: event.pointerId, y: event.clientY, x: event.clientX, moved: 0 };
    resting = false;
    handle.setPointerCapture(event.pointerId);
    handle.classList.add('is-held');
    root.classList.add('is-pulling');
    handle.style.transition = 'none';
    rope.style.transition = 'none';
    if (lamp) lamp.style.transition = 'none';
  });

  handle.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dy = Math.max(0, Math.min(38, event.clientY - pointer.y));
    const dx = Math.max(-13, Math.min(13, event.clientX - pointer.x));
    pointer.moved = Math.max(pointer.moved, Math.hypot(dx, dy));
    pullY = dy;
    pullX = dx;
    draw();
  });

  function finish(event) {
    if (!pointer || (event && event.pointerId !== pointer.id)) return;
    const moved = pointer.moved;
    const tugged = pullY >= 14;
    pointer = null;
    release();
    // A short tap acts like a normal switch; a deliberate downward tug also toggles it.
    if (moved < 7 || tugged) toggle();
  }
  handle.addEventListener('pointerup', finish);
  handle.addEventListener('pointercancel', finish);
  handle.addEventListener('lostpointercapture', event => {
    if (pointer && event.pointerId === pointer.id) finish(event);
  });
  handle.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });

  const observer = new MutationObserver(syncTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] });
  syncTheme();
  draw();
})();