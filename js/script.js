/* ============================================================
   Renacer de la Espiga — JavaScript
   Vanilla JS · menú, WhatsApp, validación, scroll-spy,
   reveal on scroll, back-to-top
   ============================================================ */
(function () {
  "use strict";

  /* ----- CONFIGURACIÓN (editar cuando se confirmen los datos) ----- */
  // Número de WhatsApp en formato internacional sin "+", espacios ni guiones.
  // Ejemplo final: "56912345678". Mientras tanto queda como placeholder.
  var WHATSAPP_NUMERO = "56900000000"; // [POR CONFIRMAR]
  var WHATSAPP_SALUDO = "Hola Renacer de la Espiga, ";

  // Marca <html> como "con JS" para activar mejoras progresivas (reveal, etc.)
  document.documentElement.classList.add("js");

  /* ----- Utilidades ----- */
  function buildWaLink(texto) {
    var mensaje = texto || (WHATSAPP_SALUDO + "quiero hacer una consulta.");
    return "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensaje);
  }

  /* ----- 1. Enlaces de WhatsApp ----- */
  document.querySelectorAll("[data-wa-cta]").forEach(function (el) {
    var texto = el.getAttribute("data-wa-text") ||
      (WHATSAPP_SALUDO + "quiero hacer una consulta sobre sus productos.");
    el.setAttribute("href", buildWaLink(texto));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  document.querySelectorAll("[data-cotizar]").forEach(function (el) {
    var producto = el.getAttribute("data-cotizar");
    var texto = WHATSAPP_SALUDO + "quiero cotizar " + producto + ". ¿Cuál es el precio actual?";
    el.setAttribute("href", buildWaLink(texto));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });

  /* ----- 2. Menú móvil con overlay ----- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");
  var navOverlay = document.getElementById("navOverlay");

  function setMenu(abierto) {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("is-open", abierto);
    navToggle.setAttribute("aria-expanded", abierto ? "true" : "false");
    navToggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    if (navOverlay) {
      navOverlay.hidden = !abierto;
      // Forzar reflow para que la transición de opacidad funcione al abrir
      if (abierto) { void navOverlay.offsetWidth; }
      navOverlay.classList.toggle("is-open", abierto);
    }
    document.body.style.overflow = abierto ? "hidden" : "";
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      setMenu(!navMenu.classList.contains("is-open"));
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    if (navOverlay) navOverlay.addEventListener("click", function () { setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("is-open")) setMenu(false);
    });
  }

  /* ----- 3. Header: sombra al hacer scroll ----- */
  var header = document.querySelector(".header");
  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ----- 4. Scroll-spy: resaltar sección activa en el menú ----- */
  var enlaces = Array.prototype.slice.call(
    document.querySelectorAll('.header__menu a[href^="#"]')
  );
  var secciones = enlaces
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && secciones.length) {
    var spy = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.getAttribute("id");
          enlaces.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    secciones.forEach(function (s) { spy.observe(s); });
  }

  /* ----- 5. Reveal on scroll ----- */
  var revelables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revelables.length) {
    var revealObs = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revelables.forEach(function (el) { revealObs.observe(el); });
  } else {
    revelables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ----- 6. Botón volver arriba ----- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    function onScrollTop() {
      var visible = window.scrollY > 600;
      toTop.classList.toggle("is-visible", visible);
      toTop.hidden = !visible;
    }
    onScrollTop();
    window.addEventListener("scroll", onScrollTop, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ----- 7. Validación y envío del formulario ----- */
  var form = document.getElementById("contactForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(campo, mensaje) {
    var input = form.elements[campo];
    var errorEl = form.querySelector('[data-error-for="' + campo + '"]');
    if (input) {
      input.classList.toggle("is-invalid", Boolean(mensaje));
      input.setAttribute("aria-invalid", mensaje ? "true" : "false");
    }
    if (errorEl) errorEl.textContent = mensaje || "";
    return !mensaje;
  }

  function validar() {
    var ok = true;
    var nombre = form.elements["nombre"].value.trim();
    var email = form.elements["email"].value.trim();
    var mensaje = form.elements["mensaje"].value.trim();

    ok = setError("nombre", nombre ? "" : "Ingresa tu nombre.") && ok;
    if (!email) {
      ok = setError("email", "Ingresa tu email.") && ok;
    } else if (!EMAIL_RE.test(email)) {
      ok = setError("email", "Ingresa un email válido.") && ok;
    } else {
      setError("email", "");
    }
    ok = setError("mensaje", mensaje ? "" : "Escribe tu mensaje.") && ok;
    return ok;
  }

  function setLoading(cargando) {
    if (!submitBtn) return;
    var label = submitBtn.querySelector(".btn__label");
    var spinner = submitBtn.querySelector(".btn__spinner");
    submitBtn.disabled = cargando;
    if (label) label.textContent = cargando ? "Enviando…" : "Enviar mensaje";
    if (spinner) spinner.hidden = !cargando;
  }

  function showStatus(tipo, mensaje) {
    if (!statusEl) return;
    statusEl.textContent = mensaje;
    statusEl.classList.remove("is-success", "is-error");
    statusEl.classList.add(tipo === "success" ? "is-success" : "is-error");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (statusEl) statusEl.textContent = "";

      // Honeypot: si un bot rellenó el campo oculto, abortar en silencio.
      var hp = form.elements["_gotcha"];
      if (hp && hp.value) return;

      if (!validar()) {
        showStatus("error", "Revisa los campos marcados.");
        var primerError = form.querySelector(".is-invalid");
        if (primerError) primerError.focus();
        return;
      }

      var action = form.getAttribute("action") || "";
      var configurado = action.indexOf("formspree.io") !== -1 &&
        action.indexOf("TU_FORM_ID") === -1;

      if (!configurado) {
        // Fallback sin backend: continuar la consulta por WhatsApp.
        showStatus("error", "El formulario aún no está conectado. Te abrimos WhatsApp para enviarlo.");
        var texto = WHATSAPP_SALUDO +
          form.elements["nombre"].value.trim() + " escribe: " +
          form.elements["mensaje"].value.trim();
        window.open(buildWaLink(texto), "_blank", "noopener");
        return;
      }

      setLoading(true);
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            showStatus("success", "¡Gracias! Nos pondremos en contacto pronto.");
            form.reset();
          } else {
            showStatus("error", "Error al enviar. Intenta de nuevo.");
          }
        })
        .catch(function () {
          showStatus("error", "Error al enviar. Intenta de nuevo.");
        })
        .finally(function () { setLoading(false); });
    });

    ["nombre", "email", "mensaje"].forEach(function (campo) {
      var input = form.elements[campo];
      if (input) {
        input.addEventListener("input", function () {
          if (input.classList.contains("is-invalid")) setError(campo, "");
        });
      }
    });
  }
})();
