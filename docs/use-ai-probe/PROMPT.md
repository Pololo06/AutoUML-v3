# Prompt de la prueba

No escribas código ni adivines datos. Usa solo el repositorio `https://github.com/Pololo06/AutoUML-v3` y las rutas indicadas. Si no puedes acceder a una ruta o leerla completa, indica «NO ACCESIBLE» o «LECTURA INCOMPLETA».

**Fase A — acceso al repositorio, sin adjuntos:** responde con siete líneas:
1. Última línea literal de `GEMINI.md`.
2. Última línea literal de `docs/plan-1.md`.
3. Número de líneas y última línea literal de `tests/fixtures/puml/real-66.puml`.
4. Contenido exacto de la línea 8 de ese archivo (1-based).
5. Número de objetos en `types` de `tests/fixtures/golden/real-66.model.json` y `declaredKind` del primer objeto.
6. Primer y último nombre alfabético de `tests/fixtures/golden/`.
7. Rama y número de commits visibles.

**Fase B — tamaño:** lee un solo archivo de `docs/use-ai-probe/size-*.txt` por turno. Para cada uno devuelve el nombre, el marcador BEGIN literal y el marcador END literal. No reproduzcas el contenido intermedio. Prueba en este orden: `size-4KiB.txt`, `size-16KiB.txt`, `size-32KiB.txt`, `size-64KiB.txt`, `size-128KiB.txt`, `size-256KiB.txt`. Si una ruta no es accesible o no puedes garantizar que llegaste al final, dilo explícitamente.

**Fase C — cantidad:** lee los archivos `docs/use-ai-probe/file-NN.txt` indicados en cada solicitud. Devuelve por cada archivo su nombre y las marcas BEGIN y END exactas; no omitas ni agrupes ninguno. Ejecuta lotes separados de 1, 5, 10, 20 y 40 archivos. Si la lista parece incompleta, indícalo.
