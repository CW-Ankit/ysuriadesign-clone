import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

for (const match of code.matchAll(/getElementById\([`"']scroll[`"']\)|#scroll/g)) {
  const i = match.index;
  console.log("Match at", i);
  console.log(code.substring(Math.max(0, i - 150), Math.min(code.length, i + 350)));
}

// Also search where storyMax is defined or where .style.height is assigned for scroll
for (const match of code.matchAll(/storyMax|scrollHeight|innerHeight\s*\*/g)) {
  const i = match.index;
  console.log("=== StoryMax match at", i);
  console.log(code.substring(Math.max(0, i - 100), Math.min(code.length, i + 250)));
}
