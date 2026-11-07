import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

function inspectFunc(name) {
  const pattern = "function " + name + "(";
  const idx = code.indexOf(pattern);
  if (idx === -1) return "NOT FOUND: " + name;
  return code.substring(idx, idx + 1800);
}

for (const name of ["v_", "R_", "V_", "Q_", "tv", "av"]) {
  console.log(`=== ${name} ===`);
  console.log(inspectFunc(name));
  console.log("\n--------------------------------\n");
}
