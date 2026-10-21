# TeamTowers · la API y los avisos

La web es la API. No hay ningún servidor propio: ficheros estáticos, los formularios de Netlify y dos funciones que envían avisos.

## Leer

| Qué | Dónde |
| --- | --- |
| Todos los datos de la web | `GET https://tu-web/web.json` |
| Los datos de cada página | El JSON-LD (schema.org) de la misma página |
| La prueba de que la web es la que salió del mapa | `GET https://tu-web/permaweb.json` |

El cerebro (`cerebro/`), las herramientas y estos documentos son del equipo: viven en el repositorio y la web no los sirve.

## Escribir: el registro vivo

Un `POST` a `https://tu-web/` con `Content-Type: application/x-www-form-urlencoded` y los campos de `registre.html`: `form-name=registre`, `de`, `a`, `entregable`, `mena` (`tangible` o `intangible`), `valor` (de 1 a 5), `data` (AAAA-MM-DD) y `evidencia` (un enlace https). Es lo que hace el formulario: Netlify lo guarda y lo envía por correo. Ningún campo para datos personales.

## Los avisos

Cada aviso es un `POST` JSON a las direcciones de `TT_WEBHOOKS`:

```json
{ "formato": "tt-avis-1", "tipus": "transaccion.creada", "web": "https://tu-web/", "creat": "2026-10-10T09:00:00.000Z", "dades": { "de": "…", "a": "…", "q": "…" } }
```

| Aviso | Cuándo | Quién lo envía |
| --- | --- | --- |
| `transaccion.creada` | Cada anotación en el registro | La función `submission-created`, sola |
| `desviacion.detectada` | La anotación no es ningún flujo del mapa (`flux-nou`), o un flujo del mapa no pasa (`flux-sense-us`) | La función, el primero; `node eines/registre.mjs --envia`, el segundo |
| `rol.sin_reciprocidad` | Un rol da y no recibe nada registrado | `node eines/registre.mjs --envia` |
| `cerebro.actualizado` | Cada publicación de la web en producción | La función `deploy-succeeded`, sola |

**La firma.** La cabecera `X-TT-Signatura` lleva `sha256=` y el HMAC-SHA256 del cuerpo con el secreto. Compruébala antes de hacer nada:

```js
import { verificaAvis } from './eines/nucli.mjs';
const bueno = await verificaAvis(cuerpo, cabeceras['x-tt-signatura'], process.env.TT_WEBHOOK_SECRET);
```

## Configurarlo

En Netlify › Site configuration › Environment variables:

- `TT_WEBHOOKS`: las direcciones https que escuchan, separadas por comas.
- `TT_WEBHOOK_SECRET`: un secreto de 16 caracteres o más. Sin secreto no se envía nada.

Las funciones piden que la web se publique desde el repositorio: Netlify Drop no las despliega.

## Para Claude Code

`.mcp.json` conecta `eines/mcp.mjs`, un servidor MCP sin dependencias con tres herramientas: `cervell_index`, `cervell_llegeix` y `registre_informe`. Solo lee lo que sale en el índice del cerebro.
