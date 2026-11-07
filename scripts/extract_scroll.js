import fs from "fs";

const code = fs.readFileSync("analysis/main.js", "utf8");

// Search for wheel, scroll, deltaY, or inertia
const wheelMatches = [];
for (const m of code.matchAll(/(wheel|deltaY|touchmove|inertia|targetProgress|smoothScroll|cameraCurve|CatmullRom|fov|dwell)/gi)) {
  wheelMatches.push({ term: m[0], index: m.index });
}
console.log("Wheel/Scroll matches:", wheelMatches.length);

// Print context around wheel listener
for (const m of wheelMatches.filter(m => m.term.toLowerCase() === 'deltay' || m.term.toLowerCase() === 'wheel')) {
  console.log(`=== MATCH AT ${m.index} (${m.term}) ===`);
  console.log(code.substring(Math.max(0, m.index - 300), Math.min(code.length, m.index + 500)));
}
