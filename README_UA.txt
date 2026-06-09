Міні-фікс для категорій Alina's Brand

Проблема: у CMS поле category було hidden із default: dresses, тому товари з розділу Костюми потрапляли на сайт у Dresses.

Що замінити у вашому репозиторії:
1) admin/config.yml
2) scripts/build-products.js
3) assets/js/products.js
4) усі файли з папки content/products/suits/

Після заміни зробіть commit у GitHub. Netlify має автоматично перезібрати сайт.

Після деплою нові товари, додані через CMS у content/products/suits, будуть показуватись у catalog-suits.html.
