import fs from "fs";
const code = fs.readFileSync("analysis/main.js", "utf8");

// Run the layout calculation in node
const script = `
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  }
  toArray() { return [this.x, this.y, this.z]; }
}

const ov = new Vector3(0, 0, -160);
const sv = 160;
const cv = (e, t) => {
  let n = e * Math.PI / 180;
  return new Vector3(ov.x + sv * Math.cos(n), t, ov.z + sv * Math.sin(n));
};
const lv = (e, t) => Math.atan2(-(t.x - e.x), -(t.z - e.z));

const origin = cv(90, 0);
const memory = cv(142, -65);
const refraction = cv(194, -130);
const work = cv(246, -195);
const threshold = cv(304, -260);

console.log('Chapter 0 (Origin):', origin.toArray());
console.log('Chapter 1 (Memory):', memory.toArray());
console.log('Chapter 2 (Refraction):', refraction.toArray());
console.log('Chapter 3 (The Work):', work.toArray());
console.log('Chapter 4 (Threshold):', threshold.toArray());
console.log('Origin Yaw:', lv(origin, memory));
console.log('Memory Yaw:', lv(origin, memory));
console.log('Refraction Yaw:', lv(memory, refraction));
console.log('Work Yaw:', lv(refraction, work));
console.log('Threshold Yaw:', lv(work, threshold));
`;

fs.writeFileSync("scripts/eval_layout.js", script);
