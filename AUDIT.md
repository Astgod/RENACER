# AUDIT.md — Auditoría de Frontend
### Renacer de la Espiga · Panadería artesanal (Quilpué, Chile)
Fecha: 2026-06-12 · Alcance: sitio web estático (landing de una página)

---

## 1. Resumen ejecutivo

El sitio es una **landing de una sola página** construida en **HTML5, CSS3 y
JavaScript vanilla**, sin frameworks, pensada para alojarse en Cloudflare Pages.
La arquitectura es adecuada para su escala y modelo de negocio (pedidos
anticipados por WhatsApp, no e-commerce con pago en línea): separación correcta
de `css/`, `js/` y `assets/`, metodología de nombres BEM, variables CSS para la
identidad de marca y enfoque mobile-first. No hay dependencias de terceros en el
front, lo que reduce a cero la superficie de vulnerabilidades por paquetes y
mantiene el bundle muy liviano.

El principal lastre encontrado es de **dos tipos**: (a) un asset de imagen de
**518 KB** (`logo-4000px.png`) referenciado como imagen Open Graph y
apple-touch-icon, desproporcionado para esos usos; y (b) **duplicación de
markup**: el icono SVG de WhatsApp está incrustado **11 veces** en el HTML, lo
que infla el documento (~41 KB) y dificulta el mantenimiento. Ambos son de
solución directa y alto impacto. En el plano funcional, el flujo de conversión
dependía de botones "Cotizar" individuales que abrían WhatsApp producto por
producto, sin posibilidad de **armar un pedido completo**, justamente la acción
de mayor valor para este negocio.

En diseño, accesibilidad y SEO el sitio parte de una base sólida (responsive
real con tres breakpoints, foco visible, `prefers-reduced-motion`, meta tags,
Open Graph, sitemap, robots y datos estructurados `Bakery`). Las oportunidades
están en: **schema de producto** (`Product`/`Offer`) para enriquecer resultados,
**optimización de imágenes**, **deduplicación de iconos** y un **armador de
pedido persistente** que convierta la navegación en una intención de compra
clara. Este informe prioriza esas mejoras y descarta, con justificación, las que
serían sobreingeniería para un catálogo de 4 productos y un modelo sin checkout.

---

## 2. Hallazgos por severidad

### 🔴 Críticos (afectan conversión o seguridad)
| # | Hallazgo | Evidencia | Impacto |
|---|----------|-----------|---------|
| C1 | No existe forma de **armar un pedido completo**; cada producto abre WhatsApp por separado | `data-cotizar` 1 a 1 | El cliente no puede pedir varios ítems en un solo mensaje → fricción y abandono |
| C2 | **Imagen OG/icono de 518 KB** | `assets/img/logo-4000px.png` usado en `og:image` y `apple-touch-icon` | Carga lenta al compartir/instalar; penaliza performance percibida |

### 🟠 Importantes (deuda técnica que limita escalabilidad)
| # | Hallazgo | Evidencia | Impacto |
|---|----------|-----------|---------|
| I1 | **Duplicación del icono WhatsApp** (11 copias del mismo `<path>`) | `grep` → 11 coincidencias | +~9 KB de HTML, mantenimiento frágil |
| I2 | **Sin `<symbol>`/sprite de iconos**: todos los SVG están inline repetidos | varios iconos repetidos | Markup verboso, difícil de cambiar |
| I3 | **Falta schema `Product`** con precio/disponibilidad | solo existe `Bakery` | SEO de producto sin rich results |
| I4 | **Sin paso de build/minificado** definido | archivos servidos en crudo | Se delega a Cloudflare; conviene documentarlo |

