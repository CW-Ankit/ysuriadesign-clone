import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const idx = code.indexOf("lb.style.height=");
console.log(code.substring(idx - 100, idx + 200));

// Find where Tb is created
const tbIdx = code.indexOf("var Tb=vv(");
console.log(code.substring(tbIdx - 100, tbIdx + 200));
