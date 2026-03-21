/**
 * ANDXSTARS · Architect of Digital Reality · v4.0
 * Smart Media Loader · Lazy Video · Parallax · Lightning · HUD Typewriter
 */

(function () {
  'use strict';

  // ========== Portfolio Data ==========
  // Категории: neuro | design | cases
  const PORTFOLIO_DATA = [
    {
      folder: 'author', category: 'cases', label: 'Автор Я Сам',
      files: [
        '1767549655237-2026-01-04 20.48.46.jpg',
        '1767549700407-019b8a2c-6557-7198-9d38-e2b5826b189c.png',
        '1772200039565-019c9f58-b3e8-78d4-98ba-451ed4facf48.png',
        '1772207528813-019c9fcd-2e32-7f16-ba16-5e1627d46b78.png',
        '1772207846385-019c9fd1-f8c8-7c64-a7d9-0cf4f9d29031.png'
      ]
    },
    {
      folder: 'video', category: 'neuro', label: 'Нейромультики',
      files: [
        '2026-03-02 15.24.56.mp4',
        '2026-03-02 15.25.24.mp4',
        '2026-03-02 15.25.38.mp4'
      ]
    },
    {
      folder: 'cards', category: 'design', label: 'Карточки ВБ',
      files: [
        '2026-03-02 15.50.57.jpg',
        '2026-03-02 15.51.06.jpg',
        '2026-03-02 15.51.12.jpg'
      ]
    },
    {
      folder: 'covers', category: 'design', label: 'Обложки',
      files: [
        '1772225274266-019ca0dc-beab-79e9-aaae-964277c95901.jpeg',
        '1772225599649-019ca0e1-8f02-7410-aad4-3789bdcbf4c2.jpeg'
      ]
    },
    {
      folder: 'clothing', category: 'design', label: 'Одежда',
      files: [
        '1766007426835-019b2e3e-05bb-730c-9b93-a770754964d3.png',
        '1766010039377-019b2e66-1c63-71c1-b9be-cbf081e0ba21.png',
        '1766011052051-019b2e75-9545-7e94-b9cb-8e0a645fc52b.png'
      ]
    },
    {
      folder: 'posters', category: 'design', label: 'Постеры',
      files: [
        '1771433468513-019c71aa-04fd-7451-a818-b28757ca62de.jpeg',
        '2026-03-02 15.32.19.jpg',
        '2026-03-02 15.45.55.jpg',
        '2026-03-02 15.46.01.jpg'
      ]
    },
    {
      folder: 'photos', category: 'cases', label: 'Фотосессии',
      files: [
        '1767209604674-019b75e6-da37-72c1-98c6-71abd70c240f.png',
        '1767712598517-019b93e1-67d9-79c5-a85e-9a644665fde8.png',
        '2026-03-02 15.23.13.jpg',
        '2026-03-02 15.23.18.jpg',
        'influencer.jpg'
      ]
    }
  ];

  function encodePath(folder, file) {
    const encFolder = /^[a-zA-Z0-9_-]+$/.test(folder) ? folder : encodeURIComponent(folder);
    return './' + encFolder + '/' + encodeURIComponent(file);
  }

  // Handles mp4, webm, ogg, mov
  function isVideo(file) {
    return /\.(mp4|webm|ogg|mov)$/i.test(file);
  }

  // ========== Smart Media Loader ==========
  function buildPortfolioGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    gallery.innerHTML = '';

    PORTFOLIO_DATA.forEach((group) => {
      group.files.forEach((file) => {
        const href = encodePath(group.folder, file);
        const vid = isVideo(file);
        const item = document.createElement('div');
        item.className = 'gallery-item skeleton';
        item.dataset.category = group.category;

        if (vid) {
          // preload="metadata" → browser fetches first frame without downloading full file
          item.innerHTML = `
            <div class="gallery-video-wrap">
              <video muted loop playsinline preload="metadata" class="lazy-video">
                <source data-src="${href}" type="video/mp4">
              </video>
              <div class="gallery-play-icon" aria-hidden="true">▶</div>
              <span class="gallery-overlay">${group.label}</span>
            </div>`;
          item.classList.remove('skeleton');
        } else {
          item.innerHTML = `
            <a href="${href}" target="_blank" rel="noopener noreferrer" class="gallery-link">
              <img src="${href}" alt="${group.label}" loading="lazy">
              <span class="gallery-overlay">${group.label}</span>
            </a>`;
          const img = item.querySelector('img');
          if (img) {
            img.addEventListener('load',  () => item.classList.remove('skeleton'));
            img.addEventListener('error', () => { item.style.display = 'none'; });
          }
        }

        gallery.appendChild(item);
      });
    });

    initLazyVideo();
    initVideoHover();
    initPortfolioFilter();
    initScrollObserver();
  }

  // ========== Lazy Video: swap data-src → src when near viewport ==========
  function initLazyVideo() {
    const lazyVideos = document.querySelectorAll('.lazy-video');
    if (!lazyVideos.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        const source = video.querySelector('source[data-src]');
        if (source) {
          // Only assign if not already set (avoids reload)
          if (!source.getAttribute('src')) {
            source.setAttribute('src', source.dataset.src);
            video.load(); // kick the browser to read metadata & first frame
          }
        }
        obs.unobserve(video);
      });
    }, { rootMargin: '300px' }); // start loading 300px before entering view

    lazyVideos.forEach((v) => obs.observe(v));
  }

  // ========== Video: fade-in play on hover ==========
  function initVideoHover() {
    document.querySelectorAll('.gallery-item .gallery-video-wrap').forEach((wrap) => {
      const video = wrap.querySelector('video');
      const playIcon = wrap.querySelector('.gallery-play-icon');
      if (!video) return;

      wrap.addEventListener('mouseenter', () => {
        // Ensure src is set before playing (fallback if lazy observer missed it)
        const source = video.querySelector('source');
        if (source && !source.getAttribute('src') && source.dataset.src) {
          source.setAttribute('src', source.dataset.src);
          video.load();
        }
        // Small delay to let load() start before play()
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

      // Click: open in new tab
      wrap.addEventListener('click', () => {
        const source = video.querySelector('source');
        const src = source?.getAttribute('src') || source?.dataset.src;
        if (src) window.open(src, '_blank');
      });
    });
  }

  // ========== Portfolio Filter ==========
  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach((item) => {
      item.classList.remove('hidden');
      item.classList.add('visible');
    });

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach((item, i) => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !show);
          item.style.transitionDelay = show ? `${(i % 10) * 0.04}s` : '0s';
          if (show) item.classList.add('visible');
        });
      });
    });
  }

  // ========== Lightning Cursor (rAF-demand, pauses when idle) ==========
  const lightCanvas = document.getElementById('lightningCanvas');
  if (lightCanvas) {
    const ctx = lightCanvas.getContext('2d');
    let lw = window.innerWidth, lh = window.innerHeight;
    const trail = [];
    const FADE = 0.09, JITTER = 5, LEN = 16, SEG = 5;
    let lx = -1, ly = -1;
    let loopRunning = false;

    function lResize() {
      lw = window.innerWidth; lh = window.innerHeight;
      lightCanvas.width = lw; lightCanvas.height = lh;
    }

    function jitter() { return (Math.random() - 0.5) * JITTER; }

    function drawSeg(x1, y1, x2, y2, a) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(210,110,255,${a})`;
      ctx.shadowColor = '#b026ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(176,38,255,${a * 0.5})`;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    function lightLoop() {
      ctx.clearRect(0, 0, lw, lh);
      let alive = false;
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.a -= FADE;
        if (p.a <= 0) { trail.splice(i, 1); continue; }
        alive = true;
        if (i > 0) {
          const prev = trail[i - 1];
          drawSeg(prev.x + prev.jx, prev.y + prev.jy, p.x + jitter(), p.y + jitter(), p.a);
        }
      }
      if (alive) requestAnimationFrame(lightLoop);
      else loopRunning = false;
    }

    function addPoint(x, y) {
      if (lx >= 0 && Math.hypot(x - lx, y - ly) < SEG && trail.length) return;
      lx = x; ly = y;
      trail.push({ x, y, jx: jitter(), jy: jitter(), a: 1 });
      if (trail.length > LEN) trail.shift();
      if (!loopRunning) {
        loopRunning = true;
        requestAnimationFrame(lightLoop);
      }
    }

    lResize();
    window.addEventListener('resize', lResize, { passive: true });
    window.addEventListener('mousemove', (e) => addPoint(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length) addPoint(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  // ========== Parallax Particle Canvas (pauses on hidden tab) ==========
  const pCanvas = document.getElementById('particleCanvas');
  if (pCanvas) {
    const pc = pCanvas.getContext('2d');
    let pw = window.innerWidth, ph = window.innerHeight;
    let mouseX = pw / 2, mouseY = ph / 2;
    let tabVisible = true;

    const PARTICLE_COUNT = 50;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * pw,
      y: Math.random() * ph,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * 0.45 + 0.08,
      depth: Math.random() * 0.04 + 0.004
    }));

    function pResize() {
      pw = window.innerWidth; ph = window.innerHeight;
      pCanvas.width = pw; pCanvas.height = ph;
    }

    function animateParticles() {
      if (!tabVisible) { requestAnimationFrame(animateParticles); return; }
      pc.clearRect(0, 0, pw, ph);
      const cx = mouseX - pw / 2;
      const cy = mouseY - ph / 2;

      particles.forEach((p) => {
        p.x = (p.x + p.vx + pw) % pw;
        p.y = (p.y + p.vy + ph) % ph;
        pc.beginPath();
        pc.arc(p.x + cx * p.depth, p.y + cy * p.depth, p.r, 0, Math.PI * 2);
        pc.fillStyle = `rgba(176,38,255,${p.a})`;
        pc.fill();
      });
      requestAnimationFrame(animateParticles);
    }

    pResize();
    window.addEventListener('resize', pResize, { passive: true });
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; });
    animateParticles();
  }

  // ========== HUD Typewriter ==========
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
          // Pause then erase
          setTimeout(() => { forward = false; tick(); }, 1800);
          return;
        }
      } else {
        el.textContent = text.slice(0, i);
        i--;
        if (i < 0) {
          i = 0;
          forward = true;
          setTimeout(tick, 600);
          return;
        }
      }
      setTimeout(tick, forward ? speed : speed * 0.5);
    }
    // Stagger start
    setTimeout(tick, Math.random() * 800);
  }

  function initHUD() {
    const ticker = document.getElementById('hudTicker');
    const coords = document.getElementById('hudCoords');

    hudType(document.getElementById('hudTypeTL'), 'LOCATION:MOSCOW/2095', 55, true);
    hudType(document.getElementById('hudTypeTR'), 'STATUS:OPTIMIZING...', 60, true);
    hudType(document.getElementById('hudTypeBL'), 'ANDX·v4.0·AI-READY', 50, true);
    hudType(document.getElementById('hudTypeBR'), 'CORE:NEURAL-SYNC', 65, true);

    if (!ticker || !coords) return;
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    setInterval(() => { ticker.textContent = String(Math.floor(Math.random() * 9999)).padStart(4, '0'); }, 180);
    setInterval(() => { coords.textContent = `X:${String(mx).padStart(4,'0')} Y:${String(my).padStart(4,'0')}`; }, 80);
  }

  // ========== Scroll Observer ==========
  function initScrollObserver() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.07 });

    document.querySelectorAll(
      '.section-title, .glass-panel, .hero-product, .skill-card, ' +
      '.gallery-item, .review-card, .cta-content, .service-card'
    ).forEach((el) => obs.observe(el));

    document.querySelectorAll('.gallery-item').forEach((item, i) => {
      item.style.transitionDelay = `${(i % 12) * 0.035}s`;
    });
    document.querySelectorAll('.skill-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.06}s`;
    });
    document.querySelectorAll('.review-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.1}s`;
    });
    document.querySelectorAll('.service-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.12}s`;
    });
  }

  // ========== Service Slide-out Panel ==========
  const SERVICE_DATA = {
    neuro: {
      icon: '◈',
      tag: '01 · NEURO-ANIMATION',
      title: 'NEURO-ANIMATION',
      sub: 'Нейромультики для бизнеса',
      highlight: 'Создание виральных мультфильмов и контента за 24 часа.',
      body: 'Мы создаём вирусные анимации и мультфильмы с помощью ИИ — за долю стоимости классической студии. Runway Gen-2, Midjourney, ElevenLabs работают в одном пайплайне, давая голливудский результат за часы, а не месяцы.',
      list: [
        'Анимационные ролики для соцсетей и рекламы',
        'Персонажи и маскоты бренда на базе AI',
        'Объяснительные видео с нейро-голосом',
        'Виральный контент: шорты, рилсы, истории',
        'Полный пайплайн: сценарий → монтаж → саунд'
      ]
    },
    avatar: {
      icon: '◉',
      tag: '02 · DIGITAL AVATAR',
      title: 'DIGITAL AVATAR & CONTENT',
      sub: 'AI-Контент и цифровой аватар',
      highlight: 'Ваше присутствие в сети без вашего участия (AI-копии).',
      body: 'Создаём ваш цифровой образ — от фотосессий до AI-клонирования голоса и внешности. Персональный бренд упакован в единый визуальный язык для всех платформ, работающий 24/7.',
      list: [
        'Фотосессии в стиле личного бренда',
        'AI-клонирование голоса и образа',
        'Видео-перебивки и динамичный монтаж',
        'Генерация контента на месяц вперёд',
        'Адаптация под TikTok, YouTube, Instagram'
      ]
    },
    logic: {
      icon: '⚡',
      tag: '03 · AI-LOGIC & CODE',
      title: 'AI-LOGIC & CODE',
      sub: 'Smart-Автоматизация бизнеса',
      highlight: 'Автоматизация бизнеса через n8n и нейросети. Свобода от рутины.',
      body: 'Строим нейронные конвейеры на базе n8n, OpenAI API и кастомного кода. Один раз настроил — система работает без вас: публикует, отвечает, анализирует, продаёт.',
      list: [
        'Автоматизация постинга и CRM через n8n',
        'AI-ассистент для бизнеса (Telegram / Web)',
        'Лендинги и продающие сайты',
        'Аналитические дашборды и отчёты',
        'Интеграция с платёжными системами и CRM'
      ]
    }
  };

  function initServiceOverlays() {
    const overlay = document.getElementById('serviceOverlay');
    const panel   = document.getElementById('serviceSlidePanel');
    const closeBtn = document.getElementById('serviceOverlayClose');
    const contentEl = document.getElementById('serviceOverlayContent');
    if (!overlay || !panel || !closeBtn || !contentEl) return;

    document.querySelectorAll('.service-card, .service-open-btn').forEach((el) => {
      el.addEventListener('click', (e) => {
        // Find the parent .service-card regardless of what was clicked
        const card = el.classList.contains('service-card') ? el : el.closest('.service-card');
        if (!card) return;
        const data = SERVICE_DATA[card.dataset.service];
        if (!data) return;

        const listHTML = data.list.map((item) => `<li>${item}</li>`).join('');
        contentEl.innerHTML = `
          <span class="soc-tag">${data.tag}</span>
          <span class="soc-icon">${data.icon}</span>
          <h2 class="soc-title">${data.title}</h2>
          <p class="soc-sub">${data.sub}</p>
          <div class="soc-divider"></div>
          <span class="soc-highlight">${data.highlight}</span>
          <p class="soc-body">${data.body}</p>
          <ul class="soc-list">${listHTML}</ul>
          <a href="https://t.me/andxxstars" target="_blank" rel="noopener noreferrer"
             class="cta-btn cta-btn-lead" style="margin-top:1.5rem;display:inline-block">
            ПОЛУЧИТЬ AI-АУДИТ (БЕСПЛАТНО)
          </a>
          <a href="https://app.lava.top/products/0889191c-4e8c-4978-b545-41dafe762377"
             target="_blank" rel="noopener noreferrer"
             class="cta-btn-secondary" style="display:block;margin-top:0.75rem">
            или оплатить консультацию →
          </a>`;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closePanel() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  }

  // ========== Arsenal Slide-in Panels (skill cards) ==========
  const SKILLS = {
    sites:      { title: 'Создание сайтов', text: 'Упакуем твой продукт так, чтобы он продавал сам. Футуристичный дизайн, который выделяет тебя из серой массы. Боль: «Мой сайт выглядит как у всех». Решение: уникальный киберпанк-интерфейс, который запоминается.' },
    music:      { title: 'Написание музыки', text: 'Авторский звук (andxsound) для твоих проектов, видео или медитаций. Задаём правильный вайб и ритм. Боль: «Музыка не передаёт мой бренд». Решение: эксклюзивный саундтрек под твою аудиторию.' },
    ai:         { title: 'Нейросети', text: 'Освободи 80% времени. Автоматизация контента, генерация идей и визуалов со скоростью мысли. Боль: «Я не успеваю создавать контент». Решение: нейросети работают на тебя 24/7.' },
    automation: { title: 'Автоматизация', text: 'Настрой системы один раз и позволь алгоритмам работать на тебя 24/7. Боль: «Рутина съедает время». Решение: автоматические пайплайны для контента и продаж через n8n.' },
    qigong:     { title: 'Цигун и Гунфу', text: 'Дисциплина тела и энергии. Без правильного состояния технологии не работают. Настроим твой внутренний фокус. Боль: «Выгораю и не могу сосредоточиться». Решение: энергия и ясность для продуктивной работы.' },
    photo:      { title: 'Фотосессии', text: 'Создадим твой идеальный цифровой и реальный аватар для личного бренда. Упакуем тебя дорого. Боль: «Не знаю, как подать себя». Решение: профессиональный визуал для соцсетей и сайта.' }
  };

  function initArsenalPanels() {
    const overlay    = document.getElementById('arsenalOverlay');
    const closeBtn   = document.getElementById('arsenalClose');
    const panelTitle = document.getElementById('arsenalPanelTitle');
    const panelText  = document.getElementById('arsenalPanelText');
    if (!overlay) return;

    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('click', () => {
        const data = SKILLS[card.dataset.skill];
        if (!data) return;
        panelTitle.textContent = data.title;
        panelText.textContent  = data.text;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function close() { overlay.classList.remove('active'); document.body.style.overflow = ''; }
    closeBtn?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  // ========== Skill Card 3D Tilt ==========
  function initSkillTilt() {
    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // ========== Preloader ==========
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) { pl.classList.add('hidden'); setTimeout(() => pl.remove(), 500); }
    }, 950);
  });

  // ========== Init ==========
  document.addEventListener('DOMContentLoaded', () => {
    buildPortfolioGallery();
    initServiceOverlays();
    initArsenalPanels();
    initSkillTilt();
    initHUD();
  });

})();
