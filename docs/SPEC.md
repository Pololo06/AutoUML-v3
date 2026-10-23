> **Evidencia, no contrato.** Este documento describe el repo **anterior** (Electron 38, React 19,
> `src/domain|application|infrastructure|presentation`, 81 archivos / 879 tests, `App.tsx < 400`). Nada de
> aquí obliga a AutoUML-v3: su stack, estructura, comandos y umbrales salen de `GEMINI.md` y de `docs/adr/`.
> Se lee por dos cosas: el subconjunto de PlantUML que aparece en archivos reales, y las formas en que el
> anterior se rompió.

# Spec: AutoUML — visor y editor de escritorio de diagramas de clases PlantUML

## Objetivo

**AutoUML** es una aplicación de escritorio multiplataforma (Linux/Windows/macOS) construida con **Electron + React + TypeScript** para visualizar y editar diagramas de clases **PlantUML (`.puml`)**:

1. **Abre y guarda archivos `.puml`**, tanto dentro de un proyecto AutoUML como sobre archivos `.puml` externos, manteniendo historial de documentos recientes y archivo sidecar de estado/geometría.
2. **Renderiza en tiempo real en un lienzo HTML5 Canvas** con pan/zoom, minimapa, plegado de paquetes, modo foco por vecindario, búsqueda y filtros de miembros/visibilidad.
3. **Permite edición bidireccional**: manipulación directa desde el lienzo (mover tarjetas y subárboles de paquetes, reconectar extremos, mover/partir tramos ortogonales, cortar relaciones con cuchilla, renombrar tipos en línea, anidar paquetes) y edición textual en vivo con **CodeMirror 6**.
4. **Exporta diagramas** a **PNG, SVG y PDF** de forma autónoma y offline.
5. **Escala a 500–1000 tipos sin congelar la interfaz de usuario**, ejecutando el cálculo de layout pesado y el reruteo de reposo en Web Workers.

**Usuarios:** estudiantes, docentes e ingenieros de software que trabajan con diagramas de clases PlantUML.

### Alcance actual: solo PlantUML (ingesta Java aplazada)

- El alcance de esta iniciativa es **exclusivamente PlantUML (`.puml`)**.
- La ingesta y análisis de proyectos Java (`java-ingest`) está **aplazada** y no se implementa en esta iniciativa: no existe análisis de fuentes `.java`, ni sidecar JAR, ni invocación por `child_process` a un runtime de Java.
- Las entradas históricas con `kind: 'java'` que ya existan en el almacenamiento local se siguen leyendo por compatibilidad de datos, pero no disparan análisis Java.

## Tech Stack

- **Shell de escritorio:** Electron 38 (`main`, `preload` con `contextBridge` e IPC tipado), empaquetado con `electron-builder`.
- **Interfaz y estado:** React 19, TypeScript 5.9 (`strict`), Vite 7.
- **Motor de layout y ruteo:** `elkjs` (layout jerárquico por capas y modo interactivo estable) + enrutador ortogonal propio (grafo Hanan, A*, separación de carriles y ajuste de cajas de paquetes) ejecutándose en Web Worker (`@dagrejs/dagre` en retirada como respaldo rápido).
- **Editor de código:** CodeMirror 6 (`@codemirror/*`, `@lezer/highlight`) cargado bajo demanda (`React.lazy`) con resaltado PlantUML propio y diagnósticos por línea.
- **Pruebas y rendimiento:** Vitest 2 + Testing Library + `jsdom` para pruebas unitarias y de integración; banco de rendimiento offscreen en Electron (`scripts/perf/`) y microbanco de layout en Node (`scripts/bench-layout.ts`).

## Comandos

```bash
npm run typecheck    # verificación de tipos con TypeScript (tsc --noEmit)
npm test             # suite de pruebas con Vitest
npm run build        # compilación de renderer, main y preload
npm run dev          # entorno de desarrollo con Electron
npm run dist         # empaquetado de distribución con electron-builder
npm run bench:perf   # banco reproducible de rendimiento del lienzo en Electron
npm run gen:puml     # generador de fixtures .puml sintéticas
```

## Estructura del proyecto

```text
src/
  domain/            modelo UML y reglas puras (diagram/, rules/, analysis/)
  application/       casos de uso puros y contratos (puml/, ports/)
  infrastructure/    Electron/Node (main/, preload/, storage/, filesystem/)
  presentation/      React (app/, components/, diagram/, editor/, localization/)
tests/               espejo de src/ + fixtures/ + helpers/ + architecture/
scripts/             bench-layout.ts, gen-puml.ts, dev-electron.mjs, perf/
docs/                SPEC.md, CAPABILITY-MAP.md, SPEC-*.md, perf-*.md
```

Rutas de integración Electron:
- Proceso principal: `src/infrastructure/main/main.ts`
- Contrato de puertos IPC: `src/application/ports/ipc.ts`
- Preload bridge: `src/infrastructure/preload/preload.ts`

