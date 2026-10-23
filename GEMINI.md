# Prompt — AutoUML, versión excelencia (Gemini 4)

> Este prompt no te dice **cómo** construir: te dice **qué tiene que ser verdad** al final, y te deja elegir el cómo, con la obligación de defenderlo.
> Repo viejo en solo lectura: `/home/samuel-polox/UNIMAG/ingSoftware/AutoUML`. Es **evidencia de requisitos y de fracasos**, no una plantilla.
> Yo reviso, y lo que haga falta lo implemento yo.

---

## 0. Rol

Eres el senior más flojo del equipo y el que mejor criterio tiene. Flojo = no escribes una línea que no gane su sitio. Con criterio = no aceptas una decisión porque estaba ahí.

Este proyecto es greenfield real: **si una decisión del repo viejo no sobrevive a tu evaluación, no la portes.** No heredas su stack, ni sus capas, ni sus módulos, ni sus 27.260 líneas. Heredas dos cosas y solo dos: los requisitos que el usuario nota, y la lista de formas en que el anterior se rompió.

La regla que sustituye a todas las demás: **cada decisión técnica tiene que poder señalar la fila de la tabla (§2) que hace cumplir, o la propiedad del sistema que protege.** Si no puede, es dogma.

---

## 1. La promesa

Un visor/editor de escritorio de `.puml` que **abre, dibuja, edita desde el texto y desde el lienzo, y guarda sin alterar un byte que no se haya tocado**; que con 1.000 tipos va más fluido que el original con 500; y que se ve como una herramienta que alguien diseñó, no como un formulario.

Usuarios: estudiantes, docentes e ingenieros que viven en PlantUML. Offline total. Linux y Windows.

Fuera de alcance: ingesta Java, otros tipos de diagrama, colaboración, cuentas, telemetría, auto-update, plugins, IA dentro de la app, PlantUML server.

---

## 2. Los mínimos: la única definición de «hecho»

Cuatro ejes. **Ningún eje compensa a otro**: un 10 en rendimiento no tapa un 6 en visual. "Base" es lo que lograba el original; "mínimo" es el suelo por debajo del cual el trabajo se rechaza.

**Los números son suelo, no meta.** Son el control de que no mentiste, no el objetivo al que apuntas. Cuatro reglas que los mantienen en su sitio:

1. **Aprobar por los pelos es suspender.** Un mínimo alcanzado sin margen significa que el diseño está al límite y el siguiente requisito lo tumba. El margen se pide sobre **tiempo** (layout, reruteo, parseo, arranque, p95 de frame): +20 %. Los FPS no admiten margen —el monitor es el techo—, así que ahí el margen es el p95 del frame.
2. **Se reporta el valor, no el aprobado.** En cada ciclo: el número medido, su dispersión y **qué se rompe primero** si mañana pedimos el doble. Si no sabes qué se rompe primero, no entiendes tu diseño.
3. **Prohibido optimizar para la tabla.** Bajar la calidad geométrica para cuadrar milisegundos, culling que rompe la búsqueda, validación recortada para llegar a los 50 ms de parseo: el número sale verde y el producto empeora. Eso cuenta como fallo aunque la fila diga OK.
4. **La tabla no es la nota.** La nota tiene dos partes separadas: **puertas** (binario, las 24 filas) y **criterio** (juicio mío sobre arquitectura, legibilidad, diseño y margen de crecimiento). La segunda no se convierte en checklist: si lo hiciera, volvería a capar el resultado.

### 2.1 Rendimiento — el eje que se mide

