# MiraKel Apartados

App para llevar los apartados de **MiraKel Accesorios**: clientas, apartados, abonos, estados de cuenta con la marca y mensajes listos para WhatsApp.

Se instala en el celular como app (PWA) y guarda todo en automático en Cloudflare (base de datos D1).

## Qué incluye

- Ficha de cada clienta con sus apartados, abonos e historial.
- Estados calculados en automático: pendiente, abonando, próximo a vencer, vencido y liquidado.
- Mensajes de WhatsApp prellenados para el estado de cuenta, los recordatorios y la confirmación de abono. Se envían a mano.
- Estado de cuenta visual con la marca, para descargar como imagen o PDF y compartir.
- Plantillas de mensajes editables desde Ajustes.
- Respaldo completo (.json) y exportación a CSV.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La app completa |
| `manifest.webmanifest`, `icons/` | Nombre e ícono al instalarla en el celular |
| `sw.js` | Hace que abra rápido y se pueda instalar |
| `functions/api/` | El servidor en Cloudflare: inicio de sesión y guardado de datos |
| `assets/` | Logo y elementos de la marca |
| `vendor/` | Librería jsPDF (licencia MIT) |

## Datos e inicio de sesión

Los datos se guardan en Cloudflare: cada cambio se sube solo y se ve igual desde cualquier teléfono. Si no hay señal, el cambio se queda en el teléfono y se sube cuando vuelve la conexión.

El usuario y la contraseña **no están en el código**: viven en la configuración de Cloudflare (variables `USUARIO` y `CONTRASENA`). Para cambiar la contraseña, cámbiala ahí y vuelve a publicar.

## Configurar Cloudflare (una sola vez)

1. **Crear la base de datos:** en dash.cloudflare.com → *Storage & databases → D1 SQL database → Create* → nombre `mirakel-apartados`. La tabla se crea sola.
2. **Crear el sitio:** *Workers & Pages → Create → Pages → Connect to Git* → elegir este repositorio, rama `main`. *Framework preset:* None. *Build command:* vacío. *Build output directory:* `/`. Guardar y publicar.
3. **Conectar la base de datos:** en el proyecto → *Settings → Bindings → Add → D1 database* → nombre de variable `DB`, base `mirakel-apartados`.
4. **Usuario y contraseña:** *Settings → Variables and Secrets → Add*: `USUARIO` = `Karina` (texto) y `CONTRASENA` = la contraseña que elijas (tipo *Secret*; no la escribas en este repositorio, es público).
5. **Volver a publicar** para que tome la configuración: *Deployments → ⋯ → Retry deployment*.
6. Abrir la app en `https://mirakel-apartados.pages.dev`, entrar e importar el respaldo desde *Ajustes → Importar respaldo (.json)*.

Cada cambio que se sube a `main` en GitHub se publica solo en Cloudflare. La versión de GitHub Pages ya no puede guardar datos (no tiene servidor); conviene apagarla en *Settings → Pages*.

## Versión

La versión se ve en el inicio de sesión, abajo de cada pantalla y en *Ajustes*. Al publicar un cambio, sube el número en `VERSION_APP` (`index.html`) y en `VERSION` (`sw.js`) para que los teléfonos descarguen la versión nueva.
