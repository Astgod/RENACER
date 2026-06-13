# COMPONENTS.md — Guía de componentes
### Renacer de la Espiga · Sistema de UI (HTML/CSS/JS vanilla)

Guía de uso de los componentes y patrones del sitio. Todo se basa en **variables
CSS** (`:root` en `css/styles.css`) y metodología **BEM** para los nombres.

---

## Tokens de marca (variables CSS)

```css
--color-crema: #F9EDD5;     /* fondo principal */
--color-dorado: #C89B38;    /* acentos, botones */
--color-marron: #7B4C18;    /* texto y titulares */
--color-dorado-claro: #E3C790;
--color-salvia: #8A9A5B;    /* badges/etiquetas */
--color-cafe: #4A3520;      /* texto alternativo */
--font-titulo: "Playfair Display";  /* títulos y logo */
--font-cuerpo: "Lora";              /* cuerpo y precios */
```

Usa siempre estas variables; no escribas colores "a mano".

---

## Iconos (sprite SVG)

Definidos una vez en el `<svg class="svg-sprite">` al inicio del `<body>`.
Para usar cualquiera:

```html
<svg class="icon" aria-hidden="true"><use href="#ic-wa"></use></svg>
```

IDs disponibles: `ic-wa`, `ic-pin`, `ic-arrow-right`, `ic-wheat`, `ic-clock`,
`ic-truck`, `ic-chevron-down`, `ic-chevron-up`, `ic-list`, `ic-check`,
`ic-receipt`, `ic-mail`, `ic-instagram`, `ic-info`, `ic-plus`, `ic-minus`,
`ic-cart`, `ic-trash`, `ic-x`.

- El icono hereda el color del texto (`currentColor`).
- Para agregar un icono nuevo: añade un `<symbol id="ic-...">` al sprite.

---

## Botones — `.btn`

```html
<a class="btn btn--primary" href="#productos">Ver productos
  <svg class="icon" aria-hidden="true"><use href="#ic-arrow-right"></use></svg>
</a>
<a class="btn btn--whatsapp" href="#" data-wa-cta>Cotiza por WhatsApp</a>
```

Modificadores: `--primary` (dorado), `--whatsapp` (verde), `--sm` (compacto),
`--block` (ancho completo). Altura mínima 46 px (44 px táctil accesible).

---

## Tarjeta de producto — `.producto`

Estructura mínima para que el armador de pedido la reconozca:

```html
<article class="producto" data-producto>
  <div class="producto__img">
    <span class="producto__min-badge">Mín. 20 un.</span>
    <svg class="producto__ilustracion" viewBox="0 0 120 120">…</svg>
  </div>
  <div class="producto__body">
    <h3 class="producto__nombre" id="p-mi-id">Nombre</h3>
    <p class="producto__desc">Descripción…</p>
    <p class="producto__precio"><span class="producto__precio-label">Precio</span> Consultar</p>
    <div class="producto__pedido">
      <div class="stepper" data-stepper>…</div>
      <button class="btn btn--primary btn--block producto__add"
              data-add data-id="mi-id" data-nombre="Nombre">
        <svg class="icon"><use href="#ic-cart"></use></svg>
        <span class="producto__add-label">Agregar al pedido</span>
      </button>
    </div>
  </div>
</article>
```

**Atributos clave**
- `data-id` — identificador único y estable (slug). Es la clave del pedido.
- `data-nombre` — nombre legible que aparece en el mensaje de WhatsApp.

> Para **añadir un producto nuevo**: copia una tarjeta, cambia `data-id`,
> `data-nombre`, el `id` del `<h3>`, la ilustración y el texto. El JS lo detecta
> automáticamente (no hay que tocar `script.js`). Recuerda añadirlo también al
> JSON-LD `ItemList` y al `sitemap` si corresponde.

---

## Selector de cantidad — `.stepper`

```html
<div class="stepper" data-stepper>
  <button type="button" class="stepper__btn" data-step="-1" aria-label="Restar"><svg class="icon"><use href="#ic-minus"></use></svg></button>
  <input class="stepper__input" type="number" inputmode="numeric" value="20" min="20" step="1" aria-label="Cantidad de …">
  <button type="button" class="stepper__btn" data-step="1" aria-label="Sumar"><svg class="icon"><use href="#ic-plus"></use></svg></button>
</div>
```

- Mínimo configurable en JS (`MINIMO_UNIDADES = 20`).
- El botón `−` se deshabilita al llegar al mínimo.
- Se reutiliza tanto en la tarjeta como dentro del drawer del pedido.

---

## Armador de pedido (carrito persistente)

Tres piezas conectadas por el JS:

1. **Barra inferior** `#orderBar` — aparece al tener productos. Muestra contador
   y botón "Enviar pedido".
2. **Drawer** `#orderDrawer` — panel lateral con la lista editable, total y envío.
3. **Estado** — objeto `{ id: cantidad }` en `localStorage` con clave
   `renacer_pedido_v1`. Persiste entre recargas.

**Flujo:** elegir cantidad → "Agregar al pedido" → (se acumula y guarda) →
barra/drawer → "Enviar pedido por WhatsApp" → se abre WhatsApp con un único
mensaje:

```
Hola Renacer de la Espiga, quiero hacer este pedido:
• Pan amasado: 40 unidades
• Sopaipillas: 20 unidades

¿Me confirman el precio total y el tiempo de elaboración? Gracias.
```

**Configuración** (en `js/script.js`, arriba del todo):
```js
var WHATSAPP_NUMERO = "56900000000"; // ← número real (sin +, sin espacios)
var MINIMO_UNIDADES = 20;            // ← mínimo por producto
```

---

## Enlaces de WhatsApp — `data-wa-cta`

Cualquier elemento con `data-wa-cta` se convierte en un enlace de WhatsApp.
Opcional: `data-wa-text="mensaje personalizado"`.

```html
<a href="#" data-wa-cta data-wa-text="Hola, quiero consultar el despacho.">Consultar</a>
```

---

## Formulario de contacto — `#contactForm`

- Validación en cliente (nombre, email, mensaje) con foco al primer error.
- **Honeypot** anti-spam (campo `_gotcha` oculto).
- Envío a **Formspree** vía `fetch`; si no está configurado el endpoint,
  ofrece continuar por WhatsApp (degradación elegante).

Configurar: reemplazar `TU_FORM_ID` en el `action` del `<form>`.

---

## Utilidades

- `.reveal` — animación de aparición al hacer scroll (se activa solo con JS).
- `.sr-only` — visible solo para lectores de pantalla.
- `.badge` — etiqueta tipo "Consultar" / "por confirmar".
- `.container` — ancho máximo centrado (1180 px) con padding lateral responsive.
