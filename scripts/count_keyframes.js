import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const mvStart = code.indexOf("function mv(");
const mvEnd = code.indexOf("var hv=class", mvStart);
const mvCode = code.substring(mvStart, mvEnd);

// Count how many e( calls exist in mvCode
const matches = mvCode.match(/e\(/g);
console.log("e( count in mv:", matches ? matches.length : 0);
