#!/usr/bin/env node
/**
 * Local static server for ANDXSTARS — logs every request and non-2xx to stdout/stderr.
 * Usage: npm run dev   or   node dev-server.cjs
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function safePath(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p === "/" || p === "") p = "/index.html";
  const normalized = path.normalize(p).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = path.join(ROOT, normalized);
  if (!abs.startsWith(ROOT)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  const abs = safePath(req.url || "/");
  const stamp = new Date().toISOString();

  if (!abs) {
    console.error(`[${stamp}] [403] ${req.method} ${req.url}`);
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(abs, (err, st) => {
    if (err || !st.isFile()) {
      console.error(`[${stamp}] [404] ${req.method} ${req.url} -> ${path.relative(ROOT, abs) || "."}`);
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    const ext = path.extname(abs).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    fs.readFile(abs, (readErr, data) => {
      if (readErr) {
        console.error(`[${stamp}] [500] read error ${req.url}`, readErr);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Server error");
        return;
      }
      console.log(`[${stamp}] [200] ${req.method} ${req.url} (${(data.length / 1024).toFixed(1)} KiB)`);
      res.writeHead(200, {
        "Content-Type": type,
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  });
});

server.on("error", (e) => {
  console.error("[ANDXSTARS dev-server] fatal:", e);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`ANDXSTARS dev server → http://${HOST}:${PORT}/`);
  console.log("Логи запросов ниже. Ошибки JS смотрите в консоли браузера (DevTools).");
});
