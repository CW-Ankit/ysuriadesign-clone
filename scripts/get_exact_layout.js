import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

// Search for uv() and surrounding functions
const uvIdx = code.indexOf("function uv(){");
console.log(code.substring(uvIdx - 200, uvIdx + 1500));
