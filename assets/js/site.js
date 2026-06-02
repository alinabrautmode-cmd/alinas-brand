/* ============================================================
   ALINA'S BRAND — Site script
   Mobile menu, scroll reveals, catalog rendering, search.
   ============================================================ */

(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function listText(value) {
    return Array.isArray(value) && value.length ? value.join(', ') : '—';
  }

  function cssUrl(value) {
    return 'url("' + String(value || '').replace(/\/g, '\\').replace(/"/g, '\"') + '")';
  }

  /* ---------- Fade-in on scroll ---------- */
  function initFadeIn() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.fade-in').forEach(function (el) {
      obs.observe(el);
    });
  }

  /* ---------- Mobile menu toggle ---------- */
  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('active');
        document.body.classList.remove('nav-open');
      });
    });
  }



  /* ---------- CMS-managed home page content ---------- */
  function initHomeContent() {
    var home = window.ALINAS_BRAND_HOME;
    if (!home) return;

    var hero = home.hero || {};
    var heroBg = document.querySelector('[data-home-hero-image]');
    if (heroBg && hero.image) {
      heroBg.style.backgroundImage = cssUrl(hero.image);
      heroBg.style.setProperty('--hero-image-desktop', cssUrl(hero.image));
    }
    if (heroBg && hero.mobileImage) {
      heroBg.style.setProperty('--hero-image-mobile', cssUrl(hero.mobileImage));
    }
    if (heroBg && hero.imagePosition) {
      heroBg.style.backgroundPosition = hero.imagePosition;
    }

    var heroOvertitle = document.querySelector('[data-home-hero-overtitle]');
    var heroTitle = document.querySelector('[data-home-hero-title]');
    var heroSubtitle = document.querySelector('[data-home-hero-subtitle]');
    var heroButton = document.querySelector('[data-home-hero-button]');
    var heroKicker = document.querySelector('[data-home-hero-kicker]');

    if (heroOvertitle && hero.overtitle) heroOvertitle.textContent = hero.overtitle;
    if (heroTitle && hero.title) heroTitle.textContent = hero.title;
    if (heroSubtitle && hero.subtitle) heroSubtitle.textContent = hero.subtitle;
    if (heroButton) {
      if (hero.buttonText) heroButton.textContent = hero.buttonText;
      if (hero.buttonUrl) heroButton.setAttribute('href', hero.buttonUrl);
    }
    if (heroKicker && hero.kicker) heroKicker.textContent = hero.kicker;

    var categories = home.categories || {};
    Object.keys(categories).forEach(function (key) {
      var data = categories[key] || {};
      var card = document.querySelector('[data-home-category="' + key + '"]');
      if (!card) return;

      var image = card.querySelector('[data-home-category-image]');
      var title = card.querySelector('[data-home-category-title]');
      var subtitle = card.querySelector('[data-home-category-subtitle]');

      if (data.url) card.setAttribute('href', data.url);
      if (image && data.image) image.setAttribute('src', data.image);
      if (image && data.title) image.setAttribute('alt', data.title);
      if (title && data.title) title.textContent = data.title;
      if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;
    });
  }

  /* ---------- Product page gallery ---------- */
  function initProductGallery() {
    document.querySelectorAll('[data-product-gallery]').forEach(function (gallery) {
      var mainImage = gallery.querySelector('[data-product-main-image]');
      var thumbs = gallery.querySelectorAll('[data-product-thumb]');
      if (!mainImage || !thumbs.length) return;

      thumbs.forEach(function (button) {
        button.addEventListener('click', function () {
          var nextImage = button.getAttribute('data-image');
          var nextAlt = button.getAttribute('data-alt') || mainImage.alt;
          if (!nextImage) return;

          mainImage.src = nextImage;
          mainImage.alt = nextAlt;

          thumbs.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
        });
      });
    });
  }

  /* ---------- Search by article ---------- */
  function initSearch() {
    var toggle = document.querySelector('.search-toggle');
    var panel = document.querySelector('.search-panel');
    if (!toggle || !panel) return;

    var input = panel.querySelector('.search-input');
    var feedback = panel.querySelector('.search-feedback');
    var closeBtn = panel.querySelector('.search-close');

    function openPanel() {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      setTimeout(function () { input.focus(); }, 50);
    }
    function closePanel() {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (feedback) feedback.textContent = '';
      input.value = '';
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (panel.classList.contains('is-open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closePanel);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) {
        closePanel();
      }
    });

    panel.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch();
    });

    function runSearch() {
      var raw = (input.value || '').trim();
      if (!raw) {
        if (feedback) feedback.textContent = 'Please enter an article number (e.g. AB-2601).';
        return;
      }

      // Normalize: uppercase, allow with or without "AB-" prefix, strip spaces
      var query = raw.toUpperCase().replace(/\s+/g, '');
      if (!/^AB-?\d+$/.test(query) && !/^\d+$/.test(query)) {
        if (feedback) feedback.textContent = 'Article format is AB-XXXX (e.g. AB-2601).';
        return;
      }
      if (/^\d+$/.test(query)) query = 'AB-' + query;
      if (/^AB\d+$/.test(query)) query = query.replace('AB', 'AB-');

      var products = window.ALINAS_BRAND_PRODUCTS || [];
      var match = products.find(function (p) {
        return p.article.toUpperCase() === query;
      });

      if (!match) {
        if (feedback) feedback.textContent = 'No product found for "' + raw + '".';
        return;
      }

      if (match.pageUrl) {
        window.location.href = match.pageUrl;
      } else {
        // Fall back to the catalog page for the right category, anchored to the article
        var categoryUrl = 'catalog-' + match.category + '.html#' + match.article.toLowerCase();
        window.location.href = categoryUrl;
      }
    }
  }

  /* ---------- Catalog rendering ---------- */
  function initCatalog() {
    var grid = document.querySelector('[data-catalog-grid]');
    if (!grid) return;

    var category = grid.getAttribute('data-category');
    var products = (window.ALINAS_BRAND_PRODUCTS || []).filter(function (p) {
      return p.category === category;
    });

    var emptyState = document.querySelector('[data-catalog-empty]');

    if (products.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    grid.innerHTML = products.map(function (p) {
      var galleryImages = (p.images || []).slice(0, 3);
      // Ensure 3 frames for layout consistency by repeating the last image if needed
      while (galleryImages.length < 3 && galleryImages.length > 0) {
        galleryImages.push(galleryImages[galleryImages.length - 1]);
      }

      var productUrl = p.pageUrl ? escapeAttr(p.pageUrl) : '';
      var safeName = escapeHtml(p.name || p.article);
      var safeArticle = escapeHtml(p.article);
      var safeTagline = escapeHtml(p.tagline || '');
      var safeDescription = escapeHtml(p.description || '');
      var safeColors = escapeHtml(listText(p.colors));
      var safeSizes = escapeHtml(listText(p.sizes));
      var safeAvailability = escapeHtml(p.availability || '');

      var galleryHtml = galleryImages.map(function (src, idx) {
        var safeSrc = escapeAttr(src);
        var alt = safeName + ' image ' + (idx + 1);
        if (productUrl) {
          return '<a class="catalog-model__frame" href="' + productUrl + '">' +
                   '<img src="' + safeSrc + '" alt="' + alt + '" loading="lazy">' +
                 '</a>';
        }
        return '<div class="catalog-model__frame">' +
                 '<img src="' + safeSrc + '" alt="' + alt + '" loading="lazy">' +
               '</div>';
      }).join('');

      var ctaHtml = productUrl
        ? '<a href="' + productUrl + '" class="catalog-model__cta">View product</a>'
        : '<a href="https://wa.me/380937709193" target="_blank" rel="noopener" class="catalog-model__cta">Enquire on WhatsApp</a>';

      return '' +
        '<article class="catalog-model fade-in" id="' + p.article.toLowerCase() + '">' +
          '<div class="catalog-model__gallery">' + galleryHtml + '</div>' +
          '<div class="catalog-model__caption">' +
            '<div class="catalog-model__article">Art. ' + safeArticle + '</div>' +
            (safeTagline ? '<div class="catalog-model__tagline">' + safeTagline + '</div>' : '') +
            (safeDescription ? '<p class="catalog-model__description">' + safeDescription + '</p>' : '') +
            '<div class="catalog-model__meta">Available colors: ' + safeColors + '</div>' +
            '<div class="catalog-model__meta">Available sizes: ' + safeSizes + '</div>' +
            (safeAvailability ? '<div class="catalog-model__meta">' + safeAvailability + '</div>' : '') +
            ctaHtml +
          '</div>' +
        '</article>';
    }).join('');

    // Re-attach fade-in observer to newly added nodes
    initFadeIn();

    // Smooth scroll if URL hash points to a product
    if (window.location.hash) {
      var target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.classList.add('catalog-model--highlight');
          setTimeout(function () {
            target.classList.remove('catalog-model--highlight');
          }, 2000);
        }, 100);
      }
    }
  }

  /* ---------- Init on DOM ready ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHomeContent();
      initMobileNav();
      initSearch();
      initProductGallery();
      initCatalog();
      initFadeIn();
    });
  } else {
    initHomeContent();
    initMobileNav();
    initSearch();
    initProductGallery();
    initCatalog();
    initFadeIn();
  }
})();
