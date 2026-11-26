import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function nativeBuildEnvironment() {
  const env = { ...process.env,
    GRADLE_USER_HOME: fileURLToPath(new URL('../../.netlify/mobile-cache/gradle', import.meta.url)),
    ANDROID_HOME: process.env.ANDROID_HOME || join(homedir(), 'Library/Android/sdk'),
  };
  if (process.platform === 'darwin') {
    try { env.JAVA_HOME = execFileSync('/usr/libexec/java_home', ['-v', '21'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
    catch { /* Doctor reports a missing JDK. Never installs global tooling. */ }
  }
  return env;
}
