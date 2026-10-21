#!/usr/bin/env node
// TeamTowers · Generado del mapa de valor con la web. No se edita a mano: se regenera.
// node eines/registre.mjs [cerebro/registro/registre.csv] [--llengua ca|es] [--envia]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { llegeixRegistre, observaRegistre, enviaAvisos } from './nucli.mjs';
const arrel = new URL('../', import.meta.url), a = process.argv.slice(2), o = { csv: new URL('cerebro/registro/registre.csv', arrel), llengua: "es", envia: false };
for (let i = 0; i < a.length; i++) { if (a[i] === '--envia') o.envia = true; else if (a[i] === '--llengua') o.llengua = a[++i]; else o.csv = a[i]; }
const l = llegeixRegistre(readFileSync(o.csv, 'utf8'));
const r = observaRegistre(JSON.parse(readFileSync(new URL('cerebro/mapa-real.json', arrel), 'utf8')), l.files, { llengua: o.llengua });
const surt = new URL('cerebro/registro/', arrel);
mkdirSync(surt, { recursive: true });
writeFileSync(new URL('informe.md', surt), r.informe);
writeFileSync(new URL('mapa-observat.json', surt), JSON.stringify(r.mapaObservat, null, 2) + '\n');
writeFileSync(new URL('avisos.json', surt), JSON.stringify(r.avisos, null, 2) + '\n');
console.log('✅ ' + l.files.length + ' · ' + r.vius.length + ' / ' + r.morts.length + ' / ' + r.nous.length + ' · ' + r.avisos.length + ' → cerebro/registro/');
if (o.envia) {
  const e = await enviaAvisos(r.avisos, { urls: process.env.TT_WEBHOOKS, secret: process.env.TT_WEBHOOK_SECRET, web: process.env.URL || "" });
  console.log(e.motiu ? '⚠️ ' + e.motiu : '📨 ' + e.enviats);
  e.errors.forEach(x => console.error(x));
}
