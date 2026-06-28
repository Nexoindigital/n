/* =========================================================
   NEXO DIGITAL — script.js
   Vanilla JS — nav, AOS init, calculadora, acordeón, formulario
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Inicializar AOS (scroll animations) ---------- */
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  /* ---------- Nav: fondo al hacer scroll ---------- */
  const navWrap = document.getElementById('navWrap');
  const onScrollNav = () => {
    if (window.scrollY > 12) {
      navWrap.classList.add('scrolled');
    } else {
      navWrap.classList.remove('scrolled');
    }
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------- Nav: menú móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Calculadora de impacto (mensual + anual) ---------- */
  const clientValueInput = document.getElementById('clientValue');
  const clientCountInput = document.getElementById('clientCount');
  const calcMonthly = document.getElementById('calcMonthly');
  const calcAnnual = document.getElementById('calcAnnual');

  const formatMXN = (num) => num.toLocaleString('es-MX', { maximumFractionDigits: 0 });

  const updateCalc = () => {
    const value = Math.max(parseFloat(clientValueInput.value) || 0, 0);
    const count = Math.max(parseInt(clientCountInput.value, 10) || 0, 0);
    const monthly = value * count;
    const annual = monthly * 12;
    calcMonthly.textContent = `$${formatMXN(monthly)} MXN`;
    calcAnnual.textContent = `$${formatMXN(annual)} MXN`;
  };

  if (clientValueInput && clientCountInput) {
    clientValueInput.addEventListener('input', updateCalc);
    clientCountInput.addEventListener('input', updateCalc);
    updateCalc();
  }

  /* ---------- Acordeón de preguntas frecuentes ---------- */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Cierra los demás (comportamiento de acordeón único)
      accordionItems.forEach(other => {
        if (other !== item) {
          other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : `${panel.scrollHeight}px`;
    });
  });

  /* ---------- Validación del formulario de contacto ---------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const validators = {
    name: (val) => val.trim().length >= 2 ? '' : 'Escribe tu nombre completo.',
    business: (val) => val.trim().length >= 2 ? '' : 'Escribe el nombre de tu negocio.',
    phone: (val) => /^[0-9\s+\-]{10,15}$/.test(val.trim()) ? '' : 'Ingresa un teléfono válido (10 dígitos).',
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Ingresa un correo válido.',
    service: (val) => val.trim().length > 0 ? '' : 'Selecciona un servicio.',
    budget: (val) => val.trim().length > 0 ? '' : 'Selecciona un rango de presupuesto.',
    message: (val) => val.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).'
  };

  const validateField = (field) => {
    const name = field.name;
    const errorEl = document.getElementById(`${name}Error`);
    const message = validators[name] ? validators[name](field.value) : '';
    field.closest('.form-row').classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message;
    return !message;
  };

  if (form) {
    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (field) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
          if (field.closest('.form-row').classList.contains('has-error')) validateField(field);
        });
        field.addEventListener('change', () => {
          if (field.closest('.form-row').classList.contains('has-error')) validateField(field);
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      Object.keys(validators).forEach(name => {
        const field = form.elements[name];
        if (field && !validateField(field)) isValid = false;
      });

      if (!isValid) {
        formSuccess.textContent = '';
        return;
      }

      const submitBtn = form.querySelector('.form-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      // Envío vía Formspree directo a tu correo, sin recargar la página.
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then((response) => {
          if (response.ok) {
            formSuccess.textContent = '¡Gracias! Tu mensaje fue enviado. Te contactaremos muy pronto.';
            form.reset();
            Object.keys(validators).forEach(name => {
              const field = form.elements[name];
              if (field) field.closest('.form-row').classList.remove('has-error');
            });
          } else {
            formSuccess.textContent = 'Hubo un problema al enviar. Por favor intenta de nuevo o escríbenos por WhatsApp.';
          }
        })
        .catch(() => {
          formSuccess.textContent = 'Hubo un problema de conexión. Por favor intenta de nuevo o escríbenos por WhatsApp.';
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Enviar mensaje <i class="fa-solid fa-arrow-up-right-from-square"></i>';
        });
    });
  }

});
