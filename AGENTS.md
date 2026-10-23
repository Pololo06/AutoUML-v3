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

- **Ciclo 0 cerrado** con reservas. **Ciclo 1 aprobado**: `docs/plan-1.md` y `docs/SPEC-parser.md` son el encargo. Revisiones `../use.ai/review-01..03.md` cerradas.
- **Sin código y sin commits.** El primer commit lo hace el usuario.
- **Siguiente: C1a**, nueve archivos: `package.json`, `tsconfig.json`, `vitest.config.ts`, `CONSTRAINTS.md`, `scripts/check-fence.mjs`, `scripts/floor-guard.mjs`, `src/domain/model.ts`, `src/core-buffer/text-buffer.ts`, `tests/core-buffer/eol-mapping.test.ts`. El parser, `hand-10`, los `.v2` y el bench son C1b.
- **Ciclos restantes**: C2 layout+ruteo, C3 sesión+disco+IPC, C4a prototipo (puerta V10), C4b lienzo, C5 edición+extras, C6 empaquetado.
- Detalle operativo, 13 decisiones cerradas y adjuntos para el modelo web: `../use.ai/04-HANDOFF-OPUS.md`.

## Reglas de trabajo

- **Lee `CONSTRAINTS.md` antes de tocar código.** Fija las dimensiones, sus umbrales y el juez externo (`knip`); la valla (`check-fence`) vigila el estado y `floor-guard` el diff.
- **El modelo web (Opus) es solo web**: entrega manifiesto y archivos completos, y no ejecuta nada. La verificación, el banco y los commits son locales. Contexto de traspaso: `../use.ai/04-HANDOFF-OPUS.md`.
- Test rojo antes de código. Los tiempos se miden en `scripts/bench-*`, **nunca** en vitest.
- Un ciclo ataca un riesgo dominante. Sin `check` verde y sin revisión cerrada no se empieza el siguiente.
- Ningún agente commitea: los commits los hace el usuario, uno por ciclo.
- Prohibido heredar `CAPABILITY-MAP`, nombres de módulos o estructura de carpetas del repo viejo.
