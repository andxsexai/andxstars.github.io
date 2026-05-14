/**
 * ANDXSTARS v7.0 — clean, professional, stable.
 *  - Single-page scroll navigation + mobile burger
 *  - Lazy-loaded hover videos (IntersectionObserver, safe if not supported)
 *  - Portfolio gallery built from a declarative manifest, with filter + lightbox
 *  - Keyboard and touch friendly lightbox (arrows, ESC, swipe)
 */

// ----------------------------------------------------------------------------
// Asset helpers
// ----------------------------------------------------------------------------

/** Build an absolute URL for an asset relative to the current page. Works on
 *  GitHub Pages (root or project subfolder) and on a local file:// preview. */
function asset(rel) {
  const clean = String(rel || '').replace(/^\.?\/*/, '');
  try {
    const origin = typeof document !== 'undefined' ? document.baseURI : '';
    return new URL(clean, origin).href;
  } catch (_) {
    return './' + clean;
  }
}

/** Encode each path segment safely (keeps Cyrillic and spaces working). */
function encodePath(path) {
  return String(path || '')
    .split('/')
    .map((seg, i) => {
      if (seg === '' && i === 0) return '';
      if (/^[A-Za-z0-9._-]+$/.test(seg)) return seg;
      return encodeURIComponent(seg);
    })
    .join('/');
}

function buildAsset(rel) {
  return asset(encodePath(rel));
}

const isVideo = (f) => /\.(mp4|webm|ogv|mov)$/i.test(f);

// ----------------------------------------------------------------------------
// Portfolio manifest
// ----------------------------------------------------------------------------

const PORTFOLIO = [
  // Нейро-видео (только файлы из репозитория — без «битых» путей)
  { category: 'neuro', label: 'AI · нейроролик', path: 'dopoln/нейросети/grok-video-2313d3aa-125b-451e-b040-0c0c6a6cc037.mp4', poster: 'posters/service-neuro.jpg' },
  { category: 'neuro', label: 'Автоматизация · образ', path: 'dopoln/автоматизации/Superhero_possesses_digital_202603291845.mp4', poster: 'posters/dopoln-auto.jpg' },
  { category: 'neuro', label: 'Подкасты · неон', path: 'catalog-uslug/podcustle/Holograms_purple_sounds_202603291733.mp4', poster: 'posters/service-podcast.jpg' },
  { category: 'neuro', label: 'Нейро-петля', path: 'catalog-uslug/multikif/flow-neuro-loop.mp4', poster: 'posters/dopoln-ai.jpg' },
  { category: 'neuro', label: 'Моушн · IT', path: 'catalog-uslug/it/Frame_approximation_moves_202603291824.mp4', poster: 'posters/service-dev.jpg' },
  { category: 'neuro', label: 'Сайты · динамика', path: 'dopoln/сайты/Sensors_moving,_camera_202603291842.mp4', poster: 'posters/dopoln-sites.jpg' },
  { category: 'neuro', label: 'Музыка · бас', path: 'dopoln/музыка/Guy_plays_bass_202603291841.mp4', poster: 'posters/dopoln-music.jpg' },
  { category: 'neuro', label: 'Цигун · tech', path: 'dopoln/цигун/Moves_technology_engaging_202603291845.mp4', poster: 'posters/dopoln-qigong.jpg' },
  { category: 'neuro', label: 'Контент · студия', path: 'catalog-uslug/photo-video/Developer_at_desk_202603291823.mp4', poster: 'posters/dopoln-photo.jpg' },
  { category: 'neuro', label: 'Мультик · сцена', path: 'catalog-uslug/multikif/Flow_delpmaspu_ (1).mp4', poster: 'posters/service-content.jpg' },

  // Дизайн — постеры из /posters (всегда открываются)
  { category: 'design', label: 'Ключ · AI', path: 'posters/dopoln-ai.jpg' },
  { category: 'design', label: 'Ключ · сайты', path: 'posters/dopoln-sites.jpg' },
  { category: 'design', label: 'Ключ · звук', path: 'posters/dopoln-music.jpg' },
  { category: 'design', label: 'Ключ · фото', path: 'posters/dopoln-photo.jpg' },
  { category: 'design', label: 'Ключ · автоматизация', path: 'posters/dopoln-auto.jpg' },
  { category: 'design', label: 'Ключ · практика', path: 'posters/dopoln-qigong.jpg' },
  { category: 'design', label: 'Сервис · нейро', path: 'posters/service-neuro.jpg' },
  { category: 'design', label: 'Сервис · контент', path: 'posters/service-content.jpg' },
  { category: 'design', label: 'Сервис · IT', path: 'posters/service-dev.jpg' },
  { category: 'design', label: 'Сервис · подкасты', path: 'posters/service-podcast.jpg' },

  // Кейсы — сильные единичные работы
  { category: 'cases', label: 'Кейс · превью бренда', path: 'photos/og-preview.jpg' },
  { category: 'cases', label: 'Кейс · нейровизуал', path: 'posters/dopoln-ai.jpg' },
  { category: 'cases', label: 'Кейс · за кадром', path: 'catalog-uslug/photo-video/Developer_at_desk_202603291823.mp4', poster: 'posters/dopoln-photo.jpg' },
  { category: 'cases', label: 'Кейс · нейропетля', path: 'catalog-uslug/multikif/flow-neuro-loop.mp4', poster: 'posters/dopoln-ai.jpg' },
  { category: 'cases', label: 'Кейс · подкаст', path: 'catalog-uslug/podcustle/Holograms_purple_sounds_202603291733.mp4', poster: 'posters/service-podcast.jpg' },
  { category: 'cases', label: 'Кейс · движение IT', path: 'catalog-uslug/it/Frame_approximation_moves_202603291824.mp4', poster: 'posters/service-dev.jpg' },
];

const CATEGORY_LABEL = { neuro: 'Нейро-видео', design: 'Дизайн', cases: 'Кейсы' };

// Carousel slides — from /carousel folder
const CAROUSEL_SLIDES = [
  { path: 'posters/dopoln-ai.jpg', alt: 'Карусель · AI' },
  { path: 'posters/dopoln-sites.jpg', alt: 'Карусель · сайты' },
  { path: 'posters/dopoln-music.jpg', alt: 'Карусель · звук' },
  { path: 'posters/dopoln-photo.jpg', alt: 'Карусель · фото' },
  { path: 'posters/dopoln-auto.jpg', alt: 'Карусель · авто-процессы' },
  { path: 'posters/dopoln-qigong.jpg', alt: 'Карусель · практика' },
  { path: 'posters/service-neuro.jpg', alt: 'Карусель · нейро' },
  { path: 'posters/service-content.jpg', alt: 'Карусель · контент' },
  { path: 'posters/service-dev.jpg', alt: 'Карусель · dev' },
  { path: 'posters/service-podcast.jpg', alt: 'Карусель · подкасты' },
];

// ----------------------------------------------------------------------------
// Gallery rendering + filters
// ----------------------------------------------------------------------------

function renderGallery() {
  const root = document.getElementById('gallery');
  if (!root) return;
  const frag = document.createDocumentFragment();

  PORTFOLIO.forEach((item, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';
    tile.dataset.cat = item.category;
    tile.dataset.index = String(index);
    if (isVideo(item.path)) tile.classList.add('video-tile');

    const badge = document.createElement('span');
    badge.className = 'tile-badge';
    badge.textContent = CATEGORY_LABEL[item.category] || item.category;
    tile.appendChild(badge);

    tile.dataset.label = item.label || CATEGORY_LABEL[item.category] || '';

    if (isVideo(item.path)) {
      const v = document.createElement('video');
      v.muted = true;
      v.playsInline = true;
      v.loop = true;
      v.preload = 'metadata';
      if (item.poster) v.poster = buildAsset(item.poster);
      v.dataset.src = buildAsset(item.path);
      v.addEventListener('error', () => { tile.dataset.broken = '1'; }, { once: true });
      tile.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = item.label;
      img.src = buildAsset(item.path);
      img.addEventListener('error', () => { tile.dataset.broken = '1'; }, { once: true });
      tile.appendChild(img);
    }

    tile.addEventListener('click', () => openLightbox(index));
    tile.classList.add('is-hidden');
    frag.appendChild(tile);
  });

  root.innerHTML = '';
  root.appendChild(frag);
  observeLazyVideos(root);
}

// ----------------------------------------------------------------------------
// Lazy-load videos (+ play on hover)
// ----------------------------------------------------------------------------

function hydrateVideo(v) {
  if (!v || v.dataset.hydrated === '1') return;
  const src = v.dataset.src;
  if (!src) { v.dataset.hydrated = '1'; return; }
  // Create source if missing; otherwise set src directly
  if (v.querySelector('source')) {
    v.querySelector('source').src = src;
  } else {
    v.src = src;
  }
  v.muted = true;
  try { v.load(); } catch (_) {}
  v.dataset.hydrated = '1';
}

function observeLazyVideos(root) {
  const scope = root || document;
  const perfLite = document.documentElement.classList.contains('perf-lite');
  const videos = Array.from(scope.querySelectorAll('video[data-src]')).filter((v) => {
    if (!perfLite) return true;
    return !v.classList.contains('hover-video');
  });
  if (!videos.length) return;

  if (typeof IntersectionObserver !== 'function') {
    videos.forEach(hydrateVideo);
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hydrateVideo(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '200px 0px' }
  );
  videos.forEach((v) => io.observe(v));
}

/** Skip heavy card/hero hover videos on low-tier devices (see perf-lite in index.html). */
function isPerfLite() {
  return document.documentElement.classList.contains('perf-lite');
}

function initHoverVideos() {
  if (!isPerfLite()) {
    // hover-to-play inside service and skill cards
    document.querySelectorAll('.hover-video').forEach((v) => {
      const card = v.closest('.service, .skill');
      if (!card) return;
      const start = () => {
        hydrateVideo(v);
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      };
      const stop = () => {
        try { v.pause(); v.currentTime = 0; } catch (_) {}
      };
      card.addEventListener('mouseenter', start);
      card.addEventListener('mouseleave', stop);
      card.addEventListener('focusin', start);
      card.addEventListener('focusout', stop);
    });

    // Auto-play service/skill videos while the card is in view — so mobile
    // and touch users see the animation immediately without hovering.
    if (typeof IntersectionObserver === 'function') {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const v = entry.target.querySelector('video.hover-video');
          if (!v) return;
          const media = entry.target.querySelector('.service-media') || entry.target;
          if (entry.isIntersecting) {
            hydrateVideo(v);
            v.addEventListener('playing', function onPlay() {
              media.classList.add('is-playing');
              entry.target.classList.add('is-playing');
              v.removeEventListener('playing', onPlay);
            }, { once: true });
            const p = v.play();
            if (p && p.catch) p.catch(() => {});
          } else {
            try { v.pause(); } catch (_) {}
            media.classList.remove('is-playing');
            entry.target.classList.remove('is-playing');
          }
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('.service, .skill').forEach((card) => io.observe(card));
    }
  }

  // tiles: preview on hover (desktop) — gallery videos still lazy-load; skip hover autoplay in perf-lite
  if (!isPerfLite()) {
    document.querySelectorAll('#gallery .video-tile video').forEach((v) => {
      const tile = v.closest('.tile');
      if (!tile) return;
      tile.addEventListener('mouseenter', () => {
        hydrateVideo(v);
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      });
      tile.addEventListener('mouseleave', () => {
        try { v.pause(); } catch (_) {}
      });
    });
  }
}

// Hero video: only mount source after we've ruled out perf-lite (saves bandwidth on weak devices).
function initHeroVideo() {
  const v = document.querySelector('.hero-video');
  if (!v) return;
  if (isPerfLite()) return;
  const rel = v.getAttribute('data-hero-src');
  if (!rel) return;
  const src = buildAsset(rel);
  const source = document.createElement('source');
  source.src = src;
  source.type = 'video/mp4';
  v.appendChild(source);
  v.setAttribute('autoplay', '');
  v.setAttribute('preload', 'metadata');
  try { v.load(); } catch (_) {}
  const tryPlay = () => {
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };
  if (v.readyState >= 2) tryPlay();
  v.addEventListener('loadeddata', tryPlay, { once: true });
}

// ----------------------------------------------------------------------------
// Lightbox
// ----------------------------------------------------------------------------

let lbCurrent = 0;
let lbVisibleIndexes = [];
/** Активный каталог портфолио (после выбора на витрине). */
let portfolioCategory = null;

function applyPortfolioFilter() {
  document.querySelectorAll('#gallery .tile').forEach((tile) => {
    const ok = portfolioCategory && tile.dataset.cat === portfolioCategory;
    tile.classList.toggle('is-hidden', !ok);
  });
}

function initPortfolioFlow() {
  const cover = document.getElementById('portfolioCover');
  const chooser = document.getElementById('portfolioChooser');
  const active = document.getElementById('portfolioActive');
  const labelEl = document.getElementById('portfolioActiveLabel');
  if (!cover || !chooser || !active) return;

  document.getElementById('portfolioRevealBtn')?.addEventListener('click', () => {
    cover.classList.add('is-hidden');
    chooser.classList.remove('is-hidden');
    chooser.setAttribute('aria-hidden', 'false');
  });

  document.querySelectorAll('.portfolio-cat').forEach((btn) => {
    btn.addEventListener('click', () => {
      portfolioCategory = btn.dataset.cat || null;
      chooser.classList.add('is-hidden');
      chooser.setAttribute('aria-hidden', 'true');
      active.classList.remove('is-hidden');
      active.setAttribute('aria-hidden', 'false');
      if (labelEl && portfolioCategory) labelEl.textContent = CATEGORY_LABEL[portfolioCategory] || '';
      applyPortfolioFilter();
      const gal = document.getElementById('gallery');
      if (gal) observeLazyVideos(gal);
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  document.getElementById('portfolioPickAnother')?.addEventListener('click', () => {
    portfolioCategory = null;
    active.classList.add('is-hidden');
    active.setAttribute('aria-hidden', 'true');
    chooser.classList.remove('is-hidden');
    chooser.setAttribute('aria-hidden', 'false');
    document.querySelectorAll('#gallery .tile').forEach((t) => t.classList.add('is-hidden'));
  });
}

function getVisibleIndexes() {
  if (!portfolioCategory) {
    return PORTFOLIO.map(function (_, i) { return i; });
  }
  return PORTFOLIO
    .map(function (item, i) { return { item: item, i: i }; })
    .filter(function (x) { return x.item.category === portfolioCategory; })
    .map(function (x) { return x.i; });
}

function renderLightbox(index) {
  const stage = document.getElementById('lbStage');
  if (!stage) return;
  stage.innerHTML = '';
  const item = PORTFOLIO[index];
  if (!item) return;
  if (isVideo(item.path)) {
    const v = document.createElement('video');
    v.src = buildAsset(item.path);
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    v.loop = true;
    if (item.poster) v.poster = buildAsset(item.poster);
    stage.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = buildAsset(item.path);
    img.alt = item.label;
    stage.appendChild(img);
  }
}

function openLightbox(index) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lbVisibleIndexes = getVisibleIndexes();
  if (!lbVisibleIndexes.includes(index)) lbVisibleIndexes.unshift(index);
  lbCurrent = index;
  renderLightbox(lbCurrent);
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  const stage = document.getElementById('lbStage');
  if (stage) stage.innerHTML = '';
}

function stepLightbox(dir) {
  const list = lbVisibleIndexes.length ? lbVisibleIndexes : PORTFOLIO.map((_, i) => i);
  const pos = list.indexOf(lbCurrent);
  const next = list[(pos + dir + list.length) % list.length];
  lbCurrent = next;
  renderLightbox(lbCurrent);
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lbClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lbPrev')?.addEventListener('click', () => stepLightbox(-1));
  document.getElementById('lbNext')?.addEventListener('click', () => stepLightbox(1));
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') stepLightbox(1);
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
  });

  // basic swipe
  let startX = null;
  lb.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) stepLightbox(dx < 0 ? 1 : -1);
  });
}

