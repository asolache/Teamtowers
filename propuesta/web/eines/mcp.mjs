#!/usr/bin/env node
// TeamTowers · Generado del mapa de valor con la web. No se edita a mano: se regenera.
import { readFileSync } from 'node:fs';
import { llegeixRegistre, observaRegistre } from './nucli.mjs';
/*VS-MCP*/
/* ── El cervell, per a Claude Code: un servidor MCP sense dependències ──────
 * El zip el posa a `eines/mcp.mjs`, i `.mcp.json` el declara: qui obre el
 * repositori del client amb Claude Code té el cervell a mà, amb tres eines.
 * Només llegeix, i només el que surt a l'índex (`cerebro/indice.json`). Aquí
 * hi ha la part que respon; la que llegeix fitxers i parla per stdin/stdout
 * és al fitxer generat, perquè les proves la puguin cridar sense disc. */
function creaMcp(opts) {
  const o = opts || {}, llegeix = o.llegeix || (() => null);
  const eines = [
    { name: 'cervell_index', description: 'Els documents del cervell del projecte: ruta, títol, tema (web, mapa, rols, lliuraments, processos, decisions, regles, eines) i capa (publica, enllac, equip).',
      inputSchema: { type: 'object', properties: { tema: { type: 'string', description: 'Només els d\'aquest tema' } } } },
    { name: 'cervell_llegeix', description: 'Llegeix un document del cervell per la seva ruta. Només els que surten a l\'índex.',
      inputSchema: { type: 'object', properties: { ruta: { type: 'string' } }, required: ['ruta'] } },
    { name: 'registre_informe', description: 'Llegeix el registre viu (cerebro/registro/registre.csv) i el compara amb el mapa real: fluxos vius, sense ús, nous, qui dona sense rebre i els avisos.',
      inputSchema: { type: 'object', properties: { llengua: { type: 'string', enum: ['ca', 'es'] } } } }
  ];
  const text = (s, error) => Object.assign({ content: [{ type: 'text', text: s }] }, error ? { isError: true } : {});
  const index = () => { const t = llegeix('cerebro/indice.json'); return t ? JSON.parse(t) : { entradas: [] }; };
  const crida = (nom, a) => {
    if (nom === 'cervell_index') return text(JSON.stringify(index().entradas.filter(x => !a.tema || x.tema === a.tema), null, 2));
    if (nom === 'cervell_llegeix') {
      const e = index().entradas.find(x => x.ruta === a.ruta), t = e ? llegeix(e.ruta) : null;
      return t == null ? text('No és a l\'índex del cervell: ' + a.ruta, true) : text(t);
    }
    if (nom === 'registre_informe') {
      const m = llegeix('cerebro/mapa-real.json');
      if (!m) return text('Falta cerebro/mapa-real.json', true);
      const r = observaRegistre(JSON.parse(m), llegeixRegistre(llegeix('cerebro/registro/registre.csv') || '').files, { llengua: a.llengua });
      return text(r.informe + '\n```json\n' + JSON.stringify(r.avisos, null, 2) + '\n```\n');
    }
    return null;
  };
  return function respon(msg) {
    if (!msg || msg.jsonrpc !== '2.0' || msg.id === undefined || msg.id === null) return null;
    const ok = result => ({ jsonrpc: '2.0', id: msg.id, result }), err = (code, message) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });
    const p = msg.params || {};
    if (msg.method === 'initialize') return ok({ protocolVersion: p.protocolVersion || '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'cervell', version: '1.0.0' },
      instructions: 'El cervell del projecte surt del mapa de valor. Comença per cervell_index; el mapa és la font i no s\'edita a mà.' });
    if (msg.method === 'ping') return ok({});
    if (msg.method === 'tools/list') return ok({ tools: eines });
    if (msg.method === 'tools/call') {
      try { const r = crida(p.name, p.arguments || {}); return r ? ok(r) : err(-32602, 'Eina desconeguda: ' + p.name); }
      catch (e) { return ok(text('Error: ' + e.message, true)); }
    }
    return err(-32601, 'Mètode desconegut: ' + msg.method);
  };
}

const arrel = new URL('../', import.meta.url);
const respon = creaMcp({ llegeix: r => { try { return readFileSync(new URL(r, arrel), 'utf8'); } catch (e) { return null; } } });
const surt = m => process.stdout.write(JSON.stringify(m) + '\n');
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => {
  buf += d;
  for (let i = buf.indexOf('\n'); i >= 0; i = buf.indexOf('\n')) {
    const l = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!l) continue;
    let m;
    try { m = JSON.parse(l); } catch (e) { surt({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSON' } }); continue; }
    const r = respon(m);
    if (r) surt(r);
  }
});
