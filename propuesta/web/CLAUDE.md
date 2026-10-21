# TeamTowers · reglas para quien trabaja en ella, persona o IA

Esta web sale del mapa de valor y de unos cuantos textos. **El HTML no se edita a mano:** se cambia la fuente y se vuelve a generar.

## Las fuentes

- **`cerebro/mapa-real.json`** (y `cerebro/mapa-ideal.json`, si lo hay): el mapa. Manda sobre las páginas, los roles y los servicios. Se cambia en el editor del mapa de valor, y se guarda en él lo que da «Copia el JSON».
- **`cerebro/continguts/<id>.md`**: el texto de las páginas. `<id>` es `inici`, `serveis`, la puerta de un rol (el nombre de su `.html`) o una página nueva.
- **`cerebro/fonts/`**: lo que ya había (la web de antes, documentos, un CSV), importado en Markdown. El índice es `cerebro/fonts/index.md`.
- **`cerebro/dossier.md`**: qué es el negocio, qué ofrece y a quién. Cada afirmación lleva el enlace a su fuente.
- **`cerebro/decisiones.md`**: lo que se acuerda y por qué, con la fecha.
- **`cerebro/marca.json`**, si lo hay: el color, la letra, la forma, el logo (SVG), los textos propios y dónde estáis (dirección, teléfono de la casa, horario). El teléfono de la web va aquí, no en los contenidos.
- **`cerebro/configuracio.json`**: lo que se eligió en el editor (nombre, idioma, roles de casa, correo de los formularios, dirección). `eines/genera.mjs` lo lee; una variable `TT_*` pasa por encima.
- **`CEREBRO.md`**: el índice de todo el cerebro, por tema y por capa.

## Regenerar

- `node eines/genera.mjs` (Node 18 o más nuevo) vuelve a hacer la web y el cerebro. Hazlo después de cambiar una fuente, y pon el resultado en la misma PR.
- **Si no hay `cerebro/mapa-real.json`, para.** Pide a la persona que pegue en él el JSON del editor del mapa de valor («Copia el JSON»). Sin mapa sale la web de ejemplo.
- Todo lo que se genera se sobrescribe, **excepto**: `netlify.toml`, `cerebro/mapa-real.json`, `cerebro/mapa-ideal.json`, `cerebro/decisiones.md`, `cerebro/dossier.md` y todo lo que hay en `cerebro/fonts/`, `cerebro/continguts/` y `cerebro/esborranys/`. Eso no se genera nunca: se escribe.

## Las tres skills (`.claude/skills/`)

- **`/importa <url o carpeta>`**: trae al cerebro lo que ya hay y escribe el dossier. El primer día, o cuando llega material nuevo.
- **`/continguts [página]`**: escribe o actualiza el texto de las páginas desde el dossier, las fuentes y el mapa.
- **`/tasca <entregable o id>`**: prepara el borrador de una tarea de rutina de `cerebro/tasques-ia.md`.

## El trabajo de rutina: la máquina propone, una persona acepta

`cerebro/tasques-ia.md` sale del mapa y dice qué entregables puede preparar en borrador la IA y cuáles no.

- **Ningún entregable intangible se hace con IA.** Nunca. Lo hace una persona del rol.
- **La IA solo hace borradores**, en `cerebro/esborranys/`. No envía, no publica, no paga ni firma nada.
- **Lo acepta una persona del rol que lo produce.** Hasta entonces, el borrador no existe.
- **Lo que no sabes, `[a completar]`.** No te inventes ningún dato, cifra ni cita.
- **Roles, nunca nombres de persona.**

## Privacidad y seguridad

- **Datos personales, precios pactados y contratos van al CRM.** Nunca al repositorio: lo leen máquinas y puede acabar siendo público.
- **Ninguna clave en el repositorio.** Las del CRM, la IA o los pagos van en las variables de entorno de Netlify.
- **HTML y CSS estáticos, sin JavaScript.** Cada página lleva sus datos en JSON-LD (schema.org), y `web.json` los tiene todos.
- **Los formularios son de Netlify Forms** y llegan por correo.

## Cómo se trabaja

- **Cada cambio, en una PR.** Netlify publica una vista previa, y quien decide la mira antes de aceptarla.
- **La API y los avisos están en `API.md`.** `.mcp.json` conecta `eines/mcp.mjs`, un servidor MCP que solo lee lo que sale en el índice del cerebro.
- **El registro vivo.** Cada entregable entre roles se anota en `registre.html`. El CSV de Netlify va a `cerebro/registro/registre.csv`, y `node eines/registre.mjs` saca el informe y la desviación.
- **Cómo trabajar con Claude**, gratis o con Claude Code: `TRABAJAR-CON-CLAUDE.md`.
