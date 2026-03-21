/**
 * ANDXSTARS · Architect of Digital Reality · v3.0
 * Parallax particles · Lightning · Portfolio · HUD · Service Overlays
 */

(function () {
  'use strict';

  // ========== Portfolio Data ==========
  // Category mapping for new filter system:
  //   neuro   → AI-generated animations / video
  //   design  → visual design work
  //   cases   → personal brand, shoots, sites
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
      folder: 'ВИДЕО', category: 'neuro', label: 'Нейромультики',
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

  function isVideo(file) {
    return /\.(mp4|webm|ogg)$/i.test(file);
  }

  // ========== Build Portfolio Gallery ==========
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
          item.innerHTML = `<a href="${href}" target="_blank" class="gallery-link">
            <video muted loop playsinline preload="metadata"><source src="${href}" type="video/mp4"></video>
            <span class="gallery-overlay">${group.label}</span>
          </a>`;
        } else {
          item.innerHTML = `<a href="${href}" target="_blank" class="gallery-link">
            <img src="${href}" alt="${group.label}" loading="lazy">
            <span class="gallery-overlay">${group.label}</span>
          </a>`;
          const img = item.querySelector('img');
          if (img) {
            img.addEventListener('load', () => item.classList.remove('skeleton'));
            img.addEventListener('error', () => { item.style.display = 'none'; });
          }
        }

        gallery.appendChild(item);
      });
    });

    // Video items remove skeleton immediately
    gallery.querySelectorAll('.gallery-item video').forEach((v) => {
      v.closest('.gallery-item')?.classList.remove('skeleton');
    });

    initVideoHover();
    initPortfolioFilter();
    initScrollObserver();
  }

  // ========== Video: fade-in play on hover ==========
  function initVideoHover() {
    document.querySelectorAll('.gallery-item video').forEach((video) => {
      const link = video.closest('.gallery-link');
      if (!link) return;
      link.addEventListener('mouseenter', () => {
        video.play().catch(() => {});
        video.classList.add('playing');
      });
      link.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
        video.classList.remove('playing');
      });
    });
  }

  // ========== Portfolio Filter ==========
  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Show all by default (active button is "Все")
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

  // ========== Lightning Cursor (rAF-only, zero setTimeout) ==========
  const canvas = document.getElementById('lightningCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    const trail = [];
    // Tuning: FADE controls speed of disappear, LEN = max trail points
    const FADE = 0.1, JITTER = 5, LEN = 14, SEG = 6;
    let lx = -1, ly = -1, rafScheduled = false;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    }

    function jitter() { return (Math.random() - 0.5) * JITTER; }

    function drawSegment(x1, y1, x2, y2, alpha) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(200,100,255,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#b026ff';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.strokeStyle = `rgba(176,38,255,${alpha * 0.55})`;
      ctx.lineWidth = 3.5;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.a -= FADE;
        if (p.a <= 0) { trail.splice(i, 1); continue; }
        alive = true;
        if (i > 0) {
          const prev = trail[i - 1];
          drawSegment(prev.x + prev.jx, prev.y + prev.jy, p.x + jitter(), p.y + jitter(), p.a);
        }
      }
      // Keep looping if trail still visible
      if (alive || rafScheduled) requestAnimationFrame(loop);
      else rafScheduled = false;
    }

    function addPoint(x, y) {
      if (lx >= 0 && Math.hypot(x - lx, y - ly) < SEG && trail.length) return;
      lx = x; ly = y;
      trail.push({ x, y, jx: jitter(), jy: jitter(), a: 1 });
      if (trail.length > LEN) trail.shift();
      if (!rafScheduled) {
        rafScheduled = true;
        requestAnimationFrame(loop);
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', (e) => addPoint(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length) addPoint(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  // ========== Parallax Particle Canvas ==========
  const pCanvas = document.getElementById('particleCanvas');
  if (pCanvas) {
    const pc = pCanvas.getContext('2d');
    let pw = window.innerWidth, ph = window.innerHeight;
    let mouseX = pw / 2, mouseY = ph / 2;

    const PARTICLE_COUNT = 55;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * pw,
        y: Math.random() * ph,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.5 + 0.1,
        // Parallax depth factor: deeper particles move less with mouse
        depth: Math.random() * 0.05 + 0.005,
        ox: 0, oy: 0 // original spawn as offset reference
      });
      particles[i].ox = particles[i].x;
      particles[i].oy = particles[i].y;
    }

    function resizeParticle() {
      pw = window.innerWidth; ph = window.innerHeight;
      pCanvas.width = pw; pCanvas.height = ph;
    }

    function animateParticles() {
      pc.clearRect(0, 0, pw, ph);

      const cx = mouseX - pw / 2;
      const cy = mouseY - ph / 2;

      particles.forEach((p) => {
        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = pw;
        if (p.x > pw) p.x = 0;
        if (p.y < 0) p.y = ph;
        if (p.y > ph) p.y = 0;

        // Parallax offset based on mouse
        const px = p.x + cx * p.depth;
        const py = p.y + cy * p.depth;

        pc.beginPath();
        pc.arc(px, py, p.r, 0, Math.PI * 2);
        pc.fillStyle = `rgba(176,38,255,${p.a})`;
        pc.fill();
      });

      requestAnimationFrame(animateParticles);
    }

    resizeParticle();
    window.addEventListener('resize', resizeParticle, { passive: true });
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    animateParticles();
  }

  // ========== HUD Ticker & Coords ==========
  function initHUD() {
    const ticker = document.getElementById('hudTicker');
    const coords = document.getElementById('hudCoords');
    if (!ticker || !coords) return;

    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    setInterval(() => {
      ticker.textContent = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
    }, 200);

    setInterval(() => {
      coords.textContent = `X:${String(mx).padStart(4, '0')} Y:${String(my).padStart(4, '0')}`;
    }, 80);
  }

  // ========== Scroll Observer ==========
  function initScrollObserver() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });

    document.querySelectorAll(
      '.section-title, .glass-panel, .hero-product, .skill-card, .gallery-item, ' +
      '.review-card, .cta-content, .service-card'
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

  // ========== Big Three: Fullscreen Service Overlays ==========
  const SERVICE_DATA = {
    neuro: {
      icon: '◈',
      tag: '01 · NEURO-ANIMATION',
      title: 'NEURO-ANIMATION',
      sub: 'Нейромультики для бизнеса',
      highlight: 'Экономия 90% бюджета на анимации.',
      body: 'Мы создаём вирусные анимации и мультфильмы с помощью ИИ — за долю стоимости классической студии. Runway Gen-2, Midjourney, ElevenLabs работают в одном пайплайне, давая голливудский результат за часы, а не месяцы.',
      list: [
        'Анимационные ролики для соцсетей и рекламы',
        'Персонажи и маскоты бренда на базе AI',
        'Объяснительные видео с нейро-голосом',
        'Виральный контент: истории, шорты, рилсы',
        'Полный пайплайн: сценарий → монтаж → саунд'
      ]
    },
    avatar: {
      icon: '◉',
      tag: '02 · DIGITAL AVATAR & CONTENT',
      title: 'DIGITAL AVATAR & CONTENT',
      sub: 'AI-Контент и цифровой аватар',
      highlight: 'Ваше присутствие в сети 24/7 без вашего участия.',
      body: 'Создаём ваш цифровой образ — от фотосессий до AI-клонирования голоса. Персональный бренд упакован в единый визуальный язык для всех платформ.',
      list: [
        'Фотосессии в стиле личного бренда',
        'AI-клонирование голоса для контента',
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
      highlight: 'Ваш бизнес на автопилоте через программный код.',
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
    const closeBtn = document.getElementById('serviceOverlayClose');
    const contentEl = document.getElementById('serviceOverlayContent');
    if (!overlay || !closeBtn || !contentEl) return;

    document.querySelectorAll('.service-card').forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.dataset.service;
        const data = SERVICE_DATA[key];
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
          <a href="https://app.lava.top/products/0889191c-4e8c-4978-b545-41dafe762377"
             target="_blank" rel="noopener noreferrer" class="cta-btn cta-btn-shine"
             style="margin-top:0.5rem">
            СЛОЖИТЬ СВОЙ ПАЗЛ (ОПЛАТИТЬ)
          </a>
        `;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeOverlay() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeOverlay(); });
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
    const overlay = document.getElementById('arsenalOverlay');
    const panel = document.getElementById('arsenalPanel');
    const closeBtn = document.getElementById('arsenalClose');
    const panelTitle = document.getElementById('arsenalPanelTitle');
    const panelText = document.getElementById('arsenalPanelText');
    if (!overlay || !panel) return;

    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('click', () => {
        const data = SKILLS[card.dataset.skill];
        if (!data) return;
        panelTitle.textContent = data.title;
        panelText.textContent = data.text;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closePanel() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closePanel);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  }

  // ========== Skill Card Tilt ==========
  function initSkillTilt() {
    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(6px) translateY(0)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // ========== Preloader ==========
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pl = document.getElementById('preloader');
      if (pl) {
        pl.classList.add('hidden');
        setTimeout(() => pl.remove(), 500);
      }
    }, 950);
  });

  // ========== Init ==========
  document.addEventListener('DOMContentLoaded', () => {
    buildPortfolioGallery();
    initServiceOverlays();
    initArsenalPanels();
    initSkillTilt();
    initHUD();
    initScrollObserver();
  });

})();
