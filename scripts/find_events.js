import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const regex = /addEventListener\([`"']([^`"']+)[`"']/g;
const events = new Set();
let m;
while ((m = regex.exec(code)) !== null) {
  events.add(m[1]);
  if (["wheel", "scroll", "pointermove", "touchmove", "touchstart", "keydown"].includes(m[1])) {
    const idx = m.index;
    console.log("=== Event:", m[1], "at", idx, "===");
    console.log(code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + 450)));
    console.log("\n---------------------------\n");
  }
}
console.log("All event types:", Array.from(events));