// ----------------------------------------------------------------------------
// Carousel (Instagram-style)
// ----------------------------------------------------------------------------

let carouselIndex = 0;
let carouselTimer = null;
const CAROUSEL_AUTOPLAY_MS = 4500;

function renderCarousel() {
  const stage = document.getElementById('carouselStage');
  const dotsWrap = document.getElementById('carouselDots');
  if (!stage || !dotsWrap) return;

  const frag = document.createDocumentFragment();
  const dotFrag = document.createDocumentFragment();

  CAROUSEL_SLIDES.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = 'carousel-slide' + (i === 0 ? ' is-active' : '');
    el.dataset.index = String(i);
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', `Слайд ${i + 1} из ${CAROUSEL_SLIDES.length}`);

    const img = document.createElement('img');
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    img.alt = slide.alt;
    img.src = buildAsset(slide.path);
    img.addEventListener('error', () => {
      el.dataset.broken = '1';
    }, { once: true });
    el.appendChild(img);

    const caption = document.createElement('div');
    caption.className = 'slide-caption';
    caption.textContent = `${String(i + 1).padStart(2, '0')} / ${String(CAROUSEL_SLIDES.length).padStart(2, '0')} · ${slide.alt}`;
    el.appendChild(caption);

    frag.appendChild(el);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
    dot.setAttribute('role', 'tab');
    dot.dataset.index = String(i);
    dot.addEventListener('click', () => setCarouselIndex(i));
    dotFrag.appendChild(dot);
  });

  stage.innerHTML = '';
  stage.appendChild(frag);
  dotsWrap.innerHTML = '';
  dotsWrap.appendChild(dotFrag);
}

