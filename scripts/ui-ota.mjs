// Bundle metadata is shared by the embedded Go module and the OTA feed. The
// immutable build number is what makes upgraded embedded assets win over
// previously downloaded bundles.
//
// The feed and archive are files of the yuhaiin.github.io site, published by CI
// from main. Their URLs are fixed and must equal the constants pinned in the Go
// Core (pkg/frontend FeedURL / ArchiveURL); the Core rejects any other archive URL.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const ARCHIVE_URL = 'https://yuhaiin.github.io/frontend.tar.gz';
// Build numbers must stay above everything already installed. The former v2
// branch published up to 2_000_000_000_556 through the `ui-v2` release; main's
// first-parent count was lower than that when v2 was squash-merged, so the base
// sits 1000 above the v2 range instead of restarting inside it.
const BUILD_NUMBER_BASE = 2_000_000_001_000;

const mode = process.argv[2];
if (mode === 'prepare') {
  const sha = (process.env.GITHUB_SHA || 'local').slice(0, 12).replace(/[^a-zA-Z0-9]/g, '');
  // First-parent history grows with each commit on main, but never with a CI rerun.
  // CI must checkout full history (fetch-depth: 0).
  const firstParentCount = Number(execFileSync('git', ['rev-list', '--first-parent', '--count', 'HEAD'], {
    encoding: 'utf8',
  }).trim());
  const buildNumber = BUILD_NUMBER_BASE + firstParentCount;
  if (!Number.isSafeInteger(firstParentCount) || firstParentCount <= 0 ||
      !Number.isSafeInteger(buildNumber)) throw new Error('Invalid history for UI build number');
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
    url: ARCHIVE_URL,
    sha256: createHash('sha256').update(data).digest('hex'),
    size: data.length,
  };
  await writeFile('frontend-update.json', JSON.stringify(release, null, 2) + '\n');
  console.log('Frontend OTA archive:', release.size, release.sha256);
} else {
  console.error('Usage: node scripts/ui-ota.mjs prepare|release');
  process.exitCode = 2;
}
