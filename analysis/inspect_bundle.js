const fs = require('fs');

const js = fs.readFileSync('analysis/main.js', 'utf8');
const css = fs.readFileSync('analysis/main.css', 'utf8');

console.log('--- ASSET STRINGS IN JS ---');
// Match URLs and paths
const assetRegex = /["'`]((\/|\.\/|https?:\/\/)[^"'`\s]+\.(png|jpg|jpeg|webp|avif|gif|svg|mp3|wav|ogg|glb|gltf|bin|hdr|exr|woff2?|ttf|mp4|webm))["'`]/gi;
const matches = new Set();
let m;
while ((m = assetRegex.exec(js)) !== null) {
  matches.add(m[1]);
}
console.log('Matches in JS:', Array.from(matches));

console.log('\n--- ASSET STRINGS IN CSS ---');
const cssMatches = new Set();
while ((m = assetRegex.exec(css)) !== null) {
  cssMatches.add(m[1]);
}
console.log('Matches in CSS:', Array.from(cssMatches));

console.log('\n--- URL(...) IN CSS ---');
const urlRegex = /url\(([^)]+)\)/g;
const cssUrls = new Set();
while ((m = urlRegex.exec(css)) !== null) {
  cssUrls.add(m[1].replace(/['"]/g, ''));
}
console.log('CSS urls:', Array.from(cssUrls));

// Check library signatures in JS
console.log('\n--- LIBRARIES DETECTED IN JS ---');
const libs = ['three', 'lenis', 'gsap', 'ogl', 'regl', 'howler', 'tone', 'barba', 'split-type', 'lucide'];
for (const lib of libs) {
  if (js.toLowerCase().includes(lib)) {
    console.log(`Found reference to: ${lib}`);
  }
}
