---
name: continguts
description: Escribe o actualiza el texto de las páginas de la web (cerebro/continguts) a partir del dossier, las fuentes y el mapa. Úsala después de importar o cuando hay que cambiar el texto de una página.
argument-hint: "[página]"
---

# Escribir el texto de la web

Las páginas salen del mapa. El texto de dentro sale de aquí: un fichero por página en `cerebro/continguts/<id>.md`. El generador lo convierte en HTML y no lo sobrescribe nunca.

## Qué páginas

- `inici`: la portada.
- `serveis`: la página de servicios.
- La puerta de cada rol: el nombre de su fichero en la web generada, sin `.html` (si hay `quien-compra.html`, el id es `quien-compra`).
- Páginas nuevas, con un id corto en minúsculas y guiones (`quienes-somos`, `preguntas-frecuentes`) y `menu: si` para que salgan en el menú.
- Estos id no se pueden usar: `equip`, `registre`, `gracies`, `404`, `estil`, `web`, `index`.

Si te dicen una página (`$ARGUMENTS`), trabaja solo en esa. Si no, propón la lista y empieza por `inici`.

## El formato

```markdown
---
titol: Quiénes somos
menu: si
font: cerebro/fonts/web/quienes-somos.md, cerebro/dossier.md
fet: esborrany fet amb IA (Claude), AAAA-MM-DD
---

## Un título de sección

Un párrafo.
```

Solo este Markdown: `##` y `###`, párrafos, listas, **negrita**, *cursiva*, enlaces `http(s)`, `mailto:` o relativos, e imágenes solo relativas, dentro de `imatges/`. El resto sale como texto: nada de HTML.

## Pasos

1. Lee `cerebro/dossier.md`, `cerebro/fonts/index.md`, el mapa (`cerebro/mapa-real.json`) y el contenido que ya tiene la página, si lo tiene.
2. Escribe solo lo que dicen las fuentes, y ponlas en `font:`. Nada inventado: ni cifras, ni clientes, ni citas, ni promesas.
3. Donde falte algo, `[a completar]`. Dilo en el resumen.
4. Ningún dato personal (nombres de persona, correos, teléfonos) ni ningún precio pactado. Eso va al CRM.
5. Escribe en la lengua de quien visita la web y con el tono que ya usa la casa en las fuentes. Frases cortas, palabras llanas.
6. Ejecuta `node eines/genera.mjs` y mira la página generada (`<id>.html`, o `index.html` para `inici`): que se lea bien y que los enlaces funcionen.
7. Abre una PR con el cambio, nunca directamente en la rama principal: la persona mira la vista previa de Netlify y decide. **Aceptar la PR es aceptar el texto**, y queda dicho quién lo ha hecho. Si no puedes abrirla, dale los ficheros para que los suba.
