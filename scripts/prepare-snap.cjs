// Create a minimal Snapcraft context without developer profiles or sessions.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const target = path.join(root, '.runtime', 'snap-build');
for (const [source, destination] of [
  ['packaging/snap/snapcraft.yaml', 'snap/snapcraft.yaml'],
  ['packaging/monochat.desktop', 'packaging/monochat.desktop'],
  ['assets/icons/512x512.png', 'assets/icons/512x512.png'],
]) {
  const output = path.join(target, destination);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(path.join(root, source), output);
}
console.log(target);
