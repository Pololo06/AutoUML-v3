---
name: "avoid-ai-design"
description: "Usar al diseñar, revisar o rediseñar interfaces (Figma o código) para que no parezcan hechas por IA: auditar señales genéricas, fijar una dirección visual y reescribir."
---

# Evitar diseño con pinta de IA

Basado en `funboy322/avoid-ai-design` (catálogo de señales), la skill oficial `frontend-design` de Anthropic y la guía "Improving frontend design through skills". Sin dirección, Claude converge en las mismas tipografías, paletas y estructuras. Esta skill obliga a decidir, no a decorar.

## Modos
- **diseñar**: algo nuevo (pantalla, sección, banner). Empieza en el paso 2.
- **auditar**: solo informe y puntuación, sin tocar nada.
- **reescribir** (por defecto si hay algo existente): auditar → dirección → reescribir → reauditar.

## Flujo
1. **Alcance.** Qué pieza exacta (frame, sección, componente), qué stack (Figma, HTML, React) y qué NO se toca. En Figma, cambiar solo el frame indicado: nunca variables, estilos o componentes compartidos sin avisar, porque afectan a todos los frames.
2. **Contexto real.** Producto, público, qué tiene que hacer la persona en esa pantalla, y la identidad existente (logo, paleta, fuentes, fotos). Si hay sistema de diseño o tokens, se trabaja dentro de ellos.
3. **Dirección.** Elegir UNA dirección estética y definirla con 3 a 5 movimientos concretos (p. ej. "titulares serif grandes alineados a la izquierda", "un solo color dominante con acento afilado", "fotos de producto a sangre"). Escribir por qué encaja con el producto. Si se pide confirmación, confirmar antes de editar; en tareas pequeñas, decidir y decirlo.
4. **Calibrar.** Componente pequeño o atado a un sistema: pasada quirúrgica. Página suelta: reconstrucción más valiente.
5. **Construir / reescribir.** Mantener funcionalidad, datos, accesibilidad y el sentido del copy. No añadir dependencias sin avisar.
6. **Ver el resultado renderizado** (captura de Figma o del navegador), no solo el código. Muchas señales solo se ven renderizadas.
7. **Reauditar** con el catálogo. Objetivo: cero P0, y explicar cada P1 que quede. Si algo ya es distintivo, decirlo y no inventar problemas.

## Reglas de decisión
- **Tipografía:** emparejar una display con una de texto con contraste real (serif + sans geométrica, display + mono). Saltos de tamaño de 3x o más y contrastes de peso fuertes. Evitar Inter, Roboto, Arial, Open Sans, Lato o system por defecto, y no caer en la "nueva fuente segura" (Space Grotesk, Geist, Syne, Sora, Instrument Serif, Fraunces) salvo que ya sea la fuente de la marca.
- **Color:** 60/30/10. Un dominante, un secundario, un acento escaso. Nada de degradados índigo/violeta→azul, texto con degradado ni sombras de color brillante. Los degradados, si hay, en un solo tono.
- **Composición:** romper la simetría (héroes a la izquierda, divididos o guiados por la tipografía). Variar el ancho según el papel de cada sección. Evitar la plantilla "hero + 3 tarjetas iguales + CTA".
- **Componentes:** radio y sombra según el rol, no iguales en todo. Glassmorphism solo donde de verdad hay capas. Diseñar estados (hover, focus, activo, vacío, error).
- **Espaciado:** escala con ritmo, no el mismo hueco en todo.
- **Movimiento:** un lenguaje compartido (misma curva y duraciones) y uno o dos momentos clave orquestados. Nada de "fade-up" idéntico en cada bloque ni micro-interacciones sueltas por todas partes. Lento y sobrio si el tono es profesional.
- **Copy:** decir qué hace y para quién, con datos concretos. Fuera "elevate", "seamless", "potente", "de otro nivel". Sin flechas → pegadas a los botones.
- **Imagen:** fotos reales del producto. Nada de stock genérico, blobs 3D, avatares generados ni cajas grises.
- **Fondos:** crear atmósfera con capas sutiles, texturas o patrones del propio contexto, no un color plano por defecto.

## Catálogo de señales (P0 = grita IA, P1 = se nota, P2 = cosmético)
**Tipografía:** T1 P0 solo Inter/system/Roboto/Arial · T2 P1 una fuente "de moda" como único gesto · T3 P1 titular sans con una palabra serif en cursiva · T4 P1 Geist por defecto · T5 P2 eyebrow en mayúsculas espaciadas en cada sección.
**Color:** C1 P0 degradado violeta→azul · C2 P1 botones índigo/violeta · C3 P1 tema oscuro gris sobre gris con acento morado · C4 P0/P1 varios colores con el mismo peso · C5 P2 sombras de color brillante · C6 P0 titular con texto en degradado.
**Layout:** L1 P0 pastilla + H1 centrado + subtítulo + CTAs centrados · L2 P0 fila de 3 tarjetas iguales con icono · L3 P1 grid de tamaños mezclados por reflejo · L4 P1 franja de cifras redondas (10.000+, 99,9%, 4,9★) · L5 P2 "cómo funciona" 1-2-3 con números grandes · L6 P1 todas las secciones en el mismo contenedor centrado · L7 P1 tres planes con el del medio destacado · L8 P1 footer de 4 columnas + newsletter + redes.
**Componentes:** K1 P0 shadcn sin tematizar · K2 P1 mismo radio grande y sombra suave en todo · K3 P1 blur de cristal en todo · K4 P1 franja de color en el borde de las tarjetas · K5 P2 cápsula con destello encima del título · K6 P1 icono en un cuadrado redondeado tintado · K7 P1 sin estados · K8 P1 radio por defecto sin cambiar · K9 P1 superficies zinc con borde white/10.
**Espaciado:** S1 P2 mismos huecos en todo.
**Movimiento:** M1 P2 el mismo fade-and-rise en cada sección · M2 P2 micro-interacciones sin lenguaje común · M3 P2 resplandor degradado animado detrás del producto.
**Iconos:** I2 P1 emojis como viñetas o iconos de navegación · I3 P1 Sparkles, ArrowRight, Zap, Rocket, CheckCircle, Star por defecto.
**Copy:** CP1 P1 titulares vagos que valen para cualquier producto · CP2 P2 superlativos genéricos · CP3 P1 flechas pegadas a botones y enlaces.
**Imagen:** IM1 P1 foto de stock de equipo sonriente · IM2 P1 blobs 3D brillantes · IM3 P2 ilustración "Corporate Memphis" · IM4 P1 avatares de stock y cajas grises.

## Formato del informe de auditoría
Por cada señal: ID, severidad, dónde está (nodo o archivo:línea), por qué se lee como IA y el arreglo propuesto. Al final: puntuación (P0/P1/P2 restantes) y la dirección elegida en 3 a 5 movimientos.

## En Figma
- Leer primero con captura y metadatos, y trabajar solo en el frame indicado.
- Preferir las fuentes, colores y fotos que ya están en el archivo antes que inventar nuevas.
- Para animaciones: un lenguaje común, loops que cierren sin salto y sin rebotes, salvo que se pidan.
- Terminar siempre con una captura del resultado y una segunda pasada crítica.

## Advertencia
Ninguna skill garantiza un gran diseño. Hacen falta referencias visuales, un objetivo claro y revisar el resultado renderizado.