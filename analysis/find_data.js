const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// Look for chapter data, project data, work data
console.log('--- SEARCHING FOR CHAPTERS & WORK ---');
// Let's search for keywords like "Chapter", "01", "Jumper", "title", "stats", "projects"
const lines = js.split('\n');
console.log('Total JS length:', js.length, 'lines:', lines.length);

// Let's search for JSON-like or object arrays
// Look for strings containing "Chapter" or "01"
const re = /\{[^{}]*title[^{}]*\}/g;
let m;
let count = 0;
while ((m = re.exec(js)) !== null && count < 20) {
  console.log(`Match ${count++}:`, m[0].slice(0, 200));
}

// Let's search for mentions of chapters or works in the bundle
const needle = 'Chapter';
let idx = 0;
while ((idx = js.indexOf(needle, idx)) !== -1) {
  console.log('Chapter context:', js.slice(Math.max(0, idx - 100), Math.min(js.length, idx + 300)));
  idx += needle.length;
}
