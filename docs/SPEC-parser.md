# SPEC-parser — gramática, recuperación y delta de goldens

> Referenciado por `tests/fixtures/golden/README.txt`: la regeneración de goldens está autorizada solo
> si este archivo declara el delta. Comprobado contra los fixtures en disco, no de memoria.

## 1. Convenciones

- **`DiagramModel`**: líneas `1-based` inclusivas `[line, endLine]`, igual que el golden antiguo
  (`App` en `real-66.puml`: `8..12`).
- **Hacia `TextBuffer`**: `fromLine = line - 1`, `toLine = endLine`, rango `0-based` semiabierto.
- **Determinismo**: `packages[].typeIds` ordenado por `id`; `skinparams` con claves en **minúsculas**
  (PlantUML no distingue mayúsculas) y orden lexicográfico, valor de la última aparición; sin dependencia
  del orden de iteración de `Map`/`Set`.
- **Encoding**: UTF-8 estricto. Un byte no UTF-8 rechaza la apertura con aviso; no se re-codifica.

## 2. Gramática cubierta en C1

Tipos (`class`, `interface`, `enum`, `record`, `abstract class`, `<<sealed>>`, `«create»`, genéricos
anidados `Map<String, List<Integer>>`), miembros (atributos, métodos, constructores, constantes de enum,
`{static}`, `{abstract}`, visibilidad `+ - # ~`), paquetes con `as` y anidamiento, relaciones
(`-->`, `..>`, `<|--`, `<|..`, `*--`, `o--`, etiqueta, multiplicidad, `sourceHead`/`targetHead`),
`skinparam` inline y en bloque, `set separator`, `hide`, `direction`, `note`, `summary`.

Cuatro reglas que los fixtures ya obligan y que no son evidentes:

1. **Estereotipo en el cuerpo** (`gen-120.puml`, `T3`): una línea `<<sealed>>` dentro de `class T3 { … }` es un
   estereotipo del tipo, no un miembro inválido. No emite `ERR_INVALID_MEMBER`.
2. **Espaciado libre alrededor de la visibilidad**: `«create» + T5(...)`, `«create» -AppScannerCli()` y
   `+ x: int` son válidos. El lexer separa visibilidad, estereotipo y nombre sin exigir espacio.
3. **Constante de enum contra atributo**: `ACTIVO` es constante; `-code: int` es atributo. La distinción es
   la ausencia de visibilidad y de `:` — no un diccionario de nombres.
4. **Relaciones duplicadas a propósito** (`gen-120`): la paridad cuenta multiconjuntos, no conjuntos.

Y cinco que la revisión del plan añadió, todas comprobables:

5. **`}` solo cierra bloque si es lo único en la línea** (quitando espacios): 88 líneas así en `real-66`.
   `{static}` y `{abstract}` al final de un miembro llevan llaves y **no** cuentan.
6. **Estereotipos en dos grafías**: `«x»` (U+00AB/BB) y `<<x>>` (ASCII) son equivalentes. `real-66` usa solo
   la primera (44 veces), `gen-120` solo la segunda (12); un test debe mezclarlas.
7. **Identificadores sensibles a mayúsculas**: `real-66` L631–632 declara `crearCurso` y `CrearCurso` en el
   mismo tipo. Son dos miembros; ninguna deduplicación puede aplanarlos.
8. **`{static}`/`{abstract}` delante o detrás**: al final es la forma de los fixtures, al principio es la
   habitual de PlantUML. Se aceptan las dos.
9. **Clasificación de una línea de cuerpo**: paréntesis → método; `:` sin paréntesis → atributo;
   identificador suelto → constante si el tipo es `enum`, `ERR_INVALID_MEMBER` si no. `ACTIVO(1, "x")`
   no aparece en los fixtures y **no entra**: se emite `ERR_INVALID_MEMBER`.

