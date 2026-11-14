// Contador de clics de teamtowers.eu, sin datos personales.
//
// POST (lo envía clics.js con sendBeacon): {"enlace":"pinya-pie","idioma":"es"}
//   Guarda una entrada vacía por clic en Netlify Blobs, almacén «clics»:
//   AAAA-MM-DD/<enlace>/<idioma>/<marca>. No guarda IP, navegador ni cookies.
//   Los clics de las previews van al almacén «clics-pruebas», para no mezclarlos.
//
// GET ?mes=AAAA-MM&clave=…  Devuelve los totales del mes por enlace e idioma.
//   Solo responde si la variable de entorno CLICS_CLAVE existe y coincide.
//   Los datos también se ven en Netlify: Project > Blobs > clics.
import { getStore } from '@netlify/blobs';

const ENLACE = /^[a-z0-9-]{1,40}$/;
const IDIOMAS = new Set(['es', 'en', 'ca']);

function almacen(context) {
  const produccion = (context?.deploy?.context || process.env.CONTEXT) === 'production';
  return getStore({ name: produccion ? 'clics' : 'clics-pruebas', consistency: 'strong' });
}

export default async (req, context) => {
  if (req.method === 'POST') {
    let datos;
    try {
      const texto = await req.text();
      if (texto.length > 200) return new Response(null, { status: 413 });
      datos = JSON.parse(texto);
    } catch {
      return new Response(null, { status: 400 });
    }
    const enlace = String(datos?.enlace || '');
    const idioma = IDIOMAS.has(datos?.idioma) ? datos.idioma : 'es';
    if (!ENLACE.test(enlace)) return new Response(null, { status: 400 });
    const dia = new Date().toISOString().slice(0, 10);
    const marca = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    await almacen(context).set(`${dia}/${enlace}/${idioma}/${marca}`, '');
    return new Response(null, { status: 204 });
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const clave = process.env.CLICS_CLAVE;
    if (!clave || url.searchParams.get('clave') !== clave) return new Response(null, { status: 404 });
    const mes = /^\d{4}-\d{2}$/.test(url.searchParams.get('mes') || '')
      ? url.searchParams.get('mes')
      : new Date().toISOString().slice(0, 7);
    const totales = {};
    let total = 0;
    const { blobs } = await almacen(context).list({ prefix: mes });
    for (const { key } of blobs) {
      const [, enlace, idioma] = key.split('/');
      totales[enlace] = totales[enlace] || {};
      totales[enlace][idioma] = (totales[enlace][idioma] || 0) + 1;
      total++;
    }
    return Response.json({ mes, total, enlaces: totales }, { headers: { 'cache-control': 'no-store' } });
  }

  return new Response(null, { status: 405 });
};
