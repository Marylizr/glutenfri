import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { MOBILE_APP_ID, MOBILE_API_URL } from '../src/native/config.js';
const config = JSON.parse(await readFile(new URL('../capacitor.config.json', import.meta.url)));
const metadata = JSON.parse(await readFile(new URL('../dist-native/native-build.json', import.meta.url)));
assert.equal(metadata.appId, MOBILE_APP_ID);
assert.equal(metadata.apiUrl, MOBILE_API_URL);
assert.equal(metadata.serviceWorker, false);
assert.equal(config.server.url, undefined);
assert.equal(config.server.cleartext, false);
const files = await readdir(new URL('../dist-native/', import.meta.url), { recursive: true, withFileTypes: true });
const source = new URL('../dist-native/', import.meta.url);
const hash = value => createHash('sha256').update(value).digest('hex');
let verified = 0;
for (const target of ['ios/App/App/public/', 'android/app/src/main/assets/public/']) {
  for (const item of files.filter(item => item.isFile())) {
    const path = `${item.parentPath}/${item.name}`;
    const relativePath = path.slice(source.pathname.length);
    const [original, bundled] = await Promise.all([readFile(path), readFile(new URL(`../${target}${relativePath}`, import.meta.url))]);
    assert.equal(hash(bundled), hash(original), `${target}${relativePath} is stale; run mobile:sync`);
    verified++;
  }
}
console.log(JSON.stringify({ bundledFilesVerified: verified, appId: MOBILE_APP_ID, apiUrl: MOBILE_API_URL,
  signed: false, submitted: false, visualDeviceQA: false }, null, 2));