Los fixtures reales solo contienen `-->` y `..>`, y **no contienen** `hide`, `direction`, `note` ni
`summary`: esos bloques se prueban con fixture propio y sus defaults (`hide: []`, `direction: "TB"`,
`notes: []`, `summaryMode: false`) se comprueban contra el golden.

## 3. Delta `*.model.json` (commit `18931b1`) → `*.v2.model.json`

| Ruta | Golden antiguo | v2 | Motivo en fixture |
|---|---|---|---|
| `types[].line/endLine` | presente, 1-based | sin cambios | ya existía (`App` 8..12) |
| `types[].attributes[]` | `{name,type,visibility,isStatic}` | `+ line` | edición quirúrgica (Inv. #1) |
| `types[].methods[]` | `{name,returnType,parameters,visibility,isStatic,isAbstract}` | `+ line` | idem |
| `types[].constructors[]` | `{name,parameters,visibility}` | `+ line` | `«create»` en ambos fixtures |
| `types[].enumConstants[]` | `string[]` (`["UNO","DOS"]`) | `{name,line}[]` | direccionar constantes por línea |
| `packages[]` | `{name,typeIds}` | `+ alias, line, endLine` | `package "..." as pkg_...` en ambos; el viejo perdía el alias |
| `relationships[]` | `{source,target,type,sourceHead,targetHead,line}` | `+ endLine` | par completo para cortar/reconectar |
| `skinparams` | `{"classattributeiconsize":"0"}` | `{"classattributeiconsize":"0","nodesep":"80","ranksep":"100"}` en `real-66` | el viejo perdía L3–L4; la clave sigue en minúsculas porque PlantUML no distingue mayúsculas |
| `separator` | no existía | `"none" \| string \| null` | `set separator none` en `real-66` L5 y `gen-120` L3 |
| `issues` | `[]` | `ParseIssue[] {code,line,endLine,snippet}` | Inv. #5; códigos tipados, sin texto de i18n |
| `summaryMode`, `notes`, `hide`, `direction` | `false`, `[]`, `[]`, `"TB"` | sin cambios | no perder contrato |

`label` **no entra**: 0 apariciones en los 355 registros de relación de ambos fixtures. Si un `.puml`
real la necesita, entra con su fixture y su fila aquí.

## 4. Cómo se demuestra la paridad

Conteos del golden antiguo: `real-66` 66 tipos / 22 paquetes / **115 relaciones**; `gen-120` 120 / 3 / **240**
(355 en total, la cifra que cita §3).

1. `hand-10.puml` con modelo esperado escrito a mano: el único juez que no se autofirma.
2. Comparación contra el golden **antiguo**, cuatro reglas: mismos `types[].id` + `declaredKind`, mismos
   `packages[]` por `name` con sus `typeIds`, mismas tripletas `(source,target,type)` **como multiconjunto**
   (mismo conteo de duplicados: `gen-120` repite relaciones a propósito) y mismos `types[].line/endLine`.
   Si una falla, el parser nuevo miente.
3. Deep-equal contra `.v2`: detector de cambios para ciclos futuros, no prueba de paridad — lo genera el
   mismo parser.

## 5. Recuperación de errores

Un error local no descarta el resto del archivo: se registra en `issues` con `code`
(`ERR_UNCLOSED_BLOCK`, `ERR_INVALID_MEMBER`, `ERR_INVALID_REL`, `ERR_UNKNOWN_SYNTAX`) y se sigue. Todo tipo
declarado después de un error aparece en el modelo.

La regla del bloque sin cerrar, que es la que sostiene el invariante #5: **si dentro del cuerpo de un tipo o
de un paquete aparece una cabecera de tipo o de paquete, se emite `ERR_UNCLOSED_BLOCK`, el bloque se cierra
en la línea anterior y la cabecera se procesa como nueva.** Esperar a la siguiente `}` convertiría a
`class X {` en un miembro del tipo anterior y el resto del archivo se perdería. Es una de las 8 entradas
hostiles de `error-recovery.test.ts`.
