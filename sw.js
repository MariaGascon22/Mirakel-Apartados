/* MiraKel Apartados: guarda la app en el teléfono para que abra rápido.
   Los datos de clientas NO se guardan aquí: vienen de Cloudflare (carpeta /api). */
const VERSION = 'mirakel-3.3'; // súbela junto con VERSION_APP en index.html
// Lo indispensable para abrir. El generador de PDF se guarda la primera vez que se usa.
const ARCHIVOS = ['./','./index.html','./manifest.webmanifest','./favicon.ico',
  './fonts/montserrat.woff2','./fonts/cormorant.woff2','./fonts/cormorant-italic.woff2',
  './assets/logo.png','./assets/wings.png','./assets/firma.png',
  './icons/icon-192.png','./icons/apple-touch-icon.png','./icons/favicon-32.png'];
const ESPERA_RED = 3000; // con señal lenta, abre la copia guardada en vez de esperar

self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(a => new Request(a, { cache: 'reload' }))))); });
// La versión nueva espera a que toques "Actualizar" en la app.
self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.tipo === 'actualizar') self.skipWaiting();
  if (e.data.tipo === 'version' && e.source) e.source.postMessage({ tipo: 'version', version: VERSION.replace('mirakel-', '') });
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return; // los datos siempre van al servidor
  if (req.mode === 'navigate') {
    const red = fetch(req).then(r => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); } return r; });
    const lenta = new Promise(res => setTimeout(res, ESPERA_RED)).then(() => caches.match('./index.html'));
    e.respondWith(Promise.race([red.catch(() => caches.match('./index.html')), lenta.then(hit => hit || red)])
      .then(r => r || red));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(req, copia)); } return r; })));
});
