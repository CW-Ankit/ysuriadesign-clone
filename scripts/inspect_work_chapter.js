import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const qIdx = code.indexOf("function Q_(");
console.log(code.substring(qIdx, qIdx + 2500));
