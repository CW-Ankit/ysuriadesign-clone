const projects = require('./projects_raw.js');
const chapters = require('./chapters_raw.js');

console.log('--- PROJECTS (' + projects.length + ') ---');
projects.forEach((p, i) => {
  console.log(`[${i}] ${p.id} - ${p.name} (${p.tag}) color: ${p.color}`);
  console.log('    Cover:', p.cover);
  console.log('    Media count:', p.media?.length);
});

console.log('\n--- CHAPTERS (' + chapters.length + ') ---');
chapters.forEach((c, i) => {
  console.log(`[${i}] ${c.id}: "${c.title}"`);
  console.log('    Line:', c.line);
  if (c.stats) console.log('    Stats:', c.stats);
  if (c.quiet) console.log('    Quiet:', c.quiet);
});
