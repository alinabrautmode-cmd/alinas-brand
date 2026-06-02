# Alina's Brand — Static Site

Static Netlify site for **Alina's Brand**. All product data is centralised
so that products can be edited in one place and (later) plugged into a
headless CMS.

## File map

```
.
├── index.html                Home page
├── catalog-dresses.html      Dresses category (renders from data)
├── catalog-suits.html        Suits category (renders from data)
├── catalog-jumpsuits.html    Jumpsuits category (renders from data)
├── product-ab-2601.html      Dedicated product page (template for new ones)
├── contacts.html             Contacts
├── netlify.toml              Build config + 301 redirects from old URLs
├── robots.txt
└── assets/
    ├── css/style.css
    ├── img/
    │   ├── hero-photo.jpg
    │   ├── editorial/                  Editorial / home imagery
    │   └── products/<article>/         Per-product galleries
    └── js/
        ├── products.js       ★ SINGLE SOURCE OF TRUTH for products
        └── site.js           Nav, search, catalog rendering
```

## Where the catalog comes from

`assets/js/products.js` exports two globals:

- `window.ALINAS_BRAND_PRODUCTS` — array of product objects
- `window.ALINAS_BRAND_CATEGORIES` — labels for each category

Each catalog page has an empty container:
`<div data-catalog-grid data-category="dresses"></div>`.
On load, `assets/js/site.js` reads `products.js`, filters by category
and renders the cards. **You don't edit the HTML to add a product —
you only edit `products.js`.**

## Adding a product (manual, before CMS)

1. Open `assets/js/products.js`.
2. Copy an existing entry and update every field:

```js
{
  article: "AB-2701",             // unique code
  category: "suits",              // dresses | suits | jumpsuits
  name: "Art. AB-2701",
  tagline: "Tailored set",        // small overtitle (product page)
  description: "Short 1–3 sentence description.",
  colors: ["Ivory", "Black"],
  sizes: ["XS", "S", "M", "L"],
  availability: "Made to order",  // free text
  images: [
    "assets/img/products/ab-2701/ab-2701-1.jpg",
    "assets/img/products/ab-2701/ab-2701-2.jpg"
  ],
  pageUrl: null                   // or "product-ab-2701.html"
}
```

3. Create `assets/img/products/ab-2701/` and drop the photos in.
4. (Optional) Duplicate `product-ab-2601.html`, rename it to
   `product-ab-2701.html`, update the content, then set `pageUrl` in
   `products.js` to the new file.

That's it. The catalog page picks it up automatically.

## Search by article (header magnifier)

Accepts: `AB-2601`, `ab-2601`, `ab2601`, or just `2601`.

- If the product has a `pageUrl`, search redirects to it.
- Otherwise it redirects to the right catalog page anchored at the
  product card (`catalog-dresses.html#ab-2601`).
- Invalid formats and missing articles show an inline message.

## Connecting a CMS later (recommended: Decap / Netlify CMS)

Because everything goes through `products.js`, swapping in a CMS is
mechanical:

1. Add `admin/` with `config.yml` describing a collection that mirrors
   the field schema above (`article`, `category`, `name`, `tagline`,
   `description`, `colors`, `sizes`, `availability`, `images`,
   `pageUrl`).
2. Store each product as one Markdown / JSON file in `_products/`.
3. Replace the hard-coded array in `products.js` with a build step
   that reads `_products/*` and writes the same
   `window.ALINAS_BRAND_PRODUCTS` array. Netlify rebuilds on every
   CMS commit.

Nothing else on the site needs to change — catalog rendering, search,
and the empty-state UX all already read from that one array.

## Empty categories

Suits and Jumpsuits ship with no products. The catalog page detects
this automatically and shows a "New pieces are on the way" panel with
a WhatsApp button. As soon as you add even one product to that
category in `products.js`, the empty state disappears.

## Redirects

`netlify.toml` 301-redirects retired URLs:

- `/catalog-2025(.html)` → `/catalog-dresses.html`
- `/catalog-2026(.html)` → `/catalog-dresses.html`

Old Instagram / share links don't 404.

## Local preview

```
python3 -m http.server 8000
# open http://127.0.0.1:8000
```


## Product pages update

Product pages are generated automatically during `npm run build` for every published product in `content/products`.

For article `AB692`, the page URL will be:

```txt
/product/ab692/
```

Do not add a manual product page link in the CMS. The URL is generated from the Article field.
