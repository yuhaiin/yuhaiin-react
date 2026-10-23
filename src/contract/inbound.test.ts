import { describe, expect, it } from 'vitest';
import { createDefaultInbound, createDefaultProtocol, normalizeInbound, selectInboundProtocol, selectTunStack, type Inbound } from './inbound';

describe('TUN automatic FakeIP route defaults', () => {
    it('enables automatic FakeIP routes for newly created TUNs', () => {
        const protocol = createDefaultProtocol('tun');
        expect(protocol.type).toBe('tun');
        if (protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(protocol.tun.autoFakeIpRoute).toBe(true);
        expect(protocol.tun.routes).toEqual([]);
    });

    it('keeps missing flags disabled for existing configurations', () => {
        const protocol = createDefaultProtocol('tun');
        if (protocol.type !== 'tun') throw new Error('unexpected protocol');
        const legacy = { ...protocol, tun: { ...protocol.tun, routes: ['192.0.2.0/24'] } };
        delete (legacy.tun as Partial<typeof legacy.tun>).autoFakeIpRoute;
        const normalized = normalizeInbound({ id: 'tun', protocol: legacy });
        if (normalized.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(normalized.protocol.tun.autoFakeIpRoute).toBe(false);
        expect(normalized.protocol.tun.routes).toEqual(['192.0.2.0/24']);
        expect(legacy.tun.autoFakeIpRoute).toBeUndefined();
    });

    it.each([true, false])('preserves an explicit %s across JSON save/reload', (enabled) => {
        const protocol = createDefaultProtocol('tun');
        if (protocol.type !== 'tun') throw new Error('unexpected protocol');
        protocol.tun.autoFakeIpRoute = enabled;
        const restored = normalizeInbound(JSON.parse(JSON.stringify({ id: 'tun', protocol })) as Inbound);
        if (restored.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(restored.protocol.tun.autoFakeIpRoute).toBe(enabled);
    });
});

describe('TUN lightweight stack config', () => {
    it('leaves the legacy stack and driver unchanged in new or existing configs', () => {
        const protocol = createDefaultProtocol('tun');
        if (protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(protocol.tun.stack).toBeUndefined();
        expect(protocol.tun.congestionControl).toBeUndefined();
        expect(protocol.tun.driver).toBe('fdbased');
        const restored = normalizeInbound(JSON.parse(JSON.stringify({ id: 'legacy', protocol })) as Inbound);
        if (restored.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(restored.protocol.tun.stack).toBeUndefined();
        expect(restored.protocol.tun.driver).toBe('fdbased');
    });

    it.each(['reno', 'cubic', 'bbr'])('round-trips lightweight %s selection in the JSON contract', (cc) => {
        const original = createDefaultProtocol('tun');
        if (original.type !== 'tun') throw new Error('unexpected protocol');
        const enabled = { ...selectTunStack(original.tun, 'lightweight'), congestionControl: cc };
        expect(enabled.driver).toBe('channel');
        const parsed = normalizeInbound(JSON.parse(JSON.stringify({ id: 'lightweight', protocol: { type: 'tun', tun: enabled } })) as Inbound);
        if (parsed.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(parsed.protocol.tun).toMatchObject({ stack: 'lightweight', congestionControl: cc, driver: 'channel' });
    });

    it('restores the previous legacy driver and clears both experimental fields on exit', () => {
        const original = createDefaultProtocol('tun');
        if (original.type !== 'tun') throw new Error('unexpected protocol');
        const system = { ...original.tun, driver: 'system_gvisor' };
        const lightweight = { ...selectTunStack(system, 'lightweight'), outputScheduler: 'fifo' };
        expect(lightweight).toMatchObject({ driver: 'channel', stack: 'lightweight', congestionControl: 'cubic' });
        const restored = selectTunStack(lightweight, '', system.driver);
        const serialized = JSON.parse(JSON.stringify(restored));
        expect(serialized.driver).toBe('system_gvisor');
        expect(serialized).not.toHaveProperty('stack');
        expect(serialized).not.toHaveProperty('congestionControl');
        expect(serialized).not.toHaveProperty('outputScheduler');
    });

    it('keeps custom fields and preserves a prior algorithm on reselect', () => {
        const original = createDefaultProtocol('tun');
        if (original.type !== 'tun') throw new Error('unexpected protocol');
        const chosen = { ...original.tun, mtu: 1400, portal: '172.19.0.1/30', congestionControl: 'bbr', outputScheduler: 'fifo' };
        expect(selectTunStack(chosen, 'lightweight')).toMatchObject({ mtu: 1400, portal: '172.19.0.1/30', stack: 'lightweight', congestionControl: 'bbr', outputScheduler: 'fifo', driver: 'channel' });
    });
});

it('keeps Darwin batching off by default and persists per-TUN choices', () => {
    const protocol = createDefaultProtocol('tun');
    if (protocol.type !== 'tun') throw new Error('unexpected protocol');
    expect(protocol.tun.darwin).toEqual({ experimentalBatch: false, batchSize: 32, pendingPackets: 32 });
    const selected = { ...protocol.tun, darwin: { experimentalBatch: true, batchSize: 64, pendingPackets: 128 } };
    const value = normalizeInbound({ ...createDefaultInbound('batch'), protocol: { type: 'tun', tun: selected } });
    const restored = normalizeInbound(JSON.parse(JSON.stringify(value)));
    expect(restored.protocol).toMatchObject({ type: 'tun', tun: { darwin: selected.darwin } });
    delete protocol.tun.darwin;
    const legacy = normalizeInbound({ ...createDefaultInbound('legacy'), protocol });
    if (legacy.protocol.type !== 'tun') throw new Error('unexpected protocol');
    expect(legacy.protocol.tun.darwin?.experimentalBatch ?? false).toBe(false);
});

describe('WireGuard inbound contract', () => {
    it('does not use the WireGuard display label as the Hysteria2 listen address', () => {
        const wireguard = selectInboundProtocol(createDefaultInbound('wg'), 'wireguard');
        const hysteria = selectInboundProtocol(wireguard, 'hysteria2');
        expect(hysteria.network).toEqual({
            type: 'tcp_udp',
            tcp_udp: { host: ':9002', udp: 'udp_only' },
        });
    });

    it('creates a memory-only listener with editable peers', () => {
        const result = selectInboundProtocol(createDefaultInbound('wg'), 'wireguard');
        expect(result.network.type).toBe('empty');
        expect(result.transports).toEqual([]);
        if (result.protocol.type !== 'wireguard') throw new Error('expected WireGuard');
        expect(result.protocol.wireguard).toMatchObject({
            listenPort: 51820, addresses: ['10.66.0.1/24'], mtu: 1420, peers: [],
        });
        const restored = normalizeInbound(JSON.parse(JSON.stringify(result)));
        expect(restored.protocol).toEqual(result.protocol);
    });
});

it('preserves explicit user-only authentication through normalization', () => {
    const inbound = createDefaultInbound('entry');
    inbound.authentication = { mode: 'users', users: ['alice', 'bob'] };
    const normalized = normalizeInbound(inbound);
    expect(normalized.authentication).toEqual({ mode: 'users', users: ['alice', 'bob'] });
    expect(normalized.authentication!.users).not.toBe(inbound.authentication.users);
    expect(normalizeInbound({ ...inbound, authentication: { users: ['alice'] } }).authentication!.mode).toBeUndefined();
});
