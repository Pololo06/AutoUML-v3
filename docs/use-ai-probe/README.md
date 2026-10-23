# Prueba de lectura de repositorio para Use.ai

Objetivo: medir acceso al repositorio, lectura completa de un archivo, límite por archivo y efecto de cantidad de archivos, sin mezclar variables.

## Muestras

- `size-4KiB.txt` a `size-256KiB.txt`: tamaños exactos en bytes, cada uno con marcador `BEGIN` y `END`.
- `count-40/file-01.txt` … `file-40.txt`: un archivo por marca; adjuntar cantidades crecientes.

## Protocolo

Usa una conversación nueva en Use.ai para evitar que respuestas anteriores aporten datos. Pega el prompt de `PROMPT.md`. Primero prueba solo el acceso al repo. Después adjunta un solo archivo de tamaño creciente; registra si repite ambos marcadores y el número de bytes indicado por el archivo. Finalmente, con un tamaño pequeño fijo, adjunta 1, 5, 10, 20 y 40 archivos de `count-40/` y pide una marca por archivo.

No pruebes tamaños o cantidades simultáneamente. Si el límite está entre dos pasos, añade una muestra intermedia para acotarlo. Repite el mayor paso que parezca funcionar para descartar fallos transitorios.

## Registro de resultados

Copia resultados y fecha en `RESULTADOS.md`. Distingue «el modelo respondió» de «la lectura quedó demostrada»: requiere marcas correctas de inicio y final; para archivos contados, todas las marcas y nombres. Una afirmación sin marca verificable cuenta como no demostrado.

Los archivos están en el repo `AutoUML-v3`, en `docs/use-ai-probe/`. El repo está público; no subir aquí secretos ni datos personales.
