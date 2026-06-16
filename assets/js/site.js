/* ============================================================
   ALINA'S BRAND — Site script
   Cloudflare Pages version
   - universal article search
   - Cloudflare Image Transformations with original-image fallback
   - stable incremental rendering on mobile Safari
   ============================================================ */
(function () {
  'use strict';

  var MOBILE_QUERY = '(max-width: 720px)';
  var MOBILE_BATCH_SIZE = 4;
  var WHATSAPP_URL = 'https://wa.me/380937709193';
  var CF_IMAGE_WIDTHS_MOBILE = [480, 800];
  var CF_IMAGE_WIDTHS_DESKTOP = [720, 1200];
  var CF_IMAGE_QUALITY = 78;

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
    return 'url("' + String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '")';
  }

  function isMobile() {
    return Boolean(window.matchMedia && window.matchMedia(MOBILE_QUERY).matches);
  }

  function articleKey(value) {
    var text = String(value || '')
      .trim()
      .toUpperCase()
      .replace(/^ART\.?\s*/i, '')
      .replace(/\s+/g, '')
      .replace(/_/g, '-')
      .replace(/^AB-?/, 'AB')
      .replace(/-/g, '');

    if (/^\d+(\/\d+)?$/.test(text)) {
      text = 'AB' + text;
    }

    return text;
  }

  function articleSlug(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^art\.?\s*/i, '')
      .replace(/\s+/g, '')
      .replace(/_/g, '-')
      .replace(/\//g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function validArticleKey(key) {
    return /^AB\d+(\/\d+)?$/.test(key);
  }

  function getProducts() {
    return Array.isArray(window.ALINAS_BRAND_PRODUCTS)
      ? window.ALINAS_BRAND_PRODUCTS
      : [];
  }

  function productUrl(product) {
    if (product && product.pageUrl) return product.pageUrl;
    if (!product || !product.category) return '#';
    return 'catalog-' + product.category + '.html#' + articleSlug(product.article);
  }

  function canUseCloudflareTransformations() {
    var host = window.location.hostname || '';
    return (
      window.location.protocol === 'https:' &&
      host !== 'localhost' &&
      host !== '127.0.0.1'
    );
  }

  function normalizeLocalImagePath(src) {
    if (!src) return '';

    try {
      var url = new URL(src, window.location.origin);
      if (url.origin !== window.location.origin) return '';
      return url.pathname.replace(/^\/+/, '');
    } catch (error) {
      return String(src).replace(/^\/+/, '');
    }
  }

  function cloudflareImageUrl(src, width) {
    var localPath = normalizeLocalImagePath(src);
    if (!localPath || !canUseCloudflareTransformations()) return src;

    var options = [
      'width=' + width,
      'quality=' + CF_IMAGE_QUALITY,
      'format=auto',
      'fit=scale-down',
      'onerror=redirect'
    ].join(',');

    return '/cdn-cgi/image/' + options + '/' + localPath;
  }

  function applyResponsiveImage(img, originalSrc, options) {
    if (!img || !originalSrc) return;

    var config = options || {};
    var widths = config.widths || (isMobile() ? CF_IMAGE_WIDTHS_MOBILE : CF_IMAGE_WIDTHS_DESKTOP);
    var primaryWidth = config.primaryWidth || widths[widths.length - 1];
    var sizes = config.sizes || '(max-width: 720px) calc(100vw - 32px), 33vw';

    img.setAttribute('data-original-src', originalSrc);
    img.setAttribute('decoding', 'async');
    img.setAttribute('loading', config.eager ? 'eager' : 'lazy');

    if (config.eager) {
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.removeAttribute('fetchpriority');
    }

    if (canUseCloudflareTransformations()) {
      img.setAttribute('src', cloudflareImageUrl(originalSrc, primaryWidth));
      img.setAttribute(
        'srcset',
        widths.map(function (width) {
          return cloudflareImageUrl(originalSrc, width) + ' ' + width + 'w';
        }).join(', ')
      );
      img.setAttribute('sizes', sizes);
    } else {
      img.setAttribute('src', originalSrc);
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    }

    if (img.getAttribute('data-image-fallback-bound') === '1') return;
    img.setAttribute('data-image-fallback-bound', '1');

    img.addEventListener('error', function () {
      if (img.getAttribute('data-image-fallback-used') === '1') return;

      var fallbackSrc = img.getAttribute('data-original-src');
      if (!fallbackSrc) return;

      img.setAttribute('data-image-fallback-used', '1');
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.setAttribute('src', fallbackSrc);
    });
  }

  function initFadeIn(root) {
    var scope = root || document;
    var items = scope.querySelectorAll('.fade-in:not(.visible)');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '160px 0px', threshold: 0.01 });

    Array.prototype.forEach.call(items, function (el) {
      observer.observe(el);
    });
  }

  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });

    Array.prototype.forEach.call(mobileNav.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('active');
        document.body.classList.remove('nav-open');
      });
    });
  }

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

      if (image && data.image) {
        applyResponsiveImage(image, data.image, {
          widths: [480, 900],
          primaryWidth: 900,
          sizes: '(max-width: 720px) calc(100vw - 32px), 33vw'
        });
      }

      if (image && data.title) image.setAttribute('alt', data.title);
      if (title && data.title) title.textContent = data.title;
      if (subtitle && data.subtitle) subtitle.textContent = data.subtitle;
    });
  }

  function initProductGallery() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-product-gallery]'), function (gallery) {
      var mainImage = gallery.querySelector('[data-product-main-image]');
      var thumbs = gallery.querySelectorAll('[data-product-thumb]');
      if (!mainImage) return;

      var initialMainSrc = mainImage.getAttribute('src');
      if (initialMainSrc) {
        applyResponsiveImage(mainImage, initialMainSrc, {
          widths: [720, 1200, 1600],
          primaryWidth: 1200,
          sizes: '(max-width: 900px) calc(100vw - 32px), 56vw',
          eager: true
        });
      }

      Array.prototype.forEach.call(thumbs, function (button) {
        var thumbImage = button.querySelector('img');
        var originalImage = button.getAttribute('data-image');

        if (thumbImage) {
          var thumbSrc = thumbImage.getAttribute('src') || originalImage;
          if (thumbSrc) {
            applyResponsiveImage(thumbImage, thumbSrc, {
              widths: [160, 280],
              primaryWidth: 280,
              sizes: '120px'
            });
          }
        }

        button.addEventListener('click', function () {
          var nextImage = originalImage || button.getAttribute('data-image');
          var nextAlt = button.getAttribute('data-alt') || mainImage.alt;
          if (!nextImage) return;

          mainImage.removeAttribute('data-image-fallback-used');
          applyResponsiveImage(mainImage, nextImage, {
            widths: [720, 1200, 1600],
            primaryWidth: 1200,
            sizes: '(max-width: 900px) calc(100vw - 32px), 56vw',
            eager: true
          });
          mainImage.alt = nextAlt;

          Array.prototype.forEach.call(thumbs, function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
        });
      });
    });
  }

  function initSearch() {
    var toggle = document.querySelector('.search-toggle');
    var panel = document.querySelector('.search-panel');
    if (!toggle || !panel) return;

    var input = panel.querySelector('.search-input');
    var feedback = panel.querySelector('.search-feedback');
    var closeBtn = panel.querySelector('.search-close');
    if (!input) return;

    function setFeedback(message) {
      if (feedback) feedback.textContent = message || '';
    }

    function openPanel() {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      window.setTimeout(function () {
        input.focus();
      }, 50);
    }

    function closePanel() {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      setFeedback('');
      input.value = '';
    }

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      if (panel.classList.contains('is-open')) closePanel();
      else openPanel();
    });

    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('is-open')) {
        closePanel();
      }
    });

    panel.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });

    function runSearch() {
      var raw = (input.value || '').trim();
      var key = articleKey(raw);

      if (!raw) {
        setFeedback('Please enter an article number, for example AB692.');
        return;
      }

      if (!validArticleKey(key)) {
        setFeedback('Article format is AB692, AB-692, 692 or AB680/1.');
        return;
      }

      var products = getProducts();

      if (!products.length) {
        setFeedback('Catalog data has not loaded yet. Please refresh the page.');
        return;
      }

      var match = products.find(function (product) {
        return articleKey(product.article) === key;
      });

      if (!match) {
        setFeedback('No product found for "' + raw + '".');
        return;
      }

      setFeedback('Opening Art. ' + match.article + '...');
      window.location.href = productUrl(match);
    }
  }

  function initCatalog() {
    var grid = document.querySelector('[data-catalog-grid]');
    if (!grid) return;

    var category = grid.getAttribute('data-category');
    var products = getProducts().filter(function (product) {
      return product.category === category;
    });
    var emptyState = document.querySelector('[data-catalog-empty]');

    if (!products.length) {
      grid.innerHTML = '';
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    var mobile = isMobile();
    var requestedHash = window.location.hash
      ? decodeURIComponent(window.location.hash.slice(1))
      : '';
    var requestedSlug = articleSlug(requestedHash);
    var requestedIndex = requestedSlug
      ? products.findIndex(function (product) {
          return articleSlug(product.article) === requestedSlug;
        })
      : -1;

    var initialCount = mobile
      ? Math.min(Math.max(MOBILE_BATCH_SIZE, requestedIndex + 1), products.length)
      : products.length;
    var renderedCount = 0;

    var loadMoreButton = document.querySelector('[data-catalog-load-more]');
    if (!loadMoreButton) {
      loadMoreButton = document.createElement('button');
      loadMoreButton.type = 'button';
      loadMoreButton.className = 'catalog-load-more';
      loadMoreButton.setAttribute('data-catalog-load-more', '');
      loadMoreButton.textContent = 'Load more';
      grid.insertAdjacentElement('afterend', loadMoreButton);
    }

    loadMoreButton.addEventListener('click', function () {
      appendProducts(MOBILE_BATCH_SIZE);
    });

    function appendProducts(count) {
      var end = Math.min(renderedCount + count, products.length);
      if (end <= renderedCount) return;

      var fragment = document.createDocumentFragment();

      for (var index = renderedCount; index < end; index += 1) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = renderProductCard(products[index], index);
        if (wrapper.firstElementChild) {
          fragment.appendChild(wrapper.firstElementChild);
        }
      }

      grid.appendChild(fragment);
      renderedCount = end;
      loadMoreButton.hidden = !mobile || renderedCount >= products.length;

      bindCatalogImages(grid);
      initFadeIn(grid);
    }

    function bindCatalogImages(root) {
      Array.prototype.forEach.call(root.querySelectorAll('img[data-catalog-original]:not([data-catalog-image-ready])'), function (img) {
        var originalSrc = img.getAttribute('data-catalog-original');
        var eager = img.getAttribute('data-catalog-eager') === '1';

        img.setAttribute('data-catalog-image-ready', '1');
        applyResponsiveImage(img, originalSrc, {
          widths: mobile ? CF_IMAGE_WIDTHS_MOBILE : CF_IMAGE_WIDTHS_DESKTOP,
          primaryWidth: mobile ? 800 : 1200,
          sizes: mobile
            ? 'calc(100vw - 32px)'
            : '(max-width: 1200px) 33vw, 420px',
          eager: eager
        });
      });
    }

    function renderProductCard(product, productIndex) {
      var safeArticle = escapeHtml(product.article || '');
      var safeTagline = escapeHtml(product.tagline || '');
      var safeDescription = escapeHtml(product.description || '');
      var safeColors = escapeHtml(listText(product.colors));
      var safeSizes = escapeHtml(listText(product.sizes));
      var safeAvailability = escapeHtml(product.availability || '');
      var url = productUrl(product);
      var safeUrl = escapeAttr(url);
      var slug = articleSlug(product.article);
      var images = (product.images || []).filter(Boolean).slice(0, mobile ? 1 : 3);

      var galleryHtml = images.length
        ? images.map(function (src, imageIndex) {
            var safeOriginal = escapeAttr(src);
            var alt = escapeAttr(
              (product.name || product.article || 'Product') +
              ' image ' +
              (imageIndex + 1)
            );
            var isFirstImage = productIndex === 0 && imageIndex === 0;
            var imageHtml = '<img src="' + safeOriginal + '"' +
              ' data-catalog-original="' + safeOriginal + '"' +
              ' data-catalog-eager="' + (isFirstImage ? '1' : '0') + '"' +
              ' alt="' + alt + '">';

            if (url && url !== '#') {
              return '<a class="catalog-model__frame" href="' + safeUrl + '" aria-label="View Art. ' + safeArticle + '">' +
                imageHtml +
                '</a>';
            }

            return '<div class="catalog-model__frame">' + imageHtml + '</div>';
          }).join('')
        : '<div class="catalog-model__frame catalog-model__frame--empty"></div>';

      var ctaHtml = url && url !== '#'
        ? '<a class="catalog-model__cta" href="' + safeUrl + '">View product</a>'
        : '<a class="catalog-model__cta" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener">Enquire on WhatsApp</a>';

      return '' +
        '<article class="catalog-model fade-in" id="' + escapeAttr(slug) + '" data-article="' + safeArticle + '">' +
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
    }

    function scrollToHashProduct() {
      if (!window.location.hash) return;

      var slug = articleSlug(decodeURIComponent(window.location.hash.slice(1)));
      var target = document.getElementById(slug);
      if (!target) return;

      window.setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('catalog-model--highlight');
        window.setTimeout(function () {
          target.classList.remove('catalog-model--highlight');
        }, 2000);
      }, 120);
    }

    appendProducts(initialCount);
    scrollToHashProduct();
  }

  function injectRuntimeStyles() {
    if (document.getElementById('alinas-runtime-fixes')) return;

    var style = document.createElement('style');
    style.id = 'alinas-runtime-fixes';
    style.textContent = [
      '.catalog-load-more{display:block;margin:34px auto 0;padding:13px 34px;border:1px solid var(--color-text);background:var(--color-text);color:var(--color-bg);font-family:var(--font-body);font-size:.72rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;}',
      '.catalog-load-more[hidden]{display:none!important;}',
      '.catalog-model__frame--empty{background:var(--color-bg-warm);}',
      '.catalog-model{content-visibility:auto;contain-intrinsic-size:900px;}',
      '@media(max-width:720px){.catalog-model__frame:nth-child(n+2){display:none!important;}.catalog-list{gap:44px;}.catalog-model{contain-intrinsic-size:1100px;}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function init() {
    injectRuntimeStyles();
    initHomeContent();
    initMobileNav();
    initSearch();
    initProductGallery();
    initCatalog();
    initFadeIn();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
