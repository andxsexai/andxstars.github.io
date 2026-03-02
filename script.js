/**
 * ANDXSTARS · Senior Refactor
 * Lightning Cursor · Slide-in Panels · Dynamic Portfolio · Blade Runner HUD
 */

(function () {
  'use strict';

  // ========== Portfolio Data (Latin folder names) ==========
  const PORTFOLIO_DATA = [
    { folder: 'author', category: 'author', label: 'Автор Я Сам', files: ['1767549655237-2026-01-04 20.48.46.jpg', '1767549700407-019b8a2c-6557-7198-9d38-e2b5826b189c.png', '1772200039565-019c9f58-b3e8-78d4-98ba-451ed4facf48.png', '1772207528813-019c9fcd-2e32-7f16-ba16-5e1627d46b78.png', '1772207846385-019c9fd1-f8c8-7c64-a7d9-0cf4f9d29031.png'] },
    { folder: 'landings', category: 'landings', label: 'Лендинги', files: ['2026-03-02 15.30.42.jpg', '2026-03-02 15.31.16.jpg', '2026-03-02 15.31.25.jpg'] },
    { folder: 'infographics', category: 'infographics', label: 'Инфографика', files: ['2026-03-02 15.24.56.mp4', '2026-03-02 15.25.24.mp4', '2026-03-02 15.25.38.mp4'] },
    { folder: 'cards', category: 'cards', label: 'Карточки ВБ', files: ['2026-03-02 15.50.57.jpg', '2026-03-02 15.51.06.jpg', '2026-03-02 15.51.12.jpg'] },
    { folder: 'covers', category: 'covers', label: 'Обложки', files: ['1772225274266-019ca0dc-beab-79e9-aaae-964277c95901.jpeg', '1772225599649-019ca0e1-8f02-7410-aad4-3789bdcbf4c2.jpeg'] },
    { folder: 'clothing', category: 'clothing', label: 'Одежда', files: ['1766007426835-019b2e3e-05bb-730c-9b93-a770754964d3.png', '1766010039377-019b2e66-1c63-71c1-b9be-cbf081e0ba21.png', '1766011052051-019b2e75-9545-7e94-b9cb-8e0a645fc52b.png'] },
    { folder: 'posters', category: 'posters', label: 'Постеры', files: ['1771433468513-019c71aa-04fd-7451-a818-b28757ca62de.jpeg', '2026-03-02 15.32.19.jpg', '2026-03-02 15.45.55.jpg', '2026-03-02 15.46.01.jpg'] },
    { folder: 'carousel', category: 'carousel', label: 'Посты карусели', files: ['2026-03-02 15.28.51.jpg', '2026-03-02 15.29.10.jpg', '2026-03-02 15.29.13.jpg', '2026-03-02 15.29.20.jpg', '2026-03-02 15.29.24.jpg', '2026-03-02 15.29.27.jpg', '2026-03-02 15.32.48.jpg', '2026-03-02 15.32.57.jpg', '2026-03-02 15.33.02.jpg', '2026-03-02 15.33.10.jpg'] },
    { folder: 'photos', category: 'photos', label: 'Фотосессии', files: ['1767209604674-019b75e6-da37-72c1-98c6-71abd70c240f.png', '1767712598517-019b93e1-67d9-79c5-a85e-9a644665fde8.png', '2026-03-02 15.23.13.jpg', '2026-03-02 15.23.18.jpg', 'influencer.jpg'] }
  ];

  function encodePath(folder, file) {
    return './' + folder + '/' + encodeURIComponent(file);
  }

  function isVideo(file) {
    return /\.(mp4|webm|ogg)$/i.test(file);
  }

  function buildPortfolioGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    gallery.innerHTML = '';
    PORTFOLIO_DATA.forEach((group) => {
      group.files.forEach((file) => {
        const href = encodePath(group.folder, file);
        const isVid = isVideo(file);
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.category = group.category;

        if (isVid) {
          item.innerHTML = `<a href="${href}" target="_blank" class="gallery-link"><video muted loop playsinline preload="metadata"><source src="${href}" type="video/mp4"></video><span class="gallery-overlay">${group.label}</span></a>`;
        } else {
          item.innerHTML = `<a href="${href}" target="_blank" class="gallery-link"><img src="${href}" alt="${group.label}" loading="lazy"><span class="gallery-overlay">${group.label}</span></a>`;
          const img = item.querySelector('img');
          if (img) {
            img.addEventListener('error', () => { item.style.display = 'none'; });
          }
        }
        gallery.appendChild(item);
      });
    });

    initVideoHover();
    initPortfolioFilter();
    initScrollObserver();
  }

  function initVideoHover() {
    document.querySelectorAll('.gallery-item video').forEach((video) => {
      const link = video.closest('.gallery-link');
      if (!link) return;
      link.addEventListener('mouseenter', () => video.play());
      link.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
    });
  }

  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        galleryItems.forEach((item, i) => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('hidden', !show);
          item.style.transitionDelay = `${(i % 12) * 0.03}s`;
          if (show) item.classList.add('visible');
        });
      });
    });
  }

  // ========== Lightning Cursor ==========
  const canvas = document.getElementById('lightningCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    const trail = [];
    const FADE = 0.12, JITTER = 4, LEN = 12, SEG = 8;

    function resize() { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; }
    function j() { return (Math.random() - 0.5) * JITTER; }

    function drawSeg(x1, y1, x2, y2, a) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(200,100,255,${a})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#b026ff';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(176,38,255,${a * 0.6})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        p.a -= FADE;
        if (p.a <= 0) { trail.splice(i, 1); continue; }
        if (i > 0) drawSeg(trail[i - 1].x + trail[i - 1].jx, trail[i - 1].y + trail[i - 1].jy, p.x + j(), p.y + j(), p.a);
      }
      requestAnimationFrame(loop);
    }

    let lx = -1, ly = -1, lt = 0;
    function add(x, y) {
      if (Date.now() - lt < 16) return;
      lt = Date.now();
      if (lx >= 0 && Math.hypot(x - lx, y - ly) < SEG && trail.length) return;
      lx = x; ly = y;
      trail.push({ x, y, jx: j(), jy: j(), a: 1 });
      if (trail.length > LEN) trail.shift();
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => add(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => { if (e.touches.length) add(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    loop();
  }

  // ========== Scroll Observer ==========
  function initScrollObserver() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

    document.querySelectorAll('.section-title, .glass-panel, .hero-product, .skill-card, .gallery-item, .review-card, .cta-content').forEach((el) => obs.observe(el));
    document.querySelectorAll('.gallery-item').forEach((item, i) => { item.style.transitionDelay = `${(i % 12) * 0.03}s`; });
    document.querySelectorAll('.skill-card').forEach((card, i) => { card.style.transitionDelay = `${i * 0.06}s`; });
    document.querySelectorAll('.review-card').forEach((card, i) => { card.style.transitionDelay = `${i * 0.1}s`; });
  }

  // ========== Arsenal Slide-in Panels ==========
  function initArsenalPanels() {
    const overlay = document.getElementById('arsenalOverlay');
    const panel = document.getElementById('arsenalPanel');
    const closeBtn = document.getElementById('arsenalClose');
    const panelTitle = document.getElementById('arsenalPanelTitle');
    const panelText = document.getElementById('arsenalPanelText');

    const SKILLS = {
      sites: { title: 'Создание сайтов', text: 'Зачем это нужно: Упакуем твой продукт так, чтобы он продавал сам. Футуристичный дизайн, который выделяет тебя из серой массы. Боль: «Мой сайт выглядит как у всех». Решение: уникальный киберпанк-интерфейс, который запоминается.' },
      music: { title: 'Написание музыки (andxsound)', text: 'Как это поможет: Авторский звук для твоих проектов, видео или медитаций. Задаем правильный вайб и ритм. Боль: «Музыка не передает мой бренд». Решение: эксклюзивный звуковой трек под твою аудиторию.' },
      ai: { title: 'Нейросети (генерация контента)', text: 'Для чего: Освободи 80% времени. Автоматизация контента, генерация идей и визуалов со скоростью мысли. Боль: «Я не успеваю создавать контент». Решение: нейросети работают на тебя 24/7.' },
      automation: { title: 'Автоматизация', text: 'Твоя выгода: Настрой системы один раз и позволь алгоритмам работать на тебя 24/7. Боль: «Рутина съедает время». Решение: автоматические пайплайны для контента и продаж.' },
      qigong: { title: 'Цигун и Гунфу', text: 'Основа всего: Дисциплина тела и энергии. Без правильного состояния технологии не работают. Настроим твой внутренний фокус. Боль: «Выгораю и не могу сосредоточиться». Решение: энергия и ясность для продуктивной работы.' },
      photo: { title: 'Фотосессии (цифровой аватар)', text: 'Твой образ: Создадим твой идеальный цифровой и реальный аватар для личного бренда. Упакуем тебя дорого. Боль: «Не знаю, как подать себя». Решение: профессиональный визуал для соцсетей и сайта.' },
      security: { title: 'Кибербезопасность', text: 'Защита: Аудит твоих цифровых активов, защита данных и персонального бренда. Боль: «Боюсь утечек и взлома». Решение: понимание угроз и практические шаги защиты.' }
    };

    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('click', () => {
        const skill = card.dataset.skill;
        const data = SKILLS[skill];
        if (!data || !overlay || !panel) return;
        panelTitle.textContent = data.title;
        panelText.textContent = data.text;
        overlay.classList.add('active');
        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closePanel() {
      overlay?.classList.remove('active');
      panel?.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closePanel);
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) closePanel(); });
  }

  function initSkillTilt() {
    document.querySelectorAll('.skill-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateZ(8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ========== Preloader ==========
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader')?.classList.add('hidden');
      setTimeout(() => document.getElementById('preloader')?.remove(), 500);
    }, 900);
  });

  // ========== Init ==========
  document.addEventListener('DOMContentLoaded', () => {
    buildPortfolioGallery();
    initArsenalPanels();
    initSkillTilt();
  });
})();
