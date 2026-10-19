# MiraKel Apartados

App para llevar los apartados de **MiraKel Accesorios**: clientas, apartados, abonos, estados de cuenta con la marca y mensajes listos para WhatsApp.

Se instala en el celular como app (PWA) y guarda los datos en Supabase.

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
| `vendor/` | Librerías: Supabase y jsPDF (licencia MIT) |

## Base de datos

Usa un proyecto de Supabase con las tablas `clientas`, `cuentas` y `ajustes`. Cada tabla tiene una regla para que solo el usuario dueño vea y modifique sus datos.

Datos de conexión: en `index.html` están la URL del proyecto y la llave **publishable**. Esa llave es pública por diseño, y la seguridad la dan el inicio de sesión y las reglas de cada tabla. Nunca se debe poner aquí la llave `secret` ni la `service_role`.

En Supabase debe estar **apagado** *Authentication → Sign In / Providers → Allow new users to sign up*, para que nadie más pueda crear cuentas.

## Publicar

La carpeta se publica tal cual, sin compilar nada. Hay dos opciones:

- **Netlify:** conectar este repositorio en *Add new site → Import from Git*. Cada cambio que se suba a GitHub se publica solo.
- **GitHub Pages:** *Settings → Pages → Deploy from a branch → main / (root)*.
