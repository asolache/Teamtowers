#!/usr/bin/env node
// Genera una página por idioma a partir de las páginas bilingües.
//
// Las fuentes (index.html, pinya.html, colla.html) siguen como hasta ahora:
// cada texto va en un elemento con class="en", class="es" o class="ca".
// En el despliegue, Netlify ejecuta este script y publica:
//   /            /pinya            /colla.html        en castellano (lang="es")
//   /en/         /en/pinya         /en/colla.html     en inglés
//   /ca/         /ca/pinya         /ca/colla.html     en catalán
// Para añadir el catalán a textos nuevos: herramientas/traducir.js.
// Cada página lleva solo su idioma, un H1, su título y descripción, canonical
// propio y hreflang cruzado. Así Google tiene una URL por idioma.
//
// Uso:  node herramientas/idiomas.js <carpeta-destino>
// En Netlify el destino es "." (reescribe las páginas en la copia del build).
// En local, usa otra carpeta: escribir en "." sobrescribiría las fuentes.

'use strict';
const fs = require('fs');
const path = require('path');

const SITE = 'https://www.teamtowers.eu';
const LANGS = ['es', 'en', 'ca'];
const LOCALE = { es: 'es_ES', en: 'en_GB', ca: 'ca_ES' };

// URL pública de cada página y de cada idioma. La primera lengua es la de la raíz.
const PAGES = [
  {
    src: 'index.html',
    url: { es: '/', en: '/en/', ca: '/ca/' },
    file: { es: 'index.html', en: 'en/index.html', ca: 'ca/index.html' },
    meta: {
      es: {
        title: 'Team building con castellers: Fent Pinya, el taller original | Teamtowers',
        description: 'Teamtowers creó Fent Pinya, el taller de castellers original para empresas. Más de 20 años de team building con torres humanas para grupos de 10 a 1.000 personas, y consultoría sistémica con mapas de valor.',
      },
      en: {
        title: 'Castellers Team Building: Fent Pinya, the original Human Towers workshop | Teamtowers',
        description: 'Teamtowers created Fent Pinya, the original castellers (human towers) team building workshop for companies. 20+ years, groups of 10 to 1,000 people, plus systemic consulting with value network maps.',
      },
      ca: {
        title: 'Team building amb castells: Fent Pinya, el taller original | Teamtowers',
        description: 'Teamtowers va crear Fent Pinya, el taller de castells original per a empreses. Més de 20 anys de team building amb castells per a grups de 10 a 1.000 persones, i consultoria sistèmica amb mapes de valor.',
      },
    },
  },
  {
    src: 'pinya.html',
    url: { es: '/pinya', en: '/en/pinya', ca: '/ca/pinya' },
    file: { es: 'pinya.html', en: 'en/pinya.html', ca: 'ca/pinya.html' },
    meta: {
      es: {
        title: 'Fent Pinya: el taller de castellers original para empresas | Teamtowers',
        description: 'Fent Pinya es el taller de castellers original para empresas, creado por Teamtowers: más de 20 años de team building con torres humanas para grupos de 10 a 1.000 personas.',
      },
      en: {
        title: 'Fent Pinya: the original castellers team building workshop | Teamtowers',
        description: 'Fent Pinya is the original castellers (human towers) team building workshop for companies, created by Teamtowers: 20+ years, groups of 10 to 1,000 people, in under 2 hours.',
      },
      ca: {
        title: 'Fent Pinya: el taller de castells original per a empreses | Teamtowers',
        description: 'Fent Pinya és el taller de castells original per a empreses, creat per Teamtowers: més de 20 anys de team building amb castells per a grups de 10 a 1.000 persones.',
      },
    },
  },
  {
    src: 'colla.html',
    url: { es: '/colla.html', en: '/en/colla.html', ca: '/ca/colla.html' },
    file: { es: 'colla.html', en: 'en/colla.html', ca: 'ca/colla.html' },
    meta: {
      es: {
        title: 'Programa La Colla: mapa de valor de tu organización (VNA) | TeamTowers',
        description: 'Programa La Colla: después de Fent Pinya, mapeamos los flujos de valor reales de tu organización con el mapa de valor (VNA). Más de 150 organizaciones, entre ellas IKEA, Porsche y FC Barcelona.',
      },
      en: {
        title: 'The Colla Programme · Value Network Analysis | TeamTowers',
        description: 'The Colla Programme: after Fent Pinya, we map the real value flows of your organization with the value map (VNA). Trusted by IKEA, Porsche, FC Barcelona and 150+ organizations.',
      },
      ca: {
        title: 'Programa La Colla: mapa de valor de la teva organització (VNA) | TeamTowers',
        description: 'Programa La Colla: després de Fent Pinya, mapem els fluxos de valor reals de la teva organització amb el mapa de valor (VNA). Més de 150 organitzacions, entre elles IKEA, Porsche i FC Barcelona.',
      },
    },
  },
];

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const TAG = /<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|<!--[\s\S]*?-->/g;

