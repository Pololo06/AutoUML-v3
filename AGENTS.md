# AutoUML-v3

Reconstrucción greenfield del visor/editor de diagramas de clases PlantUML.

**El contrato completo —24 mínimos, 6 invariantes, arquitectura y reglas de entrega— está en `GEMINI.md`. Léelo entero antes de tocar nada.** Este archivo solo cubre estado y rutas.

## Rutas

| Qué | Dónde |
|---|---|
| Contrato | `GEMINI.md` |
| Requisitos del producto **anterior** (evidencia, no contrato) | `docs/SPEC.md` |
| Plan del ciclo en curso | `docs/plan-1.md` |
| Gramática, delta de goldens y reglas del parser | `docs/SPEC-parser.md` |
| Decisiones con alternativa descartada y coste | `docs/adr/` (vacío: 0001 y 0002 llegan con C1) |
| Umbrales, motivo y juez externo | `CONSTRAINTS.md` (llega con C1a) |
| Fixtures de paridad del parser | `tests/fixtures/puml/*.puml` |
| Modelos esperados | `tests/fixtures/golden/*.json` + `README.txt` |
| Referencia de solo lectura del proyecto viejo | `../AutoUML` — no se copia código |

## Estado

- **Ciclo 0 cerrado** con reservas. **Ciclo 1 aprobado**: `docs/plan-1.md` y `docs/SPEC-parser.md` son el encargo. Revisiones `../prompts/review-01..03.md` cerradas.
- **C1a turno 1 APROBADO e INTEGRADO en el árbol (7 archivos)**: `.gitignore`, `package.json`, `tsconfig.json`, `vitest.config.ts`, `CONSTRAINTS.md`, `scripts/check-fence.mjs` y `src/domain/model.ts`. Ver `../prompts/review-09.md` y `../prompts/entrega-09-raw.txt`.
- **Sin commits todavía.** Samuel aprueba decisiones de producto y hace los commits.
- **Siguiente: C1a turno 2** (3 archivos restantes): `scripts/floor-guard.mjs`, `tests/core-buffer/eol-mapping.test.ts` (test antes que el código), y `src/core-buffer/text-buffer.ts`. C1b abordará el parser, `hand-10` y los `.v2`.
- **Ciclos restantes**: C2 layout+ruteo, C3 sesión+disco+IPC, C4a prototipo (puerta V10), C4b lienzo, C5 edición+extras, C6 empaquetado.
- Detalle operativo, 13 decisiones cerradas y paquete de 10 adjuntos (sin URLs externas) para el modelo web: `../prompts/adjuntos/1-handoff.md`.

## Reglas de trabajo

- **Lee `CONSTRAINTS.md` antes de tocar código.** Fija las dimensiones, sus umbrales y el juez externo (`knip`); la valla (`check-fence`) vigila el estado y `floor-guard` el diff.
- **El modelo web es solo web**: entrega manifiesto y archivos completos, y no ejecuta nada. Codex integra la entrega y verifica localmente; Samuel aprueba el producto y hace los commits. Contexto de traspaso: `../prompts/adjuntos/1-handoff.md`.
- Test rojo antes de código. Los tiempos se miden en `scripts/bench-*`, **nunca** en vitest.
- Un ciclo ataca un riesgo dominante. Sin `check` verde y sin revisión cerrada no se empieza el siguiente.
- Ningún agente commitea: los commits los hace el usuario, uno por ciclo.
- **Presupuesto de sesión**: una tarea por sesión y cierre obligatorio con bloque `HANDOFF`. Regla completa en `../AGENTS.md`.
- Prohibido heredar `CAPABILITY-MAP`, nombres de módulos o estructura de carpetas del repo viejo.
