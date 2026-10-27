# yuhaiin-react

yuhaiin-react is the Web frontend for yuhaiin. It provides a browser-based interface for managing nodes, subscriptions, inbounds, routing rules, active connections, logs, configuration, and debugging pages.

It is built with React, TypeScript, Vite, and Tailwind CSS, and communicates with the yuhaiin backend through HTTP and JSON APIs. The UI supports light and dark themes and includes optimizations for long-running connection, traffic, and log views.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## VPN nodes

The node editor supports native OpenVPN outbounds over UDP or TCP, with inline
CA/client certificates, password authentication, tls-auth/tls-crypt, AEAD cipher
selection, rekey and reconnect settings. Connection information is loaded on
demand from an already active tunnel; pushed DNS and routes require separate
yuhaiin configuration. GlobalProtect also exposes the optional ESP/UDP switch
and the active SSL/ESP transport.

These additions require [the companion backend PR](https://github.com/yuhaiin/yuhaiin/pull/508).
The editor does not import `.ovpn` files. Use the server's profile to fill in the
fields, and protect exports/backups containing VPN credentials.

To preview the forms with synthetic API data:

```bash
npm run dev:msw
# Open http://127.0.0.1:5175/?scenario=vpn and choose Outbound.
```

## WireGuard server inbound

The inbound editor supports **WireGuard** servers backed by yuhaiin's userspace
lightweight TCP/IP stack. Configure a UDP listen port, server key, gateway CIDRs,
and one or more client public keys with unique /32 or /128 addresses.
This feature requires the matching yuhaiin backend, and does not create a host
TUN interface or install host routes. See the
[backend setup guide](https://github.com/yuhaiin/yuhaiin/blob/main/docs/wireguard-inbound.md)
for a complete server JSON and standard WireGuard client example.
Protect saved configurations and backups containing private keys.

## HTTP Gateway

The HTTP Gateway editor is organized by Gateway instead of by resource type.
Each Gateway owns its listener, HTTP/TLS settings, HTTP rules, URL filters, default action,
and backend pools in one expandable workspace. A new rule is immediately
attached to its Gateway; a new backend pool is attached to a reverse-proxy
action so it stays visible. The same API revision is saved and activated
atomically. CA management, policy testing and statistics remain in the
Diagnostics section.

Create a listener-based Gateway to expose an HTTP reverse proxy. Create an
interception-only Gateway to handle traffic selected by Routing. Set its
**Interception mode** directly, including **HTTPS MITM** when needed. HTTPS MITM
requires explicit domain admission and a trusted local CA. In **Routing**, choose
an **HTTP Gateway** action and its Gateway; use existing Inbound conditions there
to limit which traffic is selected. Apply the Routing rule before a catch-all
Direct/Proxy rule. No additional Inbound attachment is required.


The backend now exposes and persists a versioned, nested Gateway workspace.
Legacy flat-config and individual resource management endpoints were removed.
The UI still uses a temporary flat in-memory editor adapter for established
components; this is not a supported persisted or public API format.

Gateway and Route commits are **not** a single transaction yet, so the Routing
selection remains a separate explicit step. Existing rule ordering, CA
security restrictions, HTTP/2 request-specific outbound selection and TLS
limitations remain unchanged. Certificate pinning, ECH and HTTP/3 are not bypassed.

Backend details: https://github.com/yuhaiin/yuhaiin/tree/main/docs/gateway

## Intelligent selectors

The existing Selector editor supports opt-in failover, lowest RTT, measured
throughput, balanced scoring and weighted new connections, with candidate
controls, manual lock, and explainable TCP/UDP status. It requires the companion
backend; see [configuration and delivery boundaries](docs/intelligent-selectors.md).

The monitoring follow-up also exposes shared probe schedules, per-selector
inheritance/overrides, explicit periodic download controls, mobile/network-cost
policy and bounded measurement history. Automatic monitoring remains opt-in.

Automatic selectors also expose Circuit Breaker cooldown, bounded half-open
recovery controls and distinct TCP/UDP evidence. Candidate details explain
whether the remote observation was a connect, response, DNS/HTTPS/STUN probe or
protocol-native handshake; the circuit state and recovery counters are separate.

The monitoring dialog also reports policy readiness and explains that measured
speeds include configured routing/traffic controls. Tests pause while the backend
loads its initial policy; selection and recovery continue to be backend-owned.

Shared probe/measurement limits and inclusive speed-budget behavior are documented in [intelligent selectors](docs/intelligent-selectors.md).

Enterprise reliability is being developed in one [frontend PR](https://github.com/yuhaiin/yuhaiin-react/pull/535) with its [backend companion](https://github.com/yuhaiin/yuhaiin/pull/622). Further health-routing, backup/restore and certificate lifecycle work continues in these two entries.

The backend now provides offline encrypted recovery preview/activation and
startup rollback; generated models are synchronized here. The corresponding Web
backup page now manages confirmed local/S3 encrypted captures, schedules,
history, verification, downloads and retention on root-owned Linux systemd.
Broader host maintenance and certificate UI remain
in progress in the same two PRs. See [recovery contract status](docs/intelligent-selectors.md#offline-recovery-contract-synchronization).


The Backup page now also uploads encrypted archives and shows authenticated
original/clone recovery previews with identity warnings and file changes.
Uploads and private staging are bounded. Supported systemd hosts can restore
through explicit target-ID and identity-risk confirmations; independent startup
checks decide commit or rollback. Other hosts retain the backend offline CLI. See [preview behavior](docs/intelligent-selectors.md#disaster-recovery-preview).

The Backup page also displays the latest recorded restore commit/rollback and
whether restored startup settings persist across restarts. Failed result queries
hide cached success. See [restore outcomes](docs/intelligent-selectors.md#latest-restore-result).

The Backup history supports explicit S3 archive retrieval/repair when a local copy
is missing or damaged. It shows ciphertext retrieval separately from authenticated
archive verification, supports cancellation, and exports public recovery metadata
for the backend's offline `recovery fetch` command. See the
[backend recovery guide](https://github.com/yuhaiin/yuhaiin/blob/codex/reliability-selector/docs/managed-recovery-backups.md#recover-a-missing-or-damaged-local-s3-copy).

Software Update and Previous versions show observed current/target database
schemas and distinguish compatible, migration-required, incompatible and unknown
binaries. Unknown/incompatible targets cannot be automatically installed or
restored. A binary rollback does not restore credentials, usage or database
contents. Root-owned Linux systemd hosts now support confirmed encrypted update recovery
points, migration-aware installation and real startup supervision. Success is bound
to the operation UUID, reviewed digest and durable startup receipt. The existing
Backup page controls protection independently of its periodic schedule; disabling
protection requires explicit consent and never enables a migrating target. The
status panel identifies the paired point/source and provides offline inspection
instructions when the service stays unavailable. Failed startup after possible
migration requires the matching source binary and database backup, with explicit
credential-revival review. Other hosts retain reviewed offline recovery. Browser
checks at 1440/360/320 px cover consent and receipt completion separately from the
backend's actual systemd migration/failure/SIGKILL/CLI-recovery tests. See the [update compatibility guide](https://github.com/yuhaiin/yuhaiin/blob/codex/reliability-selector/docs/update-rollback.md#verified-target-schema-preflight).

Selectors also provide opt-in active upload measurements, independent upload
schedules and direction-labeled results while sharing the existing backend test
budgets. See [upload measurement controls](docs/intelligent-selectors.md#upload-measurements-and-scheduling).

Node runtime details separate current/window-average observed traffic, recent
TCP dial failures and active download/upload measurements. The bounded window
runs on the existing observer and resets after restart or a sleep/clock gap.
