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

The **HTTP Gateway** entry provides listener and interception configuration, a
visual AND/OR/NOT HTTP rule editor, upstream backends/outbound selection, CA
management, a saved-policy tester, URL filters and request/health statistics.
Save and activate publishes the complete revision atomically; a conflict retains
local edits. The RPC routes and TypeScript models are generated from the paired
backend Contract.

HTTPS MITM is off by default and requires a generated/imported CA plus explicit
inbound/domain admission. In the existing **Routing** editor, add an **HTTP
Gateway** action with the desired host/process/inbound conditions and select the
Gateway; only those matching TCP connections enter interception. Put it before
any catch-all action, then apply Routing changes. Installing a CA does not itself
enable interception. The Gateway tester tests the selected Gateway policy; use
the Routing tester to verify the preceding handoff decision.
The UI downloads only the public root and offers platform trust instructions.
Certificate pinning, ECH, client private keys and HTTP/3 are not bypassed.
Without management authentication, the backend restricts Gateway RPCs to local
peers and local browser origins; configure authentication/TLS for a hosted UI.

Backend architecture, complete JSON examples and limitations live in
[the Gateway documentation](https://github.com/yuhaiin/yuhaiin/tree/main/docs/gateway).
