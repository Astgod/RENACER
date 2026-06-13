/* ============================================================
   Renacer de la Espiga — JavaScript
   Vanilla JS · menú, WhatsApp, validación, scroll-spy,
   reveal on scroll, back-to-top y armador de pedido persistente.
   ============================================================ */
(function () {
  "use strict";

  /* ----- CONFIGURACIÓN (editar cuando se confirmen los datos) ----- */
  // Número de WhatsApp en formato internacional sin "+", espacios ni guiones.
  var WHATSAPP_NUMERO = "56900000000"; // [POR CONFIRMAR]
  var WHATSAPP_SALUDO = "Hola Renacer de la Espiga, ";
  var MINIMO_UNIDADES = 20;            // pedido mínimo por producto
  var STORAGE_KEY = "renacer_pedido_v1";

  document.documentElement.classList.add("js");

  function buildWaLink(texto) {
    var mensaje = texto || (WHATSAPP_SALUDO + "quiero hacer una consulta.");
    return "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(mensaje);
  }
  function announce(msg) {
    var el = document.getElementById("srAnnounce");
    if (el) el.textContent = msg;
  }

  /* ----- 1. Enlaces de WhatsApp ----- */
  document.querySelectorAll("[data-wa-cta]").forEach(function (el) {
    var texto = el.getAttribute("data-wa-text") ||
      (WHATSAPP_SALUDO + "quiero hacer una consulta sobre sus productos.");
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

  /* ----- 4. Scroll-spy ----- */
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
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
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
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ============================================================
     7. ARMADOR DE PEDIDO PERSISTENTE
     Estado: { id: cantidad }. Se guarda en localStorage para que
     el pedido sobreviva recargas. Al enviar, compone un único
     mensaje de WhatsApp con todos los productos y cantidades.
     ============================================================ */
  var pedido = cargarPedido();          // { "pan-amasado": 40, ... }
  var nombres = {};                     // { id: "Nombre legible" }

  // Refs del DOM del armador
  var orderBar = document.getElementById("orderBar");
  var orderCount = document.getElementById("orderCount");
  var orderResumen = document.getElementById("orderResumen");
  var orderDrawer = document.getElementById("orderDrawer");
  var orderList = document.getElementById("orderList");
  var orderTotal = document.getElementById("orderTotal");

  function cargarPedido() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var data = raw ? JSON.parse(raw) : {};
      return (data && typeof data === "object") ? data : {};
    } catch (e) { return {}; }
  }
  function guardarPedido() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pedido)); } catch (e) {}
  }
  function normalizar(n) {
    n = parseInt(n, 10);
    if (isNaN(n) || n < MINIMO_UNIDADES) n = MINIMO_UNIDADES;
    return n;
  }
  function totalUnidades() {
    return Object.keys(pedido).reduce(function (s, id) { return s + pedido[id]; }, 0);
  }
  function numProductos() { return Object.keys(pedido).length; }

  // Registrar nombres legibles desde las tarjetas
  document.querySelectorAll("[data-add]").forEach(function (btn) {
    nombres[btn.getAttribute("data-id")] = btn.getAttribute("data-nombre");
  });

  /* ----- Steppers genéricos (tarjeta y drawer) ----- */
  function initStepper(stepper, onChange) {
    var input = stepper.querySelector(".stepper__input");
    var menos = stepper.querySelector('[data-step="-1"]');
    var mas = stepper.querySelector('[data-step="1"]');

    function refresh() {
      if (menos) menos.disabled = parseInt(input.value, 10) <= MINIMO_UNIDADES;
    }
    function set(val) {
      input.value = normalizar(val);
      refresh();
      if (onChange) onChange(parseInt(input.value, 10));
    }
    if (menos) menos.addEventListener("click", function () { set(parseInt(input.value, 10) - 1); });
    if (mas) mas.addEventListener("click", function () { set(parseInt(input.value, 10) + 1); });
    input.addEventListener("change", function () { set(input.value); });
    input.addEventListener("blur", function () { set(input.value); });
    refresh();
    return { set: set, get: function () { return parseInt(input.value, 10); } };
  }

  // Steppers de las tarjetas + botón "Agregar al pedido"
  document.querySelectorAll(".producto").forEach(function (card) {
    var stepperEl = card.querySelector("[data-stepper]");
    var addBtn = card.querySelector("[data-add]");
    if (!stepperEl || !addBtn) return;
    var ctrl = initStepper(stepperEl);

    addBtn.addEventListener("click", function () {
      var id = addBtn.getAttribute("data-id");
      var cant = normalizar(ctrl.get());
      pedido[id] = (pedido[id] || 0) + cant; // acumula si ya estaba
      guardarPedido();
      renderPedido();
      // Feedback visual breve
      var label = addBtn.querySelector(".producto__add-label");
      addBtn.classList.add("is-added");
      if (label) label.textContent = "¡Agregado!";
      announce(nombres[id] + ", " + cant + " unidades agregadas. Pedido: " + totalUnidades() + " unidades.");
      setTimeout(function () {
        addBtn.classList.remove("is-added");
        if (label) label.textContent = "Agregar al pedido";
      }, 1400);
    });
  });

  /* ----- Render de la barra y el drawer ----- */
  function mensajePedido() {
    var lineas = Object.keys(pedido).map(function (id) {
      return "• " + (nombres[id] || id) + ": " + pedido[id] + " unidades";
    });
    return WHATSAPP_SALUDO + "quiero hacer este pedido:\n" + lineas.join("\n") +
      "\n\n¿Me confirman el precio total y el tiempo de elaboración? Gracias.";
  }

  function renderPedido() {
    var nProd = numProductos();
    var nUni = totalUnidades();
    var hayItems = nProd > 0;

    // Barra inferior
    if (orderBar) {
      orderBar.hidden = !hayItems;
      if (hayItems) { void orderBar.offsetWidth; }
      orderBar.classList.toggle("is-visible", hayItems);
      document.body.classList.toggle("has-order-bar", hayItems);
    }
    if (orderCount) orderCount.textContent = String(nProd);
    if (orderResumen) {
      orderResumen.textContent = hayItems
        ? (nProd === 1 ? "1 producto" : nProd + " productos") + " · " + nUni + " un."
        : "Tu pedido";
    }
    if (orderTotal) orderTotal.textContent = String(nUni);

    // Lista del drawer
    if (orderDrawer) orderDrawer.classList.toggle("is-empty", !hayItems);
    if (orderList) {
      orderList.innerHTML = "";
      Object.keys(pedido).forEach(function (id) {
        var li = document.createElement("li");
        li.className = "order-item";
        li.innerHTML =
          '<div class="order-item__info">' +
            '<p class="order-item__nombre">' + (nombres[id] || id) + "</p>" +
            '<p class="order-item__cant">' + pedido[id] + " unidades</p>" +
          "</div>" +
          '<div class="stepper" data-stepper>' +
            '<button type="button" class="stepper__btn" data-step="-1" aria-label="Restar"><svg class="icon" aria-hidden="true"><use href="#ic-minus"></use></svg></button>' +
            '<input class="stepper__input" type="number" inputmode="numeric" value="' + pedido[id] + '" min="' + MINIMO_UNIDADES + '" step="1" aria-label="Cantidad de ' + (nombres[id] || id) + '">' +
            '<button type="button" class="stepper__btn" data-step="1" aria-label="Sumar"><svg class="icon" aria-hidden="true"><use href="#ic-plus"></use></svg></button>' +
          "</div>" +
          '<button type="button" class="order-item__del" data-del="' + id + '" aria-label="Quitar ' + (nombres[id] || id) + '"><svg class="icon" aria-hidden="true"><use href="#ic-trash"></use></svg></button>';
        orderList.appendChild(li);

        var stepperEl = li.querySelector("[data-stepper]");
        initStepper(stepperEl, function (val) {
          pedido[id] = val;
          guardarPedido();
          li.querySelector(".order-item__cant").textContent = val + " unidades";
          if (orderTotal) orderTotal.textContent = String(totalUnidades());
          if (orderResumen) orderResumen.textContent =
            (numProductos() === 1 ? "1 producto" : numProductos() + " productos") + " · " + totalUnidades() + " un.";
        });
        li.querySelector("[data-del]").addEventListener("click", function () {
          delete pedido[id];
          guardarPedido();
          renderPedido();
          announce("Producto quitado del pedido.");
        });
      });
    }
  }

  /* ----- Apertura/cierre del drawer ----- */
  function setDrawer(abierto) {
    if (!orderDrawer) return;
    if (abierto) {
      orderDrawer.hidden = false;
      void orderDrawer.offsetWidth;
    }
    orderDrawer.classList.toggle("is-open", abierto);
    document.body.style.overflow = abierto ? "hidden" : "";
    if (!abierto) {
      setTimeout(function () { if (!orderDrawer.classList.contains("is-open")) orderDrawer.hidden = true; }, 320);
    } else {
      var cerrar = document.getElementById("orderClose");
      if (cerrar) cerrar.focus();
    }
  }

  var orderOpen = document.getElementById("orderOpen");
  var orderClose = document.getElementById("orderClose");
  var orderBackdrop = document.getElementById("orderBackdrop");
  var orderClear = document.getElementById("orderClear");
  var orderSend = document.getElementById("orderSend");
  var orderSend2 = document.getElementById("orderSend2");

  if (orderOpen) orderOpen.addEventListener("click", function () { setDrawer(true); });
  if (orderClose) orderClose.addEventListener("click", function () { setDrawer(false); });
  if (orderBackdrop) orderBackdrop.addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && orderDrawer && orderDrawer.classList.contains("is-open")) setDrawer(false);
  });
  if (orderClear) orderClear.addEventListener("click", function () {
    pedido = {};
    guardarPedido();
    renderPedido();
    setDrawer(false);
    announce("Pedido vaciado.");
  });

  function enviarPedido() {
    if (numProductos() === 0) return;
    window.open(buildWaLink(mensajePedido()), "_blank", "noopener");
  }
  if (orderSend) orderSend.addEventListener("click", enviarPedido);
  if (orderSend2) orderSend2.addEventListener("click", enviarPedido);

  // Render inicial (restaura pedido guardado)
  renderPedido();

  /* ============================================================
     8. Validación y envío del formulario
     ============================================================ */
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
    if (!email) ok = setError("email", "Ingresa tu email.") && ok;
    else if (!EMAIL_RE.test(email)) ok = setError("email", "Ingresa un email válido.") && ok;
    else setError("email", "");
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
      var hp = form.elements["_gotcha"];
      if (hp && hp.value) return; // honeypot

      if (!validar()) {
        showStatus("error", "Revisa los campos marcados.");
        var primerError = form.querySelector(".is-invalid");
        if (primerError) primerError.focus();
        return;
      }
      var action = form.getAttribute("action") || "";
      var configurado = action.indexOf("formspree.io") !== -1 && action.indexOf("TU_FORM_ID") === -1;

      if (!configurado) {
        showStatus("error", "El formulario aún no está conectado. Te abrimos WhatsApp para enviarlo.");
        var texto = WHATSAPP_SALUDO + form.elements["nombre"].value.trim() + " escribe: " + form.elements["mensaje"].value.trim();
        window.open(buildWaLink(texto), "_blank", "noopener");
        return;
      }
      setLoading(true);
      fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (res) {
          if (res.ok) { showStatus("success", "¡Gracias! Nos pondremos en contacto pronto."); form.reset(); }
          else showStatus("error", "Error al enviar. Intenta de nuevo.");
        })
        .catch(function () { showStatus("error", "Error al enviar. Intenta de nuevo."); })
        .finally(function () { setLoading(false); });
    });
    ["nombre", "email", "mensaje"].forEach(function (campo) {
      var input = form.elements[campo];
      if (input) input.addEventListener("input", function () {
        if (input.classList.contains("is-invalid")) setError(campo, "");
      });
    });
  }
})();