function setCarouselIndex(i) {
  const total = CAROUSEL_SLIDES.length;
  if (!total) return;
  carouselIndex = ((i % total) + total) % total;
  document.querySelectorAll('.carousel-slide').forEach((s) => {
    s.classList.toggle('is-active', Number(s.dataset.index) === carouselIndex);
  });
  document.querySelectorAll('.carousel-dot').forEach((d) => {
    d.classList.toggle('is-active', Number(d.dataset.index) === carouselIndex);
  });
}

function startCarouselAutoplay() {
  stopCarouselAutoplay();
  if (isPerfLite()) return;
  carouselTimer = window.setInterval(() => {
    setCarouselIndex(carouselIndex + 1);
  }, CAROUSEL_AUTOPLAY_MS);
}

function stopCarouselAutoplay() {
  if (carouselTimer) {
    window.clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function initCarousel() {
  const stage = document.getElementById('carouselStage');
  if (!stage) return;
  renderCarousel();

  document.getElementById('carouselPrev')?.addEventListener('click', () => {
    setCarouselIndex(carouselIndex - 1);
    startCarouselAutoplay();
  });
  document.getElementById('carouselNext')?.addEventListener('click', () => {
    setCarouselIndex(carouselIndex + 1);
    startCarouselAutoplay();
  });

  // swipe
  let startX = null;
  let startY = null;
  stage.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = null; startY = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      setCarouselIndex(carouselIndex + (dx < 0 ? 1 : -1));
      startCarouselAutoplay();
    }
  });

  // pause on hover, resume on leave
  const wrap = stage.closest('.carousel-wrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', stopCarouselAutoplay);
    wrap.addEventListener('mouseleave', startCarouselAutoplay);
  }

  // only autoplay when in viewport
  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startCarouselAutoplay();
        else stopCarouselAutoplay();
      });
    }, { threshold: 0.3 });
    io.observe(stage);
  } else {
    startCarouselAutoplay();
  }

  // respect reduced-motion and perf-lite
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stopCarouselAutoplay();
  }
  if (isPerfLite()) stopCarouselAutoplay();
}

