// Configures the demo cores started by run.sh through the management API,
// with the same RPC operations the Web UI uses. Node built-ins only.
//
//   node configure.mjs upstream https://127.0.0.1:50072 <state.json>
//   node configure.mjs core     https://127.0.0.1:50071 <state.json>
//
// state.json carries the generated initialization codes, admin password and
// WireGuard keys. The demo cores use self-signed certificates on loopback, so
// certificate verification is disabled for this process only.
import { pbkdf2Sync, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.removeAllListeners('warning');

const [role, base, statePath] = process.argv.slice(2);
if (!['upstream', 'core'].includes(role) || !base || !statePath) {
    console.error('usage: node configure.mjs upstream|core <controller> <state.json>');
    process.exit(2);
}
const state = JSON.parse(readFileSync(statePath, 'utf8'));
const LOGIN = 'demo-admin';

const NET = {
    core: '10.89.77.10', upstream: '10.89.77.20',
    webA: '10.89.77.31', webB: '10.89.77.32', webC: '10.89.77.33', webCv6: 'fd77:89:77::33',
};

async function call(method, path, body, authorization) {
    const response = await fetch(new URL(path, base), {
        method,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : {};
}

function derive(password, parameters) {
    const salt = Buffer.from(parameters.salt, 'base64url');
    return pbkdf2Sync(Buffer.from(password.normalize('NFC')), salt, parameters.iterations, 32, 'sha256').toString('base64url');
}

async function session() {
    const code = state[role].code;
    const setup = await call('GET', '/api/v2/auth/setup');
    if (setup.required) {
        const parameters = await call('POST', '/api/v2/auth/setup/parameters', {}, `Setup ${code}`);
        await call('POST', '/api/v2/auth/setup', { login: LOGIN, clientCredential: derive(state.password, parameters) }, `Setup ${code}`);
    }
    const parameters = await call('POST', '/api/v2/auth/parameters', { login: LOGIN });
    const issued = await call('POST', '/api/v2/auth/login', { login: LOGIN, clientCredential: derive(state.password, parameters) });
    return `Session ${issued.secret}`;
}

let auth;
const rpc = (operation, body = {}) => call('POST', `/api/v2/rpc/${operation}`, body, auth);

const listen = host => ({ type: 'tcp_udp', tcp_udp: { host, udp: 'enabled' } });
async function inbound(name, network, protocol) {
    return rpc('inbounds.post', { id: randomUUID(), name, enabled: true, network, transports: [], protocol });
}

/** A fresh core starts with default inbounds; the demo replaces them with its own. */
async function clearInbounds() {
    const list = await rpc('inbounds.get', { page: 1, page_size: 100 });
    for (const item of list.items ?? []) {
        console.log(`  removing default inbound ${item.name || item.id}`);
        await rpc('inbound.delete', { id: item.id });
    }
}

/**
 * Demo domains resolve through the demo DNS server on web-a, like real names
 * through a real resolver (a hosts entry would replace the domain before routing).
 */
async function demoResolver() {
    const resolvers = await rpc('resolvers.get');
    for (const resolver of resolvers.items ?? []) {
        await rpc('resolver.put', { ...resolver, type: 'udp', host: `${NET.webA}:53` });
    }
}

async function defaultDirect() {
    // Unmatched traffic leaves directly; only the demo rules use proxies.
    const config = await rpc('route.config.get');
    await rpc('route.config.put', { ...config, defaultMode: 'direct', defaultTarget: { type: 'default' } });
}

async function configureUpstream() {
    await clearInbounds();
    await inbound('Relay SOCKS5', listen('0.0.0.0:1080'), { type: 'socks5', socks5: { username: '', password: '', udp: true } });
    await inbound('Relay HTTP', listen('0.0.0.0:8080'), { type: 'http', http: { username: '', password: '' } });
    await inbound('WireGuard server', { type: 'empty', empty: {} }, {
        type: 'wireguard',
        wireguard: {
            privateKey: state.wg.upstream.private, listenPort: 51820, addresses: ['10.66.0.1/24'], mtu: 1420,
            peers: [{ publicKey: state.wg.core.public, allowedIps: ['10.66.0.2/32'] }],
        },
    });
    await demoResolver();
    await defaultDirect();
}

const simple = (host, port) => ({ type: 'simple', simple: { host, port } });
async function node(name, chain) {
    const created = await rpc('nodes.post', { id: randomUUID(), name, group: 'demo', origin: 'manual', enabled: true, chain });
    return created.id;
}

async function rule(name, mode, target, domains) {
    return rpc('route.rules.post', {
        rule: { id: randomUUID(), revision: 0, name, mode, target, rules: [{ type: 'destination', destination: { domains, cidrs: [] } }] },
        lists: [],
    });
}

async function configureCore() {
    await clearInbounds();
    await inbound('LAN SOCKS5', listen('0.0.0.0:1080'), { type: 'socks5', socks5: { username: '', password: '', udp: true } });
    await inbound('LAN HTTP proxy', listen('0.0.0.0:8080'), { type: 'http', http: { username: '', password: '' } });
    await inbound('Local mixed', listen('127.0.0.1:7890'), { type: 'mixed', mixed: { username: '', password: '' } });

    const socksRelay = await node('SOCKS relay', [simple(NET.upstream, 1080), { type: 'socks5', socks5: { user: '', password: '', hostname: '' } }]);
    const httpRelay = await node('HTTP relay', [simple(NET.upstream, 8080), { type: 'http', http: { user: '', password: '' } }]);
    const tunnel = await node('Office WireGuard', [{
        type: 'wireguard',
        wireguard: {
            secretKey: state.wg.core.private, endpoint: ['10.66.0.2/32'], mtu: 1420,
            peers: [{ publicKey: state.wg.upstream.public, endpoint: `${NET.upstream}:51820`, keepAlive: 25, allowedIps: ['0.0.0.0/0'] }],
        },
    }]);
    const selector = await rpc('outbound.selector.put', { id: randomUUID(), name: 'Edge pool', nodeId: httpRelay, revision: 0 });

    await rule('Media via VPN', 'proxy', { type: 'node', id: tunnel }, ['media.demo.internal']);
    await rule('Telemetry via relay', 'proxy', { type: 'node', id: socksRelay }, ['metrics.demo.internal']);
    await rule('Work apps via edge pool', 'proxy', { type: 'selector', id: selector.id }, ['api.demo.internal', 'files.demo.internal']);
    const block = await rule('Block ads', 'block', { type: 'default' }, ['ads.demo.internal']);
    // The built-in LAN rule sends private ranges direct; the demo sites live in
    // one, so the demo rules must be evaluated first.
    const rules = await rpc('route.rules.get', { page: 1, page_size: 100 });
    for (const item of rules.items ?? []) {
        if (item.id === 'LAN') await rpc('route.rules.priority', { source: { id: item.id }, target: { id: block.rule.id }, operate: 'insert_after' });
    }
    await rpc('route.apply');

    await demoResolver();
    await defaultDirect();
    await rpc('resolver.server.put', { server: '0.0.0.0:5353' });
    const fakedns = await rpc('resolver.fakedns.get').catch(() => ({}));
    await rpc('resolver.fakedns.put', { ...fakedns, enabled: true, ipv4Range: '198.18.0.0/15', ipv6Range: fakedns.ipv6Range || 'fc00::/64' });
    const history = await rpc('dns.history.settings.get');
    await rpc('dns.history.settings.put', { ...history, enabled: true });
    const inbounds = await rpc('inbounds.config.get');
    await rpc('inbounds.config.put', { ...inbounds, sniff: true });
}

auth = await session();
if (role === 'upstream') await configureUpstream();
else await configureCore();
console.log(`${role}: configured`);
