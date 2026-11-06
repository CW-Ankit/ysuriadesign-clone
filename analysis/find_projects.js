const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// Find q_ definition
const pIdx = js.indexOf('/projects/1-p2p/cover.webp');
if (pIdx !== -1) {
  console.log('--- AROUND PROJECTS ---');
  console.log(js.slice(pIdx - 600, pIdx + 1500));
}