// ----------------------------------------------------------------------------
// Scroll reveal
// ----------------------------------------------------------------------------

function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (typeof IntersectionObserver !== 'function') {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  targets.forEach((el) => io.observe(el));
}

// ----------------------------------------------------------------------------
// Nav burger + anchor scroll
// ----------------------------------------------------------------------------

function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.querySelector('.nav-links');
  const overlay = document.getElementById('menuOverlay');

  const closeMenu = () => {
    if (!links) return;
    links.classList.remove('open');
    if (overlay) overlay.classList.remove('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  };

  const openMenu = () => {
    if (!links) return;
    links.classList.add('open');
    if (overlay) overlay.classList.add('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  };

  if (burger && links) {
    burger.addEventListener('click', () => {
      if (links.classList.contains('open')) closeMenu();
      else openMenu();
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });
  }

  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links && links.classList.contains('open')) closeMenu();
  });

  // Shrink/elevate nav on scroll
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Year in the footer
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
}

// ----------------------------------------------------------------------------
// Animated counters
// ----------------------------------------------------------------------------

function initCounters() {
  var counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  if (isPerfLite()) {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-target'); });
    return;
  }

  if (typeof IntersectionObserver !== 'function') {
    counters.forEach(function(el) { el.textContent = el.getAttribute('data-target'); });
    return;
  }

  var io = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-target'), 10);
      var duration = 1400;
      var start = performance.now();
      var step = function(now) {
        var elapsed = Math.min(1, (now - start) / duration);
        var ease = 1 - Math.pow(1 - elapsed, 3);
        el.textContent = Math.round(target * ease);
        if (elapsed < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(function(el) { io.observe(el); });
}

// ----------------------------------------------------------------------------
// Панель «Навыки»: возражения, преимущества, мультизадачность
// ----------------------------------------------------------------------------

const SKILL_MULTITASK =
  '<p class="skill-multi"><strong>Почему мультизадачность — база ANDXSTARS.</strong> Сейчас бренд держится на одновременном качестве визуала, звука, AI и автоматизаций. Я прохожу весь конвейер сам — от идеи и сценария до публикации и интеграций (n8n, боты, CRM). Это не «делаю всё сразу хуже», а переключение режимов продакшена без потери качества: я быстрее закрываю возражения и закрываю дыры на стыке дисциплин, пока три узких специалиста ещё согласуют ТЗ.</p>';

const SKILL_SHEET_CONTENT = {
  sites: {
    title: 'Сайты и воронки',
    html:
      '<h4>Что даёт направление</h4><p>Лендинг и воронка как единый интерфейс продаж: понятный путь к заявке, события аналитики, связка с Telegram/ботом и оплатой.</p>' +
      '<h4>Возражения → как работаю</h4><ul><li><strong>«Соберу в конструкторе»</strong> — на нестандартной воронке шаблоны ломаются; кастом держит сценарий и правки без костылей.</li><li><strong>«Дорого»</strong> — вы платите за меньше итераций и за то, что копирайт, визуал и техника смотрят в одну цель.</li></ul>' +
      '<h4>Среди конкурентов</h4><p>Классическая веб-студия часто отдаёт «красивую оболочку»; я довожу до работающей связки с ботом, оплатой и событиями — чтобы лиды не терялись между страницами.</p>' +
      SKILL_MULTITASK,
  },
  music: {
    title: 'Музыка и саунд-дизайн',
    html:
      '<h4>Что даёт направление</h4><p>Фирменный тембр, аранжировки под Reels/Shorts, чистый микс — звук перестаёт «отличаться дорогой от дешёвого контента».</p>' +
      '<h4>Возражения → как работаю</h4><ul><li><strong>«Куплю бит на стоке»</strong> — риск одинакового звука у конкурентов; я собираю узнаваемый слой под ваш визуальный код.</li><li><strong>«Нет времени на согласование»</strong> — короткие демо, понятные версии, финал без бесконечных кругов.</li></ul>' +
      '<h4>Среди конкурентов</h4><p>Битмейкер без монтажа не видит ритм кадра; я стыкую музыку с видеорядом, чтобы удержание не убивало «не тот дроп».</p>' +
      SKILL_MULTITASK,
  },
  neuro: {
    title: 'Нейросети и AI-видео',
    html:
      '<h4>Что даёт направление</h4><p>Сценарий, генерация, ретушь кадра, голос и монтаж — AI как ускоритель, а не замена вкуса.</p>' +
      '<h4>Возражения → как работаю</h4><ul><li><strong>«Нейросеть выглядит дёшево»</strong> — закрывается режиссурой, цветом и пост-обработкой; «сырой» результат не уходит в эфир.</li><li><strong>«Боюсь авторских рисков»</strong> — проговариваем источники и пайплайн до съёмки/публикации.</li></ul>' +
      '<h4>Среди конкурентов</h4><p>Сервисы «нажал кнопку» не держат бренд-голос; я собираю AI под вашу подачу и под платформу (Reels/реклама/лендинг).</p>' +
      SKILL_MULTITASK,
  },
  auto: {
    title: 'Автоматизация и интеграции',
    html:
      '<h4>Что даёт направление</h4><p>Заявки, уведомления, напоминания, перенос в CRM, отчёты — сценарии в n8n и ботах, чтобы вы не жили в таблицах.</p>' +
      '<h4>Возражения → как работаю</h4><ul><li><strong>«Хватит Google-форм»</strong> — форма — только вход; дальше данные должны жить там, где вы продаёте.</li><li><strong>«Боюсь сломать процесс»</strong> — поэтапное включение, тест и откат без простоя в лидогенерации.</li></ul>' +
      '<h4>Среди конкурентов</h4><p>Интегратор без понимания маркетинга строит «красивые стрелочки»; я ставлю автоматизацию под реальные касания клиента.</p>' +
      SKILL_MULTITASK,
  },
  qigong: {
    title: 'Цигун и устойчивое состояние',
    html:
      '<h4>Что даёт направление</h4><p>Онлайн-практика для перегруженных расписаний: фокус, дыхание, работа с телом — чтобы не выгорать на длинной дистанции проектов.</p>' +
      '<h4>Возражения → как работаю</h4><ul><li><strong>«Это не про бизнес»</strong> — ресурс внимания напрямую влияет на качество решений и скорость согласований.</li><li><strong>«Нет времени»</strong> — короткие ясные комплексы с записью для самостоятельной работы.</li></ul>' +
      '<h4>Среди конкурентов</h4><p>Массовые курсы без разбора состояния дают шаблон; я подбираю комплекс под вашу нагрузку и задачу.</p>' +
      SKILL_MULTITASK,
  },
  photo: {
    title: 'Фото и визуальные сессии',
    html:
      '<h4>Что даёт направление</h4><p>Портрет и контент под карточки, обложки и кампании — свет, цвет и кадр, которые продолжают бренд, а не «случайный кадр с телефона».</p>' +
      '<h4>Возражения → как работаю</h4><ul><li><strong>«Сниму на смартфон»</strong> — для экспертного позиционирования не хватает глубины и единого цвета; это видно в ленте.</li><li><strong>«Неловко в кадре»</strong> — спокойная постановка, референсы и понятные позы без театра.</li></ul>' +
      '<h4>Среди конкурентов</h4><p>Фотограф без монтажа/дизайна теряет связку с носителями; я понимаю, куда уйдёт кадр: сайт, соцсети, наружка.</p>' +
      SKILL_MULTITASK,
  },
};

function openSkillSheet(key) {
  const sheet = document.getElementById('skillSheet');
  const data = SKILL_SHEET_CONTENT[key];
  const titleEl = document.getElementById('skillSheetTitle');
  const bodyEl = document.getElementById('skillSheetBody');
  if (!sheet || !data || !titleEl || !bodyEl) return;
  titleEl.textContent = data.title;
  bodyEl.innerHTML = data.html;
  sheet.hidden = false;
  sheet.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
  document.querySelectorAll('.skill-tile').forEach(function (b) {
    b.setAttribute('aria-expanded', b.dataset.skill === key ? 'true' : 'false');
  });
  document.getElementById('skillSheetClose')?.focus();
}

function closeSkillSheet() {
  const sheet = document.getElementById('skillSheet');
  if (!sheet) return;
  sheet.hidden = true;
  sheet.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  document.querySelectorAll('.skill-tile').forEach(function (b) {
    b.setAttribute('aria-expanded', 'false');
  });
}

function initSkillSheet() {
  document.querySelectorAll('.skill-tile').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openSkillSheet(btn.dataset.skill);
    });
  });
  document.getElementById('skillSheetClose')?.addEventListener('click', closeSkillSheet);
  document.getElementById('skillSheetBackdrop')?.addEventListener('click', closeSkillSheet);
  document.addEventListener('keydown', function (e) {
    const sheet = document.getElementById('skillSheet');
    if (e.key === 'Escape' && sheet && !sheet.hidden) closeSkillSheet();
  });
}

// ----------------------------------------------------------------------------
// Boot
// ----------------------------------------------------------------------------

function boot() {
  try {
    initNav();
    initHeroVideo();
    renderGallery();
    initPortfolioFlow();
    initHoverVideos();
    initLightbox();
    initCarousel();
    initScrollReveal();
    initCounters();
    initSkillSheet();
    observeLazyVideos(document);
  } catch (err) {
    console.error('[ANDXSTARS] boot:', err);
  }
}

window.addEventListener('error', function (ev) {
  console.warn('[ANDXSTARS] window error:', ev.error || ev.message || ev);
});
window.addEventListener('unhandledrejection', function (ev) {
  console.warn('[ANDXSTARS] unhandled rejection:', ev.reason);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
