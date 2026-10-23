import { describe, expect, it } from 'vitest';
import { createDefaultInbound, createDefaultProtocol, normalizeInbound, selectInboundProtocol, normalizeTunProtocol, type Inbound } from './inbound';

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

describe('TUN lightweight-only stack config', () => {
    it('defaults to lightweight/channel with CUBIC congestion control', () => {
        const protocol = createDefaultProtocol('tun');
        if (protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(protocol.tun.stack).toBe('lightweight');
        expect(protocol.tun.driver).toBe('channel');
        expect(protocol.tun.congestionControl).toBe('cubic');
    });

    it('normalizes legacy persisted stack/driver while preserving other options', () => {
        const protocol = createDefaultProtocol('tun');
        if (protocol.type !== 'tun') throw new Error('unexpected protocol');
        const legacy = { ...protocol, tun: {
            ...protocol.tun, stack: undefined, driver: 'system_gvisor',
            congestionControl: undefined, outputScheduler: 'fq_codel',
            mtu: 1400, portal: '172.19.0.1/30',
        } };
        const restored = normalizeInbound(JSON.parse(JSON.stringify({ id: 'legacy', protocol: legacy })) as Inbound);
        if (restored.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(restored.protocol.tun).toMatchObject({
            stack: 'lightweight', driver: 'channel', congestionControl: 'cubic',
            outputScheduler: 'fq_codel', mtu: 1400, portal: '172.19.0.1/30',
        });
    });

    it.each(['reno', 'cubic', 'bbr'])('preserves lightweight %s congestion selection', (cc) => {
        const original = createDefaultProtocol('tun');
        if (original.type !== 'tun') throw new Error('unexpected protocol');
        const configured = { ...normalizeTunProtocol(original.tun), congestionControl: cc };
        const restored = normalizeInbound(JSON.parse(JSON.stringify({ id: 'tun', protocol: { type: 'tun', tun: configured } })) as Inbound);
        if (restored.protocol.type !== 'tun') throw new Error('unexpected protocol');
        expect(restored.protocol.tun).toMatchObject({ stack: 'lightweight', driver: 'channel', congestionControl: cc });
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
