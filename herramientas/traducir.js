#!/usr/bin/env node
// Añade la versión en catalán (class="ca") a las páginas bilingües.
//
// Cada texto en castellano (class="es") que todavía no tiene su gemelo en
// catalán recibe uno justo detrás, con la misma etiqueta y la class cambiada a
// "ca". Las páginas de /ca/ las genera después herramientas/idiomas.js.
//
// Tres modos:
//   node herramientas/traducir.js extraer colla.html > pendientes.json
//       Lista los textos sin catalán: [{ "n": 0, "es": "<p class=\"es\">…</p>" }]
//   node herramientas/traducir.js aplicar colla.html traducciones.json
//       Inserta las traducciones: [{ "n": 0, "ca": "<p class=\"ca\">…</p>" }]
//   node herramientas/traducir.js api colla.html [más páginas…]
//       Traduce con la API de Claude y aplica. Necesita ANTHROPIC_API_KEY y
//       el SDK, que no forma parte del sitio:  npm i --no-save @anthropic-ai/sdk
//
// Revisa siempre el resultado con git diff antes de publicar.

'use strict';
const fs = require('fs');
const path = require('path');
const { langElements } = require('./idiomas');

const MODEL = 'claude-opus-5-5';
const LOTE = 40; // textos por petición

const GUIA = `Traduces al catalán la web de Teamtowers (teamtowers.eu), que vende team building con castells para empresas.
Reglas:
- Catalán estándar, natural y comercial, como lo escribiría un redactor de Barcelona. Frases cortas.
- "Fent Pinya" es el nombre del taller: no se traduce. Es "el taller de castells original".
- Los nombres de posiciones castelleras ya son catalanes (Baixos, Crosses, Contraforts, Mans, Laterals, Segons, Terços, Dosos, Acotxador, Enxaneta, Cap de Colla, Músics, pinya, folre): se mantienen.
- "Programa La Colla", "Teamtowers", "Value Network Analysis (VNA)", nombres de clientes y medios: no se traducen.
- Cifras, fechas, enlaces y atributos HTML se quedan exactamente igual, salvo los atributos de texto visible (alt, title, aria-label, content), que se traducen.
- Devuelve cada fragmento completo, con la misma etiqueta y estructura, cambiando en la class del elemento exterior "es" por "ca".
- Si el fragmento es JSON-LD, traduce solo los valores de texto y deja el JSON válido.`;

function pendientes(html) {
  const els = langElements(html);
  const out = [];
  els.forEach((el, i) => {
    if (!el.langs.includes('es') || el.langs.includes('ca')) return;
    // ¿Ya hay un gemelo en catalán entre los siguientes hermanos marcados?
    for (let j = i + 1; j < els.length; j++) {
      const gap = html.slice(els[j - 1].end, els[j].start);
      if (/\S/.test(gap.replace(/<!--[\s\S]*?-->/g, ''))) break; // hay otra cosa en medio
      if (els[j].langs.includes('ca')) return;
    }
    out.push({ n: out.length, start: el.start, end: el.end, tag: el.tag, es: html.slice(el.start, el.end) });
  });
  return out;
}

function aplicar(html, items, traducciones) {
  const porN = new Map(traducciones.map((t) => [t.n, t.ca]));
  // De atrás adelante para no mover las posiciones pendientes.
  for (const it of items.slice().reverse()) {
    const ca = porN.get(it.n);
    if (ca == null) continue;
    const tag = (/^<([a-zA-Z][\w-]*)/.exec(ca) || [])[1];
    if (!tag || tag.toLowerCase() !== it.tag) throw new Error(`#${it.n}: la traducción no empieza por <${it.tag}>`);
    if (!/^<[^>]*\sclass\s*=\s*"(?:[^"]*\s)?ca(?:\s[^"]*)?"/.test(ca)) throw new Error(`#${it.n}: falta class="ca" en el elemento exterior`);
    // Misma separación que hay delante del texto en castellano (salto + sangría, o nada).
    const before = /[ \t]*\n?[ \t]*$/.exec(html.slice(0, it.start))[0];
    const sep = before.includes('\n') ? '\n' + before.split('\n').pop() : before;
    html = html.slice(0, it.end) + sep + ca.trim() + html.slice(it.end);
  }
  return html;
}

async function api(file) {
  let Anthropic;
  try { Anthropic = require('@anthropic-ai/sdk'); } catch (e) {
    throw new Error('Falta el SDK: npm i --no-save @anthropic-ai/sdk');
  }
  Anthropic = Anthropic.default || Anthropic;
  const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno
  let html = fs.readFileSync(file, 'utf8');
  const items = pendientes(html);
  console.error(`${file}: ${items.length} textos sin catalán`);
  const hechas = [];
  for (let i = 0; i < items.length; i += LOTE) {
    const lote = items.slice(i, i + LOTE).map(({ n, es }) => ({ n, es }));
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      system: GUIA,
      output_config: {
        effort: 'medium',
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              traducciones: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { n: { type: 'integer' }, ca: { type: 'string' } },
                  required: ['n', 'ca'],
                  additionalProperties: false,
                },
              },
            },
            required: ['traducciones'],
            additionalProperties: false,
          },
        },
      },
      messages: [{ role: 'user', content: 'Traduce estos fragmentos:\n' + JSON.stringify(lote, null, 1) }],
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason !== 'end_turn') throw new Error(`La API paró por "${msg.stop_reason}" en el lote ${i / LOTE + 1}`);
    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    hechas.push(...JSON.parse(text).traducciones);
    console.error(`  lote ${i / LOTE + 1}: ${lote.length} textos (${msg.usage.input_tokens} in / ${msg.usage.output_tokens} out)`);
  }
  html = aplicar(html, items, hechas);
  fs.writeFileSync(file, html);
  console.error(`  ok: ${hechas.length} textos añadidos`);
}

async function main() {
  const [modo, file, extra, ...mas] = process.argv.slice(2);
  if (modo === 'extraer' && file) {
    const items = pendientes(fs.readFileSync(file, 'utf8')).map(({ n, es }) => ({ n, es }));
    process.stdout.write(JSON.stringify(items, null, 1) + '\n');
  } else if (modo === 'aplicar' && file && extra) {
    const html = fs.readFileSync(file, 'utf8');
    const out = aplicar(html, pendientes(html), JSON.parse(fs.readFileSync(extra, 'utf8')));
    fs.writeFileSync(file, out);
    console.error(`${file}: ok`);
  } else if (modo === 'api' && file) {
    for (const f of [file, extra, ...mas].filter(Boolean)) await api(path.resolve(f));
  } else {
    console.error('Uso: traducir.js extraer <pagina> | aplicar <pagina> <traducciones.json> | api <pagina…>');
    process.exit(2);
  }
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
module.exports = { pendientes, aplicar };
