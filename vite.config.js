import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  base: './',
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
