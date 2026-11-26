import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MOBILE_API_URL, MOBILE_APP_ID, validateMobileApiUrl } from '../src/native/config.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const config = JSON.parse(await readFile(new URL('../capacitor.config.json', import.meta.url)));
if (config.appId !== MOBILE_APP_ID || config.webDir !== 'dist-native' || config.server.url || config.server.cleartext) {
  throw new Error('Native config must use the approved app ID and local bundled assets without cleartext or live reload.');
}
validateMobileApiUrl(MOBILE_API_URL);
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'dist-native', '--mode', 'production'], {
  cwd: root, stdio: 'inherit', env: { ...process.env, VITE_NATIVE_APP: 'true', VITE_API_URL: MOBILE_API_URL },
});
if (result.status !== 0) process.exit(result.status || 1);
await writeFile(new URL('../dist-native/native-build.json', import.meta.url), JSON.stringify({
  appId: MOBILE_APP_ID, appName: 'GlutenFri', version: '1.0.0', build: 1,
  apiUrl: MOBILE_API_URL, bundledAssets: true, serviceWorker: false,
}, null, 2));
console.log('Native assets prepared separately from the website; no application was opened or published.');
