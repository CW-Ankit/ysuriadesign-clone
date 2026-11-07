import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

// Search for any occurrence of "wheel"
let idx = 0;
while ((idx = code.indexOf("wheel", idx)) !== -1) {
  console.log("=== WHEEL at", idx, "===");
  console.log(code.substring(Math.max(0, idx - 100), Math.min(code.length, idx + 200)));
  idx += 5;
}
