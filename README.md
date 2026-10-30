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

## Enterprise reliability

The existing application exposes the reliability features in one
[frontend PR](https://github.com/yuhaiin/yuhaiin-react/pull/535) with its
[backend companion](https://github.com/yuhaiin/yuhaiin/pull/622).
Controls retain EN/JA/KO, the existing state/editing conventions and responsive
mobile layouts.

**Selectors and Nodes** manage opt-in failover, lowest RTT, measured throughput,
balanced scoring and weighted new flows. Manual selection remains the default.
Candidate evidence, raw score components, switch reasons, circuit state,
preferred return, manual lock and independent probe/download/upload schedules
are visible. Business Bps/window averages remain separate from active Mbps
measurements, with explicit endpoint consent and backend-enforced budgets.
See [configuration, measurement and qualification](docs/intelligent-selectors.md).

**Backup** distinguishes configuration migration from encrypted full recovery.
It manages local/S3 schedules, maintenance consent, history, download/retrieval,
verification, retention and authenticated original/clone previews. Confirmation
binds backup/source/target identities and startup changes; result panels
separate admission, committed startup and rollback. Private key inputs clear
after use. Pre-restore plaintext copies have independent default-off cleanup
consent. Configuration snapshots remove recognized credentials and disable
affected entries; private URLs/custom data still require protected storage or
an encrypted full archive.

**About / Software Update** shows current/target schemas, compatibility and
update recovery points. Confirmed protected installation uses the backend's
independent startup receipt. A failed migration requires the matching source
binary and database backup, with credential-revival review; the UI provides
offline inspection guidance when the service cannot start.
See the [backup and update workflows](docs/intelligent-selectors.md#managed-full-backups).

Automatic disruptive service maintenance is qualified for root-owned Linux
systemd and lingering user services. Windows offline restore through validation,
finalization and rollback requires elevated local NTFS access. Other hosts retain
the documented offline/capability limits; see the backend companion's operator
guides. UI browser checks use explicit synthetic fixtures, separately from the
backend's real service, migration, TLS, crypto and crash-recovery tests.

**Certificates** manages ACME resources, Cloudflare providers, renewal/failure/
expiry alerts and listener references. HTTP-01 requires an opted-in existing
port-80 Gateway. DNS tokens are write-only; private keys are not displayed.
Gateway TLS can select managed IDs, and Management HTTPS shows the explicit
host-owned `-https-certificate-id` configuration and live references. File TLS
remains supported, with site certificates separate from MITM/TLS Auto CAs.
See [certificate controls and verification](docs/managed-certificates.md).
