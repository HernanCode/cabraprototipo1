/* =========================================================
   CABRA — interacciones
   Sin dependencias externas: scroll pinning, tabs, filtros,
   overlay de caso, contadores y menú móvil.
   ========================================================= */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, min, max) { return Math.min(max, Math.max(min, v)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  var header = $('#header');
  var main = $('#main');
  var footer = $('.footer');
  var contactSection = $('#contacto');
  var menu = $('#menu');
  var menuToggle = $('#menuToggle');
  var hero = $('.hero');
  var heroMedia = $('.hero-media');
  var services = $('.services');
  var cases = $('.cases');
  var track = $('#track');
  var hProgress = $('#hProgress');
  var html = document.documentElement;

  /* =========================================================
     Header state
     ========================================================= */

  function updateHeader() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);

    if (services) {
      var servicesTop = services.getBoundingClientRect().top + y;
      var servicesBottom = servicesTop + services.offsetHeight;
      header.classList.toggle('on-services', y >= servicesTop && y < servicesBottom - 70);
    }

    if (contactSection) {
      var contactTop = contactSection.getBoundingClientRect().top + y;
      header.classList.toggle('on-dark', y >= contactTop - 70);
    }
  }

  /* =========================================================
     Mobile menu
     ========================================================= */

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
    } else {
      if (menuTrigger && typeof menuTrigger.focus === 'function') {
        menuTrigger.focus({ preventScroll: true });
      }
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

  /* =========================================================
     Services: sticky scroll + accessible tabs
     ========================================================= */

  var svcTabs = $$('.svc-tab');
  var svcPanels = $$('.svc-panel');
  var svcBgs = $$('.svc-bg');
  var svcSegs = $$('.svc-seg');
  var svcIndex = -1;
  var svcLockUntil = 0;

  function isPinned() {
    return !reduceMotion && window.innerWidth > 900;
  }

  function paintSegments(progress) {
    svcSegs.forEach(function (seg, i) {
      var fill = clamp(progress * svcTabs.length - i, 0, 1);
      var bar = seg.querySelector('i');
      if (bar) bar.style.transform = 'scaleX(' + fill + ')';
    });
  }

  function setService(index) {
    index = clamp(index, 0, svcTabs.length - 1);
    if (index === svcIndex) return;
    svcIndex = index;

    services.setAttribute('data-service', String(index));

    svcTabs.forEach(function (tab, i) {
      var active = i === index;
      tab.classList.toggle('on', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    svcPanels.forEach(function (panel, i) {
      panel.classList.toggle('on', i === index);
    });

    svcBgs.forEach(function (bg, i) {
      bg.classList.toggle('on', i === index);
    });

    svcSegs.forEach(function (seg, i) {
      var active = i === index;
      seg.classList.toggle('on', active);
      seg.setAttribute('aria-pressed', String(active));
    });

    paintSegments((index + 1) / svcTabs.length);
  }

  function scrollToService(index) {
    setService(index);
    if (!isPinned()) return;

    svcLockUntil = performance.now() + 1000;
    var vh = window.innerHeight;
    var total = services.offsetHeight - vh;
    var top = window.scrollY + services.getBoundingClientRect().top;
    var target = top + total * ((index + 0.5) / svcTabs.length);

    window.scrollTo({
      top: target,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  svcTabs.forEach(function (tab) {
    var index = parseInt(tab.dataset.index, 10);

    tab.addEventListener('click', function () { scrollToService(index); });

    tab.addEventListener('keydown', function (event) {
      var next = null;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % svcTabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + svcTabs.length) % svcTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = svcTabs.length - 1;
      if (next === null) return;

      event.preventDefault();
      svcTabs[next].focus();
      scrollToService(next);
    });
  });

  svcSegs.forEach(function (seg) {
    seg.addEventListener('click', function () {
      scrollToService(parseInt(seg.dataset.index, 10));
    });
  });

  function updateServices() {
    if (!isPinned()) return;
    if (performance.now() < svcLockUntil) return;

    var total = services.offsetHeight - window.innerHeight;
    if (total <= 0) return;

    var rect = services.getBoundingClientRect();
    var progress = clamp(-rect.top / total, 0, 1);
    setService(Math.min(svcTabs.length - 1, Math.floor(progress * svcTabs.length)));
    paintSegments(progress);
  }

  /* =========================================================
     Featured cases: horizontal scroll pinned
     ========================================================= */

  var casesOverflow = 0;
  var casesPinned = false;

  function measureCases() {
    casesPinned = isPinned();

    if (!casesPinned) {
      cases.style.height = '';
      track.style.transform = '';
      if (hProgress) hProgress.style.transform = '';
      return;
    }

    var viewport = html.clientWidth;
    casesOverflow = Math.max(0, track.scrollWidth - viewport);
    cases.style.height = (window.innerHeight + casesOverflow) + 'px';
    updateCases();
  }

  function updateCases() {
    if (!casesPinned) return;

    var total = cases.offsetHeight - window.innerHeight;
    if (total <= 0) {
      track.style.transform = '';
      return;
    }

    var rect = cases.getBoundingClientRect();
    var progress = clamp(-rect.top / total, 0, 1);

    track.style.transform = 'translate3d(' + (-progress * casesOverflow) + 'px, 0, 0)';
    if (hProgress) hProgress.style.transform = 'scaleX(' + progress + ')';
  }

  /* =========================================================
     Hero parallax + scroll loop
     ========================================================= */

  function updateHero() {
    if (reduceMotion || !heroMedia || !hero) return;
    var y = Math.min(window.scrollY, hero.offsetHeight);
    heroMedia.style.transform = 'translate3d(0, ' + (y * 0.11) + 'px, 0)';
  }

  /* =========================================================
     Hero: pase automático de proyectos
     ========================================================= */

  var heroSlides = $$('.hero-slide');
  var heroSegs = $$('.hero-seg');
  var heroSlideLabel = $('#heroSlideLabel');
  var heroIndex = 0;
  var heroTimer = null;
  var heroManualPaused = false;
  var heroInView = true;
  var heroPause = $('#heroPause');

  function stopHero() {
    if (heroTimer) {
      window.clearTimeout(heroTimer);
      heroTimer = null;
    }
  }

  function scheduleHero() {
    stopHero();
    if (reduceMotion || heroManualPaused || !heroInView || document.hidden || heroSlides.length < 2) return;

    heroTimer = window.setTimeout(function () {
      setHeroSlide(heroIndex + 1, false);
      scheduleHero();
    }, 5600);
  }

  function setHeroSlide(index, restart) {
    if (!heroSlides.length) return;

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, i) {
      var active = i === heroIndex;
      slide.classList.toggle('on', active);
      slide.setAttribute('aria-hidden', String(!active));
    });

    heroSegs.forEach(function (seg, i) {
      var active = i === heroIndex;
      seg.classList.toggle('on', active);
      seg.setAttribute('aria-pressed', String(active));
    });

    if (heroSlideLabel) {
      heroSlideLabel.textContent = heroSlides[heroIndex].dataset.label || '';
    }

    if (restart !== false) scheduleHero();
  }

  function initHeroSlides() {
    if (!heroSlides.length) return;

    setHeroSlide(0, false);

    heroSegs.forEach(function (seg) {
      seg.addEventListener('click', function () {
        setHeroSlide(parseInt(seg.dataset.index, 10), false);
        scheduleHero();
      });
    });

    if (heroPause) {
      heroPause.addEventListener('click', function () {
        heroManualPaused = !heroManualPaused;
        heroPause.classList.toggle('is-paused', heroManualPaused);
        heroPause.setAttribute('aria-pressed', String(heroManualPaused));
        heroPause.setAttribute('aria-label', heroManualPaused
          ? 'Reprendre el pas de projectes'
          : 'Pausar el pas de projectes');

        if (heroManualPaused) stopHero();
        else scheduleHero();
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopHero();
      else scheduleHero();
    });

    if ('IntersectionObserver' in window && hero) {
      var heroObserver = new IntersectionObserver(function (entries) {
        heroInView = entries[0].isIntersecting;
        if (heroInView) scheduleHero();
        else stopHero();
      }, { threshold: .12 });
      heroObserver.observe(hero);
    }

    scheduleHero();
  }

  function updateScroll() {
    updateHeader();
    updateHero();
    updateServices();
    updateCases();
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateScroll();
      ticking = false;
    });
  }, { passive: true });

  /* =========================================================
     Reveals (only below the fold, so nothing flashes)
     ========================================================= */

  var revealSelectors = [
    '.intro-text',
    '.intro-sub',
    '.services-top',
    '.cases-head',
    '.stats-head',
    '.stats-grid',
    '.all-title-row',
    '.filters',
    '.case-card',
    '.contact-grid',
    '.contact-foot'
  ];

  var revealEls = $$(revealSelectors.join(','));

  revealEls.forEach(function (el, i) {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.classList.add('reveal');

    if (el.classList.contains('case-card')) {
      var siblings = $$('.case-card', el.parentElement);
      var position = siblings.indexOf(el);
      el.style.setProperty('--d', (position % 4) * 55 + 'ms');
    }
  });

  if (!reduceMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal').forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* =========================================================
     Stats counters
     ========================================================= */

  var counters = $$('[data-count]');

  function animateCounter(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var duration = 1500;
    var start = 0;

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) window.requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }

    el.textContent = '0' + suffix;
    start = performance.now();
    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    }
  }

  /* =========================================================
     Filters
     ========================================================= */

  var grid = $('#grid');
  var filterButtons = $$('#filters button');
  var gridCards = $$('.case-card', grid);

  // Los contadores de los filtros se calculan desde las tarjetas.
  filterButtons.forEach(function (button) {
    var filter = button.dataset.filter;
    var count = filter === 'Tots'
      ? gridCards.length
      : gridCards.filter(function (card) { return card.dataset.sector === filter; }).length;
    var sup = $('sup', button);

    if (sup) sup.textContent = String(count);
    if (filter !== 'Tots' && count === 0) button.hidden = true;
  });

  // La metainformación se compone de sector + servicio, sin pills flotantes.
  gridCards.forEach(function (card) {
    var meta = $('.card-meta', card);
    if (meta && card.dataset.sector) {
      meta.textContent = card.dataset.sector + ' · ' + card.dataset.service;
    }
  });

  function applyFilter(filter) {
    filterButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });

    grid.classList.add('is-filtering');
    window.setTimeout(function () {
      gridCards.forEach(function (card) {
        card.hidden = filter !== 'Tots' && card.dataset.sector !== filter;
      });
      window.requestAnimationFrame(function () {
        grid.classList.remove('is-filtering');
      });
    }, reduceMotion ? 0 : 140);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () { applyFilter(button.dataset.filter); });
  });

  /* =========================================================
     Case overlay
     ========================================================= */

  /* Contenido ampliado de los proyectos reales de cabra.design. */
  var CASE_DETAILS = {
    pepitu: {
      long: "PEPITU és un restaurant d'hamburgueses a Manresa. En vam fer la marca sencera: el nom, la identitat visual, el look i l'interiorisme. Una experiència que comença al nom i continua a taula.",
      challenge: "Crear una marca amb personalitat per a un restaurant nou, des del nom fins al local.",
      idea: "Nom, identitat, look i interiorisme pensats com un sol univers visual.",
      outcome: "Una marca completa, del nom al local.",
      gallery: ['assets/case-pepitu-2.webp', 'assets/case-pepitu-3.webp', 'assets/case-pepitu.webp']
    },
    'cafes-serra': {
      long: "Cafès Serra és un projecte global: nom, marca, envàs, xarxes socials i web. Una marca de cafè amb una veu pròpia que funciona igual a la bossa que a la pantalla.",
      challenge: "Reunir nom, marca, envàs, xarxes i web en un sol sistema coherent.",
      idea: "Una mateixa veu per a l'envàs i per al digital.",
      outcome: "Una marca de cafè recognoscible en tots els punts de contacte.",
      gallery: ['assets/case-cafes-serra.webp', 'assets/case-cafes-serra-2.webp', 'assets/case-cafes-serra-3.webp']
    },
    sikkema: {
      long: "Sikkema volia una identitat atemporal. Vam treballar el logotip, la paleta i les aplicacions perquè funcionessin igual en roba, paper i pantalla. Un sistema sobri, amb línies netes i una paleta àmplia que parla de diversitat i inclusió.",
      challenge: "Construir una identitat que no caduqués i que transmetés elegància i qualitat.",
      idea: "Un logotip minimalista, de línies netes, i una paleta que parla de diversitat i inclusió.",
      outcome: "Una identitat sobria, atemporal i fàcil d'aplicar.",
      gallery: ['assets/case-sikkema-cover.webp', 'assets/case-sikkema-folder.webp', 'assets/case-sikkema-kk.webp']
    },
    althaia: {
      long: "Amb Althaia vam dissenyar la gràfica dels seus continguts audiovisuals. Un sistema visual coherent i recognoscible, pensat per reforçar la imatge de l'entitat en l'àmbit de la salut sense perdre la sobrietat.",
      challenge: "Modernitzar la gràfica dels vídeos d'una entitat de salut sense perdre'n la sobrietat.",
      idea: "Una gràfica aplicada al vídeo, coherent i recognoscible en cada peça.",
      outcome: "Una identitat audiovisual recognoscible en cada peça.",
      video: { src: 'assets/althaia.mp4', poster: 'assets/case-althaia-poster.webp' },
      gallery: ['assets/case-althaia-2.webp', 'assets/case-althaia-3.webp', 'assets/case-althaia.webp']
    },
    'parc-sanitari': {
      long: "Al Parc Sanitari SJD en gestionem la comunicació digital i offline. L'objectiu és reforçar la presència de l'entitat en l'àmbit de la salut i mantenir una relació propera amb pacients i comunitat.",
      challenge: "Unificar la comunicació digital i offline i acostar-la a pacients i comunitat.",
      idea: "Una gestió de la comunicació amb una mateixa veu a tots els canals.",
      outcome: "Una comunicació més propera i consistent.",
      gallery: ['assets/case-parc-sanitari.webp', 'assets/case-parc-sanitari-2.webp', 'assets/case-parc-sanitari-3.webp']
    },
    'clinica-dental': {
      long: "Vam renovar la imatge de la Clínica Dental Basterretxea, a Bagà, amb un logotip serè que reflecteix el compromís amb la feina ben feta. Una paleta de colors calmats que transmet confiança als pacients.",
      challenge: "Renovar la imatge d'una clínica dental sense perdre la confiança que ja tenia.",
      idea: "Un logotip serè i una paleta que transmet calma i qualitat.",
      outcome: "Una imatge més propera i fiable.",
      gallery: ['assets/case-clinica-dental-2.webp', 'assets/case-clinica-dental-3.webp', 'assets/case-clinica-dental.webp']
    },
    dduueett: {
      long: "Dduueett és un fabricant d'equipament per a salut, benestar i perruqueria. Vam fer una web que ordena un catàleg molt ampli per segments i converteix una marca potent en una experiència digital clara, directa i amb personalitat.",
      challenge: "Ordenar un catàleg tècnic i molt ampli sense perdre la força de la marca.",
      idea: "Una web per segments, amb una direcció d'art valenta i un recorregut B2B clar.",
      outcome: "Una web que explica el producte i obre la porta a la botiga en línia B2B.",
      hero: 'assets/case-dduueett.webp',
      gallery: ['assets/case-dduueett-card.webp', 'assets/case-dduueett.webp', 'assets/case-dduueett-2.webp']
    },
    pdepages: {
      long: "PdePagès és la marca d'una xarxa de pagesos i cooperatives del litoral català. Vam fer una web fresca i directa per explicar el producte, els productors i la venda de proximitat, del camp a la taula.",
      challenge: "Convertir una xarxa de productors locals en una marca digital propera i fàcil d'entendre.",
      idea: "Una web amb la frescor del producte: color, tipografia i contingut que parlen del camp i de la proximitat.",
      outcome: "Una marca digital recognoscible, amb el producte i les persones al centre.",
      hero: 'assets/case-pdepages.webp',
      gallery: ['assets/case-pdepages-card.webp', 'assets/case-pdepages-2.webp', 'assets/case-pdepages-3.webp']
    }
  };

  var overlay = $('#caseOverlay');
  var caseBg = $('#caseBg');
  var caseVideo = $('#caseVideo');
  var caseTitle = $('#caseTitle');
  var caseMeta = $('#caseMeta');
  var caseDesc = $('#caseDesc');
  var caseResult = $('#caseResult');
  var caseBody = $('.case-body');
  var caseScroll = $('#caseScroll');
  var caseLong = $('#caseLong');
  var caseChallenge = $('#caseChallenge');
  var caseIdea = $('#caseIdea');
  var caseOutcome = $('#caseOutcome');
  var caseGallery = $('#caseGallery');
  var caseMetaGrid = $('#caseMetaGrid');
  var caseClose = $('#caseClose');
  var caseNext = $('#caseNext');
  var caseNextBottom = $('#caseNextBottom');
  var caseAll = $('#caseAll');
  var overlayOpen = false;
  var activeCard = null;
  var lastFocus = null;
  var closeTimer = null;

  function cardImage(card) {
    var img = $('img', card);
    if (!img) return { src: '', alt: '' };
    return { src: img.currentSrc || img.src, alt: img.alt || '' };
  }

  function addMetaItem(label, value) {
    if (!caseMetaGrid) return;
    var row = document.createElement('div');
    var key = document.createElement('span');
    var val = document.createElement('strong');
    key.className = 'mono';
    key.textContent = label;
    val.textContent = value;
    row.appendChild(key);
    row.appendChild(val);
    caseMetaGrid.appendChild(row);
  }

  function populateCase(card, animate) {
    var image = cardImage(card);
    var detail = CASE_DETAILS[card.dataset.case] || {};

    caseBg.src = detail.hero || image.src;
    caseBg.alt = detail.hero ? card.dataset.title : image.alt;

    if (caseVideo) {
      caseVideo.pause();
      if (detail.video && !reduceMotion) {
        caseBg.hidden = true;
        caseVideo.hidden = false;

        if (caseVideo.getAttribute('src') !== detail.video.src) {
          caseVideo.src = detail.video.src;
          caseVideo.poster = detail.video.poster || '';
          caseVideo.load();
        }

        caseVideo.muted = true;
        caseVideo.loop = true;
        caseVideo.playsInline = true;

        try { caseVideo.currentTime = 0; } catch (error) {}

        window.requestAnimationFrame(function () {
          var playPromise = caseVideo.play();
          if (playPromise && playPromise.catch) playPromise.catch(function () {});
        });
      } else {
        caseVideo.hidden = true;
        caseBg.hidden = false;
      }
    } else {
      caseBg.hidden = false;
    }

    caseTitle.textContent = card.dataset.title;
    caseMeta.textContent = card.dataset.sector + ' · ' + card.dataset.service + ' · ' + card.dataset.year;
    caseDesc.textContent = card.dataset.desc;
    caseResult.textContent = card.dataset.result;

    if (caseLong) caseLong.textContent = detail.long || card.dataset.desc;
    if (caseChallenge) caseChallenge.textContent = detail.challenge || '';
    if (caseIdea) caseIdea.textContent = detail.idea || '';
    if (caseOutcome) caseOutcome.textContent = detail.outcome || '';

    if (caseGallery) {
      caseGallery.innerHTML = '';
      var gallery = detail.gallery && detail.gallery.length ? detail.gallery : [image.src];
      gallery.slice(0, 3).forEach(function (item, index) {
        var figure = document.createElement('figure');

        if (item && typeof item === 'object' && item.type === 'video') {
          var video = document.createElement('video');
          video.src = item.src;
          if (item.poster) video.poster = item.poster;
          video.controls = true;
          video.muted = true;
          video.loop = !reduceMotion;
          video.autoplay = !reduceMotion;
          video.playsInline = true;
          video.preload = 'metadata';
          video.setAttribute('aria-label', 'Vídeo del projecte ' + card.dataset.title);

          var cue = document.createElement('span');
          cue.className = 'case-video-cue';
          cue.setAttribute('aria-hidden', 'true');
          cue.innerHTML = '<svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z"/></svg><span>Vídeo</span>';

          figure.appendChild(video);
          figure.appendChild(cue);

          video.addEventListener('play', function () { figure.classList.add('is-playing'); });
          video.addEventListener('pause', function () { figure.classList.remove('is-playing'); });
        } else {
          var src = item && typeof item === 'object' ? item.src : item;
          var img = document.createElement('img');
          img.src = src;
          img.alt = 'Imatge del projecte ' + card.dataset.title + (index ? ' · detall ' + index : '');
          img.loading = 'lazy';
          img.decoding = 'async';
          figure.appendChild(img);
        }

        caseGallery.appendChild(figure);
      });
    }

    if (caseMetaGrid) {
      caseMetaGrid.innerHTML = '';
      addMetaItem('Client', card.dataset.title);
      addMetaItem('Sector', card.dataset.sector);
      addMetaItem('Servei', card.dataset.service);
      addMetaItem('Any', card.dataset.year);
    }

    if (animate) {
      caseBody.classList.remove('swap');
      void caseBody.offsetWidth;
      caseBody.classList.add('swap');
    }
  }

  function openCase(card, origin) {
    if (!card) return;

    window.clearTimeout(closeTimer);
    activeCard = card;
    lastFocus = origin || document.activeElement;
    populateCase(card, false);

    overlay.setAttribute('aria-hidden', 'false');
    overlay.style.visibility = 'visible';
    overlay.classList.add('is-open');
    if (caseScroll) caseScroll.scrollTop = 0;

    overlayOpen = true;
    html.classList.add('lock');
    if (header) header.inert = true;
    if (main) main.inert = true;
    if (footer) footer.inert = true;

    document.addEventListener('keydown', overlayKeys);
    window.setTimeout(function () { caseClose.focus({ preventScroll: true }); }, 80);
  }

  function closeCase() {
    if (!overlayOpen) return;
    overlayOpen = false;

    if (caseVideo) caseVideo.pause();

    if (caseGallery) {
      var playingVideo = $('video', caseGallery);
      if (playingVideo) playingVideo.pause();
    }

    document.removeEventListener('keydown', overlayKeys);
    html.classList.remove('lock');
    if (header) header.inert = false;
    if (main) main.inert = false;
    if (footer) footer.inert = false;

    overlay.classList.remove('is-open');

    if (!reduceMotion) {
      closeTimer = window.setTimeout(function () {
        overlay.style.visibility = 'hidden';
        overlay.setAttribute('aria-hidden', 'true');
      }, 460);
    } else {
      overlay.style.visibility = 'hidden';
      overlay.setAttribute('aria-hidden', 'true');
    }

    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus({ preventScroll: true });
    }
  }

  function nextCase() {
    if (!activeCard) return;
    var index = gridCards.indexOf(activeCard);
    var next = gridCards[(index + 1) % gridCards.length];
    if (!next) return;
    activeCard = next;
    populateCase(next, true);
    if (caseScroll) caseScroll.scrollTop = 0;
    window.setTimeout(function () { caseClose.focus({ preventScroll: true }); }, 100);
  }

  function showAllCases() {
    closeCase();
    var all = document.getElementById('todos');
    if (all) {
      window.setTimeout(function () {
        all.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }, 280);
    }
  }

  function overlayKeys(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCase();
      return;
    }

    if (event.key !== 'Tab') return;

    var focusable = $$('button, a[href]', overlay).filter(function (el) {
      return el.getClientRects().length > 0;
    });
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (overlay) {
    caseClose.addEventListener('click', closeCase);
    caseNext.addEventListener('click', nextCase);
    if (caseNextBottom) caseNextBottom.addEventListener('click', nextCase);
    if (caseAll) caseAll.addEventListener('click', showAllCases);

    $$('[data-case]').forEach(function (el) {
      el.setAttribute('aria-haspopup', 'dialog');
      el.addEventListener('click', function (event) {
        event.preventDefault();
        var card = el.classList.contains('case-card')
          ? el
          : gridCards.filter(function (c) { return c.dataset.case === el.dataset.case; })[0];
        openCase(card, el);
      });
    });
  }

  /* =========================================================
     Resize / load
     ========================================================= */

  var resizeTimer = null;

  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      if (window.innerWidth > 1000 && menuOpen) setMenu(false);
      if (reduceMotion) return;
      measureCases();
      updateScroll();
    }, 150);
  }

  window.addEventListener('resize', onResize);

  function init() {
    updateHeader();
    updateHero();
    initHeroSlides();
    setService(0);
    updateServices();
    measureCases();
    updateScroll();

    if (window.innerWidth > 1000 && menuOpen) setMenu(false);
  }

  init();

  window.addEventListener('load', function () {
    measureCases();
    updateScroll();
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      measureCases();
      updateScroll();
    });
  }

  /* =========================================================
     Cursor personalizado (solo desktop con puntero fino)
     ========================================================= */

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

  /* =========================================================
     Footer year
     ========================================================= */

  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
