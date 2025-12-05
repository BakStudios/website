/**
 */

// Animación de carga controlada
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar perfil primero
  const profile = document.querySelector('.profile');
  if (profile) {
    setTimeout(() => {
      profile.style.animation = 'fadeUp 0.5s ease forwards';
    }, 100);
  }
  
  // Mostrar enlaces en secuencia
  const links = document.querySelectorAll('.link');
  links.forEach((link, index) => {
    setTimeout(() => {
      link.style.animation = 'fadeUp 0.5s ease forwards';
    }, 200 + (index * 100)); // 200ms base + 100ms por cada enlace
  });
  
  // Sistema avanzado de rastreo de analíticas
  setupAdvancedAnalytics();
  
  // Lazy loading para imágenes
  setupLazyLoading();
});

// Toggle Modo Oscuro
const body = document.body;
const themeToggle = document.querySelector('.theme-toggle');
const moonIcon = document.querySelector('.moon');
const sunIcon = document.querySelector('.sun');

// Verifica si el usuario prefiere el modo oscuro
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Verifica si hay una preferencia guardada
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
  body.classList.add('dark-mode');
  moonIcon.style.display = 'none';
  sunIcon.style.display = 'block';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  
  // Determinar el nuevo tema para analytics
  const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
  
  // Enviar evento de cambio de tema
  sendAnalyticsEvent('theme_change', {
    'new_theme': newTheme
  });
  
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    moonIcon.style.display = 'none';
    sunIcon.style.display = 'block';
  } else {
    localStorage.setItem('theme', 'light');
    moonIcon.style.display = 'block';
    sunIcon.style.display = 'none';
  }
});

// Función para configurar lazy loading
function setupLazyLoading() {
  const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));
  
  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });
    
    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }
}

// Analytics mejorado
function sendAnalyticsEvent(eventName, eventParams) {
  // Registro en consola para depuración (puedes quitar esto en producción)
  console.log(`Evento Analytics: ${eventName}`, eventParams);
  
  if (typeof gtag === 'function') {
    gtag('event', eventName, eventParams);
  } else if (window.dataLayer) {
    dataLayer.push({
      'event': eventName,
      ...eventParams
    });
  }
}

// Sistema avanzado de rastreo de analytics
function setupAdvancedAnalytics() {
  // 1. Rastreo detallado de clics en enlaces de redes sociales
  document.querySelectorAll('.link').forEach(link => {
    link.addEventListener('click', function(e) {
      const linkText = this.textContent.trim();
      // Obtener información detallada del enlace
      const linkType = this.classList[1] || 'link'; // link-youtube, link-twitch, etc.
      const linkUrl = this.href;
      
      sendAnalyticsEvent('social_link_click', {
        'link_name': linkText,
        'link_type': linkType,
        'link_url': linkUrl,
        'page_section': 'social_links'
      });
    });
  });
  
  // 2. Rastreo de interacciones con botones de PayPal para videos
  if (document.querySelector('[id^="paypal-button-container"]')) {
    setupPayPalTracking();
  }
  
  // 3. Rastreo de visibilidad de secciones
  trackVisibleSections();
}

// Función para rastrear interacciones con PayPal
function setupPayPalTracking() {
  // Observer para detectar cuando se cargan los botones de PayPal
  const paypalObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        // Verificar si se añadió un iframe de PayPal
        if (document.querySelector('[data-paypal-button="true"]')) {
          trackPayPalButtons();
          paypalObserver.disconnect(); // Detener la observación una vez encontrados
        }
      }
    });
  });
  
  // Iniciar observación en los contenedores de botones
  document.querySelectorAll('[id^="paypal-button-container"]').forEach(container => {
    paypalObserver.observe(container, { childList: true, subtree: true });
    
    // Registrar impresión del contenedor de botón
    const productCard = container.closest('.product-card');
    const productTitle = productCard ? productCard.querySelector('.product-title').textContent : 'Desconocido';
    
    sendAnalyticsEvent('paypal_option_impression', {
      'button_id': container.id,
      'product_name': productTitle,
      'page_section': 'videos_personalizados'
    });
    
    // Rastrear interacciones con el contenedor (aproximación)
    container.addEventListener('mousedown', function() {
      sendAnalyticsEvent('paypal_button_click', {
        'button_id': container.id,
        'product_name': productTitle,
        'page_section': 'videos_personalizados'
      });
    });
  });
}

// Función para rastrear cuando los botones de PayPal están visibles
function trackPayPalButtons() {
  const paypalButtons = document.querySelectorAll('[data-paypal-button="true"]');
  
  // Registrar cuántos botones se encontraron
  sendAnalyticsEvent('paypal_buttons_loaded', {
    'button_count': paypalButtons.length,
    'page_section': 'videos_personalizados'
  });
  
  // Intentar rastrear clics en los botones reales (puede ser limitado debido a iframes)
  paypalButtons.forEach(button => {
    button.addEventListener('click', function() {
      const container = this.closest('[id^="paypal-button-container"]');
      if (container) {
        const productCard = container.closest('.product-card');
        const productTitle = productCard ? productCard.querySelector('.product-title').textContent : 'Desconocido';
        
        sendAnalyticsEvent('paypal_button_click_direct', {
          'button_id': container.id,
          'product_name': productTitle,
          'page_section': 'videos_personalizados'
        });
      }
    });
  });
}

// Función para rastrear secciones visibles
function trackVisibleSections() {
  // Crear un observador para las secciones principales
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.classList[0] || 'unknown-section';
        const sectionName = entry.target.querySelector('h2') ? 
                           entry.target.querySelector('h2').textContent : 
                           sectionId;
        
        sendAnalyticsEvent('section_view', {
          'section_id': sectionId,
          'section_name': sectionName,
          'visibility_percentage': Math.round(entry.intersectionRatio * 100)
        });
      }
    });
  }, {
    threshold: [0.25, 0.5, 0.75] // Registra cuando 25%, 50% y 75% de la sección es visible
  });
  
  // Observar secciones principales
  document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
  });
}

// Código para equilibrar alturas de tarjetas de producto
document.addEventListener('DOMContentLoaded', function() {
  const productCards = document.querySelectorAll('.product-card');
  if (productCards.length > 0) {
    // Esperar a que todo esté cargado
    setTimeout(equalizeCardHeights, 2000);
    // También ajustar al cambiar el tamaño de la ventana
    window.addEventListener('resize', equalizeCardHeights);
  }
});

function equalizeCardHeights() {
  const cards = document.querySelectorAll('.product-card');
  
  // Restablecer alturas
  cards.forEach(card => card.style.height = 'auto');
  
  // No ajustar en móviles
  if (window.innerWidth < 768) return;
  
  // Encontrar altura máxima
  let maxHeight = 0;
  cards.forEach(card => {
    const height = card.offsetHeight;
    if (height > maxHeight) maxHeight = height;
  });
  
  // Aplicar altura máxima
  cards.forEach(card => card.style.height = `${maxHeight}px`);
}
