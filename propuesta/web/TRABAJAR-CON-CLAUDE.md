# Trabajar con Claude en la web de TeamTowers

Hay tres maneras. Todas usan las mismas reglas (`CLAUDE.md`) y el mismo cerebro (`cerebro/`). Y en todas, **la máquina propone y una persona acepta**: nada se publica sin una PR que alguien ha mirado.

Los planes de Claude cambian. Esto es como era a octubre de 2026. Los planes y los precios de cada momento: https://claude.com/pricing.

**El repositorio, privado.** El cerebro habla del negocio: en GitHub, Settings › General › Danger Zone › Change visibility › Private. Netlify y Claude trabajan igual.

## 1 · Gratis, con claude.ai (plan Free)

**Claude Code no está en el plan gratuito (Free).** El plan Free sí deja trabajar con el cerebro de la web, leyéndolo:

1. En claude.ai, crea un proyecto: «Web de TeamTowers».
2. Copia el texto de `CLAUDE.md` en las instrucciones del proyecto.
3. Añade el repositorio al conocimiento del proyecto con la integración de GitHub. Elige `CLAUDE.md`, `CEREBRO.md` y la carpeta `cerebro/`.
4. Después de cada cambio en el repositorio, pulsa **Sync** para que Claude vea la versión nueva.
5. Sube las skills. En GitHub, Code › Download ZIP. Dentro está `.claude/skills/` (es una carpeta oculta): haz un zip de cada carpeta (`importa`, `continguts`, `tasca`) y súbelos al apartado de skills de la configuración de Claude. Hay que tener activado «Code execution and file creation».

**Qué puede hacer:** leer el mapa, las fuentes y el dossier, y escribir el dossier, el texto de las páginas, los borradores de las tareas o una propuesta de mapa.

**Qué no puede hacer:** escribir en el repositorio. La integración de GitHub solo lee. Claude te da los ficheros, y tú:

- Los subes a GitHub: entra en la carpeta (por ejemplo `cerebro/continguts/`), **Add file › Upload files**, y elige «Create a new branch… and start a pull request». Netlify publica la vista previa.
- O se los envías a TeamTowers y los subimos nosotros.

**Los límites:**

- Menos uso que en los planes de pago. Cuando se acaba, hay que esperar.
- Hasta 5 proyectos.
- No hay órdenes con barra (`/importa`). Pídelo con palabras («importa esta web») y Claude elige la skill.
- Todo lo que pones en el proyecto tiene que caber en el contexto de la conversación. Si el cerebro es grande, elige solo lo que hace falta.
- No ejecuta las herramientas del repositorio sobre tu web. Para importar, le pegas o subes el texto de las páginas y los documentos.

## 2 · Con Claude Code (plan de pago o clave de API)

Claude Code viene con los planes de pago (Pro o superior) o con una clave de API de la Claude Console, que se paga por uso. Las cuentas nuevas de la Console a veces traen un poco de crédito de prueba.

- **En el navegador:** claude.ai/code, con el repositorio de GitHub.
- **En el ordenador:** la aplicación de escritorio, o la orden `claude` dentro de la carpeta del repositorio.

`CLAUDE.md`, las skills de `.claude/skills/` y `.mcp.json` se cargan solos. El servidor MCP (`eines/mcp.mjs`) pide permiso antes de funcionar. Claude ejecuta las herramientas y abre la PR; quien decide la acepta o no.

Una sesión típica:

1. `/importa https://la-web-actual`: trae la web de ahora a `cerebro/fonts/` y escribe `cerebro/dossier.md`.
2. Lees el dossier y la lista «Por confirmar».
3. `/continguts`: escribe el texto de las páginas en `cerebro/continguts/`.
4. `node eines/genera.mjs`: vuelve a hacer la web (Node 18 o más nuevo).
5. Una PR. Miras la vista previa de Netlify y la aceptas o no.

Para la rutina, `/tasca <entregable>` prepara un borrador y lo acepta una persona del rol que lo produce.

## 3 · Con TeamTowers

- En la primera sesión hacemos la importación y los primeros contenidos, contigo.
- Después podemos mantener en marcha las tareas de rutina («Sistema viu»): la IA prepara los borradores y una persona del rol los acepta. Siempre.
- El repositorio y la web te los puedes llevar cuando quieras.

## Qué va dónde

| Qué | Dónde |
| --- | --- |
| El mapa, real e ideal | `cerebro/mapa-real.json` y `cerebro/mapa-ideal.json`. Se cambia en el editor del mapa de valor |
| El texto de las páginas | `cerebro/continguts/` |
| Lo que ya tenías: web, documentos, CSV | `cerebro/fonts/` |
| Qué es el negocio, con las fuentes | `cerebro/dossier.md` |
| Lo que se acuerda y por qué | `cerebro/decisiones.md` |
| Los borradores de la rutina | `cerebro/esborranys/` |
| Datos personales, precios pactados, contratos | En el CRM. Nunca en el repositorio |
