const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// Find the definition of qy or the array of chapters
const idx = js.indexOf('{id:`origin`');
if (idx !== -1) {
  console.log('--- FOUND CHAPTERS ARRAY ---');
  console.log(js.slice(idx - 100, idx + 1500));
}

// Find work items / projects
const workIdx = js.indexOf('{id:`work`');
if (workIdx !== -1) {
  console.log('--- WORK CONTEXT ---');
  console.log(js.slice(workIdx - 200, workIdx + 1200));
}

// Search for modal, works, projects, jumper, kelp, etc.
const kelpIdx = js.indexOf('Kelp');
if (kelpIdx !== -1) {
  console.log('--- KELP CONTEXT ---');
  console.log(js.slice(kelpIdx - 200, kelpIdx + 600));
}
