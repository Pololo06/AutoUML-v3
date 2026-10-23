# Prueba de lectura de repositorio para Use.ai

Objetivo: medir acceso al repositorio, lectura completa de un archivo, límite por tamaño y efecto de pedir varios archivos a la vez, sin mezclar variables.

## Muestras

- `size-4KiB.txt` a `size-256KiB.txt`: tamaños exactos en bytes, cada uno con marcador `BEGIN` y `END`.
- `file-01.txt` … `file-40.txt`: archivos pequeños independientes con marcadores únicos.

## Protocolo

Usa una conversación nueva en Use.ai. Pega el prompt de `PROMPT.md`. Primero prueba el acceso al repo sin adjuntos. Después pide leer un único archivo de tamaño creciente por URL; registra si devuelve ambos marcadores exactos. Finalmente, con los archivos `file-NN.txt`, solicita 1, 5, 10, 20 y 40 rutas en llamadas separadas y verifica que enumere todas las marcas.

No pruebes tamaños o cantidades simultáneamente. Si el límite está entre dos pasos, añade una muestra intermedia. Repite el mayor paso que parezca funcionar para descartar fallos transitorios.

## Registro de resultados

Copia resultados y fecha en `RESULTADOS.md`. Distingue «el modelo respondió» de «la lectura quedó demostrada»: requiere marcas correctas de inicio y final; para varios archivos, todas las marcas y nombres. Una afirmación sin marca verificable cuenta como no demostrado.

Las muestras están en `docs/use-ai-probe/` del repo público `AutoUML-v3`. No se suben secretos ni datos personales.
