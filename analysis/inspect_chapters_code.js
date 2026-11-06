const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

const chapters = ['origin', 'memory', 'refraction', 'work', 'threshold', 'network'];

for (const ch of chapters) {
  const needle = `id:\`${ch}\``;
  let idx = 0;
  console.log(`\n================ CHAPTER: ${ch} ================`);
  while ((idx = js.indexOf(needle, idx)) !== -1) {
    console.log(js.slice(Math.max(0, idx - 100), Math.min(js.length, idx + 800)));
    idx += needle.length;
  }
}
