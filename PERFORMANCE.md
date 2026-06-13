# PERFORMANCE.md — Checklist y mantenimiento
### Renacer de la Espiga

---

## Checklist de performance — antes vs. después

| Ítem | Antes | Después |
|------|:-----:|:-------:|
| Imagen Open Graph optimizada | ❌ 518 KB | ✅ 91 KB (−82 %) |
| apple-touch-icon dimensionado | ❌ 518 KB | ✅ 20 KB (180×180) |
| Iconos sin duplicar (sprite SVG) | ❌ WhatsApp ×11 | ✅ 1 sola definición |
| HTML libre de SVG repetidos | ❌ | ✅ |
| `loading="lazy"` en imágenes no críticas | ❌ | ✅ |
| `width`/`height` en imágenes (evita CLS) | ✅ | ✅ |
| Sin frameworks/JS de terceros | ✅ | ✅ (0 dependencias) |
| Fuentes con `preconnect` + `display=swap` | ✅ | ✅ |
| `manifest.webmanifest` (PWA básica) | ❌ | ✅ |
| Schema de producto (JSON-LD) | ❌ | ✅ |
| Compresión/minify en edge (Cloudflare) | ⚠️ por activar | ⚠️ activar en panel |
| HTTPS + cabeceras de seguridad | ✅ | ✅ |

### Pesos del front (transferible, sin originales)

| Archivo | Peso aprox. | Nota |
|---------|------------:|------|
| index.html | ~41 KB | El sprite quitó ~9 KB de iconos duplicados, pero se sumó el armador de pedido, los steppers y el schema de productos → peso neto similar con mucha más funcionalidad y **cero** duplicación de iconos |
| css/styles.css | ~28 KB | |
| js/script.js | ~14 KB | |
| assets/ (logos SVG + iconos PNG) | ~290 KB | incluye `logo-4000px.png` original (518 KB) que **no se referencia** desde la web; se puede excluir del deploy |

> Con Brotli de Cloudflare, el HTML/CSS/JS se transfiere a ~1/4 de su tamaño.
> El SVG sprite también permite cachear los iconos junto al HTML sin requests extra.

---

## Cómo medir (validación real)

```bash
python3 -m http.server 8080
npx lighthouse http://localhost:8080 --view --preset=desktop
npx lighthouse http://localhost:8080 --view --form-factor=mobile
```
- PageSpeed Insights: https://pagespeed.web.dev/
- Rich Results (schema): https://search.google.com/test/rich-results
- Accesibilidad: https://wave.webaim.org/

**Objetivos:** Performance ≥ 90, Accesibilidad ≥ 90, LCP < 2.5 s, CLS < 0.1,
INP < 200 ms.

---

## Activar optimizaciones en Cloudflare (una vez)

1. **Speed → Optimization → Auto Minify:** activar HTML, CSS y JS.
2. **Speed → Brotli:** activado (por defecto).
3. **Caching → Browser Cache TTL:** ≥ 1 mes para `assets/`.
4. **SSL/TLS:** Full (strict). HSTS ya va en `_headers`.

---

## Mantenimiento mensual recomendado

- [ ] Correr Lighthouse (móvil y escritorio) y registrar puntajes.
- [ ] Revisar que los **datos por confirmar** se hayan actualizado (WhatsApp,
      email, dirección, horario, precios, costos de despacho).
- [ ] Verificar que el **botón flotante y el armador de pedido** abran WhatsApp
      con el número correcto.
- [ ] Probar el **formulario de contacto** (envío real a Formspree).
- [ ] Revisar imágenes nuevas: que estén optimizadas (< 200 KB) y con `alt`.
- [ ] Validar el **schema** en Rich Results Test si se añadieron productos/precios.
- [ ] Revisar enlaces rotos y que el `sitemap.xml` liste las URLs vigentes.
- [ ] Confirmar que el certificado SSL y las cabeceras de seguridad siguen activos.

## Mantenimiento trimestral

- [ ] Tomar fotos reales de productos y reemplazar ilustraciones (con WebP).
- [ ] Revisar textos/precios de temporada.
- [ ] Hacer respaldo del repositorio (push a GitHub).
