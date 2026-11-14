// Cuenta los clics en los enlaces marcados con data-clic (por ahora, los que
// llevan a teamtowershuma.com). Solo envía qué enlace y en qué idioma: sin
// cookies, sin IP guardada y sin datos de la persona. Ver netlify/functions/clic.mjs.
document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-clic]') : null;
    if (!a || !navigator.sendBeacon) return;
    var lang = (document.documentElement.lang || 'es').slice(0, 2);
    navigator.sendBeacon('/.netlify/functions/clic', JSON.stringify({ enlace: a.getAttribute('data-clic'), idioma: lang }));
});
