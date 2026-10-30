/* site.js - Marche "NOIR MARCHÉ" behaviour (FOUNDATION): header state, mega menus, drawer, 21+ gate, reveals,
   parallax, tilt, pointer-follow key light, marquee, rotator, demo forms, demo add-to-cart toast. No dependencies,
   defer-safe. Contract D6: no string literal in this file starts with a slash; every URL is read from HTML
   attributes. All motion is off under prefers-reduced-motion. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var reduce = mq('(prefers-reduced-motion: reduce)').matches;
  var finePointer = mq('(hover: hover) and (pointer: fine)').matches;
  var coarse = mq('(hover: none), (pointer: coarse)').matches;
  var desktopMq = mq('(min-width: 1024px)');
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(sel)); };
  var $ = function (sel, el) { return (el || doc).querySelector(sel); };
  var hasIO = 'IntersectionObserver' in window;
  var onMq = function (m, fn) { if (m.addEventListener) m.addEventListener('change', fn); else if (m.addListener) m.addListener(fn); };
  root.classList.add('js');

  /* ---------------- header: scrolled state ---------------- */
  var header = $('[data-header]');
  var scrolledTick = false;
  function onScrollHeader() {
    scrolledTick = false;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener('scroll', function () {
    if (!scrolledTick) { scrolledTick = true; window.requestAnimationFrame(onScrollHeader); }
  }, { passive: true });

  /* ---------------- mega menus: hover intent + click + keyboard ---------------- */
  var megas = $$('[data-mega]');
  var openItem = null;
  var openTimer = 0;
  var closeTimer = 0;
  function setOpen(item, open) {
    var btn = $('.nav__trigger', item);
    item.classList.toggle('is-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (openItem && openItem !== item) setOpen(openItem, false);
      openItem = item;
    } else if (openItem === item) {
      openItem = null;
    }
    if (header) header.classList.toggle('has-open-mega', !!openItem && desktopMq.matches);
  }
  function closeAll() { megas.forEach(function (m) { setOpen(m, false); }); }
  megas.forEach(function (item) {
    var btn = $('.nav__trigger', item);
    if (!btn) return;
    btn.addEventListener('click', function () {
      clearTimeout(openTimer); clearTimeout(closeTimer);
      setOpen(item, !item.classList.contains('is-open'));
    });
    item.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !desktopMq.matches) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      openTimer = setTimeout(function () { setOpen(item, true); }, openItem ? 0 : 110);
    });
    item.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !desktopMq.matches) return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(function () { setOpen(item, false); }, 300);
    });
    item.addEventListener('focusout', function (e) {
      if (!desktopMq.matches) return;
      if (e.relatedTarget && item.contains(e.relatedTarget)) return;
      setTimeout(function () { if (!item.contains(doc.activeElement)) setOpen(item, false); }, 0);
    });
  });
  doc.addEventListener('click', function (e) {
    if (openItem && desktopMq.matches && !openItem.contains(e.target)) closeAll();
  });

  /* ---------------- drawer (below 1024px), with a focus loop while open ---------------- */
  var nav = $('[data-nav]');
  var toggle = $('[data-nav-toggle]');
  var scrim = $('[data-nav-scrim]');
  var closeBtn = $('[data-nav-close]');
  var focusables = function (el) {
    return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', el).filter(function (x) {
      return !x.hidden && x.offsetParent !== null;
    });
  };
  function setDrawer(open) {
    if (!nav || !toggle) return;
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
    if (open) {
      setTimeout(function () { var f = $('.nav__link', nav) || focusables(nav)[0]; if (f) f.focus(); }, 60);
    } else {
      closeAll();
    }
  }
  if (toggle) toggle.addEventListener('click', function () { setDrawer(!root.classList.contains('nav-open')); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); if (toggle) toggle.focus(); });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false); });
  if (nav) {
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !root.classList.contains('nav-open')) return;
      var f = focusables(nav);
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    /* a link inside the drawer that only changes the hash still closes it */
    nav.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (a && root.classList.contains('nav-open')) setDrawer(false);
    });
  }
  onMq(desktopMq, function () { setDrawer(false); closeAll(); });

  /* Esc: close the open mega or the drawer and return focus */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (openItem) {
      var btn = $('.nav__trigger', openItem);
      setOpen(openItem, false);
      if (btn && desktopMq.matches) btn.focus();
      return;
    }
    if (root.classList.contains('nav-open')) { setDrawer(false); if (toggle) toggle.focus(); }
  });

  /* ---------------- 21+ gate (D7): localStorage marche-age-ok = 1 ---------------- */
  var gate = $('[data-age-gate]');
  var KEY = (gate && gate.getAttribute('data-age-key')) || 'marche-age-ok';
  var ok = false;
  try { ok = window.localStorage.getItem(KEY) === '1'; } catch (err) { ok = false; }
  if (gate && !ok) {
    var lastFocus = doc.activeElement;
    gate.hidden = false;
    root.classList.add('gate-open');
    var yes = $('[data-age-yes]', gate);
    var no = $('[data-age-no]', gate);
    var msg = $('[data-age-msg]', gate);
    setTimeout(function () { if (yes) yes.focus(); }, 30);
    if (yes) yes.addEventListener('click', function () {
      try { window.localStorage.setItem(KEY, '1'); } catch (err) { /* private mode: the gate just closes */ }
      gate.hidden = true;
      root.classList.remove('gate-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    if (no) no.addEventListener('click', function () { if (msg) msg.hidden = false; });
    gate.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables(gate);
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); }
    });
  }

  /* ---------------- reveals (+ fail-safe) ---------------- */
  var reveals = $$('[data-reveal]');
  var ioAlive = false;
  if (reduce || !hasIO) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    root.classList.add('reveal-all');
  } else if (reveals.length) {
    var ioReveal = new IntersectionObserver(function (entries) {
      ioAlive = true;
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ioReveal.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ioReveal.observe(el); });
    var vh = function () { return window.innerHeight || root.clientHeight; };
    var box = function (el) { return el.getBoundingClientRect(); };
    var mark = function (el) { el.classList.add('is-in'); ioReveal.unobserve(el); };
    /* first screen starts at once (two frames, so the transition runs from its start state) */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        reveals.forEach(function (el) { var r = box(el); if ((r.width || r.height) && r.bottom > 0 && r.top < vh()) mark(el); });
      });
    });
    /* fail-safe at 2.5 s: everything visible; everything at or above the fold finished; dead observers show all */
    setTimeout(function () {
      root.classList.add('reveal-all');
      reveals.forEach(function (el) { var r = box(el); if (!ioAlive || r.top < vh()) mark(el); });
    }, 2500);
  }

  /* ---------------- parallax ([data-depth], rAF, transform only) ---------------- */
  var depthEls = (reduce || coarse) ? [] : $$('[data-depth]');
  if (depthEls.length) {
    var ticking = false;
    var vis = [];
    var queue = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    var update = function () {
      ticking = false;
      var h = window.innerHeight;
      vis.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2 - h / 2;
        var y = Math.max(-80, Math.min(80, -center * d));
        el.style.setProperty('--py', y.toFixed(1) + 'px');
      });
    };
    if (hasIO) {
      var ioDepth = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var i = vis.indexOf(en.target);
          if (en.isIntersecting && i < 0) { vis.push(en.target); en.target.classList.add('is-moving'); }
          if (!en.isIntersecting && i >= 0) { vis.splice(i, 1); en.target.classList.remove('is-moving'); }
        });
        queue();
      }, { rootMargin: '20% 0px 20% 0px' });
      depthEls.forEach(function (el) { ioDepth.observe(el); });
    } else {
      vis = depthEls.slice();
    }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    queue();
  }

  /* ---------------- pointer tilt (fine pointers): --rx/--ry, plus --mx/--my for a .glint ---------------- */
  if (!reduce && finePointer) {
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      var raf = 0, px = 0, py = 0;
      var paint = function () {
        raf = 0;
        el.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
      };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        px = (e.clientX - r.left) / r.width - 0.5;
        py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        if (!raf) raf = window.requestAnimationFrame(paint);
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------- [data-spot]: the key light follows the pointer (--lx/--ly in %, fine pointers only) -------- */
  if (!reduce && finePointer) {
    $$('[data-spot]').forEach(function (el) {
      var raf = 0, lx = 0, ly = 0;
      var paint = function () {
        raf = 0;
        el.style.setProperty('--lx', lx.toFixed(1) + '%');
        el.style.setProperty('--ly', ly.toFixed(1) + '%');
      };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        lx = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
        ly = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
        el.classList.add('is-spotting');
        if (!raf) raf = window.requestAnimationFrame(paint);
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-spotting');
        el.style.removeProperty('--lx');
        el.style.removeProperty('--ly');
      });
    });
  }

  /* ---------------- [data-marquee]: two copies in a track, moved by one copy; pause on hover, focus, off-screen ---- */
  $$('[data-marquee]').forEach(function (m) {
    if (m.classList.contains('is-marquee')) return;
    var track = $('.marquee__track', m);
    if (!track) {
      track = doc.createElement('div');
      track.className = 'marquee__track';
      while (m.firstChild) track.appendChild(m.firstChild);
      m.appendChild(track);
    }
    var group = doc.createElement('div');
    group.className = 'marquee__group';
    while (track.firstChild) group.appendChild(track.firstChild);
    track.appendChild(group);
    var copy = group.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    $$('a, button, input, select, textarea, [tabindex]', copy).forEach(function (x) { x.setAttribute('tabindex', '-1'); });
    $$('[id]', copy).forEach(function (x) { x.removeAttribute('id'); });
    track.appendChild(copy);
    m.classList.add('is-marquee');
    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { m.classList.toggle('is-paused', !en.isIntersecting); });
      }).observe(m);
    }
  });

  /* ---------------- footer wordmark: its continuous light sweep runs only while the mark is on screen ---------------- */
  if (hasIO) {
    $$('.footer__mark').forEach(function (fm) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { fm.classList.toggle('is-paused', !en.isIntersecting); });
      }).observe(fm);
    });
  }

  /* ---------------- [data-rotator]: [data-slide] children rotate every ~5 s; real <button> dots ---------------- */
  $$('[data-rotator]').forEach(function (rot, rIndex) {
    var slides = $$('[data-slide]', rot);
    if (slides.length < 2) return;
    var stage = slides[0].parentNode;
    if (stage && stage.classList) stage.classList.add('rotator__stage');
    var dotsBox = $('[data-rotator-dots]', rot);
    if (!dotsBox) {
      dotsBox = doc.createElement('div');
      rot.appendChild(dotsBox);
    }
    dotsBox.classList.add('rotator__dots');
    var label = rot.getAttribute('aria-label') || 'slide';
    var delay = parseInt(rot.getAttribute('data-rotator'), 10) || 5000;
    var cur = 0;
    var timer = 0;
    var paused = false;
    var dots = slides.map(function (s, i) {
      if (!s.id) s.id = 'rot' + rIndex + '-s' + i;
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'rotator__dot';
      b.setAttribute('aria-controls', s.id);
      b.setAttribute('aria-label', 'Show ' + label + ' ' + (i + 1) + ' of ' + slides.length);
      b.addEventListener('click', function () { show(i); restart(); });
      dotsBox.appendChild(b);
      return b;
    });
    function show(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === cur;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        if ('inert' in s) s.inert = !on;
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    }
    function restart() {
      clearInterval(timer);
      if (reduce || paused) return;
      timer = setInterval(function () { if (!doc.hidden) show(cur + 1); }, delay);
    }
    function pause() { paused = true; clearInterval(timer); }
    function resume() { paused = false; restart(); }
    rot.addEventListener('pointerenter', pause);
    rot.addEventListener('pointerleave', function () { if (!rot.contains(doc.activeElement)) resume(); });
    rot.addEventListener('focusin', pause);
    rot.addEventListener('focusout', function (e) { if (!e.relatedTarget || !rot.contains(e.relatedTarget)) resume(); });
    rot.classList.add('is-rotator');
    show(0);
    restart();
  });

  /* ---------------- demo forms (D9): never post; show the form's one honest line ---------------- */
  $$('[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = $('[data-demo-note]', f);
      if (note) { note.hidden = false; }
    });
  });

  /* ---------------- [data-demo-add]: a small toast instead of a cart ---------------- */
  var toast = null;
  var toastTimer = 0;
  function showToast(text) {
    if (!toast) {
      toast = doc.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      doc.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.remove('is-on');
    void toast.offsetWidth;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 3200);
  }
  doc.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-demo-add]') : null;
    if (!t) return;
    e.preventDefault();
    showToast(t.getAttribute('data-demo-add') || 'Preview menu: ordering connects at launch.');
  });

  /* ---------------- decorative background video: a visible pause / play toggle (WCAG 2.2.2) ----------------
     Every muted autoplay loop gets one real button in the corner of its band. Under reduced motion the video is
     hidden by CSS and never plays, so no toggle is added. */
  if (!reduce) {
    $$('video[autoplay][muted]').forEach(function (v) {
      var host = v.closest ? v.closest('.band') : null;
      if (!host) return;
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'motion-toggle';
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="motion-toggle__ico" aria-hidden="true"></span><span class="motion-toggle__label">Pause motion</span>';
      var label = b.lastChild;
      b.addEventListener('click', function () {
        if (b.getAttribute('aria-pressed') === 'true') {
          var p = v.play && v.play();
          if (p && p.catch) p.catch(function () {});
          b.setAttribute('aria-pressed', 'false');
          label.textContent = 'Pause motion';
        } else {
          if (v.pause) v.pause();
          b.setAttribute('aria-pressed', 'true');
          label.textContent = 'Play motion';
        }
      });
      host.appendChild(b);
    });
  }
})();
