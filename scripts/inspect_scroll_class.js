import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const idx = code.indexOf("readScroll(){");
console.log("=== SCROLL CONTROLLER CLASS ===");
console.log(code.substring(idx - 1500, idx + 1500));
