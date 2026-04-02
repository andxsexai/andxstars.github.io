import { defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import sirv from 'sirv';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/** Статика вне `public/`: отдаём в dev и копируем в dist (SSG-выход). */
const ASSET_DIRS = [
  'catalog-uslug',
  'dopoln',
  'author',
  'video',
  'photos',
  'posters',
  'cards',
  'covers',
  'clothing',
  'carousel',
  'landings'
];

function serveProjectAssets() {
  return {
    name: 'serve-project-assets',
    configureServer(server) {
      const root = server.config.root;
      for (const dir of ASSET_DIRS) {
        const abs = path.resolve(root, dir);
        if (fs.existsSync(abs)) {
          server.middlewares.use('/' + dir, sirv(abs, { dev: true, etag: true }));
        }
      }
    }
  };
}

export default defineConfig({
  base: './',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: true,
    minify: 'esbuild',
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  },
  plugins: [
    serveProjectAssets(),
    viteStaticCopy({
      targets: [
        ...ASSET_DIRS.map((dir) => ({
          src: `${dir}/**/*`,
          dest: dir
        })),
        { src: 'legal-offer.html', dest: '.' },
        { src: 'legal-privacy.html', dest: '.' },
        { src: 'legal-requisites.html', dest: '.' }
      ]
    })
  ]
});
