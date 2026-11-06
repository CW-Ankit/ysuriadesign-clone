const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

const jStart = js.indexOf('J_=[');
console.log('J_ starts at', jStart);
console.log(js.slice(jStart, jStart + 4000));
