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
- **C1a COMPLETO e INTEGRADO (10 archivos)**: Turno 1 (commit `2e24e58`) + Turno 2 integrado y verificado con `npm run check` verde (11 tests en `eol-mapping.test.ts`, `text-buffer.ts`, `floor-guard.mjs`, vallas y `knip` limpios). Ver `../prompts/review-10.md` y `../prompts/entrega-10-raw.txt`.
- **Siguiente: Cierre de C1a (commit) y arranque de C1b**: parser PlantUML (`src/puml-parser/`), fixture manual `hand-10.puml`, modelos `.v2` y banco `bench-parser.ts`.
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
