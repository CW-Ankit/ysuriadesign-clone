import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

// Search for dv definition
const dvIdx = code.indexOf("function dv(");
console.log("=== dv (CHAPTER BUILDER) ===");
console.log(code.substring(dvIdx, dvIdx + 4500));

// Search for a_ (thread builder)
const aIdx = code.indexOf("function a_(");
if (aIdx !== -1) {
  console.log("=== a_ (THREAD BUILDER) ===");
  console.log(code.substring(aIdx, aIdx + 2000));
}

// Search for Jg (dust/particles)
const jgIdx = code.indexOf("function Jg(");
if (jgIdx !== -1) {
  console.log("=== Jg (DUST PARTICLES) ===");
  console.log(code.substring(jgIdx, jgIdx + 2000));
}
