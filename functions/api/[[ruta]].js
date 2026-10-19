/* MiraKel Apartados: guarda los datos en Cloudflare (base de datos D1).
   Necesita en Cloudflare Pages → Settings:
   - Binding D1 llamado DB.
   - Variables USUARIO y CONTRASENA (la contraseña como "Secret").
   La tabla se crea sola la primera vez. */

const COLECCIONES = ['clientas', 'cuentas', 'ajustes'];
let tablaLista = false;

async function prepararTabla(db) {
  if (tablaLista) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS registros (
    coleccion TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL, actualizado TEXT NOT NULL,
    PRIMARY KEY (coleccion, id))`).run();
  tablaLista = true;
}

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function firmar(env, texto) {
  const llave = await crypto.subtle.importKey('raw', new TextEncoder().encode('mirakel:' + env.CONTRASENA),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', llave, new TextEncoder().encode(texto)));
}
function iguales(a, b) {
  a = String(a); b = String(b);
  let dif = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) dif |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return dif === 0;
}
async function tokenValido(request, env) {
  const m = /^Bearer (.+)$/.exec(request.headers.get('authorization') || '');
  return !!m && iguales(m[1], await firmar(env, String(env.USUARIO).toLowerCase()));
}

function filas(coleccion, mapa) {
  const ahora = new Date().toISOString();
  return Object.entries(mapa || {}).map(([id, o]) => {
    const d = Object.assign({}, o); delete d.id;
    return [coleccion, String(id), JSON.stringify(d), ahora];
  });
}

export async function onRequest({ request, env, params }) {
  if (!env.DB || !env.USUARIO || !env.CONTRASENA) return json({ error: 'config' }, 500);
  const ruta = [].concat(params.ruta || []);
  const metodo = request.method;

  if (ruta[0] === 'login' && metodo === 'POST') {
    const b = await request.json().catch(() => ({}));
    const ok = iguales(String(b.usuario || '').trim().toLowerCase(), String(env.USUARIO).toLowerCase())
      && iguales(b.contrasena || '', env.CONTRASENA);
    if (!ok) { await new Promise(r => setTimeout(r, 800)); return json({ error: 'credenciales' }, 401); }
    return json({ token: await firmar(env, String(env.USUARIO).toLowerCase()), nombre: env.USUARIO });
  }

  if (!(await tokenValido(request, env))) return json({ error: 'sesion' }, 401);
  await prepararTabla(env.DB);

  if (ruta[0] === 'datos' && metodo === 'GET') {
    const { results } = await env.DB.prepare('SELECT coleccion, id, data FROM registros').all();
    const out = { clientas: {}, cuentas: {}, ajustes: null };
    for (const r of results) {
      const d = JSON.parse(r.data);
      if (r.coleccion === 'ajustes') { if (r.id === 'general') out.ajustes = d; }
      else if (out[r.coleccion]) out[r.coleccion][r.id] = Object.assign(d, { id: r.id });
    }
    return json(out);
  }

  if (ruta[0] === 'registro' && ruta.length === 3 && COLECCIONES.includes(ruta[1])) {
    const [, coleccion, id] = ruta;
    if (metodo === 'PUT') {
      const d = await request.json().catch(() => null);
      if (!d || typeof d !== 'object') return json({ error: 'formato' }, 400);
      delete d.id;
      await env.DB.prepare(`INSERT INTO registros (coleccion, id, data, actualizado) VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT (coleccion, id) DO UPDATE SET data = excluded.data, actualizado = excluded.actualizado`)
        .bind(coleccion, id, JSON.stringify(d), new Date().toISOString()).run();
      return json({ ok: true });
    }
    if (metodo === 'DELETE') {
      await env.DB.prepare('DELETE FROM registros WHERE coleccion = ?1 AND id = ?2').bind(coleccion, id).run();
      return json({ ok: true });
    }
  }

  if (ruta[0] === 'importar' && metodo === 'POST') {
    const r = await request.json().catch(() => null);
    if (!r || typeof r !== 'object') return json({ error: 'formato' }, 400);
    const todas = filas('clientas', r.clientas).concat(filas('cuentas', r.cuentas));
    if (r.ajustes && typeof r.ajustes === 'object') todas.push(['ajustes', 'general', JSON.stringify(r.ajustes), new Date().toISOString()]);
    const sql = env.DB.prepare(`INSERT INTO registros (coleccion, id, data, actualizado) VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT (coleccion, id) DO UPDATE SET data = excluded.data, actualizado = excluded.actualizado`);
    for (let i = 0; i < todas.length; i += 50) await env.DB.batch(todas.slice(i, i + 50).map(f => sql.bind(...f)));
    return json({ ok: true, clientas: Object.keys(r.clientas || {}).length, cuentas: Object.keys(r.cuentas || {}).length });
  }

  return json({ error: 'ruta' }, 404);
}
