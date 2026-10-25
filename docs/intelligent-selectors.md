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
requires schema 19. Full Closed/Open/Half-open admission and metrics extensions
remain ongoing. Existing Backup, Software Update and TLS/CA pages are unchanged
in this component delivery.

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
Full circuit-breaker request admission, metrics additions, traffic-control
qualification, visual browser checks, disaster recovery and ACME remain ongoing.
