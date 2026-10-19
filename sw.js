/* MiraKel Apartados: guarda la app en el teléfono para que abra rápido.
   Los datos de clientas NO se guardan aquí: vienen de Cloudflare (carpeta /api). */
const VERSION = 'mirakel-v3';
const ARCHIVOS = ['./','./index.html','./manifest.webmanifest','./vendor/jspdf.umd.min.js',
  './assets/logo.png','./assets/wings.png','./assets/firma.png',
  './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // las fuentes van directo a internet
  if (url.pathname.includes('/api/')) return; // los datos siempre van al servidor
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); return r; })));
});
