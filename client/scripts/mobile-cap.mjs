import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nativeBuildEnvironment } from './native-build-environment.mjs';
const result = spawnSync(process.execPath, ['node_modules/@capacitor/cli/bin/capacitor', ...process.argv.slice(2)], {
  cwd: fileURLToPath(new URL('..', import.meta.url)), env: nativeBuildEnvironment(), stdio: 'inherit',
});
process.exit(result.status || (result.error ? 1 : 0));
