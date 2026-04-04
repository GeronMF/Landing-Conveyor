const fs = require('fs');
const path = require('path');

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.log('[postbuild] .next/standalone not found, skip.');
  process.exit(0);
}

// On Linux, Next.js standalone server does NOT follow symlinks for public/ dir.
// We use hard copies instead of symlinks so files are reliably served.
const mappings = [
  {
    src: path.join(root, '.next', 'static'),
    dest: path.join(standaloneDir, '.next', 'static'),
    useSymlink: true, // static assets: symlink OK (Next.js reads these differently)
  },
  {
    src: path.join(root, 'public'),
    dest: path.join(standaloneDir, 'public'),
    useSymlink: false, // public/: must be a real dir for Next.js file serving
  },
];

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

for (const { src, dest, useSymlink } of mappings) {
  if (!fs.existsSync(src)) {
    console.log(`[postbuild] src missing: ${src}, skip.`);
    continue;
  }
  try { fs.rmSync(dest, { recursive: true, force: true }); } catch {}

  if (useSymlink) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.symlinkSync(src, dest, 'junction');
    console.log(`[postbuild] symlinked ${dest} -> ${src}`);
  } else {
    copyDirSync(src, dest);
    console.log(`[postbuild] copied ${src} -> ${dest}`);
  }
}
