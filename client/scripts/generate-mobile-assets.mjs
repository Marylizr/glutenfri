// Compile existing brand artwork into platform assets. No new identity or remote upload.
import { mkdir, copyFile, rename } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const assets = fileURLToPath(new URL('../../.netlify/mobile-assets', import.meta.url));
await mkdir(assets, { recursive: true });
await copyFile(new URL('../public/favicon.svg', import.meta.url), `${assets}/logo.svg`);
const result = spawnSync(process.execPath, ['node_modules/@capacitor/assets/bin/capacitor-assets', 'generate',
  '--assetPath', relative(root, assets), '--ios', '--android', '--iconBackgroundColor', '#ffffff',
  '--iconBackgroundColorDark', '#ffffff', '--splashBackgroundColor', '#f6f2e9',
  '--splashBackgroundColorDark', '#f6f2e9'], { cwd: root, stdio: 'inherit', env: { ...process.env, VIPS_CONCURRENCY: '1', UV_THREADPOOL_SIZE: '2' } });
if (result.status !== 0 || result.error) process.exit(result.status || 1);
// New Capacitor projects contain three default splash images which the assets
// tool doesn't remove. Archive those unused scaffold files instead of shipping
// duplicate defaults or leaving new Xcode warnings. All files remain recoverable.
await mkdir(`${assets}/scaffold-backup`, { recursive: true });
for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  try { await rename(`${root}/ios/App/App/Assets.xcassets/Splash.imageset/${name}`, `${assets}/scaffold-backup/${name}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
