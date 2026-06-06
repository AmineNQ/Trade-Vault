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
console.log('Done.');
