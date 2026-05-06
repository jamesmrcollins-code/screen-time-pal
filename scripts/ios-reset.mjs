import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const appId = 'com.jamescollins.screentimepal';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.ignoreOutput ? 'ignore' : 'inherit',
    shell: false,
  });

  if (result.status !== 0 && !options.allowFailure) {
    process.exit(result.status ?? 1);
  }
}

rmSync('ios', { recursive: true, force: true });
run('npm', ['run', 'build']);
run('npx', ['cap', 'add', 'ios']);
run('npx', ['cap', 'sync', 'ios']);
run('xcrun', ['simctl', 'uninstall', 'booted', appId], {
  allowFailure: true,
  ignoreOutput: true,
});
run('npx', ['cap', 'run', 'ios']);