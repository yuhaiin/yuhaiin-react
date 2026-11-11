# Frontend OTA packaging

The frontend is built once and distributed separately from yuhaiin Go and the
Android APK. CI creates:

- dist/ui-build.json: embedded runtime compatibility/build metadata
- frontend.tar.gz: compressed UI archive, including ui-build.json
- frontend-update.json: feed manifest containing the bundle SHA-256 and size

The publish job copies the archive to /frontend.tar.gz and the feed to
/ui-update.json on yuhaiin.github.io. It also generates a Go module with
//go:embed index.html assets docs ui-build.json so binary releases carry the
same buildNumber as the static frontend. The Go Core reads exactly
`https://yuhaiin.github.io/ui-update.json` and rejects any feed whose archive
URL is not `https://yuhaiin.github.io/frontend.tar.gz`. The URL is a constant in
scripts/ui-ota.mjs and must stay equal to the Core's `ArchiveURL`.

buildNumber is a deterministic, monotonically increasing mainline revision:
`2_000_000_001_000 + git rev-list --first-parent --count HEAD`. CI must fetch
the complete Git history. Rerunning a workflow for the same commit never
increases its buildNumber, and an older ancestor on main always has a smaller
number than its descendants. A Core whose embedded UI has a greater or equal
buildNumber MUST prefer its embedded version over any older downloaded release.

The base is above every number published before:

- legacy timestamp-based numbers and the first mainline range
  (`1_000_000_000_000 + n`);
- the former v2 branch (`2_000_000_000_000 + n`, up to 556), which published
  through the rolling `ui-v2` prerelease of this repository. Cores built while
  that channel was pinned still read it; it is no longer updated, and they move
  on by upgrading the Core, whose embedded UI outranks the last v2 bundle.

Before deploying, the publish job verifies that its GITHUB_SHA is still the
current main branch tip. Reruns of stale revisions must not overwrite the
latest hosted frontend, OTA feed, or archive.

Backend/Android compatibility is negotiated through the Core's frontend.status
RPC. Declare requiredCapabilities only for genuinely essential operations.
Use the useBackendCapability hook or RequireBackendCapability wrapper to gate
additive features, showing frontendRequiresNewCore when unsupported. If a new
build breaks previously supported request/response semantics, raise apiContract
with the corresponding Core change. Old hosts must reject that release.

The Go Core currently enforces a pinned HTTPS origin and archive SHA-256 rather
than signed manifests. Leave unattended installation disabled until explicit
manifest-signing infrastructure is configured and reviewed.
