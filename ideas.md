# Brainstorm de Diseño — vistoenmaps.com

## Contexto
Directorio de profesionales y negocios locales optimizado para SEO local y visibilidad en Google Maps. Público objetivo: usuarios españoles buscando servicios locales (cerrajeros, fontaneros, electricistas, etc.). El diseño debe transmitir **confianza, profesionalidad y cercanía local**.

---

<response>
## Idea 1 — "Cartografía Urbana"

<text>

### Design Movement
**Neo-Brutalist Cartographic** — Inspirado en la estética de mapas urbanos y señalización de ciudades europeas. Líneas definidas, tipografía fuerte, colores de alta legibilidad.

### Core Principles
1. **Legibilidad absoluta**: Cada elemento debe ser inmediatamente comprensible, como una señal de tráfico
2. **Jerarquía espacial**: Uso de bloques de color sólido para delimitar secciones, como zonas en un mapa
3. **Funcionalidad directa**: Cero decoración innecesaria, cada pixel tiene propósito
4. **Identidad local**: Paleta que evoca ciudades españolas (terracota, azul mediterráneo, blanco cal)

### Color Philosophy
- Fondo principal: Blanco cálido (#FAFAF7) — evoca paredes encaladas
- Primario: Azul profundo (#1B4965) — confianza, profesionalidad, cielo nocturno mediterráneo
- Acento: Terracota (#C45B28) — calidez, cercanía, tejados españoles
- Texto: Gris carbón (#2D2D2D) — máxima legibilidad
- Superficies: Gris claro (#F0EFEB) — tarjetas y contenedores

### Layout Paradigm
Grid asimétrico con sidebar de navegación contextual. Las páginas de listado usan un layout de "mapa + lista" donde la lista ocupa 60% y el área de mapa/visual 40%. Mobile-first con stack vertical.

### Signature Elements
1. **Indicadores de pin de mapa** como bullets y marcadores de categoría
2. **Bordes gruesos** (2-3px) en tarjetas, estilo mapa topográfico
3. **Badge de valoración** circular prominente en cada ficha de negocio

### Interaction Philosophy
Transiciones rápidas y directas. Hover states con desplazamiento sutil (2-4px). Click feedback inmediato. Sin animaciones largas — el usuario busca un servicio urgente.

### Animation
- Entrada de tarjetas: fade-in + slide-up escalonado (150ms delay entre items)
- Hover en tarjetas: elevación sutil con sombra
- Breadcrumbs: transición de color suave al navegar
- Iconos de categoría: escala sutil al hover (1.05)

### Typography System
- Display/Títulos: **DM Sans Bold** — geométrica, moderna, alta legibilidad
- Body: **DM Sans Regular** — consistencia tipográfica
- Datos/Números: **DM Sans Medium** — para teléfonos, valoraciones, horarios

</text>
<probability>0.08</probability>
</response>

---

<response>
## Idea 2 — "Directorio Premium"

<text>

### Design Movement
**Swiss Minimalism meets Local Commerce** — Limpieza suiza con calidez española. Espacios generosos, tipografía impecable, microinteracciones elegantes.

### Core Principles
1. **Espacio como lujo**: Márgenes amplios, padding generoso, respiración visual
2. **Confianza por diseño**: Elementos que transmiten seriedad y profesionalidad
3. **Accesibilidad primero**: Contraste alto, tamaños generosos, touch targets amplios
4. **Escalabilidad visual**: El diseño debe funcionar igual con 5 negocios que con 500

### Color Philosophy
- Fondo: Blanco puro (#FFFFFF) con superficies en gris perla (#F7F7F5)
- Primario: Verde bosque (#1A5632) — confianza, verificación, "visto bueno"
- Acento: Ámbar cálido (#D4A853) — premium, destacado, estrella de valoración
- Texto principal: Negro suave (#1A1A1A)
- Texto secundario: Gris medio (#6B7280)

### Layout Paradigm
Layout de contenido centrado con max-width de 1200px. Páginas de categoría con grid de 3 columnas en desktop, 2 en tablet, 1 en mobile. Header sticky con búsqueda integrada. Footer rico con mapa del sitio.

### Signature Elements
1. **Checkmark verde** como motivo recurrente (verificado, "visto" en maps)
2. **Líneas divisorias finas** entre secciones, estilo editorial
3. **Contador de negocios** como badge en cada enlace de navegación

### Interaction Philosophy
Elegante y contenida. Hover con cambio de color de fondo suave. Focus states visibles y accesibles. Transiciones de 200ms ease-out. El diseño no distrae, facilita.

### Animation
- Page transitions: fade simple (200ms)
- Cards: hover con translate-y -2px y sombra expandida
- Breadcrumbs: underline animado de izquierda a derecha
- Contadores: número que incrementa al entrar en viewport
- CTA buttons: escala 1.02 al hover con transición suave

### Typography System
- Display: **Plus Jakarta Sans ExtraBold** — moderna, premium, excelente en títulos grandes
- Body: **Plus Jakarta Sans Regular/Medium** — legibilidad perfecta
- Monospace para datos: **JetBrains Mono** — teléfonos y códigos postales

</text>
<probability>0.06</probability>
</response>

---

<response>
## Idea 3 — "Mapa Vivo"

<text>

### Design Movement
**Organic Data Visualization** — Inspirado en interfaces de mapas modernos (Google Maps, Citymapper) con toques de diseño orgánico español.

### Core Principles
1. **El mapa es el protagonista**: Todo gira alrededor de la localización
2. **Capas de información**: Datos revelados progresivamente, no todo de golpe
3. **Colores de mapa**: Paleta inspirada en cartografía moderna
4. **Rapidez de escaneo**: El usuario debe encontrar lo que busca en <3 segundos

### Color Philosophy
- Fondo: Gris muy claro (#F8F9FA) — como fondo de mapa
- Primario: Azul Google Maps (#4285F4) — familiaridad, confianza digital
- Acento: Rojo pin (#EA4335) — urgencia, localización, CTA
- Secundario: Verde verificado (#34A853) — disponible, abierto, positivo
- Superficies: Blanco (#FFFFFF) con sombras suaves

### Layout Paradigm
Layout fluido con cards flotantes sobre fondos de color. En desktop, sidebar izquierda con filtros + área principal con grid de resultados. Inspirado en la interfaz de Google Maps con panel lateral.

### Signature Elements
1. **Pin de mapa animado** como logo/identidad
2. **Chips de filtro** redondeados estilo Material Design
3. **Mini-mapa** o indicador de zona en cada tarjeta de negocio

### Interaction Philosophy
Fluida y responsiva como una app nativa. Gestos de swipe en mobile. Cards expandibles con más detalle. Feedback háptico visual (ripple effects sutiles).

### Animation
- Cards: entrada con stagger animation desde abajo
- Pins: bounce animation al aparecer
- Filtros: slide horizontal con spring physics
- Transiciones de página: slide lateral (como navegación de mapa)
- Skeleton loading: shimmer effect mientras cargan datos

### Typography System
- Display: **Outfit Bold** — geométrica, moderna, tech-friendly
- Body: **Outfit Regular** — limpia, excelente en pantalla
- Datos: **Outfit Medium** — números y datos destacados

</text>
<probability>0.07</probability>
</response>