// Idiomas de un elemento según su class. Un elemento puede servir a varios
// (class="es en", útil para el JSON-LD que comparten dos versiones).
function langsOf(attrs) {
  const m = /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(attrs || '');
  if (!m) return [];
  const tokens = (m[1] || m[2] || '').split(/\s+/);
  return LANGS.filter((l) => tokens.includes(l));
}

// Quita los elementos marcados con un idioma distinto de `keep`.
function keepLanguage(html, keep) {
  const out = [];
  let last = 0;
  TAG.lastIndex = 0;
  const stack = []; // {name, drop, start}
  let m;
  while ((m = TAG.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    const [whole, close, rawName, attrs, selfClose] = m;
    const name = rawName.toLowerCase();
    if (!close) {
      const langs = langsOf(attrs);
      const dropping = stack.some((s) => s.drop);
      const drop = !dropping && langs.length > 0 && !langs.includes(keep);
      if (RAW.has(name)) {
        const end = html.toLowerCase().indexOf('</' + name, TAG.lastIndex);
        if (end < 0) throw new Error(`<${name}> sin cerrar en ${m.index}`);
        const endTag = html.indexOf('>', end) + 1;
        if (drop) { out.push(html.slice(last, trimStart(html, m.index))); last = endTag; }
        TAG.lastIndex = endTag;
        continue;
      }
      if (VOID.has(name) || selfClose) {
        if (drop) { out.push(html.slice(last, trimStart(html, m.index))); last = m.index + whole.length; }
        continue;
      }
      stack.push({ name, drop, start: m.index });
    } else {
      // Cierra hasta el elemento abierto con ese nombre (tolera cierres opcionales).
      let i = stack.length - 1;
      while (i >= 0 && stack[i].name !== name) i--;
      if (i < 0) continue;
      const el = stack[i];
      stack.length = i;
      if (el.drop) {
        out.push(html.slice(last, trimStart(html, el.start)));
        last = m.index + whole.length;
      }
    }
  }
  if (stack.some((s) => s.drop)) throw new Error('Elemento de idioma sin cerrar: ' + stack.map((s) => s.name).join('>'));
  out.push(html.slice(last));
  return out.join('');
}

// Elementos de primer nivel marcados con idioma: [{tag, langs, start, end}].
// "start" y "end" delimitan el elemento completo (de "<" a ">" del cierre).
function langElements(html) {
  const found = [];
  const stack = [];
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(html))) {
    if (m[0].startsWith('<!--')) continue;
    const [whole, close, rawName, attrs, selfClose] = m;
    const name = rawName.toLowerCase();
    if (!close) {
      const langs = langsOf(attrs);
      const inside = stack.some((s) => s.langs.length);
      const mark = !inside && langs.length > 0;
      if (RAW.has(name)) {
        const end = html.toLowerCase().indexOf('</' + name, TAG.lastIndex);
        const endTag = html.indexOf('>', end) + 1;
        if (mark) found.push({ tag: name, langs, start: m.index, end: endTag });
        TAG.lastIndex = endTag;
        continue;
      }
      if (VOID.has(name) || selfClose) {
        if (mark) found.push({ tag: name, langs, start: m.index, end: m.index + whole.length });
        continue;
      }
      stack.push({ name, langs: mark ? langs : [], start: m.index });
    } else {
      let i = stack.length - 1;
      while (i >= 0 && stack[i].name !== name) i--;
      if (i < 0) continue;
      const el = stack[i];
      stack.length = i;
      if (el.langs.length) found.push({ tag: el.name, langs: el.langs, start: el.start, end: m.index + whole.length });
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

// Si el elemento empieza una línea, quita también la sangría para no dejar huecos.
function trimStart(html, i) {
  let j = i;
  while (j > 0 && (html[j - 1] === ' ' || html[j - 1] === '\t')) j--;
  if (j === 0 || html[j - 1] === '\n') {
    return j > 0 ? j - 1 : j; // incluye el salto de línea anterior
  }
  return i;
}

function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function setMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${key.replace(/[.:]/g, '\\$&')}"\\s+content=")[^"]*(")`, 'i');
  if (re.test(html)) return html.replace(re, `$1${escAttr(value)}$2`);
  return html.replace(/<\/title>/i, `</title>\n    <meta ${attr}="${key}" content="${escAttr(value)}">`);
}

// Rutas internas de las páginas generadas, para reescribir enlaces.
const ROUTES = new Map([
  ['/', 0], ['index.html', 0], ['/index.html', 0],
  ['pinya', 1], ['/pinya', 1], ['pinya.html', 1], ['/pinya.html', 1],
  ['colla.html', 2], ['/colla.html', 2],
]);

function rewriteLinks(html, lang, inSubdir, selfUrl) {
  return html.replace(/(\s(?:href|src|poster|srcset|content)\s*=\s*")([^"]*)(")/gi, (all, pre, val, post) => {
    if (/^\s*$/.test(val) && !/href/i.test(pre)) return all;
    // srcset y similares: cada URL por separado.
    if (/srcset/i.test(pre)) {
      return pre + val.split(',').map((part) => part.replace(/^(\s*)(\S+)/, (x, sp, u) => sp + fixUrl(u, lang, inSubdir, selfUrl))).join(',') + post;
    }
    if (/content/i.test(pre)) return all;
    return pre + fixUrl(val, lang, inSubdir, selfUrl) + post;
  });
}

function fixUrl(u, lang, inSubdir, selfUrl) {
  if (/^(?:[a-z][\w+.-]*:|\/\/|data:|\{)/i.test(u)) return u;
  const hashAt = u.indexOf('#');
  const hash = hashAt >= 0 ? u.slice(hashAt) : '';
  let rest = hashAt >= 0 ? u.slice(0, hashAt) : u;
  const qAt = rest.indexOf('?');
  let query = qAt >= 0 ? rest.slice(qAt + 1) : '';
  let p = qAt >= 0 ? rest.slice(0, qAt) : rest;
  const page = ROUTES.has(p) ? PAGES[ROUTES.get(p)] : null;
  if (page) {
    query = query.split('&').filter((kv) => kv && !/^lang=/.test(kv)).join('&');
    const target = page.url[lang] || page.url.es;
    return target + (query ? '?' + query : '') + hash;
  }
  if (p === '') return inSubdir && hash ? selfUrl + (qAt >= 0 ? '?' + query : '') + hash : u; // "#ancla" de la propia página
  if (inSubdir && !p.startsWith('/')) p = '/' + p;
  return p + (qAt >= 0 ? '?' + query : '') + hash;
}

function langSwitcher(html, page, lang) {
  // Sustituye los botones EN/ES (onclick="setLang..('xx')") por enlaces a cada versión.
  const run = /(?:<button\b[^>]*onclick="setLang(?:uage)?\('(?:en|es)'\)"[^>]*>\s*(?:EN|ES)\s*<\/button>\s*){2}/;
  const m = run.exec(html);
  if (!m) return html;
  const cls = (/class="([^"]*)"/.exec(m[0]) || [, ''])[1].split(/\s+/).filter((c) => c && c !== 'active');
  const indent = (/\n([ \t]*)$/.exec(html.slice(0, m.index)) || [, ''])[1];
  const links = Object.keys(page.url).map((l) => {
    const c = cls.concat(l === lang ? ['active'] : []).join(' ');
    return `<a href="${page.url[l]}" hreflang="${l}" lang="${l}" id="btn-${l}"${c ? ` class="${c}"` : ''} style="text-decoration:none">${l.toUpperCase()}</a>`;
  });
  const trailing = /\s*$/.exec(m[0])[0];
  return html.slice(0, m.index) + links.join('\n' + indent) + trailing + html.slice(m.index + m[0].length);
}

function head(html, page, lang) {
  const meta = page.meta[lang];
  const url = SITE + page.url[lang];
  html = html.replace(/<html\b[^>]*>/i, `<html lang="${lang}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  html = setMeta(html, 'name', 'description', meta.description);
  html = setMeta(html, 'property', 'og:title', meta.title);
  html = setMeta(html, 'property', 'og:description', meta.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:locale', LOCALE[lang]);
  html = html.replace(/[ \t]*<meta\s+property="og:locale:alternate"[^>]*>\n?/gi, '');
  // canonical + hreflang
  html = html.replace(/[ \t]*<link\s+rel="(?:canonical|alternate)"[^>]*hreflang[^>]*>\n?/gi, '');
  html = html.replace(/[ \t]*<link\s+rel="canonical"[^>]*>\n?/gi, '');
  const alts = Object.keys(page.url).map((l) => `    <link rel="alternate" hreflang="${l}" href="${SITE + page.url[l]}" />`);
  alts.push(`    <link rel="alternate" hreflang="x-default" href="${SITE + page.url.es}" />`);
  const block = `    <link rel="canonical" href="${url}" />\n${alts.join('\n')}\n`;
  html = html.replace(/(<meta\s+name="description"[^>]*>\n)/i, `$1\n${block}`);
  // Cuerpo fijo en su idioma
  html = html.replace(/<body\b([^>]*)\bclass="([^"]*)\blang-(?:en|es|ca)\b([^"]*)"/i, `<body$1class="$2lang-${lang}$3"`);
  return html;
}

// El cambio de idioma ahora es otra URL: las funciones antiguas no hacen nada.
const FREEZE = '<script>window.setLanguage=window.setLang=function(){};</script>\n';

function build(srcHtml, page, lang) {
  let html = keepLanguage(srcHtml, lang);
  html = head(html, page, lang);
  const inSubdir = page.file[lang].includes('/');
  html = rewriteLinks(html, lang, inSubdir, page.url[lang]);
  html = langSwitcher(html, page, lang); // después: sus enlaces ya apuntan a cada idioma
  // En /en/ y /ca/, las rutas relativas (CSS, imágenes, url() y JS) se resuelven desde la raíz.
  if (inSubdir) html = html.replace(/(<meta\s+charset[^>]*>)/i, '$1\n    <base href="/">');
  html = html.replace(/<\/body>/i, FREEZE + '</body>');
  // Comprobaciones mínimas
  const h1 = (html.match(/<h1\b/gi) || []).length;
  if (h1 !== 1) throw new Error(`${page.file[lang]}: ${h1} H1 (se esperaba 1)`);
  const left = langElements(html).filter((e) => !e.langs.includes(lang) && e.tag !== 'script');
  if (left.length) throw new Error(`${page.file[lang]}: quedan elementos en "${left[0].langs.join(' ')}"`);
  return html;
}

function main() {
  const dest = process.argv[2];
  if (!dest) {
    console.error('Uso: node herramientas/idiomas.js <carpeta-destino>');
    process.exit(2);
  }
  const root = path.resolve(__dirname, '..');
  const out = path.resolve(dest);
  if (out === root && !process.env.NETLIFY && !process.argv.includes('--forzar')) {
    console.error('Escribir en la carpeta del repositorio sobrescribe las fuentes. Usa otra carpeta, o --forzar.');
    process.exit(2);
  }
  // Leer todas las fuentes antes de escribir nada (las de "es" se reescriben en su sitio).
  const sources = PAGES.map((p) => fs.readFileSync(path.join(root, p.src), 'utf8'));
  for (const s of sources) {
    if (!/<body\b[^>]*class="[^"]*\blang-en\b/.test(s)) throw new Error('La fuente no parece bilingüe (falta body.lang-en). ¿Ya estaba generada?');
  }
  // Generar todo en memoria y escribir solo si no ha fallado nada.
  const files = [];
  PAGES.forEach((page, i) => {
    for (const lang of Object.keys(page.url)) files.push([page.file[lang], build(sources[i], page, lang)]);
  });
  for (const [rel, html] of files) {
    const file = path.join(out, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    console.log('ok', rel);
  }
}

if (require.main === module) main();
module.exports = { keepLanguage, langElements, build, PAGES, LANGS };
