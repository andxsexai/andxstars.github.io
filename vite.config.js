import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * GitHub Pages:
 * - репозиторий `имя.github.io` → сайт в КОРНЕ домена, base должен быть `/`
 * - иначе (project page) → `https://user.github.io/repo/` → base `/repo/`
 * Локально без env → `./`
 * Подпапка вручную: `VITE_BASE=/ANDXSTARS/ npm run build`
 */
function resolveBase() {
  const fromEnv = process.env.VITE_BASE;
  if (fromEnv) {
    return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`;
  }
  const ref = process.env.GITHUB_REPOSITORY;
  if (ref) {
    const repo = ref.split('/')[1] || '';
    if (/\.github\.io$/i.test(repo)) return '/';
    if (repo) return `/${repo}/`;
  }
  return './';
}

const assetDirs = [
  'author',
  'video',
  'cards',
  'covers',
  'clothing',
  'posters',
  'photos',
  'catalog-uslug',
  'carousel',
  'landings',
  'dopoln'
];

export default defineConfig({
  root: __dirname,
  base: resolveBase(),
  publicDir: false,
  plugins: [
    viteStaticCopy({
      targets: assetDirs.map((src) => ({ src, dest: '.' }))
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
});
