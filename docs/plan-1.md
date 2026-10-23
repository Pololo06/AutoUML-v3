# Plan Ciclo 1 — Valla, TextBuffer por línea y Parser PlantUML con juez manual

## Objetivo
Cerrar `npm run check` (`check-fence` + `floor-guard` + `tsc` + `vitest` + `knip`), el buffer UTF-8 por línea (`[fromLine, toLine)` 0-based) y el parser PlantUML validado contra un fixture manual (`hand-10.puml`) y los goldens `.v2` sin sobrescribir los originales.

## Dos entregas, un ciclo
- **C1a**: `package.json`, `tsconfig.json`, `vitest.config.ts`, `CONSTRAINTS.md`, `scripts/check-fence.mjs`, `scripts/floor-guard.mjs`, `src/domain/model.ts`, `src/core-buffer/text-buffer.ts`, `tests/core-buffer/eol-mapping.test.ts`. Verde antes de tocar el parser.
- **C1b**: lexer, parser, miembros, relaciones, `hand-10`, `.v2`, bench.

## Archivos
- `package.json`, `tsconfig.json`, `vitest.config.ts`, `CONSTRAINTS.md` (0 runtime deps; dev: `typescript`, `vitest`, `knip`). Los scripts corren con `node scripts/x.ts`: Node 24 solo borra tipos, así que `erasableSyntaxOnly`, `allowImportingTsExtensions`, `noEmit`, imports con `.ts` y **uniones de literales, nunca `enum`/`namespace`/propiedades de constructor**.
- `CONSTRAINTS.md`: cada dimensión con su umbral y su motivo, y `knip` declarado como el juez externo.
- `scripts/check-fence.mjs` — solo estado del repo: `any`, `@ts-ignore`/`@ts-expect-error`, `skip`/`only`, archivos > 350 líneas, dependencias fuera de lista.
- `scripts/floor-guard.mjs` — solo diff, adaptado del reference de la skill (`floor-guard.md`): supresiones nuevas, tests borrados, aserciones quitadas, umbrales rebajados en `CONSTRAINTS.md`, stubs. Base por defecto: `origin/main`; sin commits, el árbol vacío.
- `scripts/bench-parser.ts` (generador determinista de 1.000 tipos = 100 bloques de 10 + 2.000 relaciones; 3 pasadas, mediana, dispersión; punto de rotura = N de tipos en el que la mediana supera los 50 ms de P6).
- `scripts/regen-golden.ts` (escribe `tests/fixtures/golden/{real-66,gen-120}.v2.model.json`; no toca `*.model.json`).
- `src/domain/model.ts` (`DiagramModel` único con `issues`, `summaryMode`, `separator` y rangos `{ line, endLine }`).
- `src/core-buffer/text-buffer.ts` (UTF-8 fatal, BOM propio, EOL por línea, desempate `CRLF > LF > CR`, parche `[fromLine, toLine)`).
- `src/puml-parser/{lexer,parser,members,relationships}.ts`.
- `tests/fixtures/puml/hand-10.puml` y los dos `.v2.model.json`.
- `docs/SPEC-parser.md`, `docs/adr/0001-stack-and-deep-modules.md`, `docs/adr/0002-domain-model-and-parser.md`.

## Tests nombrados (Vitest: corrección y determinismo; tiempos fuera)
- `eol-mapping.test.ts`: 0-based, CRLF/LF/mixto/sin EOL final/BOM, desempate, rechazo de `\r`/`\n` en `newLines`, rango fuera de límites, no-UTF-8, y **parche de una línea de `real-66.puml` comparado byte a byte**.
- `hand-10.test.ts`: juez manual, modelo esperado escrito a mano.
- `blocks-types-and-members.test.ts`: `class`, `interface`, `enum`, `record`, `abstract`, `<<sealed>>` y `«create»` mezclados, genéricos anidados, rangos de miembros, `{static}` delante y detrás, `}` solo en su línea, `crearCurso` contra `CrearCurso`.
- `blocks-packages-and-rels.test.ts`: alias/anidamiento, seis flechas, etiquetas, `endLine`; fixture propio.
- `blocks-directives-and-notes.test.ts`: `skinparam` inline/bloque, `set separator`, `hide`, `direction`, `summary`, `note`; fixture propio.
- `golden-parity.test.ts`: cuatro comparaciones contra `*.model.json` (ids + `declaredKind`, paquetes con `typeIds`, tripletas de relación, `line/endLine` de tipos) y deep-equal contra `.v2` como detector de cambios.
- `error-recovery.test.ts`: 8 entradas hostiles, `issues` con `code`, 100 % de tipos posteriores.
- `determinism.test.ts`: mismo `.puml`, dos órdenes de inserción en los `Map`/`Set` internos, salida serializada idéntica. No se reordena la entrada: las líneas cambiarían.

**Filas e invariantes**: `P6` (bench), `S1`, `S2`, `S5`, Invariante #1 (memoria), Invariante #5, Determinismo.

## Qué NO entra
`src/i18n/`, `scripts/gen-puml.ts`, layout, ruteo, sesión, disco/watcher/IPC, editor, lienzo.
