# 🎯 CURSOR TASK — ANDXSTARS SITE OPTIMIZATION
**Дата:** 29 марта 2026  
**Репозиторий:** `andxsexai/andxstars.github.io`  
**Деплой:** GitHub Pages → `https://andxsexai.github.io/andxstars.github.io/index.html`

---

## 🔴 КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (делать в первую очередь)

### ЗАДАЧА 1 — Убрать блокировку рендера от видео

**Файл:** `index.html`  
**Проблема:** Все `<video>` элементы запускают буферизацию при парсинге HTML, ещё до выполнения JS. LCP = 4–8 секунд на мобильных.

**Что сделать:** Найти каждый тег `<video>` в `index.html` и добавить атрибуты:

```html
<!-- БЫЛО -->
<video autoplay muted loop playsinline src="...">

<!-- СТАЛО -->
<video autoplay muted loop playsinline
       preload="none"
       poster="./posters/hero-poster.jpg">
  <source src="..." type="video/mp4">
  <img src="./photos/hero-fallback.jpg" alt="ANDXSTARS — Бизнес AI Видео Код">
</video>
```

**Poster-файлы** — создать JPEG-скриншоты первого кадра каждого видео, разместить в `/posters/`. Разрешение: 1280×720, качество: 70%.

---

### ЗАДАЧА 2 — Убрать render-blocking JS

**Файл:** `index.html`  
**Проблема:** `<script src="./script.js">` в `<head>` блокирует парсинг и First Paint.

```html
<!-- БЫЛО (в <head>) -->
<script src="./script.js"></script>

<!-- СТАЛО (перед </body>) -->
<script src="./script.js" defer></script>
```

Убедиться, что перенос в конец `<body>` с `defer` не ломает инициализацию Canvas/Matrix (они должны ждать DOMContentLoaded).

---

### ЗАДАЧА 3 — Critical CSS inline + async CSS

**Файл:** `index.html`, `style.css`  
**Проблема:** Весь `style.css` блокирует First Paint (единый файл, подключён в `<head>` без оптимизации).

**Что сделать:**

1. Выделить Critical CSS (стили для hero-секции, шапки, шрифтов — всё, что видно без скролла) — примерно 60–100 строк — и вставить **inline** в `<head>`:

```html
<style>
/* CRITICAL: hero + header + fonts */
:root { --safe-top: env(safe-area-inset-top, 0px); --neon: #00f5ff; ... }
body { margin: 0; background: #000; color: #fff; ... }
.hero { ... }
/* ... только то, что нужно до первого скролла */
</style>
```

2. Подключить основной `style.css` асинхронно:

```html
<link rel="preload" href="./style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="./style.css"></noscript>
```

---

### ЗАДАЧА 4 — SEO-мета теги (сейчас нулевые)

**Файл:** `index.html`  
**Проблема:** Нет description, OG-тегов, canonical. В Telegram и VK при репосте — пустая карточка.

Добавить в `<head>` перед `</head>`:

```html
<!-- SEO -->
<meta name="description" content="ANDXSTARS — эксперт по AI, видео и автоматизации. Нейромультики, подкасты, IT-разработка, консультации от 990 ₽. Скидка 15% на первый заказ.">
<meta name="keywords" content="AI автоматизация, нейромультики, видео продакшн, подкасты, IT разработка, n8n, консультация">
<link rel="canonical" href="https://andxsexai.github.io/andxstars.github.io/">

<!-- Open Graph (для Telegram, VK, WhatsApp) -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://andxsexai.github.io/andxstars.github.io/">
<meta property="og:title" content="ANDXSTARS — Бизнес · AI · Видео · Код">
<meta property="og:description" content="Архитектор цифровой реальности. Нейромультики, подкасты, IT-автоматизация. Консультация от 990 ₽.">
<meta property="og:image" content="https://andxsexai.github.io/andxstars.github.io/photos/og-preview.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="ANDXSTARS — Бизнес · AI · Видео · Код">
<meta name="twitter:description" content="Архитектор цифровой реальности. AI, видео, автоматизация.">
<meta name="twitter:image" content="https://andxsexai.github.io/andxstars.github.io/photos/og-preview.jpg">
```

**Создать файл** `./photos/og-preview.jpg` — 1200×630 px, яркий брендовый баннер с логотипом и слоганом.

---

### ЗАДАЧА 5 — Google Fonts: устранить FOIT

**Файл:** `index.html`  
**Проблема:** Шрифты грузятся без `display=swap` — текст невидим 1–3 сек на медленном интернете.

```html
<!-- БЫЛО -->
<link href="https://fonts.googleapis.com/css2?family=Orbitron..." rel="stylesheet">

<!-- СТАЛО -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
```

Добавить в CSS:
```css
body { font-display: swap; }
```

---

## 🟡 ВАЖНЫЕ ИСПРАВЛЕНИЯ (вторая очередь)

### ЗАДАЧА 6 — Переименовать папки (убрать пробелы)

**Проблема:** Пробелы в именах папок — нестабильное поведение на GitHub Pages.

