# Backlog

La fuente de verdad del desarrollo. Cada bloque dice **quién lo pidió, cuándo,
qué se pide y cómo se cierra**. Cada PR fusionado se cierra aquí con lo medido.

## Pendiente

### El primer mapa de valor de teamtowers.eu (pedido 2026-10-21)

**Pedido por:** Álvaro. **Qué:** «que teamtowers humà guíe tu desarrollo de
infraestructura técnica como otro cliente». El siguiente paso de un cliente es
la propuesta inicial: un flujo, su mapa revisado, las preguntas que la web no
contesta y la web que sale del mapa (skill `propuesta-inicial`).
**Cómo se cierra:** un `mapa.json` que pasa `revisa-mapa.js` sin reglas duras
abiertas, y Álvaro ha elegido el flujo.
**Estado (21/10/2026):** borrador hecho con Fent Pinya, el flujo recomendado,
en `propuesta/` (mapa, preguntas, marca y web). Falta que Álvaro confirme el
flujo y conteste las preguntas 1 a 4. Siguiente flujo: de Fent Pinya a La Colla.

### Para TeamTowers Humà: lo que `analitza-contingut.js` no ve (visto 2026-10-21)

**Visto en:** la propuesta inicial de este proyecto. **Qué:** el análisis dice
que no hay formulario ni correo, y la web pide presupuesto por un formulario de
Google; propone `lletra: serif` y un color que no es el de la marca, porque no
lee las variables CSS ni las fuentes de Google; y saca la presentación en
inglés, porque la página tiene `lang="en"` y carga el castellano con JS.
**Cómo se cierra:** se propone a TeamTowers Humà y vuelve con `--actualitza`.
No se arregla aquí: las herramientas son heredadas.

### El espacio de las agencias (pedido 2026-10-21)

**Pedido por:** Álvaro: «que nuestros partners, que son en general las
agencias, tengan su propio espacio y podamos gestionar ahí también las
propuestas y los acuerdos». Eligió entrar por **enlace privado**.
**Qué:** `agencias/` en esta web; el servicio (`espai-partner`) vive en
TeamTowers Humà, donde están las claves de Zoho (veda 171 de Humà). La agencia
ve su acuerdo y sus propuestas, pide una nueva y acepta una (nota en Zoho, sin
cambiar la fase). Cada agencia ve solo lo suyo; los datos no salen de Zoho.
**Falta:** los campos en Zoho (cuenta: `Clave_espacio`, `Comision`,
`Condiciones_agencia`; trato: `Enlace_propuesta`), que el token de Zoho de
Humà pueda leer cuentas y tratos y crear tratos y notas, y la primera clave.
**Cómo se cierra:** una agencia de verdad entra con su enlace y ve lo suyo.

### Botón principal de La Colla (pedido 2026-10-10)

**Pedido por:** Álvaro, sin decidir todavía. **Qué:** si el primer botón de La
Colla es «Reservar sesión» (hoy) o el diagnóstico gratis de TeamTowers Humà.
**Cómo se cierra:** la decisión de Álvaro aplicada en `colla.html`.

### La Colla para buscadores (pedido 2026-10-10)

**Pedido por:** Álvaro, dentro del plan de integración con TeamTowers Humà.
**Qué:** retirar `lacolla.html` con una 301 a `colla.html` y quitarla del
sitemap; dar al castellano una URL propia con `lang="es"` y su `hreflang`; una
sola `Organization` con `sameAs` a las dos webs.
**Cómo se cierra:** `lacolla.html` responde 301, la versión en castellano tiene
su URL y la prueba de resultados enriquecidos de Google pasa.

## Hecho
