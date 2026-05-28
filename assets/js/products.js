/* ============================================================
   ALINA'S BRAND — Products data source
   ------------------------------------------------------------
   THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL PRODUCTS.

   Once a CMS is connected (Netlify CMS / Decap / Sanity etc.),
   this array will be generated automatically from CMS entries.
   Until then, manage products by editing this file.

   To add a new product:
     1) duplicate one of the objects below
     2) update every field
     3) drop product photos into assets/img/products/<article>/
     4) optionally create a dedicated product page (see
        product-ab-2601.html as a template)

   FIELD REFERENCE
   ---------------
   article      : Unique article code (e.g. "AB-2601"). Required.
   category     : "dresses" | "suits" | "jumpsuits". Required.
   name         : Short product title shown on the product page.
   tagline      : Small overtitle on product page (e.g. "Signature gown").
   description  : 1–3 sentences describing the model.
   colors       : Array of human-readable color names.
   sizes        : Array of available sizes.
   availability : Short text (e.g. "Made to order", "In stock").
   images       : Array of image paths (first one is used as the
                  catalog thumbnail).
   pageUrl      : Path to the dedicated product page, or null if
                  the product does not have one yet.
   ============================================================ */

window.ALINAS_BRAND_PRODUCTS = [
  {
    article: "AB-2601",
    category: "dresses",
    name: "Art. AB-2601",
    tagline: "Signature gown",
    description: "A sleek halter gown with an open back and a fluid silhouette designed for evening events, receptions and formal celebrations.",
    colors: ["White", "Red", "Black"],
    sizes: ["XS", "S", "M", "L"],
    availability: "Made to order",
    images: [
      "assets/img/products/ab-2601/ab-2601-1.jpg",
      "assets/img/products/ab-2601/ab-2601-2.jpg",
      "assets/img/products/ab-2601/ab-2601-3.jpg"
    ],
    pageUrl: "product-ab-2601.html"
  },
  {
    article: "AB-2602",
    category: "dresses",
    name: "Art. AB-2602",
    tagline: "Evening gown",
    description: "A floor-length evening gown with a structured bodice and a thigh-high slit, tailored for formal events.",
    colors: ["White", "Black"],
    sizes: ["XS", "S", "M", "L"],
    availability: "Made to order",
    images: [
      "assets/img/products/ab-2602/ab-2602-1.jpg",
      "assets/img/products/ab-2602/ab-2602-2.jpg"
    ],
    pageUrl: null
  },
  {
    article: "AB-2603",
    category: "dresses",
    name: "Art. AB-2603",
    tagline: "Midi dress",
    description: "A refined strapless midi dress with a fitted bodice and full skirt — easy to style for daytime celebrations and receptions.",
    colors: ["Sky Blue", "Red", "Ivory"],
    sizes: ["XS", "S", "M", "L"],
    availability: "Made to order",
    images: [
      "assets/img/products/ab-2603/ab-2603-1.jpg",
      "assets/img/products/ab-2603/ab-2603-2.jpg"
    ],
    pageUrl: null
  },
  {
    article: "AB-2604",
    category: "dresses",
    name: "Art. AB-2604",
    tagline: "Occasion dress",
    description: "A bustier midi dress with a corset waist and full skirt — designed to feel polished both in photos and across a full evening.",
    colors: ["Black", "Pink", "Ivory"],
    sizes: ["XS", "S", "M", "L"],
    availability: "Made to order",
    images: [
      "assets/img/products/ab-2604/ab-2604-1.jpg",
      "assets/img/products/ab-2604/ab-2604-2.jpg"
    ],
    pageUrl: null
  }
];

window.ALINAS_BRAND_CATEGORIES = {
  dresses: {
    title: "Dresses",
    subtitle: "Evening gowns, midi and occasion dresses",
    emptyMessage: "New dresses are coming soon. Reach out via WhatsApp or Instagram for current availability."
  },
  suits: {
    title: "Suits",
    subtitle: "Tailored sets for receptions and city events",
    emptyMessage: "New suits are coming soon. Reach out via WhatsApp or Instagram for current availability."
  },
  jumpsuits: {
    title: "Jumpsuits",
    subtitle: "Modern one-piece silhouettes for special occasions",
    emptyMessage: "New jumpsuits are coming soon. Reach out via WhatsApp or Instagram for current availability."
  }
};