| Было | Стало |
|------|-------|
| `catalog uslug/` | `catalog-uslug/` |
| `Photo and video/` | `photo-video/` |
| `MULTIKIF/` | `multikif/` |
| `PODCUSTLE/` | `podcustle/` |

После переименования — глобальная замена всех путей в `index.html` и `script.js`. Использовать find & replace в Cursor.

---

### ЗАДАЧА 7 — Fallback для body:has() в старом Safari

**Файл:** `script.js`  
**Проблема:** `body:has(#serviceOverlay.active)` не работает в Safari < 15.4.

Добавить JS-fallback:

```javascript
// Добавлять класс на body при открытии любого оверлея
function openOverlay(overlayId) {
  document.getElementById(overlayId).classList.add('active');
  document.body.classList.add('overlay-open'); // fallback-класс
}

function closeOverlay(overlayId) {
  document.getElementById(overlayId).classList.remove('active');
  // Проверить, нет ли других открытых оверлеев
  const anyOpen = document.querySelector('.active[id$="Overlay"], .active[id$="Modal"]');
  if (!anyOpen) document.body.classList.remove('overlay-open');
}
```

В `style.css` добавить:
```css
/* Fallback для Safari < 15.4 */
body.overlay-open .mobile-quick-nav {
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px);
}
```

---

### ЗАДАЧА 8 — Canvas/Matrix: добавить deviceMemory проверку

**Файл:** `script.js`  
**Проблема:** Текущая логика не проверяет `navigator.deviceMemory` — Matrix может запуститься на 3ГБ устройстве с 6 ядрами.

```javascript
function allowMatrixEffect() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4; // в ГБ
  const isLowEnd = cores <= 4 || memory < 4;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return !isLowEnd && !prefersReduced;
}

// Запуск
if (window.requestIdleCallback) {
  requestIdleCallback(() => {
    if (allowMatrixEffect()) initMatrix();
  }, { timeout: 3000 }); // timeout важен!
} else {
  setTimeout(() => {
    if (allowMatrixEffect()) initMatrix();
  }, 500);
}
```

---

### ЗАДАЧА 9 — Marquee: убрать дублирование DOM-узлов

**Файл:** `index.html`  
**Проблема:** Два полных набора тегов технологий для эффекта бесконечной ленты.

**Решение:** Дублирование делать через CSS, а не HTML:

```html
<!-- HTML: только один набор -->
<div class="marquee-track" aria-hidden="true">
  <span>OpenAI</span><span>Midjourney</span><!-- ...остальные... -->
</div>

```

```css
/* CSS: дублирование через pseudo + animation */
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 25s linear infinite;
}
.marquee-track::after {
  content: attr(data-clone); /* или дублирование через JS один раз */
}
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

Или клонировать через JS один раз при инициализации (не дважды в HTML).

---

## 🔵 ФИНАЛЬНАЯ ПРОВЕРКА

После всех изменений выполнить:

1. **Lighthouse audit** в DevTools → режим Mobile → проверить Performance ≥ 70
2. **Проверить пути видео** — открыть DevTools Network, убедиться что нет 404 на .mp4 файлы  
3. **Проверить OG-теги** на сайте: https://developers.facebook.com/tools/debug/ (ввести URL)
4. **Проверить в Safari iOS** — открыть на реальном iPhone, проверить модалки и safe-area
5. **Проверить canvas** — открыть в режиме Slow 3G (DevTools → Network throttling)

---

## 📁 ИТОГОВАЯ СТРУКТУРА ПОСЛЕ ИЗМЕНЕНИЙ

```
/
├── index.html          ← critical CSS inline + defer JS + OG теги + preload="none" на видео
├── style.css           ← async load + font-display: swap
├── script.js           ← в конце body + defer + deviceMemory check + overlay-open класс
├── catalog-uslug/      ← переименовано (было: catalog uslug)
│   ├── photo-video/    ← переименовано (было: Photo and video)
│   ├── multikif/       ← переименовано
│   ├── podcustle/      ← переименовано
│   └── it/
├── dopoln/
├── photos/
│   └── og-preview.jpg  ← НОВЫЙ: 1200×630 для соцсетей
├── posters/            ← НОВЫЙ: постеры первого кадра для каждого видео
│   ├── hero-poster.jpg
│   └── ...
├── legal-privacy.html
├── legal-requisites.html
└── legal-offer.html
```

---

## ⚡ ОЖИДАЕМЫЙ РЕЗУЛЬТАТ ПОСЛЕ ИСПРАВЛЕНИЙ

| Метрика | До | После |
|---------|-----|-------|
| LCP (mobile) | ~4–8 сек | ~1.5–2.5 сек |
| Performance (mobile) | ~38 | ~70–80 |
| FCP | ~2.5 сек | ~0.8 сек |
| SEO score | ~72 | ~95+ |
| 404 на видео | Возможны | Исключены |
| OG-карточки | Пустые | Брендовые |

---

*Задание сформировано Claude (Anthropic) на основе аудита сайта andxstars.github.io от 29.03.2026*
