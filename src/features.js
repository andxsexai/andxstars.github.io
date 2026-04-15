/**
 * Вкладки (history.replaceState), lazy-video и перезапуск observe при появлении .visible
 */

function readDataSrc(source) {
  if (!source) return '';
  return source.getAttribute('data-src') || '';
}

/** Одинаково для dev (Vite), dist и file:// — путь относительно текущей страницы */
function resolveMediaHref(href) {
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  try {
    return new URL(href, document.baseURI).href;
  } catch (e) {
    return href;
  }
}

/**
 * Публичные ассеты (корень сайта / Vite dist). Всегда строка, без `undefined`.
 * new URL + import.meta.env.BASE_URL — корректно для подпапки и preview.
 */
export function getAsset(relPath) {
  const raw = String(relPath || '').trim();
  if (!raw) return '';
  const rel = raw.startsWith('./') ? raw : `./${raw.replace(/^\/+/, '')}`;
  const viteBase =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL != null
      ? String(import.meta.env.BASE_URL)
      : './';
  let pathForUrl = rel;
  if (viteBase === '/') {
    pathForUrl = `/${rel.replace(/^\.\//, '')}`;
  } else if (viteBase !== './' && viteBase !== '') {
    const tail = rel.replace(/^\.\//, '');
    pathForUrl = `${viteBase.endsWith('/') ? viteBase : `${viteBase}/`}${tail}`;
  }
  if (typeof document !== 'undefined' && document.baseURI) {
    try {
      return new URL(pathForUrl, document.baseURI).href;
    } catch (e) {
      try {
        return new URL(rel, document.baseURI).href;
      } catch (e2) {
        return rel;
      }
    }
  }
  return pathForUrl;
}

export function encodePath(folder, file) {
  const segments = String(folder)
    .split('/')
    .map((seg) => {
      if (!seg) return '';
      return /^[a-zA-Z0-9_-]+$/.test(seg) ? seg : encodeURIComponent(seg);
    })
    .filter(Boolean);
  return getAsset(`./${segments.join('/')}/${encodeURIComponent(file)}`);
}

function isVideo(file) {
  return /\.(mp4|webm|ogg|mov)$/i.test(file);
}

export const CATEGORY_TITLES = {
  neuro: 'Нейромультики',
  design: 'Дизайн',
  cases: 'Кейсы',
  all: 'Все проекты'
};

/** Данные портфолио: папки в корне репо → копируются в dist через Vite */
export const PORTFOLIO_DATA = [
  {
    folder: 'author',
    category: 'cases',
    label: 'Автор Я Сам',
    files: [
      '1767549655237-2026-01-04 20.48.46.jpg',
      '1767549700407-019b8a2c-6557-7198-9d38-e2b5826b189c.png',
      '1772200039565-019c9f58-b3e8-78d4-98ba-451ed4facf48.png',
      '1772207528813-019c9fcd-2e32-7f16-ba16-5e1627d46b78.png',
      '1772207846385-019c9fd1-f8c8-7c64-a7d9-0cf4f9d29031.png'
    ]
  },
  {
    folder: 'video',
    category: 'neuro',
    label: 'Нейромультики',
    files: ['2026-03-02 15.24.56.mp4', '2026-03-02 15.25.24.mp4', '2026-03-02 15.25.38.mp4']
  },
  {
    folder: 'cards',
    category: 'design',
    label: 'Карточки ВБ',
    files: ['2026-03-02 15.50.57.jpg', '2026-03-02 15.51.06.jpg', '2026-03-02 15.51.12.jpg']
  },
  {
    folder: 'covers',
    category: 'design',
    label: 'Обложки',
    files: [
      '1772225274266-019ca0dc-beab-79e9-aaae-964277c95901.jpeg',
      '1772225599649-019ca0e1-8f02-7410-aad4-3789bdcbf4c2.jpeg'
    ]
  },
  {
    folder: 'clothing',
    category: 'design',
    label: 'Одежда',
    files: [
      '1766007426835-019b2e3e-05bb-730c-9b93-a770754964d3.png',
      '1766010039377-019b2e66-1c63-71c1-b9be-cbf081e0ba21.png',
      '1766011052051-019b2e75-9545-7e94-b9cb-8e0a645fc52b.png'
    ]
  },
  {
    folder: 'posters',
    category: 'design',
    label: 'Постеры',
    files: [
      '1771433468513-019c71aa-04fd-7451-a818-b28757ca62de.jpeg',
      '2026-03-02 15.32.19.jpg',
      '2026-03-02 15.45.55.jpg',
      '2026-03-02 15.46.01.jpg'
    ]
  },
  {
    folder: 'photos',
    category: 'cases',
    label: 'Фотосессии',
    files: [
      '1767209604674-019b75e6-da37-72c1-98c6-71abd70c240f.png',
      '1767712598517-019b93e1-67d9-79c5-a85e-9a644665fde8.png',
      '2026-03-02 15.23.13.jpg',
      '2026-03-02 15.23.18.jpg',
      'influencer.jpg'
    ]
  }
];

const HEAVY_PORTFOLIO_IMAGES = new Set([
  '1772207846385-019c9fd1-f8c8-7c64-a7d9-0cf4f9d29031.png',
  '1772200039565-019c9f58-b3e8-78d4-98ba-451ed4facf48.png',
  '1767209604674-019b75e6-da37-72c1-98c6-71abd70c240f.png',
  '1766010039377-019b2e66-1c63-71c1-b9be-cbf081e0ba21.png',
  '1766007426835-019b2e3e-05bb-730c-9b93-a770754964d3.png',
  '1766011052051-019b2e75-9545-7e94-b9cb-8e0a645fc52b.png',
  '1772207528813-019c9fcd-2e32-7f16-ba16-5e1627d46b78.png',
  '1767549700407-019b8a2c-6557-7198-9d38-e2b5826b189c.png',
  '1767712598517-019b93e1-67d9-79c5-a85e-9a644665fde8.png',
  '1772225274266-019ca0dc-beab-79e9-aaae-964277c95901.jpeg',
  '1772225599649-019ca0e1-8f02-7410-aad4-3789bdcbf4c2.jpeg',
  '1771433468513-019c71aa-04fd-7451-a818-b28757ca62de.jpeg'
]);

function defaultGalleryVideoPoster() {
  return encodePath('posters', '2026-03-02 15.32.19.jpg');
}

/** Отложенный observe (модалка / скрытые панели — после layout). */
export function observeLazyVideosInDeferred(root, delayMs = 320) {
  const ms = typeof delayMs === 'number' ? delayMs : 320;
  window.setTimeout(() => observeLazyVideosIn(root), ms);
}

function hydrateVideoSource(video) {
  const source = video.querySelector('source');
  const raw = readDataSrc(source);
  if (!source || !raw) return false;
  const url = resolveMediaHref(raw);
  if (!source.getAttribute('src')) {
    source.setAttribute('src', url);
    source.removeAttribute('data-src');
    video.muted = true;
    video.setAttribute('playsinline', '');
    video.load();
  }
  return true;
}

const lazyVideoObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      const srcEl = video.querySelector('source');
      if (srcEl?.getAttribute('src')) {
        observer.unobserve(video);
        return;
      }
      const raw = readDataSrc(srcEl);
      if (!raw || !srcEl) {
        observer.unobserve(video);
        return;
      }
      if (hydrateVideoSource(video)) {
        video.play().catch(() => {});
      }
      observer.unobserve(video);
    });
  },
  { rootMargin: '0px 0px 480px 0px', threshold: 0.01 }
);

