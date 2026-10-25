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
