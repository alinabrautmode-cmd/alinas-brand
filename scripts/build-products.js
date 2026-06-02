const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const productsDir = path.join(rootDir, 'content', 'products');
const categoriesPath = path.join(rootDir, 'content', 'settings', 'categories.json');
const outputPath = path.join(rootDir, 'assets', 'js', 'products.js');

const WHATSAPP_NUMBER = '380937709193';
const INSTAGRAM_URL = 'https://www.instagram.com/alinas_brand.ua?igsh=MWxlZzA3dmJiOXM4bA%3D%3D&utm_source=qr';

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read JSON file ${filePath}: ${error.message}`);
  }
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          return item.image || item.url || item.path || item.file || item.value || '';
        }
        return String(item);
      })
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function slugifyArticle(article) {
  return String(article || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function productFileName(article) {
  return `product-${slugifyArticle(article)}.html`;
}

function productUrl(article) {
  return `/product/${slugifyArticle(article)}`;
}

function catalogUrl(category) {
  return `/catalog-${category}.html`;
}

function rootAssetPath(src) {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src;
  return `/${src.replace(/^\/+/, '')}`;
}

function listText(value) {
  return Array.isArray(value) && value.length ? value.join(', ') : '—';
}

function normalizeProduct(raw, fileName) {
  const article = String(raw.article || '').trim().toUpperCase();
  const category = String(raw.category || '').trim().toLowerCase();

  if (!article) {
    throw new Error(`${fileName}: product article is required`);
  }
  if (!category) {
    throw new Error(`${fileName}: product category is required`);
  }

  return {
    article,
    category,
    name: String(raw.name || `Art. ${article}`).trim(),
    tagline: String(raw.tagline || '').trim(),
    description: String(raw.description || '').trim(),
    colors: normalizeArray(raw.colors),
    sizes: normalizeArray(raw.sizes),
    availability: String(raw.availability || '').trim(),
    images: normalizeArray(raw.images),
    productSlug: slugifyArticle(article),
    pageUrl: productUrl(article),
    productFile: productFileName(article),
    published: raw.published !== false,
    sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : 100
  };
}

function categoryTitle(categories, category) {
  return categories && categories[category] && categories[category].title
    ? categories[category].title
    : category.charAt(0).toUpperCase() + category.slice(1);
}

function renderProductPage(product, categories) {
  const safeTitle = escapeHtml(product.name || `Art. ${product.article}`);
  const safeArticle = escapeHtml(product.article);
  const safeTagline = escapeHtml(product.tagline || 'Product details');
  const safeDescription = escapeHtml(product.description || 'For details about this item, please contact us directly.');
  const safeColors = escapeHtml(listText(product.colors));
  const safeSizes = escapeHtml(listText(product.sizes));
  const safeAvailability = escapeHtml(product.availability || 'Contact us for availability');
  const categoryName = categoryTitle(categories, product.category);
  const safeCategoryName = escapeHtml(categoryName);
  const safeCategoryUrl = escapeAttr(catalogUrl(product.category));
  const images = product.images.length ? product.images : [];
  const firstImage = images[0] ? rootAssetPath(images[0]) : '';
  const whatsappText = encodeURIComponent(`Hello, I am interested in ${product.name || `Art. ${product.article}`}.`);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

  const thumbsHtml = images.map((src, index) => {
    const imagePath = escapeAttr(rootAssetPath(src));
    const alt = `${product.name || product.article} image ${index + 1}`;
    return `
              <button type="button" class="product-thumb${index === 0 ? ' is-active' : ''}" data-product-thumb data-image="${imagePath}" data-alt="${escapeAttr(alt)}">
                <img src="${imagePath}" alt="${escapeAttr(alt)}" loading="lazy">
              </button>`;
  }).join('');

  const mainImageHtml = firstImage
    ? `<img data-product-main-image src="${escapeAttr(firstImage)}" alt="${safeTitle} by Alina's Brand">`
    : `<div class="product-gallery__placeholder">No image uploaded</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — Alina's Brand</title>
  <meta name="description" content="${safeTitle} by Alina's Brand. ${safeDescription}">
  <link rel="canonical" href="https://www.alinasbrand.com${escapeAttr(product.pageUrl)}">
  <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>

  <header class="header">
    <div class="container header__inner">
      <a href="/index.html" class="header__logo">
        <span class="header__logo-name">Alina's Brand</span>
        <span class="header__logo-tagline">made with love</span>
      </a>
      <nav class="nav">
        <a href="/index.html" class="nav__link">Home</a>
        <div class="nav__dropdown">
          <a href="/catalog-dresses.html" class="nav__link nav__link--active">Catalog</a>
          <div class="nav__dropdown-menu">
            <ul class="nav__dropdown-list">
              <li><a href="/catalog-dresses.html">Dresses</a></li>
              <li><a href="/catalog-suits.html">Suits</a></li>
              <li><a href="/catalog-jumpsuits.html">Jumpsuits</a></li>
            </ul>
          </div>
        </div>
        <a href="/contacts.html" class="nav__link">Contacts</a>
      </nav>
      <div class="header__actions">
        <button type="button" class="search-toggle" aria-label="Search by article" aria-expanded="false">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="20" y1="20" x2="16.5" y2="16.5" stroke-linecap="round"></line>
          </svg>
        </button>
        <button class="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <form class="search-panel" role="search">
      <div class="search-panel__inner">
        <span class="search-panel__label">Search by article</span>
        <input type="text" class="search-input" name="article" placeholder="e.g. AB-2601" autocomplete="off" inputmode="text">
        <button type="submit" class="search-submit">Find</button>
        <button type="button" class="search-close" aria-label="Close search">&times;</button>
        <div class="search-feedback" role="status" aria-live="polite"></div>
      </div>
    </form>
  </header>

  <div class="mobile-nav">
    <a href="/index.html">Home</a>
    <a href="/catalog-dresses.html">Dresses</a>
    <a href="/catalog-suits.html">Suits</a>
    <a href="/catalog-jumpsuits.html">Jumpsuits</a>
    <a href="/contacts.html">Contacts</a>
  </div>

  <section class="product-page">
    <div class="container">
      <div class="product-breadcrumbs">
        <a href="/index.html">Home</a> / <a href="${safeCategoryUrl}">${safeCategoryName}</a> / Art. ${safeArticle}
      </div>

      <div class="product-layout">
        <div class="product-gallery fade-in" data-product-gallery>
          <div class="product-gallery__main">
            ${mainImageHtml}
          </div>
          ${images.length > 1 ? `<div class="product-gallery__thumbs">${thumbsHtml}
          </div>` : ''}
        </div>

        <div class="product-info fade-in">
          <div class="section__overtitle">${safeTagline}</div>
          <h1>${safeTitle}</h1>
          <p class="product-info__lead">${safeDescription}</p>

          <div class="product-meta-grid">
            <div class="product-meta-card">
              <span class="product-meta-card__label">Article</span>
              <span>${safeArticle}</span>
            </div>
            <div class="product-meta-card">
              <span class="product-meta-card__label">Available colors</span>
              <span>${safeColors}</span>
            </div>
            <div class="product-meta-card">
              <span class="product-meta-card__label">Available sizes</span>
              <span>${safeSizes}</span>
            </div>
            <div class="product-meta-card">
              <span class="product-meta-card__label">Availability</span>
              <span>${safeAvailability}</span>
            </div>
          </div>

          <div class="product-actions">
            <a class="hero__cta" href="${escapeAttr(whatsappUrl)}" target="_blank" rel="noopener">Order via WhatsApp</a>
            <a class="product-link-inline" href="${escapeAttr(INSTAGRAM_URL)}" target="_blank" rel="noopener">Open Instagram</a>
          </div>

          <div class="product-note">
            To clarify available fabrics, production timing or measurements, message us directly on WhatsApp or Instagram.
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer__inner">
        <div class="footer__brand">
          <div class="footer__brand-name">Alina's Brand</div>
          <div class="footer__brand-tagline">made with love</div>
          <p>Ukrainian label creating elegant evening dresses and bridal-inspired occasionwear.</p>
        </div>
        <div class="footer__links">
          <div class="footer__col">
            <h4>Catalog</h4>
            <ul>
              <li><a href="/catalog-dresses.html">Dresses</a></li>
              <li><a href="/catalog-suits.html">Suits</a></li>
              <li><a href="/catalog-jumpsuits.html">Jumpsuits</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <h4>Contacts</h4>
            <ul>
              <li><a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener">WhatsApp</a></li>
              <li><a href="mailto:alinabrautmode@gmail.com">alinabrautmode@gmail.com</a></li>
              <li><a href="${escapeAttr(INSTAGRAM_URL)}" target="_blank" rel="noopener">Instagram</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer__bottom">© 2024–2026 Alina's Brand. All rights reserved.</div>
    </div>
  </footer>

  <a href="https://wa.me/${WHATSAPP_NUMBER}" class="wa-float" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 2.825.737 5.476 2.025 7.775L0 32l8.45-2.213A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.087a13.04 13.04 0 0 1-6.65-1.812l-.475-.288-4.913 1.288 1.313-4.788-.313-.5A13.025 13.025 0 0 1 2.913 16C2.913 8.762 8.763 2.912 16 2.912S29.087 8.762 29.087 16 23.237 29.087 16 29.087zm7.413-9.762c-.4-.2-2.4-1.187-2.775-1.325-.375-.137-.65-.2-.925.2-.275.4-1.062 1.325-1.3 1.6-.238.275-.475.3-.875.1-.4-.2-1.7-.625-3.238-2-1.2-1.062-2-2.388-2.237-2.788-.238-.4-.025-.6.175-.8.187-.187.4-.475.6-.712.2-.238.262-.4.4-.675.137-.275.075-.512-.025-.713-.1-.2-.875-2.125-1.2-2.913-.313-.762-.638-.662-.875-.675-.225-.012-.488-.012-.75-.012-.263 0-.687.1-1.05.487-.362.4-1.387 1.357-1.387 3.307s1.425 3.838 1.624 4.1c.2.275 2.812 4.288 6.812 6.012.95.412 1.687.65 2.262.838.95.3 1.812.262 2.5.162.762-.113 2.4-.975 2.738-1.925.337-.95.337-1.762.237-1.925-.1-.175-.362-.275-.762-.475z"/>
    </svg>
  </a>

  <script src="/assets/js/products.js"></script>
  <script src="/assets/js/site.js"></script>
