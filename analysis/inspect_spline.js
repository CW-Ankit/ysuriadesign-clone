const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// Look for CatmullRomCurve3 or curve or spline
const curveMatches = [];
const curveRegex = /CatmullRomCurve3|CurvePath|spline|thread/gi;
let m;
while ((m = curveRegex.exec(js)) !== null) {
  curveMatches.push({ index: m.index, match: m[0] });
}
console.log('Total curve/thread matches:', curveMatches.length);
for (const cm of curveMatches.slice(0, 15)) {
  console.log(`\nMatch "${cm.match}" at ${cm.index}:`);
  console.log(js.slice(Math.max(0, cm.index - 100), Math.min(js.length, cm.index + 400)));
}
