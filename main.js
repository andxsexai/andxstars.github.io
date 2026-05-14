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
  // Нейро-видео
  { category: 'neuro', label: 'Нейроролик · 1', path: 'video/2026-03-02 15.24.56.mp4', poster: 'posters/2026-03-02 15.32.19.jpg' },
  { category: 'neuro', label: 'Нейроролик · 2', path: 'video/2026-03-02 15.25.24.mp4', poster: 'posters/2026-03-02 15.32.48.jpg' },
  { category: 'neuro', label: 'Нейроролик · 3', path: 'video/2026-03-02 15.25.38.mp4', poster: 'posters/2026-03-02 15.32.57.jpg' },
  { category: 'neuro', label: 'AI Нейросеть', path: 'dopoln/нейросети/grok-video-2313d3aa-125b-451e-b040-0c0c6a6cc037.mp4', poster: 'posters/service-neuro.jpg' },
  { category: 'neuro', label: 'Автоматизация', path: 'dopoln/автоматизации/Superhero_possesses_digital_202603291845.mp4', poster: 'posters/2026-03-02 15.32.48.jpg' },
  { category: 'neuro', label: 'Подкасты', path: 'catalog-uslug/podcustle/Holograms_purple_sounds_202603291733.mp4', poster: 'posters/service-podcast.jpg' },

  // Дизайн
  { category: 'design', label: 'Постер · 1', path: 'posters/1771433468513-019c71aa-04fd-7451-a818-b28757ca62de.jpeg' },
  { category: 'design', label: 'Постер · 2', path: 'posters/2026-03-02 15.32.19.jpg' },
  { category: 'design', label: 'Постер · 3', path: 'posters/2026-03-02 15.45.55.jpg' },
  { category: 'design', label: 'Постер · 4', path: 'posters/2026-03-02 15.46.01.jpg' },
  { category: 'design', label: 'Постер · 5', path: 'posters/2026-03-02 15.33.02.jpg' },
  { category: 'design', label: 'Постер · 6', path: 'posters/2026-03-02 15.33.10.jpg' },
  { category: 'design', label: 'Постер · 7', path: 'posters/2026-03-02 15.32.57.jpg' },
  { category: 'design', label: 'Постер · 8', path: 'posters/2026-03-02 15.32.48.jpg' },
  { category: 'design', label: 'Сервис · нейро', path: 'posters/service-neuro.jpg' },
  { category: 'design', label: 'Сервис · подкасты', path: 'posters/service-podcast.jpg' },
  { category: 'design', label: 'Сервис · контент', path: 'posters/service-content.jpg' },

  // Кейсы
  { category: 'cases', label: 'Фото · 1', path: 'photos/1767209604674-019b75e6-da37-72c1-98c6-71abd70c240f.png' },
  { category: 'cases', label: 'Фото · 2', path: 'photos/1767712598517-019b93e1-67d9-79c5-a85e-9a644665fde8.png' },
  { category: 'cases', label: 'Фото · 3', path: 'photos/2026-03-02 15.23.13.jpg' },
  { category: 'cases', label: 'Фото · 4', path: 'photos/2026-03-02 15.23.18.jpg' },
  { category: 'cases', label: 'Инфлюенс', path: 'photos/influencer.jpg' },
  { category: 'cases', label: 'Видео · сайты', path: 'dopoln/сайты/Sensors_moving,_camera_202603291842.mp4', poster: 'posters/2026-03-02 15.33.10.jpg' },
  { category: 'cases', label: 'Видео · музыка', path: 'dopoln/музыка/Guy_plays_bass_202603291841.mp4', poster: 'posters/2026-03-02 15.33.02.jpg' },
  { category: 'cases', label: 'Видео · цигун', path: 'dopoln/цигун/Moves_technology_engaging_202603291845.mp4', poster: 'posters/2026-03-02 15.32.19.jpg' },
];

const CATEGORY_LABEL = { all: 'Все', neuro: 'Нейро-видео', design: 'Дизайн', cases: 'Кейсы' };

// Carousel slides — from /carousel folder
const CAROUSEL_SLIDES = [
  { path: 'posters/2026-03-02 15.28.51.jpg', alt: 'Карусель · слайд 1' },
  { path: 'posters/2026-03-02 15.29.10.jpg', alt: 'Карусель · слайд 2' },
  { path: 'posters/2026-03-02 15.29.13.jpg', alt: 'Карусель · слайд 3' },
  { path: 'posters/2026-03-02 15.29.20.jpg', alt: 'Карусель · слайд 4' },
  { path: 'posters/2026-03-02 15.29.24.jpg', alt: 'Карусель · слайд 5' },
  { path: 'posters/2026-03-02 15.29.27.jpg', alt: 'Карусель · слайд 6' },
  { path: 'posters/2026-03-02 15.32.48.jpg', alt: 'Карусель · слайд 7' },
  { path: 'posters/2026-03-02 15.32.57.jpg', alt: 'Карусель · слайд 8' },
  { path: 'posters/2026-03-02 15.33.02.jpg', alt: 'Карусель · слайд 9' },
  { path: 'posters/2026-03-02 15.33.10.jpg', alt: 'Карусель · слайд 10' },
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
    frag.appendChild(tile);
  });

  root.innerHTML = '';
  root.appendChild(frag);
  observeLazyVideos(root);
}

function initFilters() {
  const buttons = document.querySelectorAll('.filter');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const target = btn.dataset.filter || 'all';
      document.querySelectorAll('#gallery .tile').forEach((tile) => {
        const ok = target === 'all' || tile.dataset.cat === target;
        tile.classList.toggle('is-hidden', !ok);
      });
    });
  });
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
  const videos = scope.querySelectorAll('video[data-src]');
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

function initHoverVideos() {
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
          // Only mark is-playing once the video actually begins — avoids fading
          // the fallback image while video is still buffering / blocked.
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

  // tiles: preview on hover (desktop)
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

// Play the hero video proactively (it's visible on load)
function initHeroVideo() {
  const v = document.querySelector('.hero-video');
  if (!v) return;
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

function getVisibleIndexes() {
  const active = document.querySelector('.filter.active');
  const target = (active && active.dataset.filter) || 'all';
  return PORTFOLIO
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => target === 'all' || item.category === target)
    .map(({ i }) => i);
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

  // respect reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stopCarouselAutoplay();
  }
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
// Boot
// ----------------------------------------------------------------------------

function boot() {
  initNav();
  renderGallery();
  initFilters();
  initHoverVideos();
  initHeroVideo();
  initLightbox();
  initCarousel();
  initScrollReveal();
  initCounters();
  observeLazyVideos(document);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
