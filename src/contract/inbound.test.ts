import { describe, expect, it } from 'vitest';
import { createDefaultProtocol, normalizeInbound, type Inbound } from './inbound';

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
