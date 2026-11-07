import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

const qIdx = code.indexOf("J_.forEach((e,t)=>{");
console.log(code.substring(qIdx, qIdx + 2000));
