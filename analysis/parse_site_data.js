const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// Find qy array: starts with qy=[ and ends with ]
const qyMatch = js.match(/qy=(\[\s*\{id:`origin`[\s\S]*?\}\s*\]);/);
let chapters = [];
if (qyMatch) {
  chapters = eval(qyMatch[1]);
}

// Find J_ array: starts with J_=[ and ends with ]
const jMatch = js.match(/q_=`https:\/\/ysuriadesign\.com\/assets`,\s*J_=(\[\s*\{id:`p2p`[\s\S]*?\}\s*\]);/);
let projects = [];
if (jMatch) {
  const q_ = "https://ysuriadesign.com/assets";
  projects = eval(jMatch[1]);
}

const siteData = { chapters, projects };
fs.writeFileSync('analysis/site_data.json', JSON.stringify(siteData, null, 2));
console.log('Saved site_data.json with:');
console.log('Chapters count:', chapters.length);
console.log('Projects count:', projects.length);
console.log(JSON.stringify(siteData, null, 2));
