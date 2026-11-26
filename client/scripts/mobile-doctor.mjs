import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { nativeBuildEnvironment } from './native-build-environment.mjs';
import { MOBILE_API_URL, MOBILE_APP_ID } from '../src/native/config.js';
const file = value => new URL(`../${value}`, import.meta.url);
const env = nativeBuildEnvironment();
const config = JSON.parse(readFileSync(file('capacitor.config.json')));
const xcode = spawnSync('xcodebuild', ['-version'], { encoding: 'utf8' });
const java = env.JAVA_HOME ? spawnSync(`${env.JAVA_HOME}/bin/java`, ['-version'], { encoding: 'utf8' }) : null;
const report = {
  appId: config.appId,
  localAssetsOnly: config.webDir === 'dist-native' && !config.server.url && config.server.cleartext === false,
  nativeProjects: { ios: existsSync(file('ios/App/App.xcodeproj')), android: existsSync(file('android/gradlew')) },
  toolchain: { xcode: xcode.status === 0 ? xcode.stdout.split('\n')[0] : 'missing',
    java21: java?.status === 0 && /"21\./.test(java.stderr), androidApi36: existsSync(`${env.ANDROID_HOME}/platforms/android-36`) },
  networkChecked: false, storeSubmissionReady: false,
  pending: ['Signing and store account ownership', 'Device QA including permissions/login/deletion/export',
    'Privacy and Data safety review, user content blocking/filtering', 'Approved listing screenshots and final app icon', 'Apple minimum-functionality review'],
};
if (process.argv.includes('--network')) {
  report.networkChecked = true;
  report.cors = {};
  for (const origin of ['capacitor://localhost', 'https://localhost']) {
    try {
      const response = await fetch(`${MOBILE_API_URL}/health`, { headers: { Origin: origin }, signal: AbortSignal.timeout(15000) });
      report.cors[origin] = { status: response.status, allowed: response.headers.get('access-control-allow-origin') === origin };
    } catch { report.cors[origin] = { allowed: false, error: 'connection_failed' }; }
  }
  if (Object.values(report.cors).some(value => !value.allowed)) report.pending.push('Production CORS must explicitly allow the native origins; no environment was changed');
}
console.log(JSON.stringify(report, null, 2));
if (config.appId !== MOBILE_APP_ID || !report.localAssetsOnly || !Object.values(report.nativeProjects).every(Boolean)) process.exitCode = 1;
