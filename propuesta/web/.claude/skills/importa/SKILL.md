---
name: importa
description: Trae al cerebro lo que ya hay (la web de ahora, documentos, un CSV) y escribe el dossier con la fuente de cada afirmación. Úsala el primer día o cuando llega material nuevo.
argument-hint: "<url o carpeta>"
---

# Importar lo que ya hay

Que todo lo que se sabe del negocio esté en `cerebro/fonts/`, y que `cerebro/dossier.md` lo resuma diciendo de dónde sale cada cosa.

## Pasos

1. **Importa.** Ejecuta `node eines/importa.mjs $ARGUMENTS` (Node 18 o más nuevo; `--max 30` limita las páginas). Escribe `cerebro/fonts/web/`, `cerebro/fonts/docs/`, `cerebro/fonts/dades/`, `cerebro/fonts/index.md` y `cerebro/fonts/fonts.json`.
   - **Una web, solo la de quien te lo pide y con su permiso:** añade `--autoritzat <dominio>` (el mismo dominio que lees). Si no es su web, para.
   - **De una tabla (.csv) solo entra la cabecera** y cuántas filas tiene. Pregunta qué columnas hacen falta y vuelve a importarla con `--columnes "a,b"`. Las de persona no entran nunca.
   - Si no puedes ejecutar órdenes (por ejemplo, en claude.ai), pide a la persona que te pegue o suba el texto de las páginas y de los documentos. Escribe tú los ficheros, con el mismo formato: un `.md` por fuente en `web/`, `docs/` o `dades/`, que empieza así, y añade cada fuente a `cerebro/fonts/index.md`:

   ```markdown
   ---
   font: https://la-web-actual/servicios (o el nombre del fichero)
   tipus: web
   titol: Servicios
   importat: AAAA-MM-DD
   ---
   ```

   `tipus` es `web`, `doc` o `dades`.
2. **Lee `cerebro/fonts/index.md`**, y después las fuentes que salen en él.
3. **Lo que no se ha podido leer.** En `cerebro/fonts/fonts.json`, la lista `fora` dice qué ha quedado fuera (los PDF y los Word, por ejemplo). Haz la lista y pídeselo a la persona, pegado como texto o subido.
4. **Escribe o actualiza `cerebro/dossier.md`:** qué es el negocio, qué ofrece, a quién y cómo trabaja. **Cada afirmación lleva el enlace a su fuente**, por ejemplo `([fuente](fonts/web/serveis.md))`. Sin fuente, no se escribe: va a la lista «Por confirmar», al final. Si el dossier ya existe, conserva lo que hay y añade.
5. **Ningún dato personal.** El importador oculta correos y teléfonos: no los vuelvas a poner. No copies nombres de personas, ni de clientes ni del equipo: habla de roles. Los precios pactados y los contratos van al CRM.
6. **Si todavía no hay mapa** (`cerebro/mapa-real.json`), propón un borrador en `cerebro/proposta-mapa.json`, con el formato del editor del mapa de valor:
   `{"abast": "…", "roles": ["…"], "pairs": [["A", "B", "tangible", "lo que va de A a B", "intangible", "lo que vuelve de B a A"]], "processos": [{"id": "…", "nom": "…", "d": "…"}], "seq": {"A→B": ["id del proceso", 1]}, "troballes": [{"t": "…", "d": "…"}], "dubtes": []}`
   - En `seq`, cada flujo lleva `[proceso, paso]` o `"sempre"`.
   - De 6 a 12 roles. Un rol es lo que alguien hace, no una persona ni un cargo.
   - Como mínimo un tercio de los entregables, intangibles.
   - Todo vínculo es recíproco: cada par lleva un entregable en cada sentido.
   - Ningún nombre propio de persona ni de empresa.
   - Es una propuesta. La persona la carga en el editor y se valida en la sesión. No la copies a `mapa-real.json`.
7. **Acaba con un resumen:** qué se ha importado (cuántas fuentes de cada tipo y cuántos datos ocultos), qué falta y la lista «Por confirmar».
