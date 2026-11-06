const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

const figIdx = js.indexOf('ky({');
if (figIdx !== -1) {
  console.log('--- FIGURE FUNCTION ---');
  console.log(js.slice(figIdx - 50, figIdx + 2500));
}
