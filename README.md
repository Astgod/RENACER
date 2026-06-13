# Renacer de la Espiga — Sitio web

Página web estática y responsive para **Renacer de la Espiga**, panadería
artesanal en Quilpué, Chile. Permite ver el catálogo de productos, **armar un
pedido** y enviarlo completo por WhatsApp, entender el proceso, conocer las zonas
de entrega y contactar al negocio.

> **Documentación del proyecto:** [`AUDIT.md`](AUDIT.md) (auditoría),
> [`IMPROVEMENTS.md`](IMPROVEMENTS.md) (cambios), [`COMPONENTS.md`](COMPONENTS.md)
> (guía de componentes) y [`PERFORMANCE.md`](PERFORMANCE.md) (checklist y
> mantenimiento).

## 🧱 Stack

- **HTML5, CSS3 y JavaScript vanilla** (sin frameworks).
- **Mobile-first**, breakpoints en 320 / 768 / 1024 px.
- **Hosting:** Cloudflare Pages (sitio estático).
- **Dominio:** renacerdelaespiga.cl (nic.cl).

## 📁 Estructura

```
.
├── public/                 # ← lo único que se publica (assets de Cloudflare)
│   ├── index.html          # Página única (sprite de iconos + armador de pedido)
│   ├── css/styles.css      # Estilos (mobile-first, variables de marca, BEM)
│   ├── js/script.js        # Menú, WhatsApp, validación, scroll-spy y carrito
│   ├── assets/             # Logos SVG, favicon, og-cover, iconos PNG
│   ├── manifest.webmanifest
│   ├── _headers            # Cabeceras de seguridad
│   ├── robots.txt
│   └── sitemap.xml
├── wrangler.jsonc          # Config de despliegue (sirve ./public)
├── .htaccess               # Cabeceras de seguridad (Apache, alternativa)
├── .env.example            # Variables de entorno (plantilla)
├── AUDIT.md · IMPROVEMENTS.md · COMPONENTS.md · PERFORMANCE.md
└── .gitignore
```

> La documentación y la configuración viven en la **raíz** y **no se publican**:
> Cloudflare sólo sirve la carpeta `public/`.

## 🛒 Armador de pedido

El catálogo permite elegir cantidades (mínimo 20 por producto) y **acumular
varios productos** en un pedido que se guarda en `localStorage` (persiste al
recargar). El botón "Enviar pedido" abre WhatsApp con un único mensaje que lista
todo. Ver detalle en [`COMPONENTS.md`](COMPONENTS.md).

## ⚙️ Datos a completar antes de publicar

Estos valores están como **placeholder** y deben actualizarse:

| Dato | Dónde se edita |
|------|----------------|
| Número de WhatsApp | `js/script.js` → `WHATSAPP_NUMERO` |
| Endpoint del formulario | `index.html` → `action` del `<form>` (Formspree) |
| Email, dirección, horario, Instagram | textos con la etiqueta "por confirmar" en `index.html` |
| Precios y costos de despacho | actualmente muestran "Consultar" |

> El sitio funciona sin backend: si el formulario aún no tiene endpoint de
> Formspree, el botón "Enviar" ofrece continuar la consulta por WhatsApp.

### Configurar el formulario (Formspree)

1. Crear una cuenta gratuita en [formspree.io](https://formspree.io).
2. Crear un formulario y copiar su ID.
3. En `index.html` reemplazar `TU_FORM_ID` en:
   `action="https://formspree.io/f/TU_FORM_ID"`.

### Configurar el número de WhatsApp

En `js/script.js`, cambiar:

```js
var WHATSAPP_NUMERO = "56900000000"; // formato internacional, sin + ni espacios
```

## 💻 Ejecutar en local

Es un sitio estático; basta abrir `index.html`. Para probar `fetch` y rutas
absolutas conviene un servidor local:

```bash
python3 -m http.server 8080
# luego abrir http://localhost:8080
```

## 🚀 Despliegue en Cloudflare Pages

1. Subir el repositorio a GitHub.
2. En Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**.
3. Configuración de build:
   - **Build command:** (vacío)
   - **Build output directory:** `/`
4. **Custom domains:** agregar `renacerdelaespiga.cl`.
5. En **nic.cl**, apuntar los nameservers a los que indique Cloudflare.
6. HTTPS y certificado SSL se configuran automáticamente.

Las cabeceras de seguridad se aplican vía el archivo `_headers`.

## ♿ Accesibilidad y SEO

- Estructura semántica, `alt` en imágenes, foco visible, enlace "saltar al contenido".
- Meta tags, Open Graph, datos estructurados (schema.org `Bakery`), favicon, sitemap y robots.
- Objetivo: Lighthouse > 90 en Performance y Accesibilidad.

## 🎨 Identidad de marca

Colores, tipografías y uso del logo según el *Manual de Marca Renacer de la
Espiga* (v1.0). Tipografías Playfair Display y Lora cargadas desde Google Fonts.

---

© 2026 Renacer de la Espiga. Todos los derechos reservados.
