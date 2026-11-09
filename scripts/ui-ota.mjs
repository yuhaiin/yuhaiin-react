// Bundle metadata is shared by the embedded Go module and the OTA feed of the
// v2 channel. The immutable build number is what makes upgraded embedded assets
// win over previously downloaded bundles.
//
// The v2 channel is the rolling `ui-v2` prerelease of this repository. Its URLs
// are fixed and must equal the constants pinned in the Go Core
// (pkg/frontend FeedURL / ArchiveURL); the Core rejects any other archive URL.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const ARCHIVE_URL = 'https://github.com/yuhaiin/yuhaiin-react/releases/download/ui-v2/frontend.tar.gz';
// v2 build numbers live above the stable channel's 1_000_000_000_000 range, so a
// stable bundle can never outrank a v2 build even if one were ever offered.
const BUILD_NUMBER_BASE = 2_000_000_000_000;

const mode = process.argv[2];
if (mode === 'prepare') {
  const sha = (process.env.GITHUB_SHA || 'local').slice(0, 12).replace(/[^a-zA-Z0-9]/g, '');
  // First-parent history grows with each v2 commit, but never with a CI rerun.
  // CI must checkout full history (fetch-depth: 0).
  const firstParentCount = Number(execFileSync('git', ['rev-list', '--first-parent', '--count', 'HEAD'], {
    encoding: 'utf8',
  }).trim());
  const buildNumber = BUILD_NUMBER_BASE + firstParentCount;
  if (!Number.isSafeInteger(firstParentCount) || firstParentCount <= 0 ||
      !Number.isSafeInteger(buildNumber)) throw new Error('Invalid v2 history for UI build number');
  const build = {
    version: `ui-v2-${buildNumber}-${sha}`,
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
} else if (mode === 'newer') {
  // Publish guard for the rolling release: exit 0 only when this build is newer than
  // the published feed (passed as a file; missing or unreadable means nothing is published).
  const build = JSON.parse(await readFile('dist/ui-build.json', 'utf8'));
  let published = 0;
  try {
    published = Number(JSON.parse(await readFile(process.argv[3], 'utf8')).buildNumber) || 0;
  } catch { /* first publication */ }
  if (build.buildNumber > published) console.log(`Publishing ${build.buildNumber} over ${published}`);
  else {
    console.log(`Not publishing ${build.buildNumber}: the release already has ${published}`);
    process.exitCode = 3;
  }
} else {
  console.error('Usage: node scripts/ui-ota.mjs prepare|release|newer <published-feed.json>');
  process.exitCode = 2;
}