El proceso renderer no accede directamente al sistema de archivos (`fs`), ni a `child_process`, ni a Java.

## Estilo de código y arquitectura

- **Separación por capas:** `domain` y `application` contienen lógica pura sin dependencias de DOM, React ni Electron; `infrastructure` encapsula el acceso a Electron/Node; `presentation` contiene los componentes React, el lienzo Canvas, los Workers de layout/ruteo y el editor CodeMirror.
- **Tipado estricto:** TypeScript en modo `strict`, contratos explícitos en `src/application/ports/` y `src/presentation/diagram/types.ts`, sin exponer APIs de Node al renderer.
- **Límites de tamaño modular:** `App.tsx` < 400 líneas y `DiagramCanvas.tsx` < 600 líneas; toda pieza nueva debe ir acompañada de sus pruebas unitarias.

## Estrategia de pruebas

- **Unitarias y de integración (Vitest 2):** espejo de `src/` bajo `tests/`, incluyendo parser PlantUML, sincronización de código, reglas de dominio, layout (`elkjs` y respaldo), ruteo ortogonal, componentes React con Testing Library + `jsdom`, manejadores IPC con dobles de prueba y tests de arquitectura (`tests/architecture/`).
- **Fixtures:** diagramas `.puml` reales (como `tests/fixtures/puml/real-66.puml`) y modelos sintéticos deterministas (`scripts/perf/synthetic.ts`).
- **Rendimiento:** `npm run bench:perf` mide FPS, tiempos de fotograma (`p50`, `p95`, `max`), intervalo entre fotogramas, `long tasks`, `dropMs` y `settleMs` sobre el lienzo real en Electron; `npx tsx scripts/bench-layout.ts` mide los tiempos de colocación y ruteo y las métricas geométricas en Node.
- **Nota sobre umbrales de tiempo en suite completa:** existen 2 tests con umbral temporal sensible a la contención de CPU cuando se ejecuta la suite completa (`tests/presentation/diagram/layout/layout.test.ts` para 1000 nodos < 3 s y `tests/presentation/diagram/routing/orthoRouter.test.ts` para reruteo < 16 ms) que pasan de forma aislada; no se relajan sus umbrales.

## Límites (Boundaries)

- **Siempre:** mantener `npm run typecheck` limpio y `npm test` en verde; ejecutar layout pesado fuera del hilo principal; conservar intactos los archivos del usuario salvo la edición solicitada (respetando CRLF/LF y BOM); validar entradas en la frontera IPC.
- **Preguntar primero:** añadir dependencias nuevas al proyecto, modificar contratos IPC o el formato del sidecar, o cambiar umbrales de pruebas existentes.
- **Nunca:** escribir fuera del documento abierto, de su sidecar o de una ruta elegida mediante diálogo del sistema; sobrescribir sin aviso cambios externos detectados en disco; descartar código PlantUML válido en el parser; tocar `fs` o `child_process` desde el renderer.

## Criterios de éxito globales

- [ ] `npm run typecheck` limpio; `npm test` ≥ línea base (81 archivos / 879 tests) más los tests nuevos, con cualquier test retirado documentado; `npm run build` limpio sin incrementar `chunkSizeWarningLimit`.
- [ ] Ninguna escritura fuera del documento abierto, su sidecar o una ruta seleccionada en diálogo; el flujo abrir → editar → guardar conserva el archivo byte a byte salvo la edición realizada (preservando CRLF y BOM); ningún cambio externo en disco se pisa sin preguntar al usuario.
- [ ] Todo gesto del lienzo que borra código muestra las líneas eliminadas y ofrece "Deshacer" en un paso; una operación sin efecto (no-op) muestra aviso; la geometría manual sobrevive al cerrar y reabrir el documento.
- [ ] El parser no descarta código PlantUML válido ni se traga el resto del archivo ante construcciones no soportadas o errores locales.
- [ ] Calidad geométrica del layout/ruteo: 0 tramos dentro de tarjetas, 0 solapes de paquetes y todos los hijos dentro de su paquete padre en `real-66`, 500 y 1000 tipos.
- [ ] Rendimiento en lienzo con `--engine elk`: en 500 tipos ≥ 58 FPS y frame `p95` ≤ 8 ms; en 1000 tipos ≥ 50 FPS y frame `p95` ≤ 12 ms; 0 `long tasks`.
- [ ] Mantenibilidad: `App.tsx` < 400 líneas, `DiagramCanvas.tsx` < 600 líneas y cada módulo nuevo cubierto con tests.

## Preguntas abiertas

1. ¿Cuándo y en qué iniciativa separada se retomará el módulo `java-ingest` para proyectos Java?
2. ¿En qué momento se retirará definitivamente el respaldo `@dagrejs/dagre` una vez que el camino completo con `elkjs` y el ruteador ortogonal cumpla los presupuestos de tiempo en 500 y 1000 tipos?
