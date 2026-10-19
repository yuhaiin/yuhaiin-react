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
Each Gateway owns its traffic sources, HTTP rules, URL filters, default action,
and backend pools in one expandable workspace. A new rule is immediately
attached to its Gateway; a new backend pool is attached to a reverse-proxy
action so it stays visible. The same API revision is saved and activated
atomically. CA management, policy testing and statistics remain in the
Diagnostics section.

Create a listener-based Gateway to expose an HTTP reverse proxy. Create an
interception-only Gateway to handle selected existing Inbound traffic, then
attach an Inbound in the Gateway's **Traffic sources** section. HTTPS MITM
requires explicit domain admission, a trusted local CA and a selected
**HTTP Gateway** action in **Routing**. The Routing action must appear before
any catch-all Direct/Proxy rule and must be applied separately; assigning an
Inbound here does not independently divert TCP traffic.

This PR changes the editor's user-facing organization but does not yet make
Gateway and Route commits a single transaction. Until that API is implemented,
the Routing selection remains a separate explicit step and the backend stores
its existing resource format. Existing rule ordering, CA security restrictions,
HTTP/2 request-specific outbound selection and TLS limitations remain
unchanged. Certificate pinning, ECH and HTTP/3 are not bypassed.

Backend details: https://github.com/yuhaiin/yuhaiin/tree/main/docs/gateway
