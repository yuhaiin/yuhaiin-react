# Intelligent selectors

Open **Outbound → Selectors** and choose a selection mode. Legacy selectors
remain manual unless you explicitly configure an automatic policy. Backend
snapshots make the decisions without requiring an open browser.

Add candidate nodes, enable them, set priorities (lower first) and connection
weights, and choose how to handle no healthy candidates. Manual lock uses the
selected node above the policy editor; unlocking resumes the retained policy.
Recovery can remain sticky or return to the preferred/priority node in failover
mode. Candidates in use are protected against deletion/subscription removal.

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
capacity. This delivery has download measurements only: leave upload weights
and minimum upload thresholds at zero.

Mode, candidate, thresholds and speed-test edits take effect on Save. Test
buttons use the saved configuration so editing an unsaved URL does not initiate
traffic. Errors remain visible in the editor/status panel. The same fields and
candidate cards work in the mobile workspace. EN/JA/KO strings use the existing
routing namespace and theme tokens.

The initial editor requires schema 18; the monitoring follow-up described below
requires schema 19. Circuit admission uses the existing policy/observation JSON
and does not add a migration. Managed backup history subsequently adds backend
schema 21. The existing Backup page now includes the full-backup controls
described below; safe-update and certificate management remain in progress.

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
exposed by the managed-backup panel below. Web restore activation remains pending.

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
The managed-backup panel adds root-owned Linux systemd capture coordination,
schedules, history and retention. Web restore activation, update recovery-point
controls, broader host coordination and certificate management remain in progress.

Original-instance recovery explicitly acknowledges revived credentials and
reverted quota state. Clone recovery disables restored nodes/listeners, resets
management identities and selected native machine identities, and disables S3/
measurement schedules pending administrator review. Any future restore UI must
present these backend warnings and require confirmation of backup/source/target
identifiers; it must not overwrite live SQLite files through the legacy route.
See the backend [offline operator workflow](https://github.com/yuhaiin/yuhaiin/blob/codex/reliability-selector/docs/recovery-archive.md)
for current support, tests and platform limits.


## Managed full backups

Open **Backup** to distinguish the existing configuration-only S3 snapshot from
**Full disaster recovery backup**. Set a public age recipient, local/S3 target,
maintenance consent, timeout and count/age retention. Scheduling is opt-in and
runs in the backend. Save before creating a backup; the confirmation explains
the temporary service interruption. Automatic maintenance currently requires a
root-owned Linux systemd service. Other hosts keep the offline CLI workflow.

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

Web restore upload/preview/activation and recent-restore presentation are still
required. Existing plaintext offline rollback points have separate retention;
the managed encrypted-archive policy does not delete them. See the backend
[managed-backup operator guide](https://github.com/yuhaiin/yuhaiin/blob/codex/reliability-selector/docs/managed-recovery-backups.md)
for lifecycle details, resource limits and the remaining work.
