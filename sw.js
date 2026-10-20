/* MiraKel Apartados: guarda la app en el teléfono para que abra rápido.
   Los datos de clientas NO se guardan aquí: vienen de Cloudflare (carpeta /api). */
const VERSION = 'mirakel-3.9'; // súbela junto con VERSION_APP en index.html
// Lo indispensable para abrir. El generador de PDF se guarda la primera vez que se usa.
// Ojo: no poner './index.html'; Cloudflare lo redirige a './' y Safari no abre páginas redirigidas guardadas.
const ARCHIVOS = ['./','./manifest.webmanifest','./favicon.ico',
  './fonts/montserrat.woff2','./fonts/cormorant.woff2','./fonts/cormorant-italic.woff2',
  './assets/logo.png','./assets/wings.png','./assets/firma.png',
  './icons/icon-192.png','./icons/apple-touch-icon.png','./icons/favicon-32.png'];
const INICIO = './';
const ESPERA_RED = 3000; // con señal lenta, abre la copia guardada en vez de esperar

// Safari rechaza respuestas redirigidas: se guarda una copia limpia.
async function limpia(r) {
  if (!r || !r.redirected) return r;
  return new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: r.headers });
}
async function guardar(clave, r) {
  if (!r || !r.ok) return;
  const c = await caches.open(VERSION); await c.put(clave, await limpia(r));
}

// La versión nueva se instala sola; la app muestra el botón "Actualizar" para recargar.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION)
    .then(c => Promise.all(ARCHIVOS.map(a => fetch(new Request(a, { cache: 'reload' })).then(async r => { if (r.ok) await c.put(a, await limpia(r)); }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('message', e => {
  if (e.data && e.data.tipo === 'version' && e.source) e.source.postMessage({ tipo: 'version', version: VERSION.replace('mirakel-', '') });
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return; // los datos siempre van al servidor
  if (req.mode === 'navigate') {
    const red = fetch(req).then(async r => { const l = await limpia(r); guardar(INICIO, l.clone()); return l; });
    const copia = () => caches.match(INICIO).then(limpia);
    const lenta = new Promise(res => setTimeout(res, ESPERA_RED)).then(copia);
    e.respondWith(Promise.race([red.catch(copia), lenta.then(hit => hit || red)]).then(r => r || red));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit ? limpia(hit) : fetch(req).then(r => { guardar(req, r.clone()); return r; })));
});
