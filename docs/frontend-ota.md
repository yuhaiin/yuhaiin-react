# Frontend OTA packaging

The frontend is built once and distributed separately from yuhaiin Go and the
Android APK. CI creates:

- dist/ui-build.json: embedded runtime compatibility/build metadata
- frontend.tar.gz: compressed UI archive, including ui-build.json
- frontend-update.json: feed manifest containing the bundle SHA-256 and size

The v2 branch publishes the Web UI in two places:

- The yuhaiin.github.io `v2` branch (embedded build): the publish job copies the
  build there, including ui-build.json, and generates a Go module with
  //go:embed index.html assets docs ui-build.json so v2 binary releases carry the
  same buildNumber as the hosted frontend. The public site and stable Cores keep
  using `main`, which this workflow never touches.
- The rolling `ui-v2` GitHub prerelease of this repository (OTA channel): CI
  replaces `frontend.tar.gz` and `ui-update.json` in place. The Go Core of v2
  reads exactly
  `https://github.com/yuhaiin/yuhaiin-react/releases/download/ui-v2/ui-update.json`
  and rejects any feed whose archive URL is not
  `.../ui-v2/frontend.tar.gz`. The URL is a constant in scripts/ui-ota.mjs and
  must stay equal to the Core's `ArchiveURL`.

The archive is uploaded before the feed. A client that sees the old feed keeps
the old archive's SHA-256; one that sees the new feed before the new archive is
visible fails the size/SHA-256 check and retries later. A build is published only
when its buildNumber is greater than the published feed's
(`node scripts/ui-ota.mjs newer <feed>`), so two overlapping builds cannot
downgrade the channel.

buildNumber is a deterministic, monotonically increasing v2 revision:
`2_000_000_000_000 + git rev-list --first-parent --count HEAD`. CI must fetch
the complete Git history. Rerunning a workflow for the same commit never
increases its buildNumber, and an older ancestor on v2 always has a smaller
number than its descendants. The range is deliberately above the stable
channel's `1_000_000_000_000 + n` and the legacy timestamp-based numbers, so a
stable bundle can never outrank a v2 build. A Core whose embedded UI has a
greater or equal buildNumber MUST prefer its embedded version over any older
downloaded release.

Before publishing, the job verifies that its GITHUB_SHA is still the current v2
branch tip. Reruns of stale revisions must not overwrite the latest hosted
frontend or OTA channel.

Backend/Android compatibility is negotiated through the Core's frontend.status
RPC. Declare requiredCapabilities only for genuinely essential operations.
Use the useBackendCapability hook or RequireBackendCapability wrapper to gate
additive features, showing frontendRequiresNewCore when unsupported. If a new
build breaks previously supported request/response semantics, raise apiContract
with the corresponding Core change. Old hosts must reject that release.

The Go Core currently enforces a pinned HTTPS origin and archive SHA-256 rather
than signed manifests. Leave unattended installation disabled until explicit
manifest-signing infrastructure is configured and reviewed.
