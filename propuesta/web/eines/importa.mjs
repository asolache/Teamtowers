#!/usr/bin/env node
// TeamTowers · Generado del mapa de valor con la web. No se edita a mano: se regenera.
// Porta el que el projecte ja té a cerebro/fonts/: una web, documents (.html .md .txt) i taules (.csv).
// node eines/importa.mjs <url|carpeta|fitxer>… [--autoritzat <domini>] [--columnes "a,b"] [--max 30] [--surt <arrel del repositori>]
// Una web, només amb --autoritzat i el seu domini: la de qui us ho demana, amb la seva autorització escrita (va al CRM).
// D'una taula (.csv) només entra la capçalera i quantes files té, si no es trien les columnes amb --columnes.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative, resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importaFonts, rastreja } from './nucli.mjs';
const a = process.argv.slice(2), o = { max: 30, surt: fileURLToPath(new URL('../', import.meta.url)), urls: [], camins: [], autoritzat: '', columnes: [] };
for (let i = 0; i < a.length; i++) {
  if (a[i] === '--max') o.max = parseInt(a[++i], 10) || 30;
  else if (a[i] === '--surt') o.surt = resolve(a[++i] || '.');
  else if (a[i] === '--autoritzat') o.autoritzat = a[++i] || '';
  else if (a[i] === '--columnes') o.columnes = String(a[++i] || '').split(',').map(x => x.trim()).filter(Boolean);
  else if (/^https?:\/\//i.test(a[i])) o.urls.push(a[i]);
  else o.camins.push(a[i]);
}
if (!o.urls.length && !o.camins.length) { console.error('node eines/importa.mjs <url|carpeta|fitxer>… [--autoritzat <domini>] [--columnes "a,b"] [--max 30] [--surt <carpeta>]'); process.exit(1); }
if (o.urls.length && !o.autoritzat) { console.error('Per llegir una web cal --autoritzat <domini> / Para leer una web hace falta --autoritzat <dominio>'); process.exit(1); }
if (o.urls.length && typeof fetch !== 'function') { console.error('Cal Node 18 o més per llegir webs'); process.exit(1); }
// De les carpetes es llegeixen els textos i les taules; PDF, Word i fulls de càlcul només es llisten, per llegir-los amb la IA.
// El nom que queda és relatiu a la carpeta donada: un camí absolut porta el nom d'usuari de qui importa.
const TEXT = /\.(html?|md|markdown|txt|csv|tsv)$/i, LLEGIR = /\.(pdf|docx?|xlsx?|odt|ods|odp|pptx?|rtf)$/i, MAX = 5 * 1024 * 1024;
const fonts = resolve(o.surt, 'cerebro', 'fonts'), entrades = [], docs = [], fora = [];
const llegeix = (fitxer, nom, explicit) => {
  if (resolve(fitxer).startsWith(fonts + sep)) return;   // el que ja és a cerebro/fonts/ no es torna a importar
  if (!TEXT.test(fitxer)) { if (explicit || LLEGIR.test(fitxer)) entrades.push({ tipus: 'doc', font: nom, nom, cos: '' }); return; }
  if (statSync(fitxer).size > MAX) { fora.push({ font: nom, motiu: '> 5 MB' }); return; }
  entrades.push({ tipus: /\.(csv|tsv)$/i.test(fitxer) ? 'dades' : 'doc', font: nom, nom, cos: readFileSync(fitxer, 'utf8') });
};
const recorre = (dir, arrel) => readdirSync(dir, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1)).forEach(d => {
  const p = join(dir, d.name);
  if (d.name[0] === '.' || d.name === 'node_modules') return;
  if (d.isDirectory()) recorre(p, arrel); else if (d.isFile()) llegeix(p, relative(arrel, p).split(sep).join('/'), false);
});
for (const c of o.camins) {
  let st = null;
  try { st = statSync(c); } catch (e) { console.error('⚠️ ' + c + ' ?'); continue; }
  if (st.isDirectory()) recorre(resolve(c), dirname(resolve(c))); else llegeix(c, basename(c), true);
}
for (const u of o.urls) {
  const r = await rastreja(u, { fetch, max: o.max, autoritzat: o.autoritzat, avis: x => console.error('· ' + x) });
  r.pagines.forEach(p => entrades.push({ tipus: 'web', font: p.url, nom: p.url, cos: p.html }));
  docs.push(...r.docs);
  fora.push(...r.fora);
}
// L'índex d'abans es completa, no es perd: importar la web avui i un CSV demà.
let previ = null;
try { previ = JSON.parse(readFileSync(join(fonts, 'fonts.json'), 'utf8')); } catch (e) { previ = null; }
const r = importaFonts(entrades, { ara: new Date().toISOString().slice(0, 10), previ, docs, fora, columnes: o.columnes }), i = r.informe;
for (const f of r.fitxers) {
  if (!/^cerebro\/fonts\/([a-z]+\/)?[a-z0-9-]+\.(md|json)$/.test(f.ruta)) continue;   // res fora de cerebro/fonts/
  mkdirSync(dirname(join(o.surt, f.ruta)), { recursive: true });
  writeFileSync(join(o.surt, f.ruta), f.cos);
}
const altres = i.fora.length - i.perLlegir;
console.log('✅ ' + i.web + ' web, ' + i.docs + ' docs, ' + i.dades + ' CSV → cerebro/fonts/. Ocult/oculto: ' + i.correus + ' e-mail, ' + i.telefons + ' tel., ' + i.altres + ' DNI/IBAN.'
  + (i.columnesFora.length ? ' Columnes/columnas fora: ' + i.columnesFora.join(', ') + '.' : '')
  + (i.perLlegir ? ' PDF/Word per a la IA / para la IA: ' + i.perLlegir + '.' : '')
  + (altres ? ' No importat/importado: ' + altres + '.' : '') + ' Detall/detalle: cerebro/fonts/index.md');
process.exit(i.web + i.docs + i.dades + i.perLlegir ? 0 : 1);
