import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const idx = code.indexOf("this.compMat=Mg(Ag,");
console.log("Found at:", idx);
// Search backward for "Ag="
const agIdx = code.lastIndexOf("Ag=", idx);
console.log("Ag= at:", agIdx);
console.log(code.substring(agIdx - 20, agIdx + 1200));
