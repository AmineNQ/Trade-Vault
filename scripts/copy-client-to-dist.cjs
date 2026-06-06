const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const from = path.join(__dirname, '..', 'dist', 'client');
const to = path.join(__dirname, '..', 'dist');

console.log(`Copying from ${from} to ${to}`);
copyRecursive(from, to);

// Ensure index.html exists in dist/client with correct asset references
const indexClientPath = path.join(__dirname, '..', 'dist', 'client', 'index.html');
const assetsDir = path.join(__dirname, '..', 'dist', 'client', 'assets');

let cssFile = '';
let jsFile = '';

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const cssFiles = files.filter(f => f.endsWith('.css'));
  const jsFiles = files.filter(f => f.endsWith('.js') && f.startsWith('index-'));
  
  if (cssFiles.length > 0) cssFile = cssFiles[0];
  if (jsFiles.length > 0) jsFile = jsFiles[0];
}

if (!fs.existsSync(indexClientPath)) {
  const cssLink = cssFile ? `    <link rel="stylesheet" href="/assets/${cssFile}" />\n` : '';
  const jsScript = jsFile 
    ? `    <script type="module" src="/assets/${jsFile}"><\/script>\n`
    : `    <script type="module" src="/assets/index.js"><\/script>\n`;
  
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Trade Vault - Trading Journal" />
    <title>Trade Vault</title>
${cssLink}  </head>
  <body>
    <div id="root"></div>
${jsScript}  </body>
</html>`;
  
  fs.writeFileSync(indexClientPath, html);
  console.log(`Created ${indexClientPath} with CSS: ${cssFile}, JS: ${jsFile}`);
}

// Also ensure it's in dist/
const indexDistPath = path.join(__dirname, '..', 'dist', 'index.html');
if (!fs.existsSync(indexDistPath)) {
  const html = fs.readFileSync(indexClientPath, 'utf8');
  fs.writeFileSync(indexDistPath, html);
  console.log(`Created ${indexDistPath}`);
}

console.log('Done.');
