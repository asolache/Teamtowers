/* De dónde llega quien pide una propuesta (teamtowers.eu/presupuesto).
   Se guarda la primera vez que entra en la web, en esta pestaña: la web de la
   que viene y la campaña (utm_*, ?ref). Sin cookies y sin nada de fuera. El
   formulario lo manda con la petición y el CRM lo usa para saber qué canal
   trae ventas (directa, agencia, buscador, Events Penedès). */
(function () {
    var CLAVE = 'tt-origen';
    var p = new URLSearchParams(location.search);
    var ahora = {
        origen_web: document.referrer && document.referrer.indexOf(location.host) === -1 ? document.referrer.split('?')[0] : '',
        utm_source: p.get('utm_source') || '',
        utm_medium: p.get('utm_medium') || '',
        utm_campaign: p.get('utm_campaign') || '',
        ref: p.get('ref') || ''
    };
    var guardado = null;
    try { guardado = JSON.parse(sessionStorage.getItem(CLAVE) || 'null'); } catch (e) {}
    var hayAlgo = ahora.origen_web || ahora.utm_source || ahora.ref;
    if (!guardado || (hayAlgo && !(guardado.origen_web || guardado.utm_source || guardado.ref))) {
        guardado = ahora;
        try { sessionStorage.setItem(CLAVE, JSON.stringify(guardado)); } catch (e) {}
    }
    window.ttOrigen = function () { return guardado || ahora; };

    // Los botones de presupuesto llevan el idioma de la página
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('a[href^="/presupuesto"]').forEach(function (a) {
            var l = (document.documentElement.lang || 'es').slice(0, 2);
            a.href = '/presupuesto?lang=' + (/^(es|ca|en)$/.test(l) ? l : 'es');
        });
    });
})();