export function observeLazyVideosIn(root) {
  if (!root) return;
  root.querySelectorAll('.lazy-video').forEach((video) => {
    const source = video.querySelector('source[data-src]');
    if (source) lazyVideoObserver.observe(video);
  });
}

/** После снятия hidden браузер отдаёт размеры панели только на следующем кадре — иначе IO даёт 0% видимости */
export function scheduleObserveLazyVideosIn(root) {
  if (!root) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => observeLazyVideosIn(root));
  });
}

function revealAnimatedInPanel(panel) {
  if (!panel) return;
  const sel =
    '.section-title, .glass-panel, .skill-card, .review-card, .service-card, ' +
    '.portfolio-hub-card, .case-card, .cta-content, .discount-banner, .pricing-pill';
  panel.querySelectorAll(sel).forEach((el) => el.classList.add('visible'));
}

let __visibleLazyMo = null;
function initVisibleClassLazyBridge() {
  if (__visibleLazyMo) return;
  __visibleLazyMo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
      const el = m.target;
      if (!el.classList?.contains('visible')) continue;
      scheduleObserveLazyVideosIn(el);
    }
  });
  __visibleLazyMo.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });
}

export function initMainTabs() {
  const tabs = Array.from(document.querySelectorAll('.main-tab-bar [role="tab"]'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));
  if (!tabs.length || !panels.length) return;

  const byId = (id) => panels.find((p) => p.id === id);

  function activateTab(tabId) {
    tabs.forEach((t) => {
      const on = t.id === `tab-${tabId}`;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    panels.forEach((p) => {
      const on = p.id === `panel-${tabId}`;
      p.hidden = !on;
      if (on) {
        revealAnimatedInPanel(p);
        scheduleObserveLazyVideosIn(p);
      }
    });
    try {
      history.replaceState(null, '', `#panel-${tabId}`);
    } catch (e) {
      /* noop */
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('aria-controls');
      const key = id && id.startsWith('panel-') ? id.slice('panel-'.length) : '';
      if (key) activateTab(key);
    });
  });

  document.querySelectorAll('a.js-tab-jump').forEach((a) => {
    a.addEventListener('click', (e) => {
      const key = a.getAttribute('data-tab');
      if (!key) return;
      e.preventDefault();
      activateTab(key);
      const panel = document.getElementById(`panel-${key}`);
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const hash = (location.hash || '').replace(/^#/, '');
  if (hash.startsWith('panel-')) {
    const key = hash.slice('panel-'.length);
    if (byId(`panel-${key}`)) activateTab(key);
    else activateTab('overview');
  } else {
    activateTab('overview');
  }

  initVisibleClassLazyBridge();
}

let __andxFeaturesStarted = false;

export function initAndxFeatures() {
  'use strict';
  if (__andxFeaturesStarted) return;
  __andxFeaturesStarted = true;

  function syncBodyOverlayClass() {
    const so = document.getElementById('serviceOverlay');
    const ao = document.getElementById('arsenalOverlay');
    const pm = document.getElementById('portfolioModal');
    const any =
      (so && so.classList.contains('active')) ||
      (ao && ao.classList.contains('active')) ||
      (pm && pm.classList.contains('is-open'));
    document.body.classList.toggle('overlay-open', !!any);
  }

  function isMobileLite() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    if (window.matchMedia('(max-width: 768px)').matches) return true;
    return 'ontouchstart' in window && navigator.maxTouchPoints > 0 && window.innerWidth < 900;
  }

  /** iPhone / Android / планшеты: без matrix, particles и лишнего blur */
  function isReducedEffects() {
    if (isMobileLite()) return true;
    if (isSlowConnection()) return true;
    try {
      if (window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 1024) return true;
    } catch (e) { /* noop */ }
    return false;
  }

  /** Слабое железо / экономия — без matrix и particles (город в hero остаётся по отдельной проверке) */
  function isLowTierDevice() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (c && c.saveData) return true;
    const cores = navigator.hardwareConcurrency;
    if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
    const mem = navigator.deviceMemory;
    if (typeof mem === 'number' && mem > 0 && mem < 4) return true;
    return false;
  }

  function allowMatrixEffect() {
    if (isReducedEffects()) return false;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.saveData) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const cores = navigator.hardwareConcurrency;
    const memoryGB = navigator.deviceMemory;
    const c = typeof cores === 'number' && cores > 0 ? cores : 8;
    const m = typeof memoryGB === 'number' && memoryGB > 0 ? memoryGB : 8;
    if (c <= 4 || m < 4) return false;
    return true;
  }

  function allowParticleField() {
    if (isReducedEffects() || isLowTierDevice()) return false;
    return true;
  }

  function allowHeroCityCanvas() {
    if (isMobileLite() || isReducedEffects()) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.matchMedia('(max-width: 768px)').matches) return false;
    if (isLowTierDevice()) return false;
    return true;
  }

  function isNarrowViewport() {
    return window.innerWidth < 768;
  }

  function isSlowConnection() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    if (c.saveData) return true;
    const t = c.effectiveType;
    return t === 'slow-2g' || t === '2g' || t === '3g';
  }

  /** Статичный poster для видео на мобильных (без загрузки ролика до клика) */
  const VIDEO_POSTER_URL =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">' +
        '<rect fill="#0a0618" width="640" height="360"/>' +
        '<circle cx="320" cy="180" r="48" fill="none" stroke="#b026ff" stroke-width="3" opacity="0.85"/>' +
        '<path fill="#b026ff" d="M300 150l60 40-60 40z" opacity="0.9"/>' +
      '</svg>'
    );

  function applyLayoutMode() {
    document.body.classList.toggle('is-mobile-lite', isMobileLite());
    document.body.classList.toggle('is-reduced-effects', isReducedEffects());
    document.body.classList.toggle('is-low-tier', isLowTierDevice());
  }

  // ========== Gallery item factory ==========
  function createGalleryItem(group, file) {
    const href = encodePath(group.folder, file);
    const vid = isVideo(file);
    const item = document.createElement('div');
    item.className = 'gallery-item skeleton visible';
    item.dataset.category = group.category;

    if (vid) {
      const narrow = isNarrowViewport();
      const slow = isSlowConnection();
      const preload = narrow || slow ? 'none' : 'none';
      const posterUrl = defaultGalleryVideoPoster();
      const posterEsc = posterUrl.replace(/"/g, '&quot;');
      const deferCls = narrow ? ' lazy-video--defer-mobile' : '';
      item.innerHTML = `
        <div class="gallery-video-wrap${narrow ? ' gallery-video-wrap--tap' : ''}">
          <video muted loop playsinline preload="${preload}" class="lazy-video lazy-video--gpu${deferCls}" poster="${posterEsc}">
            <source data-src="${href}" type="video/mp4">
          </video>
          <div class="gallery-play-icon" aria-hidden="true">▶</div>
          <span class="gallery-overlay">${group.label}</span>
        </div>`;
      item.classList.remove('skeleton');
    } else {
      const heavy = HEAVY_PORTFOLIO_IMAGES.has(file);
      const lazyAttr = heavy ? ' loading="lazy" fetchpriority="low"' : ' loading="lazy"';
      item.innerHTML = `
        <a href="${href}" target="_blank" rel="noopener noreferrer" class="gallery-link">
          <img src="${href}" alt="${group.label}"${lazyAttr} decoding="async">
          <span class="gallery-overlay">${group.label}</span>
        </a>`;
      const img = item.querySelector('img');
      if (img) {
        img.addEventListener('load', () => item.classList.remove('skeleton'));
        img.addEventListener('error', () => { item.style.display = 'none'; });
      }
    }
    return item;
  }

  function initLazyVideoIn(root) {
    const lazyVideos = root.querySelectorAll('.lazy-video');
    if (!lazyVideos.length) return;
    const narrow = isNarrowViewport();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        const deferMobile = video.classList.contains('lazy-video--defer-mobile');
        if (isSlowConnection() && deferMobile) {
          obs.unobserve(video);
          return;
        }
        const source = video.querySelector('source[data-src]');
        const raw = readDataSrc(source);
        if (source && raw && !source.getAttribute('src')) {
          source.setAttribute('src', resolveMediaHref(raw));
          source.removeAttribute('data-src');
          video.load();
        }
        obs.unobserve(video);
      });
    }, { rootMargin: '480px', threshold: 0.01 });
    lazyVideos.forEach((v) => {
      if (narrow && v.classList.contains('lazy-video--defer-mobile')) return;
      obs.observe(v);
    });
  }

  function initVideoHoverIn(root) {
    root.querySelectorAll('.gallery-video-wrap').forEach((wrap) => {
      const video = wrap.querySelector('video');
      const playIcon = wrap.querySelector('.gallery-play-icon');
      if (!video) return;
      const tapMode = wrap.classList.contains('gallery-video-wrap--tap');

      function ensureSrc() {
        const source = video.querySelector('source');
        const raw = readDataSrc(source);
        if (source && !source.getAttribute('src') && raw) {
          source.setAttribute('src', resolveMediaHref(raw));
          source.removeAttribute('data-src');
          video.load();
        }
      }

      if (!tapMode) {
        wrap.addEventListener('mouseenter', () => {
          ensureSrc();
          setTimeout(() => video.play().catch(() => {}), 50);
          video.classList.add('playing');
          if (playIcon) playIcon.classList.add('hidden');
        });
        wrap.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
          video.classList.remove('playing');
          if (playIcon) playIcon.classList.remove('hidden');
        });
      }

      wrap.addEventListener('click', (e) => {
        if (tapMode) {
          e.preventDefault();
          ensureSrc();
          video.play().catch(() => {});
          video.classList.add('playing');
          if (playIcon) playIcon.classList.add('hidden');
          return;
        }
        const source = video.querySelector('source');
        const src = source?.getAttribute('src') || readDataSrc(source);
        if (src) window.open(src, '_blank');
      });
    });
  }

  // ========== Preview URL for hub hover ==========
  function getPreviewForCategory(cat) {
    if (cat === 'all') {
      const g = PORTFOLIO_DATA.find((x) => x.category === 'neuro');
      const vf = g?.files.find((f) => isVideo(f));
      if (g && vf) return { type: 'video', src: encodePath(g.folder, vf) };
    }
    for (const g of PORTFOLIO_DATA) {
      if (g.category !== cat) continue;
      if (cat === 'neuro') {
        const vf = g.files.find((f) => isVideo(f));
        if (vf) return { type: 'video', src: encodePath(g.folder, vf) };
      }
      const imgf = g.files.find((f) => !isVideo(f));
      if (imgf) return { type: 'image', src: encodePath(g.folder, imgf) };
      const f0 = g.files[0];
      return { type: isVideo(f0) ? 'video' : 'image', src: encodePath(g.folder, f0) };
    }
    return null;
  }

  // ========== Portfolio modal ==========
  function fillPortfolioModal(category) {
    const gallery = document.getElementById('portfolioModalGallery');
    const title = document.getElementById('portfolioModalTitle');
    if (!gallery || !title) return;
    gallery.innerHTML = '';
    title.textContent = CATEGORY_TITLES[category] || 'Портфолио';

    PORTFOLIO_DATA.forEach((group) => {
      if (category !== 'all' && group.category !== category) return;
      group.files.forEach((file) => gallery.appendChild(createGalleryItem(group, file)));
    });

    gallery.querySelectorAll('.gallery-item').forEach((el, i) => {
      el.style.transitionDelay = `${(i % 10) * 0.03}s`;
    });
  }

  function hydratePortfolioModalGallery() {
    const gallery = document.getElementById('portfolioModalGallery');
    if (!gallery) return;
    initVideoHoverIn(gallery);
    attachVideoPauseWhenHidden(gallery);
    gallery.querySelectorAll('video.lazy-video').forEach((v) => hydrateVideoSource(v));
    initLazyVideoIn(gallery);
    observeLazyVideosIn(gallery);
    const first = gallery.querySelector('video.lazy-video');
    if (first) first.play().catch(() => {});
  }

  function initPortfolioModal() {
    const modal = document.getElementById('portfolioModal');
    const closeBtn = document.getElementById('portfolioModalClose');
    const hub = document.getElementById('portfolioHub');
    const pop = document.getElementById('categoryPreviewPop');
    if (!modal || !hub) return;

    let previewVideo = null;
    let modalHydrateTimer = null;
    let onModalTransitionEnd = null;

    function clearModalHydrateSchedule() {
      if (modalHydrateTimer != null) {
        window.clearTimeout(modalHydrateTimer);
        modalHydrateTimer = null;
      }
      if (onModalTransitionEnd) {
        modal.removeEventListener('transitionend', onModalTransitionEnd);
        onModalTransitionEnd = null;
      }
    }

    function openModal(cat) {
      clearModalHydrateSchedule();
      fillPortfolioModal(cat);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      syncBodyOverlayClass();

      let fired = false;
      function runHydrate() {
        if (fired) return;
        fired = true;
        clearModalHydrateSchedule();
        hydratePortfolioModalGallery();
      }

      onModalTransitionEnd = (e) => {
        if (e.target !== modal) return;
        if (e.propertyName !== 'opacity') return;
        runHydrate();
      };
      modal.addEventListener('transitionend', onModalTransitionEnd);
      modalHydrateTimer = window.setTimeout(runHydrate, 320);
    }

    function closeModal() {
      clearModalHydrateSchedule();
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      const g = document.getElementById('portfolioModalGallery');
      if (g) {
        g.querySelectorAll('video').forEach((v) => { v.pause(); });
        g.innerHTML = '';
      }
      syncBodyOverlayClass();
    }

    hub.querySelectorAll('.portfolio-hub-card').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.category || 'all'));
    });

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    const showPreview = !document.body.classList.contains('is-mobile-lite');

    if (showPreview && pop) {
      hub.querySelectorAll('.portfolio-hub-card').forEach((btn) => {
        const cat = btn.dataset.category;
        if (btn.dataset.previewKind === 'none') return;

        btn.addEventListener('mouseenter', (e) => {
          const data = getPreviewForCategory(cat);
          if (!data) return;
          pop.innerHTML = '';
          pop.classList.add('is-visible');
          pop.setAttribute('aria-hidden', 'false');
          if (data.type === 'video') {
            const v = document.createElement('video');
            v.muted = true;
            v.loop = true;
            v.playsInline = true;
            v.preload = 'none';
            v.className = 'lazy-video lazy-video--gpu';
            v.src = resolveMediaHref(data.src);
            pop.appendChild(v);
            v.play().catch(() => {});
            previewVideo = v;
          } else {
            const im = document.createElement('img');
            im.src = resolveMediaHref(data.src);
            im.alt = '';
            pop.appendChild(im);
          }
          positionPreview(e);
        });

        btn.addEventListener('mousemove', positionPreview);

        btn.addEventListener('mouseleave', () => {
          pop.classList.remove('is-visible');
          pop.setAttribute('aria-hidden', 'true');
          pop.innerHTML = '';
          if (previewVideo) { previewVideo.pause(); previewVideo = null; }
        });
      });
    }

    function positionPreview(e) {
      if (!pop || !pop.classList.contains('is-visible')) return;
      const pad = 16;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      const rect = pop.getBoundingClientRect();
      if (x + 220 > window.innerWidth) x = e.clientX - rect.width - pad;
      if (y + 140 > window.innerHeight) y = e.clientY - rect.height - pad;
      pop.style.left = `${Math.max(8, x)}px`;
      pop.style.top = `${Math.max(8, y)}px`;
    }
  }

  /** Неоновый город только в блоке hero (десктоп; на телефоне не запускаем) */
  function initHeroCityCanvas() {
    const hero = document.getElementById('hero');
    const canvas = document.getElementById('heroCityCanvas');
    if (!hero || !canvas) return;
    if (!allowHeroCityCanvas()) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let buildings = [];
    let t0 = 0;
    let frame = 0;
    let rafId = 0;

    function stopLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      t0 = 0;
      frame = 0;
    }

    function startLoop() {
      if (rafId || document.hidden) return;
      function loop(ts) {
        if (document.hidden) {
          stopLoop();
          return;
        }
        frame += 1;
        if (frame % 3 !== 0) {
          rafId = requestAnimationFrame(loop);
          return;
        }
        draw(ts);
        rafId = requestAnimationFrame(loop);
      }
      rafId = requestAnimationFrame(loop);
    }

    function genBuildings() {
      buildings = [];
      let x = -80;
      const total = Math.max(w * 1.75, 1200);
      while (x < total) {
        const bw = 22 + Math.random() * 48;
        const bh = h * (0.22 + Math.random() * 0.5);
        buildings.push({ x, w: bw, h: bh, seed: Math.random() * 50 });
        x += bw + 4 + Math.random() * 18;
      }
    }

    function resize() {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      genBuildings();
    }

    function draw(ts) {
      if (!t0) t0 = ts;
      const t = (ts - t0) / 1000;
      const scroll = (t * 38) % 260;

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#2a1848');
      sky.addColorStop(0.4, '#150a22');
      sky.addColorStop(1, '#08050e');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(-scroll, 0);
      buildings.forEach((b) => {
        const y0 = h - b.h;
        ctx.fillStyle = 'rgba(18, 10, 32, 0.96)';
        ctx.strokeStyle = 'rgba(176, 38, 255, 0.55)';
        ctx.lineWidth = 1;
        ctx.fillRect(b.x, y0, b.w, b.h);
        ctx.strokeRect(b.x, y0, b.w, b.h);
        const cols = Math.max(2, Math.floor(b.w / 14));
        const rows = Math.max(2, Math.floor(b.h / 26));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (((r + c) & 1) === 0) continue;
            const wx = b.x + 4 + (c * (b.w - 8)) / Math.max(cols - 1, 1);
            const wy = y0 + 10 + r * 22;
            const flick = 0.5 + 0.5 * Math.sin(t * 2 + b.seed + r * 0.65 + c * 0.38);
            ctx.fillStyle = `rgba(191, 0, 255, ${0.26 + flick * 0.5})`;
            ctx.fillRect(wx, wy, Math.max(4, b.w / (cols + 2)), 6);
          }
        }
        const topGlow = ctx.createLinearGradient(b.x, y0, b.x + b.w, y0);
        topGlow.addColorStop(0, 'transparent');
        topGlow.addColorStop(0.5, 'rgba(176, 38, 255, 0.55)');
        topGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = topGlow;
        ctx.fillRect(b.x, y0, b.w, 2);
      });
      ctx.restore();

      ctx.strokeStyle = 'rgba(176, 38, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w, h * 0.78);
      ctx.stroke();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) startLoop();
          else stopLoop();
        });
      },
      { threshold: 0.06 }
    );
    io.observe(hero);

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopLoop();
      else {
        requestAnimationFrame(() => {
          const r = hero.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) startLoop();
        });
      }
    });
    requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) startLoop();
    });
  }

  /** Каталог услуг: hover на десктопе; touch / узкий экран — превью по касанию */
  function initServiceCardHoverVideos() {
    document.querySelectorAll('.service-card').forEach((card) => {
      const video = card.querySelector('.service-card-hover-video');
      const source = video?.querySelector('source[data-src], source[src]');
      if (!video || !source) return;

      function prime() {
        const raw = readDataSrc(source) || source.getAttribute('src');
        if (!raw) return;
        if (!source.getAttribute('src')) {
          source.setAttribute('src', resolveMediaHref(raw));
          source.removeAttribute('data-src');
          video.muted = true;
          video.load();
        }
        card.classList.add('service-card--hover-video');
        video.play().catch(() => {});
      }

      function stopPreview() {
        video.pause();
        video.currentTime = 0;
        card.classList.remove('service-card--hover-video');
      }

      if (!isNarrowViewport()) {
        card.addEventListener('mouseenter', prime);
        card.addEventListener('mouseleave', stopPreview);
      }
      card.addEventListener(
        'pointerdown',
        (e) => {
          if (e.pointerType === 'touch' || isNarrowViewport()) prime();
        },
        { passive: true }
      );

      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) stopPreview();
        });
      }, { threshold: 0.06 });
      io.observe(card);
    });
  }

  /** Дополнительно: hover + touch — ролик из dopoln/… */
  function initSkillHoverVideos() {
    document.querySelectorAll('.skill-card').forEach((card) => {
      const video = card.querySelector('.skill-card-hover-video');
      const source = video?.querySelector('source[data-src], source[src]');
      if (!video || !source) return;

      function prime() {
        const raw = readDataSrc(source) || source.getAttribute('src');
        if (!raw) return;
        if (!source.getAttribute('src')) {
          source.setAttribute('src', resolveMediaHref(raw));
          source.removeAttribute('data-src');
          video.muted = true;
          video.load();
        }
        card.classList.add('skill-card--hover-video');
        video.play().catch(() => {});
      }

      function stopPreview() {
        video.pause();
        video.currentTime = 0;
        card.classList.remove('skill-card--hover-video');
      }

      if (!isNarrowViewport()) {
        card.addEventListener('mouseenter', prime);
        card.addEventListener('mouseleave', stopPreview);
      }
      card.addEventListener(
        'pointerdown',
        (e) => {
          if (e.pointerType === 'touch' || isNarrowViewport()) prime();
        },
        { passive: true }
      );

      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) stopPreview();
        });
      }, { threshold: 0.08 });
      io.observe(card);
    });
  }

  /** Пауза видео вне экрана (экономия CPU/GPU) */
  function attachVideoPauseWhenHidden(root) {
    if (!root) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (v instanceof HTMLVideoElement && !entry.isIntersecting) v.pause();
      });
    }, { threshold: 0.08 });
    root.querySelectorAll('video.lazy-video').forEach((v) => {
      obs.observe(v);
    });
  }

  // ========== Matrix Neon Touch: расходящиеся символы #b026ff, затухание ~1.5 с ==========
  const MATRIX_NEON_FADE_SEC = 1.5;
  const MATRIX_PURPLE = { r: 176, g: 38, b: 255 };

  function initMatrixTrace() {
    const canvas = document.getElementById('matrixNeonCanvas');
    if (!canvas || !allowMatrixEffect()) return;

    const ctx = canvas.getContext('2d');
    let w, h;
    const glyphs = 'ｱｲｳｴｵ01アイウラΣπ∞ﾊﾝ0x010101{}[]<>/\\';
    const particles = [];
    let lx = -99, ly = -99, rafId = null;
    let lastTs = 0;

    function narrow() {
      return window.innerWidth < 768;
    }

    function maxParticles() {
      return narrow() ? 28 : 64;
    }

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function spawnBurst(cx, cy, count) {
      const m = maxParticles();
      for (let n = 0; n < count; n++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = (narrow() ? 0.35 : 0.55) + Math.random() * (narrow() ? 1.6 : 2.4);
        particles.push({
          x: cx + (Math.random() - 0.5) * 12,
          y: cy + (Math.random() - 0.5) * 12,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          char: glyphs[Math.floor(Math.random() * glyphs.length)],
          life: 1
        });
      }
      while (particles.length > m) particles.shift();
    }

    function tick(ts) {
      if (document.hidden) {
        rafId = null;
        lastTs = 0;
        return;
      }
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      ctx.clearRect(0, 0, w, h);
      const fontPx = narrow() ? 11 : 13;
      ctx.font = `${fontPx}px ui-monospace, monospace`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      const decay = dt / MATRIX_NEON_FADE_SEC;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life -= decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const a = p.life;
        ctx.fillStyle = `rgba(${MATRIX_PURPLE.r},${MATRIX_PURPLE.g},${MATRIX_PURPLE.b},${0.22 + a * 0.78})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      if (particles.length) rafId = requestAnimationFrame(tick);
      else {
        rafId = null;
        lastTs = 0;
      }
    }

    function onMove(x, y) {
      const minD = narrow() ? 8 : 5;
      if (Math.hypot(x - lx, y - ly) < minD) return;
      lx = x;
      ly = y;
      spawnBurst(x, y, narrow() ? 1 : 2);
      if (!rafId) {
        lastTs = 0;
        rafId = requestAnimationFrame(tick);
      }
    }

    function onTouchStart(e) {
      if (!e.touches.length) return;
      const t = e.touches[0];
      lx = t.clientX;
      ly = t.clientY;
      spawnBurst(t.clientX, t.clientY, narrow() ? 3 : 4);
      if (!rafId) {
        lastTs = 0;
        rafId = requestAnimationFrame(tick);
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  function initCTANeonTouch(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('.cta-btn, .service-open-btn').forEach((btn) => {
      let touchTimer;
      btn.addEventListener('mouseenter', () => btn.classList.add('cta-neon-touch-active'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('cta-neon-touch-active'));
      btn.addEventListener('touchstart', () => {
        btn.classList.add('cta-neon-touch-active');
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() => btn.classList.remove('cta-neon-touch-active'), 450);
      }, { passive: true });
    });
  }

  // ========== Particles (desktop) ==========
  function initParticles() {
    const pCanvas = document.getElementById('particleCanvas');
    if (!pCanvas || !allowParticleField()) return;

    const pc = pCanvas.getContext('2d');
    let pw = window.innerWidth, ph = window.innerHeight;
    let mouseX = pw / 2, mouseY = ph / 2;
    let tabVisible = true;
    let lastDrawTs = 0;
    const FRAME_MIN_MS = 44;

    const PARTICLE_COUNT = 22;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * pw,
      y: Math.random() * ph,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 0.35,
      a: Math.random() * 0.42 + 0.07,
      depth: Math.random() * 0.038 + 0.004
    }));

    function pResize() {
      pw = pCanvas.width = window.innerWidth;
      ph = pCanvas.height = window.innerHeight;
    }

    function animateParticles(ts) {
      requestAnimationFrame(animateParticles);
      if (!tabVisible || document.hidden) return;
      const cx = mouseX - pw / 2;
      const cy = mouseY - ph / 2;
      particles.forEach((p) => {
        p.x = (p.x + p.vx + pw) % pw;
        p.y = (p.y + p.vy + ph) % ph;
      });
      const now = ts || performance.now();
      if (now - lastDrawTs < FRAME_MIN_MS) return;
      lastDrawTs = now;
      pc.clearRect(0, 0, pw, ph);
      particles.forEach((p) => {
        pc.beginPath();
        pc.arc(p.x + cx * p.depth, p.y + cy * p.depth, p.r, 0, Math.PI * 2);
        pc.fillStyle = `rgba(176,38,255,${p.a})`;
        pc.fill();
      });
    }

    pResize();
    window.addEventListener('resize', pResize, { passive: true });
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      tabVisible = !document.hidden;
      if (tabVisible) lastDrawTs = 0;
    });
    requestAnimationFrame(animateParticles);
  }

  // ========== HUD ==========
  function hudType(el, text, speed, loop) {
    if (!el) return;
    let i = 0;
    let forward = true;
    function tick() {
      if (forward) {
        el.textContent = text.slice(0, i);
        i++;
        if (i > text.length) {
          if (!loop) return;
          setTimeout(() => { forward = false; tick(); }, 1600);
          return;
        }
      } else {
        el.textContent = text.slice(0, i);
        i--;
        if (i < 0) {
          i = 0;
          forward = true;
          setTimeout(tick, 500);
          return;
        }
      }
      setTimeout(tick, forward ? speed : speed * 0.45);
    }
    setTimeout(tick, Math.random() * 600);
  }

  function initHUD() {
    if (document.body.classList.contains('is-mobile-lite')) return;
    const ticker = document.getElementById('hudTicker');
    const coords = document.getElementById('hudCoords');
    hudType(document.getElementById('hudTypeTL'), 'LOCATION:MOSCOW/2095', 55, true);
    hudType(document.getElementById('hudTypeTR'), 'STATUS:OPTIMIZING...', 58, true);
    hudType(document.getElementById('hudTypeBL'), 'ANDX·v5.0·SECURE', 48, true);
    hudType(document.getElementById('hudTypeBR'), 'CORE:AI-READY', 62, true);
    if (!ticker || !coords) return;
    let mx = 0;
    let my = 0;
    let lastHudTs = 0;
    const hudInterval = document.body.classList.contains('is-low-tier') ? 380 : 300;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    function hudFrame(ts) {
      requestAnimationFrame(hudFrame);
      if (document.hidden) return;
      const t = ts || performance.now();
      if (t - lastHudTs < hudInterval) return;
      lastHudTs = t;
      ticker.textContent = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
      coords.textContent = `X:${String(mx).padStart(4, '0')} Y:${String(my).padStart(4, '0')}`;
    }
    requestAnimationFrame(hudFrame);
  }

  // ========== Scroll observer ==========
  function initScrollObserver() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { rootMargin: '0px 0px -45px 0px', threshold: 0.06 });

    document.querySelectorAll(
      '.section-title, .glass-panel, .hero-product, .skill-card, ' +
      '.review-card, .cta-content, .service-card, .portfolio-hub-card, ' +
      '.case-card, .discount-banner, .pricing-pill'
    ).forEach((el) => obs.observe(el));

    document.querySelectorAll('.skill-card').forEach((card, i) => { card.style.transitionDelay = `${i * 0.06}s`; });
    document.querySelectorAll('.review-card').forEach((card, i) => { card.style.transitionDelay = `${i * 0.08}s`; });
    document.querySelectorAll('.service-card').forEach((card, i) => { card.style.transitionDelay = `${i * 0.08}s`; });
    document.querySelectorAll('.portfolio-hub-card').forEach((card, i) => { card.style.transitionDelay = `${i * 0.07}s`; });
    document.querySelectorAll('.case-card').forEach((card, i) => { card.style.transitionDelay = `${i * 0.06}s`; });
  }

  /** Ролики из папки catalog-uslug (photo-video, multikif, podcustle, it) */
  const SERVICE_PANEL_MEDIA = {
    content: {
      kind: 'video',
      folder: 'catalog-uslug/photo-video',
      file: 'Developer_at_desk_202603291823.mp4',
      poster: VIDEO_POSTER_URL,
      fallback: { folder: 'photos', file: '2026-03-02 15.23.13.jpg' }
    },
    neuro: {
      kind: 'video',
      folder: 'catalog-uslug/multikif',
      file: 'flow-neuro-loop.mp4',
      poster: VIDEO_POSTER_URL,
      fallback: { folder: 'posters', file: '2026-03-02 15.32.19.jpg' }
    },
    podcast: {
      kind: 'video',
      folder: 'catalog-uslug/podcustle',
      file: 'Holograms_purple_sounds_202603291733.mp4',
      poster: VIDEO_POSTER_URL,
      fallback: { folder: 'author', file: '1767549655237-2026-01-04 20.48.46.jpg' }
    },
    dev: {
      kind: 'video',
      folder: 'catalog-uslug/it',
      file: 'Frame_approximation_moves_202603291824.mp4',
      poster: VIDEO_POSTER_URL,
      fallback: { folder: 'cards', file: '2026-03-02 15.50.57.jpg' }
    }
  };

  function buildServicePanelMedia(serviceId) {
    const m = SERVICE_PANEL_MEDIA[serviceId];
    if (!m) return '';
    const u = encodePath(m.folder, m.file);
    if (m.kind === 'video' && !isNarrowViewport() && !isSlowConnection()) {
      return `<div class="soc-media"><video class="lazy-video lazy-video--gpu lazy-video--panel" muted playsinline loop preload="none">
        <source data-src="${u}" type="video/mp4"></video></div>`;
    }
    if (m.fallback) {
      const fb = encodePath(m.fallback.folder, m.fallback.file);
      return `<div class="soc-media"><img src="${fb}" alt="" class="soc-media-img" loading="lazy" decoding="async"/></div>`;
    }
    return '';
  }

  const SERVICE_DATA = {
    content: {
      icon: '▣',
      tag: '01 · ФОТО И ВИДЕО',
      title: 'ФОТО И ВИДЕО КОНТЕНТ',
      sub: 'Съёмка и постпродакшн',
      highlight: 'Визуал, который продаёт ваш бренд в Reels, Shorts и рекламе.',
      purpose: 'Зачем: единый узнаваемый визуал снижает стоимость лида и ускоряет решение о покупке. Для экспертов, брендов и маркетплейсов, где кадр = первый аргумент.',
      body: 'Создаём фото- и видеоконтент под задачи: личный бренд, маркетплейсы, соцсети, презентации. Сценарий, свет, монтаж, цветокор — единый стиль на всех носителях. Ролик карточки — <strong>catalog-uslug/photo-video</strong>; примеры съёмок — папка <strong>photos</strong> в портфолио.',
      list: [
        'Предметная и портретная съёмка',
        'Рекламные ролики и тизеры',
        'Монтаж под форматы платформ',
        'Обложки, баннеры, карточки товара',
        'Согласование ТЗ и сметы до старта'
      ]
    },
    neuro: {
      icon: '◈',
      tag: '02 · НЕЙРОМУЛЬТИКИ',
      title: 'НЕЙРОМУЛЬТИКИ (AI-ANIMATION)',
      sub: 'ИИ + продакшн',
      highlight: 'Виральные мультфильмы и анимация в сжатые сроки.',
      purpose: 'Зачем: быстро получить движение и историю в кадре без полного аниме-студио — для рекламы, тизеров и виральных форматов. Превью услуги — <strong>catalog-uslug/multikif</strong>; полная подборка — <strong>video</strong> в портфолио.',
      body: 'Комбинируем нейросети (Runway, Midjourney и др.) с классическим монтажом и саундом. Подходит для рекламы, обучающего контента и соцсетей.',
      list: [
        'AI-анимация и motion-графика',
        'Озвучка и саунд-дизайн',
        'Адаптация под вертикальные форматы',
        'Серии роликов под контент-план',
        'Прозрачный пайплайн и правки'
      ]
    },
    podcast: {
      icon: '◎',
      tag: '03 · ПОДКАСТЫ',
      title: 'ВЫЕЗДНЫЕ ПОДКАСТЫ',
      sub: 'Звук · свет · картинка',
      highlight: 'Запись у вас в студии или на площадке — «под ключ».',
      purpose: 'Зачем: выезд экономит ваше время и даёт студийное качество без аренды площадки. Превью услуги — <strong>catalog-uslug/podcustle</strong>; кадры бренда — <strong>author</strong>, больше роликов — <strong>video</strong> в портфолио.',
      body: 'Приезжаем с оборудованием: микрофоны, рекордер, базовый свет, при необходимости — камеры. Настраиваем акустику, даём гостям комфорт, отдаём чистые дорожки и монтаж.',
      list: [
        'Мультитрек-запись голоса',
        'Шумоподавление и сведение',
        'Видеоверсия выпуска (опционально)',
        'Тизеры для соцсетей',
        'График выездов по договорённости'
      ]
    },
    dev: {
      icon: '⚡',
      tag: '04 · IT',
      title: 'IT-РАЗРАБОТКА',
      sub: 'Код · n8n · интеграции',
      highlight: 'Автоматизация бизнеса через код и n8n.',
      purpose: 'Зачем: убрать ручные перекладывания данных между чатами, CRM и таблицами — меньше ошибок и быстрее отклик клиенту. Превью услуги — <strong>catalog-uslug/it</strong>; визуал продуктов — <strong>cards</strong> в портфолио.',
      body: 'Лендинги, боты, внутренние инструменты, связка CRM–мессенджеры–таблицы. Проектируем так, чтобы система жила без лишней ручной работы.',
      list: [
        'Сайты и лендинги',
        'Сценарии n8n и webhooks',
        'Интеграция OpenAI / API',
        'Telegram- и web-ассистенты',
        'Документация и передача проекта'
      ]
    }
  };

  function initServiceOverlays() {
    const overlay = document.getElementById('serviceOverlay');
    const closeBtn = document.getElementById('serviceOverlayClose');
    const contentEl = document.getElementById('serviceOverlayContent');
    if (!overlay || !closeBtn || !contentEl) return;

    document.querySelectorAll('.service-card, .service-open-btn').forEach((el) => {
      el.addEventListener('click', () => {
        const card = el.classList.contains('service-card') ? el : el.closest('.service-card');
        if (!card) return;
        const sid = card.dataset.service;
        const data = SERVICE_DATA[sid];
        if (!data) return;
        const listHTML = data.list.map((item) => `<li>${item}</li>`).join('');
        const mediaHTML = buildServicePanelMedia(sid);
        contentEl.innerHTML = `
          ${mediaHTML}
          <span class="soc-tag">${data.tag}</span>
          <span class="soc-icon">${data.icon}</span>
          <h2 class="soc-title">${data.title}</h2>
          <p class="soc-sub">${data.sub}</p>
          <div class="soc-divider"></div>
          <p class="soc-purpose">${data.purpose || ''}</p>
          <span class="soc-highlight">${data.highlight}</span>
          <p class="soc-body">${data.body}</p>
          <ul class="soc-list">${listHTML}</ul>
          <a href="https://t.me/andxxstars" target="_blank" rel="noopener noreferrer"
             class="cta-btn cta-zapis cyber-pulse-glow" style="margin-top:1.25rem;display:inline-flex">
            ЗАПИСАТЬСЯ
          </a>
          <a href="https://t.me/andxxstars" target="_blank" rel="noopener noreferrer"
             class="cta-btn cta-btn-lead" style="margin-top:1rem;display:inline-flex">
            ПОЛУЧИТЬ AI-АУДИТ (БЕСПЛАТНО)
          </a>
          <p class="pay-options-caption" style="margin-top:1.25rem">Оплата</p>
          <div class="payment-split">
            <a href="https://app.lava.top/products/0889191c-4e8c-4978-b545-41dafe762377"
               target="_blank" rel="noopener noreferrer"
               class="cta-btn cta-btn-pay cta-btn-pay-card">КАРТА (СНГ)</a>
            <a href="https://pay.cryptocloud.plus/pos/s47OYqsRvYUPfGts"
               target="_blank" rel="noopener noreferrer"
               class="cta-btn cta-btn-pay cta-btn-pay-crypto">КРИПТОВАЛЮТА</a>
          </div>`;
        const pv = contentEl.querySelector('video.lazy-video--panel');
        if (pv) {
          const srcEl = pv.querySelector('source[data-src]');
          const raw = readDataSrc(srcEl);
          if (srcEl && raw) {
            srcEl.setAttribute('src', resolveMediaHref(raw));
            srcEl.removeAttribute('data-src');
            pv.muted = true;
            pv.load();
          }
          pv.play().catch(() => {});
        }
        initCTANeonTouch(contentEl);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        syncBodyOverlayClass();
      });
    });

    function closePanel() {
      contentEl.querySelectorAll('video').forEach((v) => v.pause());
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      syncBodyOverlayClass();
    }
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closePanel();
    });
  }

  const SKILL_DETAIL = {
    sites: {
      title: 'Сайты',
      folderLabel: 'dopoln/sites · портфолио: covers',
      purpose: 'Сайт — основа диджитал-присутствия: на нём принимают решение о доверии, заявке и покупке.',
      body: 'Проектируем структуру под вашу воронку: чёткий оффер, блоки доверия, заметные CTA, быстрая загрузка и корректный мобильный вид. Ролик на карточке и в этом окне — из папки <strong>dopoln/sites</strong>. Живые макеты и обложки — в портфолио, раздел <strong>covers</strong>.',
      list: [
        'Лендинги под запуск, рекламу и вебинары',
        'Многостраничные сайты под услуги и личный бренд',
        'Формы, мессенджеры, оплата и аналитика',
        'Передача проекта с понятной структурой файлов'
      ],
      media: {
        type: 'video',
        folder: 'dopoln/sites',
        file: 'Sensors_moving,_camera_202603291842.mp4',
        fallback: { folder: 'covers', file: '1772225274266-019ca0dc-beab-79e9-aaae-964277c95901.jpeg' }
      }
    },
    music: {
      title: 'Музыка (ANDXSOUND)',
      folderLabel: 'dopoln/music · портфолио: posters',
      purpose: 'Аудио задаёт эмоцию ролика, подкаста и бренда — от узнаваемости до удержания внимания.',
      body: 'Авторский саунд, шлифовка под YouTube, подкасты и рекламу: динамика, частотный баланс, громкость под площадку. Превью на карточке и здесь — <strong>dopoln/music</strong>. Визуальные референсы обложек — папка <strong>posters</strong> в портфолио.',
      list: [
        'Треки и джинглы под видео и подкасты',
        'Сведение и мастеринг «под эфир»',
        'Синхронизация с монтажом и таймкодами',
        'Брендовый звуковой характер (ANDXSOUND)'
      ],
      media: {
        type: 'video',
        folder: 'dopoln/music',
        file: 'Guy_plays_bass_202603291841.mp4',
        fallback: { folder: 'posters', file: '2026-03-02 15.32.19.jpg' }
      }
    },
    ai: {
      title: 'Нейросети',
      folderLabel: 'dopoln/ai · портфолио: video (нейро)',
      purpose: 'Нейросети ускоряют идеацию, визуал и черновики — при грамотном пайплайне экономят недели production.',
      body: 'Подбираем инструменты под задачу: кадры, озвучка, апскейл, ассистенты для текстов и структуры. На карточке и в окне — ролик из <strong>dopoln/ai</strong>. Полная подборка AI-видео — в портфолио, категория <strong>Нейромультики</strong> (папка <strong>video</strong>).',
      list: [
        'Генерация и доработка визуала, storyboard',
        'Ускорение препродакшна и итераций',
        'Встраивание AI в ваш рабочий процесс',
        'Контроль качества и единый стиль бренда'
      ],
      media: {
        type: 'video',
        folder: 'dopoln/ai',
        file: 'grok-video-2313d3aa-125b-451e-b040-0c0c6a6cc037.mp4',
        fallback: { folder: 'posters', file: '2026-03-02 15.32.19.jpg' }
      }
    },
    automation: {
      title: 'Автоматизация',
      folderLabel: 'dopoln/automation · портфолио: cards',
      purpose: 'Автоматизация убирает ручной ввод и задержки между CRM, чатами и таблицами.',
      body: 'Сценарии на n8n, webhooks, боты в Telegram: заявки, напоминания, отчёты без «копипаста». Превью — <strong>dopoln/automation</strong>. Примеры визуала цифровых продуктов — <strong>cards</strong> в портфолио.',
      list: [
        'Цепочки уведомлений и статусов',
        'Связка Telegram, почта, Google Sheets, CRM',
        'Мониторинг сбоев и логирование',
        'Документация сценариев для команды'
      ],
      media: {
        type: 'video',
        folder: 'dopoln/automation',
        file: 'Superhero_possesses_digital_202603291845.mp4',
        fallback: { folder: 'cards', file: '2026-03-02 15.51.06.jpg' }
      }
    },
    qigong: {
      title: 'Цигун',
      folderLabel: 'dopoln/qigong · портфолио: author',
      purpose: 'Ресурс и ясность влияют на качество решений и устойчивость в долгих проектах.',
      body: 'Короткие практики для концентрации, дыхания и опоры перед эфиром, съёмкой или переговорами. Ролик на карточке — <strong>dopoln/qigong</strong>; атмосфера личного бренда в кадре — папка <strong>author</strong> в портфолио.',
      list: [
        'Микро-практики 5–15 минут в день',
        'Настрой перед съёмкой, эфиром, выступлением',
        'Мягкая работа с телом без перегруза'
      ],
      media: {
        type: 'video',
        folder: 'dopoln/qigong',
        file: 'Moves_technology_engaging_202603291845.mp4',
        fallback: { folder: 'author', file: '1767549655237-2026-01-04 20.48.46.jpg' }
      }
    },
    photo: {
      title: 'Фотосессии',
      folderLabel: 'catalog-uslug/photo-video · портфолио: photos',
      purpose: 'Сильные кадры усиливают экспертность и конверсию в соцсетях и на маркетплейсах.',
      body: 'Портрет, предметка и лукбуки под единый визуальный код бренда. Отдельного ролика в <strong>dopoln</strong> пока нет — используется тот же превью-ролик, что и для фото/видео в каталоге (<strong>catalog-uslug/photo-video</strong>). Полные серии съёмок — раздел <strong>photos</strong> в портфолио.',
      list: [
        'Личный бренд и экспертный контент',
        'Карточки товара, маркетплейсы, баннеры',
        'Свет, ретушь и единая палитра',
        'Согласование референсов до съёмки'
      ],
      media: {
        type: 'video',
        folder: 'catalog-uslug/photo-video',
        file: 'Developer_at_desk_202603291823.mp4',
        fallback: { folder: 'photos', file: '2026-03-02 15.23.18.jpg' }
      }
    }
  };

  function renderSkillDetail(skillId) {
    const d = SKILL_DETAIL[skillId];
    const bodyEl = document.getElementById('arsenalPanelBody');
    if (!d || !bodyEl) return;
    const m = d.media;
    const url = encodePath(m.folder, m.file);
    let mediaBlock = '';
    if (m.type === 'video' && !isNarrowViewport() && !isSlowConnection()) {
      mediaBlock = `<div class="arsenal-media"><video class="lazy-video lazy-video--gpu lazy-video--arsenal" muted playsinline loop preload="none">
        <source data-src="${url}" type="video/mp4"></video></div>`;
    } else if (m.type === 'video' && m.fallback) {
      const fu = encodePath(m.fallback.folder, m.fallback.file);
      mediaBlock = `<div class="arsenal-media arsenal-media--static"><img src="${fu}" alt="" class="arsenal-media-img" loading="lazy" decoding="async"/></div>`;
    } else {
      mediaBlock = `<div class="arsenal-media arsenal-media--static"><img src="${url}" alt="" class="arsenal-media-img" loading="lazy" decoding="async"/></div>`;
    }
    const listHTML = d.list.map((x) => `<li>${x}</li>`).join('');
    bodyEl.innerHTML = `${mediaBlock}
      <h3 class="arsenal-panel-title">${d.title}</h3>
      <p class="arsenal-purpose">${d.purpose}</p>
      <p class="arsenal-panel-text">${d.body}</p>
      <ul class="arsenal-detail-list">${listHTML}</ul>
      <p class="arsenal-folder-tag">Папка проекта: <strong>${d.folderLabel}</strong></p>
      <a href="https://t.me/andxxstars" target="_blank" rel="noopener noreferrer" class="cta-btn cta-zapis cyber-pulse-glow">ЗАПИСАТЬСЯ</a>`;
    const vid = bodyEl.querySelector('video.lazy-video--arsenal');
    if (vid) {
      const s = vid.querySelector('source[data-src]');
      const raw = readDataSrc(s);
      if (s && raw) {
        s.setAttribute('src', resolveMediaHref(raw));
        s.removeAttribute('data-src');
        vid.muted = true;
        vid.load();
      }
      vid.play().catch(() => {});
    }
    initCTANeonTouch(bodyEl);
  }

  function initArsenalPanels() {
    const overlay = document.getElementById('arsenalOverlay');
    const closeBtn = document.getElementById('arsenalClose');
    if (!overlay) return;
    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('click', () => {
        renderSkillDetail(card.dataset.skill);
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        syncBodyOverlayClass();
      });
    });
    function close() {
      const bodyEl = document.getElementById('arsenalPanelBody');
      bodyEl?.querySelectorAll('video').forEach((v) => v.pause());
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      syncBodyOverlayClass();
    }
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) close();
    });
  }

  function initSkillTilt() {
    if (document.body.classList.contains('is-mobile-lite')) return;
    if (document.body.classList.contains('is-low-tier')) return;
    document.querySelectorAll('.skill-card').forEach((card) => {
      const inner = card.querySelector('.skill-card-inner') || card;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        inner.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => { inner.style.transform = ''; });
    });
  }

  function bootFeatures() {
    applyLayoutMode();
    window.addEventListener('resize', () => {
      applyLayoutMode();
    }, { passive: true });

    initPortfolioModal();
    initServiceOverlays();
    initArsenalPanels();
    initSkillTilt();
    initScrollObserver();
    initServiceCardHoverVideos();
    initSkillHoverVideos();
    initCTANeonTouch();
    initMatrixTrace();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootFeatures);
  } else {
    bootFeatures();
  }

  document.querySelectorAll('.tab-panel:not([hidden])').forEach((p) => {
    revealAnimatedInPanel(p);
    scheduleObserveLazyVideosIn(p);
  });
}