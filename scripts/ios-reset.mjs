import { existsSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const appId = 'com.jamescollins.screentimepal';
const dryRun = process.argv.includes('--dry-run');

function assertBundledCapacitorApp() {
  const configPath = 'capacitor.config.ts';
  const config = readFileSync(configPath, 'utf8');

  if (/server\s*:\s*{[\s\S]*url\s*:/m.test(config)) {
    console.error('Refusing to build: capacitor.config.ts still has server.url, which would load a remote Lovable page in iOS.');
    process.exit(1);
  }

  if (!/webDir\s*:\s*['"]dist['"]/m.test(config)) {
    console.error('Refusing to build: capacitor.config.ts must use webDir: dist for a bundled iOS app.');
    process.exit(1);
  }
}

function run(command, args, options = {}) {
  console.log(`$ ${[command, ...args].join(' ')}`);
  if (dryRun) return;

  const result = spawnSync(command, args, {
    stdio: options.ignoreOutput ? 'ignore' : 'inherit',
    shell: false,
  });

  if (result.status !== 0 && !options.allowFailure) {
    process.exit(result.status ?? 1);
  }
}

assertBundledCapacitorApp();
rmSync('ios', { recursive: true, force: true });
rmSync('dist', { recursive: true, force: true });
run('npm', ['run', 'build']);
run('npx', ['cap', 'add', 'ios']);
run('npx', ['cap', 'sync', 'ios']);
run('xcrun', ['simctl', 'uninstall', 'booted', appId], {
  allowFailure: true,
  ignoreOutput: true,
});
run('xcrun', ['simctl', 'terminate', 'booted', appId], {
  allowFailure: true,
  ignoreOutput: true,
});

if (existsSync('ios')) {
  run('xcrun', ['simctl', 'privacy', 'booted', 'reset', 'all', appId], {
    allowFailure: true,
    ignoreOutput: true,
  });
}

run('npx', ['cap', 'run', 'ios']);