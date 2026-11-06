const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// Let's locate the full J_ array
const jStart = js.indexOf('J_=[');
let jEnd = js.indexOf(';function', jStart);
if (jEnd === -1) jEnd = js.indexOf('];', jStart) + 1;
const jStr = js.slice(jStart + 3, jEnd);
console.log('J_ length:', jStr.length);

// Let's locate qy
const qyStart = js.indexOf('qy=[');
let qyEnd = js.indexOf('];', qyStart) + 1;
const qyStr = js.slice(qyStart + 3, qyEnd);
console.log('qy length:', qyStr.length);

fs.writeFileSync('analysis/projects_raw.js', 'const q_ = "https://ysuriadesign.com/assets";\nmodule.exports = ' + jStr);
fs.writeFileSync('analysis/chapters_raw.js', 'module.exports = ' + qyStr);

console.log('Wrote projects_raw.js and chapters_raw.js');
