// TeamTowers · Generado del mapa de valor con la web. No se edita a mano: se regenera.
import { enviaAvisos } from '../../eines/nucli.mjs';
export async function handler(event) {
  let p = {};
  try { p = JSON.parse(event.body || '{}').payload || {}; } catch (e) { p = {}; }
  if (p.context && p.context !== 'production') return { statusCode: 200, body: '' };
  const dades = { url: p.ssl_url || p.url || process.env.URL || '', commit: p.commit_ref || '', branca: p.branch || '' };
  const r = await enviaAvisos([{ tipus: 'cerebro.actualizado', dades }], { urls: process.env.TT_WEBHOOKS, secret: process.env.TT_WEBHOOK_SECRET, web: process.env.URL || "" });
  if (r.errors.length) console.error(r.errors.join('\n'));
  return { statusCode: 200, body: JSON.stringify({ enviats: r.enviats, motiu: r.motiu }) };
}