</body>
</html>`;
}

function removeGeneratedProductPages() {
  fs.readdirSync(rootDir)
    .filter((file) => /^product-.+\.html$/.test(file))
    .forEach((file) => fs.unlinkSync(path.join(rootDir, file)));

  const cleanProductDir = path.join(rootDir, 'product');
  if (fs.existsSync(cleanProductDir)) {
    fs.rmSync(cleanProductDir, { recursive: true, force: true });
  }
}

function writeProductPage(product, html) {
  // Backward-compatible generated file: /product-ab-2601.html
  fs.writeFileSync(path.join(rootDir, product.productFile), html);

  // Clean URL version without relying on Netlify redirects: /product/ab-2601/
  const cleanDir = path.join(rootDir, 'product', product.productSlug);
  fs.mkdirSync(cleanDir, { recursive: true });
  fs.writeFileSync(path.join(cleanDir, 'index.html'), html);
}

function buildProducts() {
  if (!fs.existsSync(productsDir)) {
    throw new Error(`Products folder does not exist: ${productsDir}`);
  }

  const files = fs.readdirSync(productsDir)
    .filter((file) => file.endsWith('.json'))
    .sort();

  const normalizedProducts = files
    .map((file) => normalizeProduct(readJson(path.join(productsDir, file)), file));

  const duplicateArticles = normalizedProducts
    .map((product) => product.article)
    .filter((article, index, articles) => articles.indexOf(article) !== index);

  if (duplicateArticles.length) {
    throw new Error(`Duplicate product article(s): ${[...new Set(duplicateArticles)].join(', ')}`);
  }

  const products = normalizedProducts
    .filter((product) => product.published)
    .sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.article.localeCompare(b.article);
    });

  const categories = fs.existsSync(categoriesPath) ? readJson(categoriesPath) : {};

  const productsForBrowser = products.map(({ published, sortOrder, productFile, productSlug, ...product }) => product);

  const output = `/* ============================================================
   ALINA'S BRAND — Products data source
   ------------------------------------------------------------
   AUTO-GENERATED FILE. Do not edit this file manually.

   Edit products in content/products/*.json instead.
   The CMS admin panel edits those JSON files for you.
   ============================================================ */

window.ALINAS_BRAND_PRODUCTS = ${JSON.stringify(productsForBrowser, null, 2)};

window.ALINAS_BRAND_CATEGORIES = ${JSON.stringify(categories, null, 2)};
`;

  fs.writeFileSync(outputPath, output);

  removeGeneratedProductPages();
  products.forEach((product) => {
    writeProductPage(product, renderProductPage(product, categories));
  });

  console.log(`Generated ${path.relative(rootDir, outputPath)} from ${products.length} published products.`);
  console.log(`Generated ${products.length} clean product page(s) under /product/<article>/ and compatibility HTML files.`);
}

buildProducts();