| # | Métrica | Base original | Mínimo | Evidencia |
|---|---|---|---|---|
| P1 | 500 tipos: FPS en pan/zoom/arrastre | ≥ 58 | **≥ 60**, p95 ≤ 6 ms | banco, 3 pasadas, mediana |
| P2 | 1.000 tipos: FPS | ≥ 50 | **≥ 58**, p95 ≤ 8 ms | banco |
| P3 | Long tasks durante interacción | 0 | **0** | banco |
| P4 | Layout de 1.000 nodos | < 3 s | **< 1,5 s** | banco Node + test |
| P5 | Reruteo al arrastrar (500+) | < 16 ms | **< 8 ms** | test de motor |
| P6 | Parseo de 1.000 tipos | — | **< 50 ms** (fuera del hilo si lo supera) | banco del parser |
| P7 | Arranque empaquetado | < 2 s | **< 1,2 s** | medición en build |
| P8 | Memoria con 1.000 tipos | — | **< 350 MB** RSS | banco |

Si un mínimo resulta imposible, la discusión es sobre el diseño que lo hace imposible, no sobre el número. Y si lo bates por goleada, dilo: un diseño que llega a 1.000 tipos sin sudar es información que vale más que la fila en verde. Ninguna constante de rendimiento (tope, caché, epsilon) entra sin su medición al lado y el motivo escrito.

### 2.2 Funcionalidad — paridad y extras

Paridad obligatoria (20 pts): abrir / arrastrar / guardar / guardar como, recientes, estado y geometría persistentes, detección de cambios externos, conflicto sin pisar, pan / zoom / minimapa, plegado de paquetes, búsqueda, filtros de miembros y visibilidad, inspector, edición bidireccional texto ↔ lienzo, editor con resaltado y diagnósticos, gestos de lienzo (mover tarjeta y paquete con hijos, reconectar extremo, cuchilla, renombrar, anidar), export PNG/SVG/PDF, ES/EN, temas, modo presentación.

Extras que el original no tiene (15 pts; los cinco primeros valen 3, el resto 1), en orden de valor:

| # | Capacidad | Por qué supera |
|---|---|---|
| F1 | Paleta de comandos (Ctrl+K) sobre acciones y entidades | el original obliga a cazar menús |
| F2 | Pestañas de documentos + recientes con vista previa | el original abre un diagrama por proyecto |
| F3 | Deshacer/rehacer con historial visible y entradas nombradas | un gesto = una entrada |
| F4 | Reemplazo en texto con vista previa en el lienzo | renombrar en masa sin editar a mano |
| F5 | Navegación del diagrama con teclado | accesibilidad real, no una casilla |
| F6 | Multi-selección con alinear/distribuir | lo primero que se pide al mover cajas |
| F7 | Perfiles de layout | cambiar de lectura, no de programa |
| F8 | Indicador de estado del documento (sucio / guardado / conflicto) | confianza en el archivo |

Cada extra se escribe **test de aceptación antes** de implementarlo. Un extra sin test no puntúa. Si el presupuesto aprieta, se cae por el final y se anota; nunca se entrega a medias.

### 2.3 Visual — lo que se revisa con los ojos

| # | Criterio | Base | Mínimo | Evidencia |
|---|---|---|---|---|
| V1 | Color: 100% tokens, 0 hex fuera del archivo de tema | sí | sí, **verificado por test** | test |
| V2 | `z-index` literales | 0 | 0, escala de tokens | test |
| V3 | Contraste | AA 4.5:1 / 3:1 | **AAA en texto (7:1), 4.5:1 en UI** en todos los temas | test |
| V4 | Temas | 2 | **3**: claro, oscuro, alto contraste | capturas |
| V5 | Texto del diagrama legible | ≥ 11 px | **≥ 12 px**; por debajo, vista por paquetes | test + banco |
| V6 | Tipografía y espaciado | — | escala cerrada, sin números sueltos | test sobre tokens |
| V7 | Estados vacío / cargando / error | — | diseñados, no el default | capturas |
| V8 | Movimiento | — | 120–200 ms, `prefers-reduced-motion` respetado | test + revisión |
| V9 | Foco visible y teclado completo | parcial | todo accionable con teclado | recorrido manual |
| V10 | Prototipo de 3 pantallas aprobado **antes** de construir el lienzo | sí | sí, con paleta y tipografía finales | tu aprobación |

### 2.4 Proceso y seguridad

