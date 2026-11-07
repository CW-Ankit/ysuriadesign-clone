import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const idx = 1014373;
console.log("=== MAIN INITIALIZATION AROUND 1014373 ===");
console.log(code.substring(idx - 1000, idx + 4000));
