// Bundle metadata is shared by the embedded Go module and the OTA feed.
// The immutable build number is what makes upgraded embedded assets win
// over previously downloaded bundles.
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const mode = process.argv[2];
if (mode === 'prepare') {
  const sha = (process.env.GITHUB_SHA || 'local').slice(0, 12).replace(/[^a-zA-Z0-9]/g, '');
  const buildNumber = Number(process.env.UI_BUILD_NUMBER || Math.floor(Date.now() / 1000));
  if (!Number.isSafeInteger(buildNumber) || buildNumber <= 0) throw new Error('Invalid UI_BUILD_NUMBER');
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
