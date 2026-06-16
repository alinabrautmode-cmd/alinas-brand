const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const assets = [
  'assets/css/style.css',
  'assets/js/site.js',
  'assets/js/products.js',
  'assets/js/home.js'
].filter((relativePath) => fs.existsSync(path.join(rootDir, relativePath)));

function fileHash(relativePath) {
  const content = fs.readFileSync(path.join(rootDir, relativePath));
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
}

function listHtmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') return [];

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(fullPath);
    return entry.isFile() && entry.name.toLowerCase().endsWith('.html')
      ? [fullPath]
      : [];
  });
}

const versions = Object.fromEntries(
  assets.map((asset) => [asset, fileHash(asset)])
);

let changedFiles = 0;

listHtmlFiles(rootDir).forEach((htmlPath) => {
  const original = fs.readFileSync(htmlPath, 'utf8');
  let updated = original;

  Object.entries(versions).forEach(([asset, version]) => {
    const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      "(/?" + escapedAsset + ")(?:\\?v=[^\"'\\s>]*)?",
      'g'
    );
    updated = updated.replace(pattern, '$1?v=' + version);
  });

  if (updated !== original) {
    fs.writeFileSync(htmlPath, updated);
    changedFiles += 1;
  }
});

console.log(
  `Stamped ${changedFiles} HTML file(s) with content-based asset versions.`
);
