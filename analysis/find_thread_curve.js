const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// The bundle has Three.js bundled. Let's find where Ss (CatmullRomCurve3) is instantiated with 'new Ss('
const matches = [];
const regex = /new\s+Ss\s*\(/g;
let m;
while ((m = regex.exec(js)) !== null) {
  matches.push(m.index);
}
console.log('new Ss count:', matches.length);
for (const idx of matches) {
  console.log('\n--- Match at', idx, '---');
  console.log(js.slice(Math.max(0, idx - 100), Math.min(js.length, idx + 400)));
}
