# Intelligent selectors

Open **Outbound → Selectors** and choose a selection mode. Legacy selectors
remain manual unless you explicitly configure an automatic policy. Backend
snapshots make the decisions without requiring an open browser.

Add candidate nodes, enable them, set priorities (lower first) and connection
weights, and choose how to handle no healthy candidates. Manual lock uses the
selected node above the policy editor; unlocking resumes the retained policy.
Choose a preferred candidate with **Prefer this node**; click **Preferred** again
to clear it. Replacing that candidate updates its preference reference.

**Allow return to preferred node** has explicit mode-specific behavior:

- Failover starts with the healthy preferred/priority node. After failure it
  keeps a healthy survivor unless return is enabled and hold/cooldown permits it.
- Latency, throughput and balanced modes can keep an eligible non-preferred
  survivor while still ranking other alternatives. When return is enabled, the
  preferred node must win the metric and clear the normal switching thresholds;
  preference cannot force a slower node. With no preferred candidate set, normal
  ranking continues.
- Initial selection or loss of the current node's eligibility still permits
  failover, including to the preferred node. Existing streams stay on their
  original runtime reference.
- Weighted mode uses weights for new flows; its unused preference/return controls
  are hidden. Manual selection and lock retain their existing behavior.

The live reason explains when preferred return is disabled. These settings use
the existing persisted policy and add no schema migration. Candidates in use are
protected against deletion/subscription removal.

**Active selection and evidence** presents separate TCP/UDP decisions. Expand a
candidate to inspect RTT EWMA/sample count, active-test Mbps, recent failure
ratio, active connections, normalized scoring components, and selection reasons.
Business traffic Bps on the Nodes page remains a separate metric. A score is
shown only when balanced scoring produces one. The recent-switch list retains
up to 64 events in backend memory; it resets on restart.

Configure thresholds and measurement lifetime in milliseconds. RTT switches
require both absolute and percentage improvements plus hold/cooldown rules.
Unknown, stale, mismatched-target or insufficient measurements cannot silently
rank as fast. A weighted selector distributes new TCP connections/UDP sessions;
its displayed selected node is a representative candidate, while connection
metadata identifies the actual chosen node.

Manual TCP/UDP probes use the saved selector targets and existing backend node
probe support. Per-node latency overrides still apply. **Measure download** uses
the saved HTTPS URL and persisted sample-size, duration, timeout, and instance
UTC daily-byte limits. Repeat measurements to reach the configured minimum
sample count (default three). TLS is verified and redirects/compression are
rejected. Failed/cancelled tests consume their reserved daily allowance.
Measurements approximate this target and time; they do not guarantee link
capacity. **Active upload measurement** adds an independent HTTPS endpoint,
byte/duration/daily limits and an explicit supported-endpoint acknowledgement.
The backend first verifies support, then sends one bounded POST and validates the
server's byte-count acknowledgement. Ordinary download URLs are not upload
endpoints. **Measure upload now** is disabled without a saved target and consent.
Upload samples, timestamps and EWMA remain independent from downloads; measured
history labels each direction. Upload-only scoring does not require download
samples. Configure minimum samples and freshness to suit the test interval;
the default three-sample threshold requires repeated tests within the two-minute
smoothing window, or lower the threshold explicitly for infrequent tests.

Mode, candidate, thresholds and speed-test edits take effect on Save. Test
buttons use the saved configuration so editing an unsaved URL does not initiate
traffic. Errors remain visible in the editor/status panel. The same fields and
candidate cards work in the mobile workspace. EN/JA/KO strings use the existing
routing namespace and theme tokens.

The initial editor requires schema 18; the monitoring follow-up described below
requires schema 19. Circuit admission uses the existing policy/observation JSON
and does not add a migration. Managed backup history subsequently adds backend
schema 21. The existing Backup page now includes the full-backup controls
described below; protected updates and certificate management are implemented in the companion backend.

