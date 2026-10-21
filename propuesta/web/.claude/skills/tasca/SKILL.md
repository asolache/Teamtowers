---
name: tasca
description: Prepara el borrador de una tarea de rutina de cerebro/tasques-ia.md para que lo acepte una persona del rol que la produce. Úsala cuando toca un entregable tangible que la IA puede preparar en borrador.
argument-hint: "<entregable o id>"
---

# Preparar el borrador de una tarea

La máquina propone, una persona acepta. Esta skill solo hace borradores: no envía, no publica, no paga ni firma nada.

## Pasos

1. Lee `cerebro/tasques-ia.json` y busca la tarea (`$ARGUMENTS`) por su `id` o por el entregable (`q`). Si encaja más de una, pregunta cuál. Si no hay ninguna, dilo y para.
2. **Si no tiene `pot: true`, explica por qué y para:**
   - Intangible: lo hace una persona del rol, nunca la IA. Ningún borrador, ni «solo para ayudar».
   - Tangible sin tipo declarado, o sin mena: hay que decidir su tipo en la sesión y anotarlo en el mapa.
   - El tipo no sale de una máquina (un acuerdo, una factura): lo hace y responde de él una persona.
3. Mira qué pide `cal` y pregunta a la persona lo que falte. Si algún dato lleva nombres de persona, pídelo por roles.
4. Escribe el borrador en `cerebro/esborranys/AAAA-MM-DD-<id>.md` (la fecha de hoy), con la forma que dice `surt`. Empieza con esta cabecera, para que diga quién lo ha hecho:

   ```markdown
   ---
   tasca: <id>
   tipus: <tipo>
   de: <rol que lo produce>
   a: <rol que lo recibe>
   fet: borrador hecho con IA (Claude), AAAA-MM-DD
   accepta: <rol>
   estat: esborrany
   ---
   ```

5. Cada dato que no tienes, `[a completar]`. No te inventes ninguna cifra, fecha, acuerdo ni nombre. Ningún nombre de persona: solo roles. Ni precios pactados ni datos personales.
6. Di quién tiene que aceptarlo: una persona del rol de `accepta`, que es quien produce el entregable.
7. Abre una PR con el borrador, o da el fichero si no puedes. Cuando esa persona lo acepta, en la misma PR pasa a `estat: acceptat AAAA-MM-DD`.
8. **Hasta que lo acepta, el borrador no existe:** no se usa, no se envía y no se publica.