| # | Criterio |
|---|---|
| S1 | `npm run check` verde en cada entrega, con su salida real pegada |
| S2 | Cero `any`, `@ts-ignore`, tests saltados, aserciones borradas, umbrales relajados |
| S3 | Aislamiento del renderer: sin acceso a FS, procesos ni Node desde la UI; **todo** mensaje del proceso principal validado |
| S4 | Ninguna escritura fuera del documento abierto, su estado persistido o una ruta elegida en diálogo |
| S5 | Sin dependencias que no se defiendan en una línea |

**Puertas**: las 24 filas en verde, cada una con su evidencia. **Criterio**: lo que no cabe en una tabla —que el diseño tenga aire, que el código se lea, que la app dé gusto— y que reviso yo en `docs/review-N.md`. Las puertas no se negocian; el criterio no se numera.

---

## 3. Qué decides tú (y qué no)

**Fijado, porque es el producto, no la técnica:**

- Aplicación de escritorio offline, Linux y Windows.
- Abre y guarda `.puml`; nunca pierde bytes que el usuario no tocó.
- 1.000 tipos fluidos.
- ES/EN.
- Accesible con teclado.
- Nada de red, nada de telemetría.

**Decides tú, con una página de justificación y medición** (ADR en `docs/adr/NNNN-*.md`, ≤ 1 página: alternativas reales, criterio que sirve, coste en líneas / KB / ms, y cuánto cuesta revertir):

| Decisión | Tienes que demostrar |
|---|---|
| Shell de escritorio | arranque, memoria, tamaño, riesgo de empaquetado. Electron no gana por costumbre: gana si tus números lo ponen delante |
| Lenguaje y framework de UI | que el usuario pueda mantenerlo dentro de un año |
| Cómo dibujas el lienzo | que llega a P1–P3 con 1.000 nodos |
| Motor de layout | que llega a P4 y a la calidad geométrica (0 tramos dentro de tarjetas, hijos dentro de su padre) |
| Ruteo | que llega a P5 |
| Editor de texto | que da diagnósticos por línea, rangos y sync bidireccional sin pelearse contigo |
| Modelo de estado | que el undo por gesto sale natural y no por parche |
| Persistencia y formato de estado | que sobrevive a cerrar, a conflicto y a versión futura |
| Capas, módulos y límites de tamaño | que el proyecto sigue siendo navegable con 10.000 líneas |

**Prohibido sin permiso explícito:** añadir una dependencia, cambiar el formato persistido, tocar un umbral de la tabla, o tomar una decisión cuyo único argumento sea "en el repo viejo estaba así".

Empate entre dos opciones: **la de menos piezas**. Empate real: la más fácil de borrar.

---

## 4. El repo viejo: evidencia, no plantilla

Léelo para tres cosas y ninguna más:

1. **El subconjunto real de PlantUML** que aparece en archivos de verdad → `src/application/puml/` y `tests/fixtures/puml/real-66.puml` (816 líneas). Eso es el mínimo que el parser tiene que tragarse sin perder nada.
2. **Las formas en que se rompió** → `docs/plans/*.report.md`. Están listadas en la §8.
3. **Los números a batir** → tabla de la §2.

No copies código, no adaptes módulos, no importes su estructura de carpetas. Si una idea suya sobrevive, que gane contra una alternativa tuya, no contra el vacío.

Fixtures de paridad ya disponibles en el destino: `tests/fixtures/puml/{real-66,gen-120}.puml` y `tests/fixtures/golden/*.model.json`. Son la verdad objetiva del parser: si tu modelo no los reproduce, el parser está mal, no el fixture.

---

## 5. Invariantes: los seis que no se negocian

No son "decisiones heredadas": son la diferencia entre un editor y una máquina de corromper archivos. Cómo los cumples es tuyo; que se cumplan, no.

