const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSETS = [
  // Fonts & profile
  { url: 'https://ysuriadesign.co/fonts/geist-latin-var.woff', dest: 'public/fonts/geist-latin-var.woff' },
  { url: 'https://ysuriadesign.co/media/profile.jpg', dest: 'public/media/profile.jpg' },

  // 3D Model
  { url: 'https://ysuriadesign.co/models/figure.v2.glb', dest: 'public/models/figure.v2.glb' },

  // Audio tracks
  { url: 'https://ysuriadesign.co/media/audio/disrespectful.mp3', dest: 'public/media/audio/disrespectful.mp3' },
  { url: 'https://ysuriadesign.co/media/audio/come-n-go.mp3', dest: 'public/media/audio/come-n-go.mp3' },

  // Jumper videos
  { url: 'https://ysuriadesign.co/media/jumper/advanced-v2-loop.mp4', dest: 'public/media/jumper/advanced-v2-loop.mp4' },
  { url: 'https://ysuriadesign.co/media/jumper/advanced-v2.mp4', dest: 'public/media/jumper/advanced-v2.mp4' },
  { url: 'https://ysuriadesign.co/media/jumper/base.mp4', dest: 'public/media/jumper/base.mp4' },
  { url: 'https://ysuriadesign.co/media/jumper/base-loop.mp4', dest: 'public/media/jumper/base-loop.mp4' },

  // P2P.org
  { url: 'https://ysuriadesign.com/assets/projects/1-p2p/cover.webp', dest: 'public/assets/projects/1-p2p/cover.webp' },
  { url: 'https://ysuriadesign.com/assets/projects/1-p2p/3.webm', dest: 'public/assets/projects/1-p2p/3.webm' },
  { url: 'https://ysuriadesign.com/assets/projects/1-p2p/2.webp', dest: 'public/assets/projects/1-p2p/2.webp' },
  { url: 'https://ysuriadesign.com/assets/projects/1-p2p/4.webp', dest: 'public/assets/projects/1-p2p/4.webp' },

  // Kelp DAO
  { url: 'https://ysuriadesign.com/assets/projects/3-kelp/cover.webp', dest: 'public/assets/projects/3-kelp/cover.webp' },
  { url: 'https://ysuriadesign.com/assets/projects/3-kelp/4.webm', dest: 'public/assets/projects/3-kelp/4.webm' },
  { url: 'https://ysuriadesign.com/assets/projects/3-kelp/2.webp', dest: 'public/assets/projects/3-kelp/2.webp' },
  { url: 'https://ysuriadesign.com/assets/projects/3-kelp/3.webp', dest: 'public/assets/projects/3-kelp/3.webp' },

  // RedStone
  { url: 'https://ysuriadesign.com/assets/projects/2-redstone/cover.webm', dest: 'public/assets/projects/2-redstone/cover.webm' },
  { url: 'https://ysuriadesign.com/assets/hero-reels/brand/redstone_2.webm', dest: 'public/assets/hero-reels/brand/redstone_2.webm' },
  { url: 'https://ysuriadesign.com/assets/projects/2-redstone/3.webm', dest: 'public/assets/projects/2-redstone/3.webm' },
  { url: 'https://ysuriadesign.com/assets/projects/2-redstone/4.webm', dest: 'public/assets/projects/2-redstone/4.webm' },
  { url: 'https://ysuriadesign.com/assets/projects/2-redstone/2.webp', dest: 'public/assets/projects/2-redstone/2.webp' },
];

async function downloadFile(url, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        const stat = fs.statSync(dest);
        console.log(`[OK] ${dest} (${stat.size} bytes)`);
        resolve(stat.size);
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Starting download of ${ASSETS.length} assets...`);
  const results = await Promise.allSettled(ASSETS.map(a => downloadFile(a.url, a.dest)));
  let failed = 0;
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[FAIL] ${ASSETS[i].dest}:`, r.reason.message);
      failed++;
    }
  });
  console.log(`Finished: ${ASSETS.length - failed}/${ASSETS.length} succeeded.`);
  if (failed > 0) process.exit(1);
}

main();
