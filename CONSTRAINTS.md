# CONSTRAINTS — AutoUML-v3

Fuente única de los umbrales. `scripts/check-fence.mjs` lee los números de aquí y no tiene cifras propias.
Cambiar una regla se hace en un commit propio, con motivo y fecha, y se ve en el diff.

## Suelo (diff, `scripts/floor-guard.mjs`)

- Supresión nueva: ningún comentario que silencie a `tsc`, linters o cobertura en código añadido.
- Test borrado: ningún archivo de test desaparece.
- Aserción quitada: ninguna línea con `expect`/`assert`/`should` sale de un test que sigue existiendo.
- Umbral rebajado: ningún mínimo de esta tabla baja y ningún máximo sube.
- Trabajo a medias: ni stub «no implementado», ni `catch` vacío, ni marcas de pendiente en código.

## Dimensiones (estado, `scripts/check-fence.mjs` salvo que el juez diga otra cosa)

| Dimensión | Regla | Juez | Motivo |
|---|---|---|---|
| Tamaño de archivo | ≤ 350 líneas por archivo | check-fence | un archivo que no se lee de una sentada son dos (§7) |
| Tipado laxo | ≤ 0 any | check-fence | S2 |
| Supresiones de tsc | ≤ 0 supresiones | check-fence | S2 |
| Tests saltados o aislados | ≤ 0 skip/only | check-fence + `allowOnly: false` | S2 |
| Dependencias de runtime | ≤ 0 dependencias de runtime | check-fence | S5, trampa #8 |
| Dependencias de desarrollo | solo la lista permitida | check-fence | S5 |
| Tipos | 0 errores de `tsc` strict | tsc | S2 |
| Código muerto | 0 archivos/exports sin importador | knip | la suite no ve lo que nadie importa |
| Tiempos | fuera de vitest | revisión | trampa #9: los tiempos van al banco, no a la suite |

Dependencias permitidas (dev): typescript, vitest, knip, @types/node

## Juez externo

`knip`: resuelve el grafo de imports por su cuenta. Los tests se aprueban a sí mismos; un módulo huérfano solo lo ve una herramienta ajena a la suite.

## Medido, aún no aplicado

- P6 parseo: mediana de 1.000 tipos ≤ 50 ms; se mide en `scripts/bench-parser.ts` (C1b), no entra en la suite.

## Excepciones

| ID | Regla | Ruta | Motivo | Responsable | Caduca |
|---|---|---|---|---|---|
| E1 | knip-entry | src/domain/model.ts | contrato de tipos sin importador hasta que el parser de C1b lo consuma; declarado como entry de knip | Samuel | 2026-11-30 |
