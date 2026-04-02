const fs = require('fs');
const path = require('path');

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.log('[postbuild-links] .next/standalone not found, skip.');
  process.exit(0);
}

const mappings = [
  {
    target: path.join(root, '.next', 'static'),
    link: path.join(standaloneDir, '.next', 'static'),
  },
  {
    target: path.join(root, 'public'),
    link: path.join(standaloneDir, 'public'),
  },
];

for (const { target, link } of mappings) {
  if (!fs.existsSync(target)) {
    console.log(`[postbuild-links] target missing: ${target}, skip.`);
    continue;
  }
  fs.mkdirSync(path.dirname(link), { recursive: true });
  try {
    fs.rmSync(link, { recursive: true, force: true });
  } catch {}
  fs.symlinkSync(target, link, 'junction');
  console.log(`[postbuild-links] linked ${link} -> ${target}`);
}

