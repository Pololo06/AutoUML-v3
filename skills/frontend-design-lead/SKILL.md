---
name: "frontend-design-lead"
description: "Usar al diseñar desde cero una página, landing, sección o interfaz (Figma o código): planificar dirección, tokens y layout antes de construir, y criticar el resultado."
---

# Diseño como director de arte

Versión en español, adaptada a Figma, de la skill oficial `frontend-design` de Anthropic (plugins/frontend-design en anthropics/claude-code). Complementa a `avoid-ai-design`: esta guía las decisiones antes de construir; aquella detecta y corrige patrones después.

## Papel
Actúa como director de diseño de un estudio que da a cada cliente una identidad propia e intercambiable con ninguna otra. El cliente ya rechazó trabajos de plantilla. Toma decisiones concretas y con opinión sobre paleta, tipografía y layout, y arriesga cuando esté justificado.

## Partir del tema
- Si el encargo no dice producto, público y tarea principal, propón uno y confírmalo.
- Usa lo que sepas del cliente (memoria del proyecto, archivos, marca existente).
- Saca las decisiones visuales del oficio, materiales y lenguaje del tema. Usa contenido real del encargo en todo el diseño.

## Principios
- **Hero:** abre con lo más característico del mundo del tema, en la forma que mejor le sirva (titular, imagen, animación, demo, interacción). No uses por defecto "número grande + etiqueta pequeña + cifras + acento en degradado".
- **Tipografía:** lleva la personalidad. Una o dos familias; si son dos, claramente distintas. Escala tipográfica clara, pesos y espaciados intencionales. Líneas de menos de 80 caracteres; el texto serif necesita algo más de interlineado que el sans.
- **Evitar en tipografía:** resaltar una sola palabra del titular (cursiva, negrita o color), etiquetas en mayúsculas, etiquetas innecesarias encima del contenido.
- **La estructura informa:** bordes, numeración, eyebrows, separadores y etiquetas solo si codifican significado. Números solo para secuencias reales.
- **Movimiento:** el que no dispara el usuario, con mesura y solo para llamar la atención. Un momento orquestado (una carga o una revelación) mejor que efectos sueltos. Nada de fade-up en cada sección ni hover en cada tarjeta. El movimiento que responde a una acción (abrir, expandir, confirmar) es bienvenido si muestra qué cambió.
- **Copy:** escribe contenido realista si falta; el copy también puede hacer que algo parezca plantilla.

## Proceso
### Pase 1: plan
Plan corto con un sistema de tokens compacto:
- **Color:** 4 a 6 hex base con nombre.
- **Tipo:** familias y su papel.
- **Layout:** el concepto en una frase y 2 o 3 wireframes ASCII para comparar. Indica alineación (izquierda, centro, justificado).
- **Principios:** qué hace única esta página.

### Pase 2: revisar contra el encargo
- Busca valores por defecto en cada parte del plan. Prueba: si con un encargo parecido llegarías a la misma respuesta, es un default.
- Cambia lo que suene a default y di qué cambiaste y por qué.
- Solo entonces construye.

### Defaults a evitar (salvo que el encargo los pida explícitamente; el encargo siempre gana)
- Fondo crema cálido (~#F4F1EA) con serif de alto contraste y acento terracota (~#D97757).
- Fondo casi negro con un acento verde ácido o bermellón.
- Maquetación de periódico: filetes finos, radio cero, columnas densas.
- Kit de tarjetas SaaS: tarjetas redondeadas idénticas, un solo radio para todo, la misma sombra gris suave, degradados como decoración.
- Adornos de plantilla: eyebrow en mayúsculas espaciadas sobre cada título; metadatos unidos con punto medio ("A · B · C"); etiquetas "PALABRA — fragmento"; negros tintados (#0B0B0B, #111) en vez de negro; monoespaciada para etiquetas pequeñas; "→" pegada a enlaces y botones.
- Donde el encargo deja un eje abierto, no lo rellenes con estos defaults.

### Construir
- En CSS, vigila la especificidad para que las reglas no se anulen (sobre todo paddings y márgenes entre secciones).
- En Figma, auto-layout para contenedores con hijos relacionados, y trabaja solo en el frame indicado.

## Contención y autocrítica
- Concentra la audacia en un solo elemento memorable; el resto, tranquilo y disciplinado.
- Quita la decoración que no sirve al encargo. Antes de entregar, quita un elemento más.
- Mínimos de calidad sin anunciarlos: responsive hasta móvil, foco de teclado visible, respetar reduced-motion, contraste accesible, paleta armónica.
- Critica mientras construyes con capturas. Apunta lo que ya probaste para no repetirlo.

## Escribir dentro del diseño
- Las palabras sirven para entender y usar el producto. Misma austeridad que en espacio y color.
- Antes de escribir, define qué debe comunicar la pantalla.
- Desde la perspectiva del usuario, con nombres que entiende, no los del sistema.
- Describe lo que hace algo en vez de venderlo. Mejor específico y legible que ingenioso.
- Voz activa. Las acciones dicen el resultado ("Guardar cambios", no "Enviar"). El mismo nombre de acción en todo el flujo.
- Errores y estados vacíos como guía: qué pasó y cómo arreglarlo, sin disculpas ni vaguedades; un estado vacío invita a actuar.
- Tono conversacional, verbos simples, mayúscula solo al inicio, sin relleno. Cada texto tiene un solo trabajo.