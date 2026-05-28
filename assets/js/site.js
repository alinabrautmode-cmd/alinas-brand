/* ============================================================
   ALINA'S BRAND — Site script
   Mobile menu, scroll reveals, catalog rendering, search.
   ============================================================ */

(function () {
  'use strict';

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
      var galleryImages = p.images.slice(0, 3);
      // Ensure 3 frames for layout consistency by repeating the last image if needed
      while (galleryImages.length < 3 && galleryImages.length > 0) {
        galleryImages.push(galleryImages[galleryImages.length - 1]);
      }

      var galleryHtml = galleryImages.map(function (src, idx) {
        var alt = p.name + ' image ' + (idx + 1);
        if (p.pageUrl) {
          return '<a class="catalog-model__frame" href="' + p.pageUrl + '">' +
                   '<img src="' + src + '" alt="' + alt + '" loading="lazy">' +
                 '</a>';
        }
        return '<div class="catalog-model__frame">' +
                 '<img src="' + src + '" alt="' + alt + '" loading="lazy">' +
               '</div>';
      }).join('');

      var ctaHtml = p.pageUrl
        ? '<a href="' + p.pageUrl + '" class="catalog-model__cta">View details</a>'
        : '<a href="https://wa.me/380937709193" target="_blank" rel="noopener" class="catalog-model__cta">Enquire on WhatsApp</a>';

      return '' +
        '<article class="catalog-model fade-in" id="' + p.article.toLowerCase() + '">' +
          '<div class="catalog-model__gallery">' + galleryHtml + '</div>' +
          '<div class="catalog-model__caption">' +
            '<div class="catalog-model__article">Art. ' + p.article + '</div>' +
            '<div class="catalog-model__meta">Available colors: ' + p.colors.join(', ') + '</div>' +
            '<div class="catalog-model__meta">Available sizes: ' + p.sizes.join(', ') + '</div>' +
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
      initMobileNav();
      initSearch();
      initCatalog();
      initFadeIn();
    });
  } else {
    initMobileNav();
    initSearch();
    initCatalog();
    initFadeIn();
  }
})();
