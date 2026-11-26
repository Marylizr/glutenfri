import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nativeBuildEnvironment } from './native-build-environment.mjs';
const platform = process.argv[2];
const root = fileURLToPath(new URL('..', import.meta.url));
const env = nativeBuildEnvironment();
let result;
if (platform === 'ios') {
  result = spawnSync('xcodebuild', ['-project', 'ios/App/App.xcodeproj', '-scheme', 'App', '-configuration', 'Release',
    '-destination', 'generic/platform=iOS', '-derivedDataPath', '../.netlify/mobile-build/ios',
    '-clonedSourcePackagesDirPath', '../.netlify/mobile-cache/spm', '-jobs', '2',
    'CODE_SIGNING_ALLOWED=NO', 'CODE_SIGNING_REQUIRED=NO', 'build', '-quiet'], { cwd: root, env, stdio: 'inherit' });
} else if (platform === 'android') {
  result = spawnSync('./gradlew', ['bundleRelease', '--no-daemon', '--max-workers=2', '-Dorg.gradle.jvmargs=-Xmx1536m'],
    { cwd: `${root}/android`, env, stdio: 'inherit' });
} else throw new Error('Specify ios or android. This command never signs or uploads builds.');
process.exit(result.status || (result.error ? 1 : 0));
