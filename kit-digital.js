/* =========================================================
   Kit Digital — interacciones de página
   Header sobre fondo claro, menú, índice sticky, cursor y año.
   ========================================================= */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var html = document.documentElement;
  var header = $('#header');
  var menu = $('#menu');
  var menuToggle = $('#menuToggle');
  var main = $('#main');
  var footer = $('.footer');
  var contact = $('#contacto');

  /* ---------- Header: modo oscuro sobre el footer ---------- */

  function updateHeader() {
    if (!contact || !header) return;
    var y = window.scrollY;
    var top = contact.getBoundingClientRect().top + y;
    header.classList.toggle('on-dark', y >= top - 70);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      ticking = false;
    });
  }, { passive: true });
  updateHeader();

  /* ---------- Mobile menu ---------- */

  var menuOpen = false;
  var menuTrigger = null;

  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;

    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Tancar menú' : 'Obrir menú');
    header.classList.toggle('menu-open', open);
    html.classList.toggle('lock', open);

    if (main) main.inert = open;
    if (footer) footer.inert = open;

    if (open) {
      menuTrigger = document.activeElement;
      window.setTimeout(function () {
        var first = $('.menu-nav a', menu);
        if (first) first.focus();
      }, 60);
    } else if (menuTrigger) {
      menuTrigger.focus({ preventScroll: true });
      menuTrigger = null;
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () { setMenu(!menuOpen); });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuOpen) setMenu(false);
    });

    $$('.header a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (menuOpen) setMenu(false);
      });
    });
  }

  /* ---------- Índice activo ---------- */

  var indexLinks = $$('.kit-index a');
  var indexSections = indexLinks
    .map(function (link) { return $(link.getAttribute('href')); })
    .filter(Boolean);

  if (indexLinks.length) indexLinks[0].classList.add('is-active');

  if ('IntersectionObserver' in window && indexSections.length) {
    var indexObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;

        indexLinks.forEach(function (link) {
          var active = link.getAttribute('href') === id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-18% 0px -64% 0px', threshold: 0 });

    indexSections.forEach(function (section) { indexObserver.observe(section); });
  }

  /* ---------- Cursor personalizado ---------- */

  (function initCustomCursor() {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduceMotion) return;

    var dot = $('#cursorDot');
    var ring = $('#cursorRing');
    if (!dot || !ring) return;

    html.classList.add('has-custom-cursor');

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx;
    var ry = my;
    var visible = false;
    var interactive = 'a, button, [role="button"], input, textarea, select, label';

    function setVisible(on) {
      visible = on;
      dot.classList.toggle('is-visible', on);
      ring.classList.toggle('is-visible', on);
    }

    function placeRing() {
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    }

    function move(event) {
      mx = event.clientX;
      my = event.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';

      if (!visible) {
        rx = mx;
        ry = my;
        placeRing();
        setVisible(true);
      }
    }

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      placeRing();
      window.requestAnimationFrame(loop);
    }

    document.addEventListener('mousemove', move);

    document.addEventListener('mouseover', function (event) {
      if (!(event.target instanceof Element)) return;
      var hover = !!event.target.closest(interactive);
      ring.classList.toggle('is-hover', hover);
      dot.classList.toggle('is-hover', hover);
    });

    document.addEventListener('mousedown', function () {
      ring.classList.add('is-down');
    });
    document.addEventListener('mouseup', function () {
      ring.classList.remove('is-down');
    });

    document.documentElement.addEventListener('mouseleave', function () { setVisible(false); });
    document.documentElement.addEventListener('mouseenter', function () { setVisible(true); });
    window.addEventListener('blur', function () { setVisible(false); });

    window.requestAnimationFrame(loop);
  })();

  /* ---------- Año ---------- */

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
