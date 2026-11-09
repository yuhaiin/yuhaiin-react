# Frontend OTA packaging

The frontend is built once and distributed separately from yuhaiin Go and the
Android APK. CI creates:

- dist/ui-build.json: embedded runtime compatibility/build metadata
- frontend.tar.gz: compressed UI archive, including ui-build.json
- frontend-update.json: feed manifest containing the bundle SHA-256 and size

The publish job copies the archive to /frontend.tar.gz and the feed to
/ui-update.json on yuhaiin.github.io. It also generates a Go module with
//go:embed index.html assets docs ui-build.json so binary releases carry the
same buildNumber as the static frontend.

buildNumber is an immutable release timestamp. A Core whose embedded UI has a
greater or equal buildNumber MUST prefer its embedded version over any older
downloaded release, even after a binary upgrade.

Backend/Android compatibility is negotiated through the Core's frontend.status
RPC. Declare requiredCapabilities only for genuinely essential operations.
Use the useBackendCapability hook or RequireBackendCapability wrapper to gate
additive features, showing frontendRequiresNewCore when unsupported. If a new
build breaks previously supported request/response semantics, raise apiContract
with the corresponding Core change. Old hosts must reject that release.

The Go Core currently enforces a pinned HTTPS origin and archive SHA-256 rather
than signed manifests. Leave unattended installation disabled until explicit
manifest-signing infrastructure is configured and reviewed.
