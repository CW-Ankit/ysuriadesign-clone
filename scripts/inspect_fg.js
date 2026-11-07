import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const fgIdx = code.indexOf("Fg=class{");
console.log(code.substring(fgIdx, fgIdx + 2000));
