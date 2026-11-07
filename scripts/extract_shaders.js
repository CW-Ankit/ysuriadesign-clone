import fs from "fs";

const code = fs.readFileSync("analysis/main.js", "utf8");

function getVar(varName) {
  const pattern = "var " + varName + "=";
  const idx = code.indexOf(pattern);
  if (idx === -1) return "NOT FOUND";
  // find until the next top-level var or function or end of statement
  return code.substring(idx, idx + 2500);
}

console.log("=== Ag (COMPOSITE SHADER) ===");
console.log(getVar("Ag"));

console.log("=== kg (STREAK SHADER) ===");
console.log(getVar("kg"));

console.log("=== Dg (BLOOM DOWN) ===");
console.log(getVar("Dg"));

console.log("=== Og (BLOOM UP) ===");
console.log(getVar("Og"));
