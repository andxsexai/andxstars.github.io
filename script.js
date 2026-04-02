/**
 * ANDXSTARS v6.0 — hero canvas, glow; модули: ./scripts/features.js (вкладки, lazy, оверлеи)
 */

import { initMainTabs, initAndxFeatures, observeLazyVideosIn } from './scripts/features.js';

function isLowTierDevice() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const saveData = navigator.connection && navigator.connection.saveData;
  return cores < 4 || memory < 4 || isMobile || saveData;
}

function scheduleFeaturesBundle() {
  const run = () => {
    initAndxFeatures();
  };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 120);
  }
}

function initGlowCardTracking() {
  document.addEventListener(
    'mousemove',
    (e) => {
      document.querySelectorAll('.glow-card').forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--y', `${e.clientY - rect.top}px`);
      });
    },
    { passive: true }
  );
}

function initSpiral() {
  const canvas = document.getElementById('spiralCanvas');
  if (!canvas || isLowTierDevice()) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let size;

  function resize() {
    size = Math.max(window.innerWidth, window.innerHeight);
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const CHANGE_EVENT_TIME = 0.32;
  const CAMERA_Z = -400;
  const CAMERA_TRAVEL = 3400;
  const VIEW_ZOOM = 100;
  const NUM_STARS = 3000;
  const TRAIL_LEN = 60;
  const START_DOT_Y = 28;

  let time = 0;
  const stars = [];
  let seed = 1234;

  function seededRand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  function ease(p, g) {
    if (p < 0.5) return 0.5 * Math.pow(2 * p, g);
    return 1 - 0.5 * Math.pow(2 * (1 - p), g);
  }

  function mapRange(v, s1, e1, s2, e2) {
    return s2 + ((e2 - s2) * (v - s1)) / (e1 - s1);
  }
  function clamp(v, mn, mx) {
    return Math.min(Math.max(v, mn), mx);
  }
  function lerp(a, b, t) {
    return a * (1 - t) + b * t;
  }

  function spiralPath(p) {
    p = clamp(1.2 * p, 0, 1);
    p = ease(p, 1.8);
    const turns = 6;
    const theta = 2 * Math.PI * turns * Math.sqrt(p);
    const r = 170 * Math.sqrt(p);
    return { x: r * Math.cos(theta), y: r * Math.sin(theta) + START_DOT_Y };
  }

  function createStar() {
    const angle = seededRand() * Math.PI * 2;
    const dist = 30 * seededRand() + 15;
    const spiralLoc = (1 - Math.pow(1 - seededRand(), 3)) / 1.3;
    let z = lerp(0.5 * CAMERA_Z, CAMERA_TRAVEL + CAMERA_Z, seededRand());
    z = lerp(z, CAMERA_TRAVEL / 2, 0.3 * spiralLoc);
    return {
      dx: dist * Math.cos(angle),
      dy: dist * Math.sin(angle),
      spiralLoc,
      z,
      swFactor: Math.pow(seededRand(), 2),
      rotDir: seededRand() > 0.5 ? 1 : -1,
      expRate: 1.2 + seededRand() * 0.8,
      finalScale: 0.7 + seededRand() * 0.6
    };
  }

  function showDot(pos3, sizeFactor) {
    const t2 = clamp(mapRange(time, CHANGE_EVENT_TIME, 1, 0, 1), 0, 1);
    const camZ = CAMERA_Z + ease(Math.pow(t2, 1.2), 1.8) * CAMERA_TRAVEL;
    if (pos3.z > camZ) {
      const depth = pos3.z - camZ;
      const x = (VIEW_ZOOM * pos3.x) / depth;
      const y = (VIEW_ZOOM * pos3.y) / depth;
      const sw = (400 * sizeFactor) / depth;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(sw / 2, 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function renderStar(star, p) {
    const sp = spiralPath(star.spiralLoc);
    const q = p - star.spiralLoc;
    if (q <= 0) return;

    const dp = clamp(4 * q, 0, 1);
    let sx;
    let sy;

    if (dp < 0.3) {
      const t = dp / 0.3;
      sx = lerp(sp.x, sp.x + star.dx * 0.3, t);
      sy = lerp(sp.y, sp.y + star.dy * 0.3, t);
    } else if (dp < 0.7) {
      const mp = (dp - 0.3) / 0.4;
      const curve = Math.sin(mp * Math.PI) * star.rotDir * 1.5;
      sx = lerp(sp.x + star.dx * 0.3, sp.x + star.dx * 0.7, mp) + -star.dy * 0.4 * curve * mp;
      sy = lerp(sp.y + star.dy * 0.3, sp.y + star.dy * 0.7, mp) + star.dx * 0.4 * curve * mp;
    } else {
      const fp = (dp - 0.7) / 0.3;
      const tDist = Math.sqrt(star.dx * star.dx + star.dy * star.dy) * star.expRate * 1.5;
      const baseAngle = Math.atan2(star.dy, star.dx);
      const sAngle = baseAngle + star.rotDir * 1.2 * fp * Math.PI;
      sx = lerp(sp.x + star.dx * 0.7, sp.x + tDist * Math.cos(sAngle), fp);
      sy = lerp(sp.y + star.dy * 0.7, sp.y + tDist * Math.sin(sAngle), fp);
    }

    const depth = star.z - CAMERA_Z;
    const vx = (depth * sx) / VIEW_ZOOM;
    const vy = (depth * sy) / VIEW_ZOOM;
    const szMul = dp < 0.6 ? 1 + dp * 0.2 : lerp(1.2, star.finalScale, (dp - 0.6) / 0.4);
    showDot({ x: vx, y: vy, z: star.z }, 8.5 * star.swFactor * szMul);
  }

  function drawTrail(t1) {
    for (let i = 0; i < TRAIL_LEN; i++) {
      const f = mapRange(i, 0, TRAIL_LEN, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;
      const pt = spiralPath(t1 - 0.00015 * i);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(sw / 2, 0.3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < NUM_STARS; i++) stars.push(createStar());
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let lastTs = 0;
  const SPEED = 1 / 900;

  function render(ts) {
    if (document.hidden) {
      requestAnimationFrame(render);
      return;
    }
    const dt = Math.min(ts - lastTs, 50);
    lastTs = ts;
    time = (time + dt * SPEED) % 1;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    const t2 = clamp(mapRange(time, CHANGE_EVENT_TIME, 1, 0, 1), 0, 1);
    ctx.rotate(-Math.PI * ease(t2, 2.7));

    const t1 = clamp(mapRange(time, 0, CHANGE_EVENT_TIME + 0.25, 0, 1), 0, 1);
    ctx.fillStyle = '#ffffff';
    drawTrail(t1);

    ctx.fillStyle = 'rgba(211, 148, 255, 0.8)';
    for (const star of stars) renderStar(star, t1);

    ctx.restore();
    requestAnimationFrame(render);
  }

  requestAnimationFrame((ts) => {
    lastTs = ts;
    render(ts);
    setTimeout(() => {
      canvas.style.opacity = '1';
    }, 200);
  });
}

function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);
  let drops = Array(Math.floor(w / 20)).fill(1);

  function syncSize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const newCols = Math.floor(w / 20);
    const next = Array(newCols).fill(1);
    for (let i = 0; i < Math.min(drops.length, newCols); i++) next[i] = drops[i];
    drops = next;
  }

  function draw() {
    if (document.hidden) return;
    ctx.fillStyle = 'rgba(14, 14, 14, 0.05)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#aa30fa';
    ctx.font = '15px "Space Grotesk", sans-serif';
    for (let i = 0; i < drops.length; i++) {
      const text = String.fromCharCode(Math.random() * 128);
      ctx.fillText(text, i * 20, drops[i] * 20);
      if (drops[i] * 20 > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  window.addEventListener('resize', syncSize, { passive: true });
  setInterval(draw, 33);
}

function boot() {
  initGlowCardTracking();
  initMainTabs();
  observeLazyVideosIn(document);
  initMatrix();
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => initSpiral());
  } else {
    setTimeout(initSpiral, 300);
  }
  scheduleFeaturesBundle();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
