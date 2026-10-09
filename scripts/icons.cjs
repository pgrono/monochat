// Deterministic size exports from the approved generated master; requires ffmpeg.
const { spawnSync } = require('node:child_process');
const { mkdirSync } = require('node:fs');
const { join, resolve } = require('node:path');
const root = resolve(__dirname, '..');
mkdirSync(join(root, 'assets/icons'), { recursive: true });
for (const size of [16, 24, 32, 48, 64, 128, 256, 512]) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', join(root, 'assets/monochat.png'), '-vf', `scale=${size}:${size}:flags=lanczos`, '-frames:v', '1', '-update', '1', join(root, `assets/icons/${size}x${size}.png`)], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Icon export failed: ${size}`);
}
console.log('Exported MonoChat icon sizes with alpha preserved.');
