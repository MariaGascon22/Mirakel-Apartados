# MiraKel Apartados

App para llevar los apartados de **MiraKel Accesorios**: clientas, apartados, abonos, estados de cuenta con la marca y mensajes listos para WhatsApp.

Se instala en el celular como app (PWA) y guarda los datos en el mismo dispositivo (en el navegador).

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
| `assets/` | Logo y elementos de la marca |
| `vendor/` | Librería jsPDF (licencia MIT) |

## Datos e inicio de sesión

Ya no usa Supabase ni ninguna base de datos en internet. Todo se guarda en el navegador del dispositivo donde se usa la app, así que:

- Los datos de un teléfono no aparecen en otro. Para pasarlos, descarga el respaldo completo (.json) en uno e impórtalo en el otro desde *Ajustes → Importar respaldo*.
- Si se borran los datos del navegador o se desinstala la app, se pierden los registros. Descarga el respaldo completo seguido.

Para entrar: usuario **Karina**, contraseña **Karinarazo** (están en `index.html`). Esta contraseña solo evita que alguien abra la app por descuido en el teléfono; no es una protección fuerte, porque cualquiera que vea el código puede leerla.

## Publicar

La carpeta se publica tal cual, sin compilar nada. Hay dos opciones:

- **Netlify:** conectar este repositorio en *Add new site → Import from Git*. Cada cambio que se suba a GitHub se publica solo.
- **GitHub Pages:** *Settings → Pages → Deploy from a branch → main / (root)*.
