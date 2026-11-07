import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const idx = code.indexOf("this.compMat=Mg(");
// Find the shader string before this.compMat
const start = code.lastIndexOf("`", idx - 100);
const fullStart = code.lastIndexOf("`", start - 1);
console.log(code.substring(fullStart, idx + 100));