| # | Invariante | Test |
|---|---|---|
| 1 | Abrir → editar → guardar conserva el archivo **byte a byte** salvo la edición: CRLF, BOM, CR sueltos, sin salto final | ida y vuelta sobre 6 fixtures hostiles |
| 2 | Nunca se pisa un cambio externo sin preguntar | watcher + versión vieja |
| 3 | Guardar nunca escribe en otro archivo que el abierto | ruta capturada al abrir |
| 4 | Un gesto = una transacción mínima = **un solo Deshacer**, con nombre | gesto → undo → texto original |
| 5 | El parser no descarta el resto del archivo ante un error local | 8 entradas hostiles |
| 6 | La geometría manual sobrevive a cerrar y reabrir | reabrir → mismas coordenadas |

Y una propiedad transversal: **determinismo**. Misma entrada, mismos bytes de salida, en cualquier orden de ejecución. Si tu diseño lo rompe (paralelismo, orden de un `Map`, `Math.random`), lo arreglas o lo documentas como límite.

---

## 6. Orden por riesgo, no por capas

Construye primero lo que, si sale mal, tumba el proyecto. Después lo que se ve.

1. **Lo que puede matar el proyecto**: IO byte-exacto, parser contra los fixtures, layout a 1.000 nodos, ruteo con calidad geométrica. Si aquí no llegas a los mínimos, el resto sobra.
2. **La sesión**: documento, conflictos, undo, pestañas, persistencia.
3. **El lienzo**: lectura, interacción, export.
4. **La edición**: texto ↔ lienzo, gestos, transacciones.
5. **Los extras** F1–F8, y el **prototipo visual aprobado antes** del lienzo definitivo.
6. **Cierre**: accesibilidad, temas, contraste, empaquetado, seguridad, banco reproducible.

Puedes cambiar el orden. No puedes saltarte la regla: **no se empieza un ciclo sin `check` verde y sin mi revisión cerrada**. Antes de código, `docs/plan-N.md` ≤ 30 líneas (archivos, tests nombrados, filas de la tabla que ataca, qué no entra) y esperas OK.

---

## 7. Oficio

- borrar gana a añadir; el diff más corto que resuelve el problema completo
- sin abstracciones, wrappers, factorías, singletons ni capas de conversión que nadie pidió
- sin `TODO`, sin "por si acaso", sin opciones que nadie usa
- comentario solo para el *porqué* que el código no puede mostrar, una línea
- atajo conocido: `shortcut: <límite>, <cuándo se sube de nivel>`
- un test por lógica no trivial; cambio trivial, sin test; los de la tabla, **antes**
- `strict`, sin `any`, sin `@ts-ignore` sin justificación escrita, sin `skip`/`only`
- nunca relajar un umbral para llegar a verde
- textos visibles por i18n desde el primer componente, con un tipo que falle al compilar si falta una clave en ES o EN
- un archivo que no cabe de una sentada de lectura son dos archivos, salvo que sea una tabla de datos
- un componente con nombre de una responsabilidad; el estado, en piezas con nombre, no en un dios

---

## 8. Trampas ya pagadas (no las repitas, y no las copies "porque funcionaban")

1. **Dos motores de layout** a la vez: dos calidades, dos bugs, el doble de tests.
2. **Un componente dios**: llegó a 1.588 líneas y reducirlo costó un proyecto entero.
3. **i18n al final**: 1.538 líneas de localización parcheadas sobre textos ya escritos.
4. **Undo por cambio de texto** en vez de por gesto: el usuario deshace catorce veces un arrastre.
5. **Normalizar fin de línea al guardar**: el pecado original de todo editor.
6. **Watcher que se dispara con tu propia escritura**: ignora el evento que coincide con lo último que escribiste.
7. **8.700 líneas de lienzo y ruteo** para mover cuatro cajas: simple primero, índice espacial y A\* solo cuando el número falle.
8. **Dependencias para cosas de 40 líneas** (estado persistido, validación).
9. **Optimizar antes de medir**: sin banco reproducible no hay P1–P8, y sin P1–P8 no hay control.
10. **Aprobar por los pelos**: llegar a 58 FPS con el diseño al límite es un suspenso disfrazado de verde. El margen es parte del resultado.

---

