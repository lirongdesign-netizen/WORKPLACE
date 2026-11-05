// 网络优先：有网时总拿最新题库，断网时用缓存兜底
const CACHE = "hht-v1";
const FILES = ["./", "./index.html", "./questions.js", "./manifest.webmanifest", "./icon-192.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-store" }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req.url.split("?")[0], copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req.url.split("?")[0]).then(r => r || caches.match("./index.html")))
  );
});