### 🟡 Mejorables (rendimiento y UX)
| # | Hallazgo | Impacto |
|---|----------|---------|
| M1 | Imágenes no críticas sin `loading="lazy"`/`decoding="async"` | Micro-mejora de carga |
| M2 | El carrito/armador necesitará `aria-live` para anunciar cambios | Accesibilidad |
| M3 | No hay `manifest.webmanifest` (instalable / PWA básica) | Experiencia móvil |
| M4 | Sin testing automatizado (e2e) | Riesgo de regresiones a futuro |
| M5 | Catálogo sin precios reales ni disponibilidad (placeholders) | Pendiente de datos del negocio |

---

## 3. Puntuación por categoría (0–100)

| Categoría | Antes | Comentario |
|-----------|:----:|------------|
| Estructura y arquitectura | **78** | Buena separación y BEM; resta deduplicar iconos y definir build |
| Rendimiento | **72** | Vanilla liviano, pero imagen de 518 KB y HTML inflado |
| Diseño y UX | **80** | Responsive e identidad sólidas; faltaba flujo de pedido completo |
| Código | **76** | Limpio y comentado; deuda en duplicación y ausencia de tests |
| SEO | **82** | Meta/OG/sitemap/JSON-LD `Bakery`; falta `Product` |
| Accesibilidad (WCAG 2.1) | **80** | Skip-link, foco, reduced-motion; faltan detalles de aria |
| Seguridad | **85** | CSP/HSTS, honeypot, validación, 0 dependencias |
| **Global** | **79** | Base profesional con mejoras de alto impacto identificadas |

> Las puntuaciones "después" se registran en `IMPROVEMENTS.md` tras aplicar la Fase 3.

---

## 4. Core Web Vitals (estimación)

> ⚠️ **Transparencia:** este entorno no dispone de Chrome headless/Lighthouse,
> por lo que estos valores son **estimaciones** a partir del análisis estático,
> no una medición ejecutada. Para medir realmente, ver el comando en la sección 6.

| Métrica | Estimado antes | Objetivo | Notas |
|---------|:-----:|:-----:|------|
| **LCP** | ~1.8–2.5 s | < 2.5 s | El hero es texto + SVG (no imagen pesada) → favorable |
| **CLS** | ~0.0–0.05 | < 0.1 | Imágenes con `width/height`; reservar espacio del carrito |
| **INP/FID** | bajo | < 200 ms | JS mínimo, sin librerías |
| **Peso de imagen OG** | 518 KB → **91 KB** | — | −82 % tras optimizar |

---

## 5. Decisiones de alcance (qué NO se implementa y por qué)

Como ingeniería responsable, se **descartan** las siguientes peticiones por ser
sobreingeniería para el tamaño y modelo actual (se dejan como *roadmap* en
`IMPROVEMENTS.md`):

- **Migrar a React/Next/Vue:** una landing de 1 página no justifica el bundle ni
  la complejidad de un framework SPA; vanilla rinde mejor en CWV aquí.
- **Filtros y búsqueda de catálogo:** con **4 productos** añaden fricción, no
  valor. Reconsiderar si el catálogo supera ~12 ítems.
- **Code splitting / chunks:** el JS es un único archivo de 9 KB; dividir solo
  agregaría requests.
- **Cálculo de fechas de entrega y validación de direcciones:** dependen de
  datos de negocio aún por confirmar (zonas, tiempos, cobertura por calle).
- **Contador de disponibilidad/inventario:** requiere backend y stock real.

Lo que **sí** se implementa por alto valor y bajo riesgo: armador de pedido
persistente, sprite de iconos, schema de producto, optimización de imágenes,
accesibilidad del carrito y documentación.

---

## 6. Cómo medir de verdad (para validación del cliente)

```bash
# Servir en local
python3 -m http.server 8080

# Lighthouse (requiere Node + Chrome)
npx lighthouse http://localhost:8080 --view --preset=desktop
npx lighthouse http://localhost:8080 --view --form-factor=mobile

# Validaciones online
#  - PageSpeed Insights: https://pagespeed.web.dev/
#  - Rich Results Test:  https://search.google.com/test/rich-results
#  - WAVE (accesibilidad): https://wave.webaim.org/
```