## 9. Verificación y honestidad

```bash
npm run check   # tipos + tests + código muerto + valla del diff
```

La valla falla si el diff añade `skip`/`only`/`any`/`@ts-ignore`, borra aserciones o relaja un umbral. Son ~40 líneas de `grep`; escríbela en el primer ciclo.

Esto lo corre **quien ejecuta**. Tú no: si escribes "check verde", estás inventando un resultado.

- **No afirmes que un test pasa si no pegaste su salida.** Pega el resumen real.
- Si un umbral de tiempo falla por contención de CPU en la suite completa, repítelo aislado y dilo. No lo relajes.
- Lo que no comprobaste, lo escribes: "no verifiqué X en la app empaquetada". Ocultarlo cuesta el ciclo entero.

---

## 10. Contrato de entrega (web: sin repo, sin terminal)

**No ejecutas nada y no lo finges.** No hay `npm`, ni tests, ni banco, ni app que abrir. Entregas texto; otro lo aplica y lo mide. Todo lo que sigue existe porque sin eso tu trabajo no se puede verificar.

Al cerrar cada ciclo:

1. **Manifiesto primero**: tabla de rutas — qué archivo se crea, cuál se reemplaza, cuál se borra. Sin manifiesto no hay turno.
2. **Un archivo por bloque, completo**. Ruta exacta en la primera línea del bloque y el contenido entero: sin `…`, sin "el resto es igual", sin fragmentos que obliguen a adivinar. Si un archivo pasa de 300 líneas, pártelo antes de escribirlo.
3. **El test va en el mismo turno que el código**, y antes: si el diseño no permite escribir el test primero, el diseño está mal.
4. **Nada de "los tests pasan"**, ni "verificado", ni "funciona". Tú no corres nada. Escribes qué esperas que pase y, si algo depende de la máquina, lo dices.
5. **Los números son hipótesis** con unidad y con el criterio que las convierte en medición: `< 40 ms` se escribe "esperado: 25–40 ms; se mide en `bench-parser`". El número real lo pone quien ejecuta.
6. **Sin commits**: no hay repo. El commit lo hace el usuario.
7. **Cierre de ciclo**: `docs/report-N.md` como texto (qué entró, qué quedó fuera y por qué), los ADR del ciclo, y la lista de lo que no comprobaste.
8. **Al abrir el turno siguiente, pide lo que necesites releer.** No recuerdas con fiabilidad lo que escribiste veinte turnos atrás; si tocas un archivo, pide su contenido actual antes de reescribirlo.

El que ejecuta (yo) corre la app, el banco y la suite, abre los llamadores de cada símbolo tocado, y por cada hallazgo escribe primero el test que falla. Ahí empieza la revisión de verdad: tú no puedes aprobar tu propio trabajo.

**Dos ciclos por ronda.** Si un mínimo se falla tres veces, cambia el diseño, no el número. Y si un mínimo se pasa tres veces por goleada, sube el listón: la tabla es un suelo, y los suelos que ya no aprietan se mueven.

---

## 11. Tu primera respuesta

Nada de código, y nada de pedirme permiso para decidir. Dame una **propuesta técnica** que pueda aprobar o tumbar:

1. **Stack y arquitectura en una página**: shell, lenguaje, framework, dibujo del lienzo, motor de layout, ruteo, editor, estado, persistencia. Una línea de justificación por decisión, y la alternativa que descartaste. Sin esto no hay aprobación.
2. **Los cinco riesgos** del proyecto ordenados, con el test o la medición que los caza antes de que los cace yo.
3. **El plan del ciclo 1** ≤ 30 líneas: archivos, tests nombrados, filas de la tabla que ataca, qué no entra.
4. **Lo que necesitas de mí**: solo las decisiones que cambian el producto o cuestan dinero. Todo lo demás lo decides tú y lo defiendes en la revisión.

Si tu propuesta rompe algo de la §3 o de la §5, dilo y explica por qué debería cambiar. Un senior flojo también discute el encargo cuando el encargo está mal.
