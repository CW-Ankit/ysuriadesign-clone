import fs from "fs";

const code = fs.readFileSync("analysis/main.js", "utf8");

// Extract the PostProcessing Class Pg and its shaders
const pgStart = code.indexOf("var Pg=class");
const pgEnd = code.indexOf("compile()", pgStart);
console.log("=== PG DEFINITION (first 4000 chars) ===");
console.log(code.substring(pgStart, pgStart + 4000));

// Extract the Composite Shader (compMat)
const compMatIdx = code.indexOf("this.compMat=Mg(Ag,");
if (compMatIdx !== -1) {
  console.log("=== COMPMAT / AG SHADER ===");
  const agIdx = code.lastIndexOf("var Ag=", compMatIdx);
  console.log(code.substring(agIdx, agIdx + 3000));
}

// Extract chapter presets
const presetsIdx = code.indexOf("fogFalloff:.05");
if (presetsIdx !== -1) {
  const start = code.lastIndexOf("[{", presetsIdx);
  const end = code.indexOf("}],", presetsIdx) + 2;
  console.log("=== CHAPTER PRESETS ===");
  console.log(code.substring(start, end));
}