See the [backend guide](https://github.com/yuhaiin/yuhaiin/blob/main/docs/intelligent-selectors.md)
for scoring formulas, fallback semantics, safety limits and reproducible
benchmarks. While the backend PR is unmerged, use its branch version of the guide.

## Monitoring follow-up

**Monitoring defaults** now configures the shared scheduler and optional periodic
download tests. A Selector's **Probe and speed schedules** can inherit these
settings or override them; creating an override leaves it disabled until an
administrator explicitly enables and saves it. Per-selector targets remain the
source of comparable RTT and speed observations. Manual selector probes use the
same verified HTTPS HEAD cohort as periodic probes; legacy Nodes GET probes are
still available and keep their separate evidence type.

The backend deduplicates shared node/transport/target tasks, bounds concurrency,
spreads initial execution, applies configurable jitter and probe-failure cooldown,
and cancels old tasks on configuration/network changes. Periodic download tests
use the existing durable daily allowance and byte/time caps. Busy/exhausted tests
are skipped; no unbounded fallback testing is started. Recent raw download samples
are fetched only when their history is expanded.

Android monitoring requires an explicit opt-in plus foreground state reported
by the native host. Metered networks are excluded by default; download schedules
have their own metered-network permission. Periodic work never initiates a new
enterprise VPN login: it can reuse a manually established client. Host network
state is shown for diagnosis and does not depend on an open browser.

This follow-up requires backend schema 19 and the paired monitoring branch.
Metrics additions, traffic-control qualification, visual browser checks,
disaster recovery and ACME remain ongoing.

## Circuit breaker and recovery

Expand **Circuit breaker and recovery** in an automatic Selector. Its failure,
recovery and minimum-sample thresholds are shared with the controls above. Set
the open cooldown, concurrent recovery requests, total request quota per cycle
and recovery-window duration. Turning the breaker off preserves custom limits
for later re-enabling. Manual selection and manual lock retain their behavior.

Candidate details separate remote evidence from the circuit state. Closed admits
new connections, Open blocks them until cooldown, and Half-open permits a bounded
trial. The reason, next trial, in-flight count, issued quota and confirmed
recoveries explain what the backend is doing. A TCP response strengthens connect
evidence without counting the same connection twice; UDP needs an actual reply.
A constructed proxy or PacketConn is not shown as a completed remote handshake.

A failed transport attempt is returned to its caller without replay. New
connections can choose a pre-ranked backup; existing connections/sessions keep
their original outbound. Changing a transport or referenced credential invalidates
old observations. Renames alone preserve the VPN client. Metrics and current
state are owned by the backend; leaving this screen does not stop recovery.

Frontend validation: lint, TypeScript, EN/JA/KO key checks, style audit, build and
104 test files / 309 tests pass. The paired backend provides virtual-clock and
1,024-creator concurrency tests plus connection/selection benchmarks. Chrome layout/interaction checks also pass at 1440, 360 and 320 px, using
isolated synthetic data for the Selector/circuit controls and monitoring dialog.
These checks exercise saving the circuit switch, separate UDP recovery evidence,
readable counters, modal dismissal and absence of horizontal overflow. Backend
network behavior is tested separately; this harness makes no live VPN claim.

To reproduce browser checks without a personal Chrome profile:

```sh
npm run dev:msw -- --port 5187
# In a second shell:
CHROME_PATH=google-chrome-stable node scripts/check-reliability.mjs
```

Screenshots and machine-readable results are written under
`/tmp/yuhaiin-reliability-shots`. The reliability UI workflow runs these checks
and retains a `reliability-browser` artifact. Synthetic credentials/targets remain
scoped to the existing local MSW preview; they are not production configuration.

## Measurement policy status

The monitoring dialog reports whether measurements are waiting for initial policy
loading, governed by application routing/traffic controls, or running in a
standalone core without attached app policy. Waiting pauses network tests before
Node construction or budget spend. Fixing configuration through the existing API
resumes readiness without the browser making any selection decision. Status
refreshes while the dialog is open. EN/JA/KO messages make the scope explicit.

Measured download speeds include configured global/default/route traffic limits.
Local admission, routing block and pacing timeouts do not condemn a remote Node.
The backend uses the existing forwarding policy components and keeps UDP probe
sessions pinned to their candidate. Backend schema remains 19; the generated
monitoring type adds the read-only `policyState` field.

## Shared measurements and inclusive download reservations

The monitoring dialog shows all active manual/periodic network measurements
against the backend shared limit (`activeMeasurements` / `measurementLimit`).
Scheduler `running` remains a separate counter. Measurements remain opt-in and
backend-driven; opening this dialog does not start background tests.

Speed test controls now explain that every test reserves the requested response
body limit plus 65,536 bytes for TLS, HTTP headers and read-ahead. Failed or
cancelled tests consume that full reservation. VPN framing and protocol control
traffic are outside the logical Node-stream cap. The daily budget must fit an
inclusive reservation. After backend schema-20 migration, a nonzero old-format
reservation pauses tests until the next UTC day. Restart/export cannot reset it.
EN/JA/KO provide the same explanation; current traffic Bps and measured Mbps
remain distinct. Older servers lacking shared counters omit that status; deploy the backend
companion to obtain authoritative admission counts.

Browser coverage verifies the shared count and expanded budget explanation at
1440, 360 and 320 pixels using synthetic MSW fixtures; actual transport and
budget persistence are covered by backend tests.

## Review and delivery entry

All reliability work now uses [frontend #535](https://github.com/yuhaiin/yuhaiin-react/pull/535)
and [backend #622](https://github.com/yuhaiin/yuhaiin/pull/622), both targeting main.
Earlier component PRs are superseded. The three-stage goal remains in progress;
backup/restore and ACME changes continue in the same entries.

The generated recovery contract now includes version 2 complete-inventory,
startup-input, external dependency and uninitialized-identity metadata for the
backend's offline create/verify commands. External source paths are descriptive
metadata, never destinations to write. Full disaster-recovery creation is now
exposed by the managed-backup panel below. Confirmed Web activation is available on the supported systemd host.

## Native protocol lifecycle

The Nodes runtime panel translates native session states and shows when the
backend observed them. Native tunnel setup, control configuration, actual remote
TCP/UDP responses and comparable measured RTT remain separate evidence. Tailscale
control readiness and static L2TPv3 setup explicitly show configured rather than
claiming a peer handshake. Authentication failure is shown as administrator
attention, independently of traffic/loss counters. Automatic candidate details
explain authentication, control or session unavailability while retaining raw
measurements; manual lock continues to follow the existing backend behavior.

Periodic checks reuse existing VPN sessions. They cannot start a lazy Tailnet
identity/login or wake an idle GlobalProtect reconnect, even through a cached
Set/endpoint chain. Ordinary traffic and manual checks retain protocol semantics.
Not every protocol exposes native status; those continue to show the existing
passive/explicit network evidence. All additions use the existing status API.

## Offline recovery contract synchronization

Generated contracts include `RecoveryRestorePreview`, per-file installation/
replacement/removal decisions and `RecoveryRestoreResult`. The backend CLI now
supports authenticated preview, explicit original/clone confirmation, staged
activation, durable rollback and startup verification. File activation reports
`awaiting_startup`; the actual healthy server start commits the transaction.
The managed-backup panel adds Linux systemd system/user capture coordination,
schedules, history and retention. Web activation reuses that host; update recovery-point
controls, broader host coordination and certificate management remain in progress.

Original-instance recovery explicitly acknowledges revived credentials and
reverted quota state. Clone recovery disables restored nodes/listeners, resets
management identities and selected native machine identities, and disables S3/
measurement schedules pending administrator review. The restore UI presents these backend warnings and requires confirmation of
the exact preview and backup/source/target/resulting identifiers; it must not overwrite live SQLite files through the legacy route.
See the backend [offline operator workflow](https://github.com/yuhaiin/yuhaiin/blob/codex/reliability-selector/docs/recovery-archive.md)
for current support, tests and platform limits.


## Managed full backups

Open **Backup** to distinguish the existing configuration-only S3 snapshot from
**Full disaster recovery backup**. Set a public age recipient, local/S3 target,
maintenance consent, timeout and count/age retention. Scheduling is opt-in and
runs in the backend. Save before creating a backup; the confirmation explains
the temporary service interruption. Automatic maintenance currently requires a
root-owned Linux systemd service or a lingering systemd user service. Other hosts keep the offline CLI workflow.
On Windows, the offline restore, validation startup, journal finalization and
rollback require an elevated account with deployment access on local NTFS.
This does not provide a Windows automatic service-maintenance coordinator.
Native crash/rollback and CLI/TLS qualification run separately from compilation.

Updated servers refuse new unencrypted configuration backups when route,
registry, GeoIP or DNS source URLs have user credentials, queries or fragments.
The API explains that an encrypted full backup is required; it does not change
the configured resource or routing policy. The configuration panel explains
this in EN/JA/KO. Source paths can also contain secrets, so private URLs still
require an encrypted full backup. Historical SQLite objects remain locally
restorable without changing their source URLs.
New configuration backups omit unused historical configuration copies, while
keeping current nodes, Sets and Selector settings. The EN/JA/KO hint explains
this distinction; private historical imports and encrypted full recovery retain
the old records.

History shows size, target, finite job state and failures. Ciphertext S3 readback
and authenticated archive verification are distinct: **Verify archive** accepts
a transient private identity, clears the field on submission and validates the
complete archive. No private identity enters saved settings or browser storage.
Downloads stream to a native file writer when available; the compatibility
fallback has a hard 64 MiB limit. Failed S3 uploads can be explicitly retried;
archive deletion requires confirmation and the backend protects active readers.
The newest successful point remains protected from automatic age retention.

The panel uses existing management permissions, components, draft state and
EN/JA/KO translations. It polls only while an operation is active or waiting for
restart. Automated 1440/360/320 px checks cover save, maintenance confirmation,
history and the verification dialog without horizontal overflow. These browser
fixtures are synthetic; the backend separately exercises a real installed
service, HTTPS authorization, S3 readback and helper-crash restart in an isolated
systemd container.

Web archive upload and authenticated preview are described below. Confirmed Web activation and recent-restore presentation use the same
installed-service coordinator. Existing plaintext offline rollback points have separate retention;
the managed encrypted-archive policy does not delete them. See the backend
[managed-backup operator guide](https://github.com/yuhaiin/yuhaiin/blob/codex/reliability-selector/docs/managed-recovery-backups.md)
for lifecycle details, resource limits and the remaining work.


## Disaster recovery preview

The existing Backup page can upload a full encrypted archive and authenticate
an original-instance or clone preview using a transient private age identity or
passphrase. The UI clears that input on submission and keeps it out of saved
drafts/storage. The server displays source/target/resulting identity, build
version, file changes and explicit credential/device/quota warnings. Expanded
file paths wrap on mobile. Discard requires confirmation.

Backend schema 22 bounds staging to two imports, 100 GiB combined ciphertext
and a 30-minute preview lifetime. Admitted maintenance retains staging until
its controlled recovery resolves. Uploads stream the File directly, support cancellation
and never call File.arrayBuffer. The server reuses the existing authenticated
archive decoder and restore planner, keeps prepared files private, protects a
disk reserve and runs expiry cleanup on the existing Backup scheduler. Import
records belong to the creating administrator. Browser refresh can reload the
remaining staged previews.

Supported systemd deployments can continue from authenticated preview to a
confirmed maintenance restore. The offline CLI remains available for other hosts.
Browser tests at 1440/360/320 px cover upload, private input clearing, identity
warnings, file expansion and confirmed discard. Fixtures are synthetic; the
backend's actual HTTPS service drill independently checks import authentication,
read-only denial, a stable service PID during preview and staging removal.

## Latest restore result

The Backup page reads the backend's actual latest restore result under
`backup:manage`. It distinguishes a restored deployment that passed startup
checks from a rollback to the previous deployment, shows backup/transaction/
instance/recovery-point references and states whether restored startup settings
are retained. A backup or preview does not create a successful restore result.
Missing history has an explicit empty state. Failed queries hide cached success;
manual refresh is available without idle polling. Existing authentication-scope
boundaries isolate the data across controller/session changes.

The offline CLI's explicit `recovery restore -adopt-startup` can retain relocated
TLS/authentication/listener/file inputs across restarts. Its transaction restores
the previous adopted binding on a later failed restore. The separate confirmed
activation dialog invokes the same controlled startup/rollback mechanism. Result
fields are compatible; exclusive restore admission adds backend schema 23. EN/JA/KO and synthetic browser
checks cover desktop/mobile result rendering; actual server-process certificate,
restart, listener-failure and crash drills run in the backend.


## Confirmed Web restore

On a supported Linux systemd system or lingering user service, **Review and restore** opens a
separate destructive-action dialog. Administrators type the target instance ID
and acknowledge downtime/data replacement and restored TLS/auth/listener inputs.
Original-instance mode requires stopped-source and revoked-credential/device/
quota-rewind consent. Clone mode requires new administrator setup, protocol
re-enrollment and disabled restored resources/schedules. A changed resulting
identity has its own acknowledgement. All submitted identifiers are bound to one
server-issued preview revision; replacing a preview invalidates prior consent.

The backend seals projected files and SQLite schemas after authenticating the
archive, stores no private decryption input, then takes the existing maintenance
lease and stops SQLite owners before activation. A unique SQLite admission index
excludes other restores and capture requests. Only the independent helper runs
activation; the browser and request handler do not replace databases.

The API response means **admitted**, not **committed**. A disconnect can occur
after admission. The UI never automatically repeats that destructive request;
it keeps an uncertain/pending state and offers manual result refresh. Old cached
success is hidden during a pending operation. Refreshing the actual result also
refreshes staged imports. Reconnect using restored HTTPS/listener settings or
initialize a fresh clone administrator as needed.

Actual startup checks, including database/listener health, determine commit.
Startup failure, timeout and helper death use the existing rollback journal and
restore the previous startup binding. Cleanup failures retain private-file
ownership and an actionable error without preventing a safe service restart.
An idle, unclaimed handoff can be discarded; a live helper's staging is protected
by its maintenance lease and excluded from expiry cleanup. Web restoration
requires a matching application version/platform; reviewed version changes and
other maintenance hosts use the offline CLI.

EN/JA/KO, typed-target/consent/uncertain-request unit tests and the existing
1440/360/320 px real-browser regression cover the flow. Its MSW state remains
synthetic. The backend's actual systemd/HTTPS drill separately restores changed
configuration and tests clone certificate rotation, fresh administrator setup
and rejection of the source session. Protected updates and explicit paired offline recovery now use this same backup
owner on supported Linux systemd services. Broader host support remains limited;
managed ACME certificates are covered separately in the certificate guide.


## Protected software maintenance

The About page displays recovery readiness beside observed database catalogs.
A database-migrating target is enabled only with configured protection and a
supported host. The confirmation dialog requires maintenance and external-key /
offline-recovery acknowledgement, with a separate no-point confirmation when an
administrator disables protection. Missing protection is enabled by default in
the existing Backup settings; periodic backup scheduling remains independent.
A target must also declare support for the backend's startup-receipt protocol.

The update observer persists the client operation UUID and reviewed executable
SHA-256 across reloads. A matching committed startup receipt, produced after real
backend database/inbound/Gateway/local-listener checks and verified against the
installed MainPID, is required for protected-update success. A changed version or
started helper alone cannot finish the observer. Retries poll status without
replaying mutation requests. An unresolved operation shows its paired backup and
source/target digests; only an unclaimed prepared handoff can be explicitly
cancelled. Long outages display the host's `update-status` CLI procedure instead
of inventing a successful update or automatic database rollback.

Backend protection reuses coherent encrypted full snapshots. The point is local;
configured S3 upload/readback resumes after service recovery. Potentially migrated
failed stores require a reviewed matching source executable and database backup,
with explicit original-instance and credential-revival confirmations. The full
workflow and supported-host limitations are in the
[backend update guide](https://github.com/yuhaiin/yuhaiin/blob/codex/reliability-selector/docs/update-rollback.md#protected-update-and-offline-recovery).

Unit tests cover migrating/unknown/missing recovery state, consent, mismatched or
stale operation/digest receipts and unchanged legacy-backend observation. The real
browser harness at 1440/360/320 px confirms blocked unprotected migration,
consented protected migration and matched receipt completion without horizontal
overflow. Its data is synthetic; actual service migration, startup failure,
SIGKILL and offline restoration run separately in the backend systemd fixture.

## Upload measurements and scheduling

Each Selector can independently configure **Active upload measurement** and
**Override upload schedule**. Creating the override leaves tests disabled and
does not grant endpoint consent. **Monitoring defaults → Periodic upload tests**
provides an optional global schedule with its own target, consent, interval and
network controls. Both directions share backend admission/concurrency and the
same durable UTC-day allowance; failed/cancelled tests consume their reservation.
Metered networks and Android background work remain off by default.

Upload configuration extends the existing policy/monitoring JSON. Results extend
the existing statistics JSON and bounded raw history. No new database migration
is required for this follow-up. A separate HTTPS endpoint tool and protocol are
specified in the backend measurement guide; it does not open an app listener.

Local tests cover saved upload targets/limits, withheld consent, separate schedule
enablement, and correct upload-history Mbps. The three-width browser harness
executes the real upload button against explicit synthetic MSW data and checks
the target/direction/consent/budget sent, history labels, disabled default schedule
and layout. Actual verified-TLS measurement, persistence, shared budgets and
selection correctness are covered by backend integration tests, rather than
inferred from those browser fixtures.

## Node observed traffic and active measurements

Expand **Traffic window and active measurements** in a Node's existing runtime
overview to inspect actual sampled traffic coverage, recent retained TCP dial
failures, and the last download/upload measurements with their own timestamps,
targets and sample counts. Current Bps and window-average Bps describe logical
observed traffic, including tests; active Mbps measurements describe a specific
target/time. Neither a load peak nor a window mean is a link-capacity estimate.

The backend uses a bounded ring on its existing five-second observer, reports
up to a minute of actual coverage and resets after restart, sleep/clock gaps or
counter resets. Unknown windows and absent old-server fields are displayed as
unavailable. A TCP dial ratio excludes later I/O, application/probe events and
UDP session creation, and uses only retained eligible dial outcomes. Details
remain collapsed until needed; the normal statistics and native-state panel are
preserved. This follow-up adds no persistent database state or migration.


## Fresh timeout outcomes

The expanded candidate card shows a timeout ratio with its health-outcome count,
separate from RTT EWMA/sample count. The backend derives it from the same fresh
health window as the failure ratio, excluding stale/future and duplicate response
evidence. Without a denominator (including an older backend response), it shows
unmeasured. These are eligible connection/probe health timeouts, not a UDP
packet-loss estimate. The normalized score and existing raw metrics remain visible.
A component regression and synthetic Chrome fixture at 1440/360/320 px cover the
projection; actual backend tests cover timeout classification, expiry and counts.
