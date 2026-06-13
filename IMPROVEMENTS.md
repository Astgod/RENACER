# IMPROVEMENTS.md — Cambios realizados
### Renacer de la Espiga · Refactorización de frontend
Fecha: 2026-06-12 · Base: ver `AUDIT.md`

Este documento explica **qué** se cambió, **por qué** y con **qué impacto
medible**. Cada bloque mapea a un hallazgo del informe de auditoría.

---

## Fase 1 · Estructura

**Sprite de iconos SVG** *(resuelve I1, I2)*
- **Antes:** el `<path>` del icono de WhatsApp estaba incrustado **11 veces** en
  el HTML; otros iconos también se repetían inline.
- **Después:** todos los iconos se definen **una sola vez** en un
  `<svg class="svg-sprite">` con `<symbol>` y se referencian con
  `<svg class="icon"><use href="#ic-..."></use></svg>`.
- **Por qué:** elimina duplicación, centraliza el cambio de un icono en un único
  lugar y reduce el peso del HTML.
- **Impacto:** un solo punto de verdad para 18 iconos; HTML más mantenible.

> No se migró a un framework SPA (React/Next/Vue) **a propósito**: para una
> landing de una página, el coste en bundle y complejidad empeora los Core Web
> Vitals. Vanilla es la decisión correcta aquí (ver `AUDIT.md §5`).

---

## Fase 2 · Rendimiento

**Optimización de imágenes con `sips`** *(resuelve C2)*

| Asset | Antes | Después | Reducción |
|-------|------:|--------:|:---------:|
| Imagen Open Graph | 518 KB (4000 px) | **91 KB** (`og-cover.png`, 1200×630) | **−82 %** |
| apple-touch-icon | 518 KB (reutilizaba el de 4000 px) | **20 KB** (180×180) | **−96 %** |
| Icono PWA 512 | — | 82 KB (`icon-512.png`) | nuevo |

- **Por qué:** una imagen de 4000 px para previsualización social y para el icono
  de iOS es enorme e innecesaria; afecta a la carga al compartir e instalar.
- **`loading="lazy"` + `decoding="async"`** en imágenes no críticas (logo del
  footer) para no competir con el render inicial.
- **Minificado/compresión:** se delega a **Cloudflare** (Auto Minify + Brotli),
  que comprime HTML/CSS/JS en el edge. **Por qué no minificar a mano:** generar
  archivos `.min` duplicados crea dos fuentes de verdad y deuda de
  mantenimiento; Cloudflare lo hace sin esa penalización (ver checklist).

---

## Fase 3 · Diseño

- **Identidad coherente** mantenida vía variables CSS del manual de marca
  (colores, tipografías Playfair Display + Lora, espaciado).
- **Consistencia de componentes:** botones, inputs y tarjetas comparten radios,
  sombras y estados *hover/focus* unificados (ver `COMPONENTS.md`).
- **Stepper de cantidad** nuevo, accesible y consistente con la estética.
- **Validación de formulario en tiempo real** (el error se limpia al corregir el
  campo) ya presente; se reforzó el foco al primer campo inválido.

---

## Fase 4 · Funcionalidad — Armador de pedido persistente *(resuelve C1)*

La mejora de mayor impacto en conversión. **Adaptada al modelo del negocio**
(pedido anticipado por WhatsApp, sin pago en línea):

- **Selector de cantidad** por producto (mínimo 20 unidades, con `−`/`+` e input
  editable).
- **"Agregar al pedido"** acumula productos y cantidades en un **carrito
  persistente** guardado en `localStorage` (`renacer_pedido_v1`), que **sobrevive
  recargas**.
- **Barra inferior** que aparece al haber productos, con contador de productos y
  unidades, y acceso rápido a enviar.
- **Panel (drawer) editable**: cambiar cantidades, quitar ítems, vaciar.
- **Envío único por WhatsApp:** compone **un solo mensaje** con todo el pedido
  (producto + cantidades) y la pregunta por precio y tiempo de elaboración.
- **Por qué así y no un checkout con pago:** el negocio cierra y cobra por
  WhatsApp/transferencia; un carrito con pasarela sería infraestructura que no se
  usa. Este diseño respeta el flujo real y reduce la fricción de pedir varios
  productos.

> **Cambio de comportamiento avisado:** el botón "Cotizar" individual anterior se
> **evolucionó** a "Agregar al pedido". No se perdió la posibilidad de cotizar
> por WhatsApp: ahora se hace con el pedido completo (uno o varios productos).

**Descartado con justificación** (roadmap, ver más abajo): cálculo automático de
fechas de entrega, validación de direcciones, filtros/búsqueda y contador de
inventario — dependen de datos/infra aún inexistentes o son sobreingeniería para
4 productos.

---

## Fase 5 · SEO y Meta

- **Schema `ItemList` + `Product`** (JSON-LD) para el catálogo, además del
  `Bakery` ya existente. *(resuelve I3)*
  - Cuando se confirmen precios, añadir `offers` con `price`/`priceCurrency`
    `CLP` y `availability: PreOrder` (plantilla comentada en el HTML).
- **Open Graph** actualizado a la imagen optimizada con `og:image:width/height`.
- **`manifest.webmanifest`** añadido (PWA básica instalable). *(resuelve M3)*
- `sitemap.xml` y `robots.txt` ya existentes, verificados.

---

## Fase 6 · Documentación

- `AUDIT.md` — auditoría y puntuaciones.
- `IMPROVEMENTS.md` — este documento.
- `COMPONENTS.md` — guía de uso de componentes y del armador de pedido.
- `README.md` — actualizado con la nueva estructura y datos por confirmar.

---

## Accesibilidad (WCAG 2.1) *(resuelve M2)*

- Steppers con `aria-label` por producto y botones `−`/`+` etiquetados.
- Región `aria-live` (`#srAnnounce`) que **anuncia** los cambios del pedido a
  lectores de pantalla ("40 unidades agregadas…", "Producto quitado…").
- Drawer con `role="dialog"`, `aria-modal`, cierre con `Esc`, foco gestionado.
- Se respeta `prefers-reduced-motion`.

---

## Puntuación por categoría — antes → después

| Categoría | Antes | Después | Δ |
|-----------|:----:|:------:|:--:|
| Estructura y arquitectura | 78 | **88** | +10 |
| Rendimiento | 72 | **90** | +18 |
| Diseño y UX | 80 | **91** | +11 |
| Código | 76 | **86** | +10 |
| SEO | 82 | **92** | +10 |
| Accesibilidad (WCAG 2.1) | 80 | **89** | +9 |
| Seguridad | 85 | **86** | +1 |
| **Global** | **79** | **89** | **+10** |

> Las puntuaciones son una valoración experta basada en el análisis estático, no
> en una corrida de Lighthouse (este entorno no tiene Chrome headless). Validar
> con los comandos de `AUDIT.md §6`.

---

## Roadmap (no implementado, recomendado por fases)

1. **Datos reales:** número de WhatsApp, email, dirección, horario, **precios** y
   costos de despacho → desbloquea `offers` en schema y quita los *badges* "por
   confirmar".
2. **Cálculo de fecha de entrega por zona:** definir tiempos por comuna y mostrar
   "entrega estimada".
3. **Fotos reales de productos** (reemplazar ilustraciones SVG) con `srcset` y
   formato WebP/AVIF.
4. **Testing e2e** con Playwright (flujo: armar pedido → abrir WhatsApp).
5. **Analítica** (Cloudflare Web Analytics, sin cookies) para medir conversión.
