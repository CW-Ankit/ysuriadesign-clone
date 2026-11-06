const fs = require('fs');
const js = fs.readFileSync('analysis/main.js', 'utf8');

// Search for audio setup / sound effects
console.log('--- AUDIO SFX & SYNTH ---');
const sfxIdx = js.indexOf('addEventListener(`sfx`');
if (sfxIdx !== -1) {
  console.log(js.slice(sfxIdx - 300, sfxIdx + 1200));
}

// Search for audio files or synth methods
const audIdx = js.indexOf('disrespectful.mp3');
if (audIdx !== -1) {
  console.log('Audio track context:', js.slice(audIdx - 200, audIdx + 600));
}

// Search for 3D model / scene setup
const glbIdx = js.indexOf('figure.v2.glb');
if (glbIdx !== -1) {
  console.log('GLB context:', js.slice(glbIdx - 300, glbIdx + 800));
}
