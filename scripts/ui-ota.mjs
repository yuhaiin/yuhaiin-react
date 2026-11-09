// Bundle metadata is shared by the embedded Go module and the OTA feed.
// The immutable build number is what makes upgraded embedded assets win
// over previously downloaded bundles.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const mode = process.argv[2];
if (mode === 'prepare') {
  const sha = (process.env.GITHUB_SHA || 'local').slice(0, 12).replace(/[^a-zA-Z0-9]/g, '');
  // First-parent history grows with each mainline commit, but never with a
  // CI rerun. Use a distinct high range so previously published timestamp
  // numbers and Core's legacy pseudo-version timestamps remain comparable.
  // CI must checkout full history (fetch-depth: 0).
  const firstParentCount = Number(execFileSync('git', ['rev-list', '--first-parent', '--count', 'HEAD'], {
    encoding: 'utf8',
  }).trim());
  const buildNumber = 1_000_000_000_000 + firstParentCount;
  if (!Number.isSafeInteger(firstParentCount) || firstParentCount <= 0 ||
      !Number.isSafeInteger(buildNumber)) throw new Error('Invalid mainline history for UI build number');
  const build = {
    version: `ui-${buildNumber}-${sha}`,
    buildNumber,
    apiContract: 1,
    requiredCapabilities: ['rpc.v2', 'management.v1'],
    optionalCapabilities: ['ssh.wrap.timezone.v1'],
    minAndroidBridge: 0,
  };
  await writeFile('dist/ui-build.json', JSON.stringify(build, null, 2) + '\n');
  console.log('Frontend OTA build:', build.version);
} else if (mode === 'release') {
  const build = JSON.parse(await readFile('dist/ui-build.json', 'utf8'));
  const data = await readFile('frontend.tar.gz');
  const release = {
    ...build,
    url: 'https://yuhaiin.github.io/frontend.tar.gz',
    sha256: createHash('sha256').update(data).digest('hex'),
    size: data.length,
  };
  await writeFile('frontend-update.json', JSON.stringify(release, null, 2) + '\n');
  console.log('Frontend OTA archive:', release.size, release.sha256);
} else {
  console.error('Usage: node scripts/ui-ota.mjs prepare|release');
  process.exitCode = 2;
}
