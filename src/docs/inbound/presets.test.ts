import { expect, it } from 'vitest';
import { createDefaultInbound, createDefaultTransport } from '@/contract/inbound';
import { initialInbound, presetInbound, proxyInstructions, supportsSimpleInbound } from './presets';

it('creates local and LAN mixed proxies using the same inbound contract', () => {
    const local = initialInbound('stable');
    expect(local.enabled).toBe(true);
    expect(local.id).toBe('stable');
    expect(proxyInstructions(local)).toMatchObject({ local: true, host: '127.0.0.1', port: '9002', http: true, socks: true });
    const lan = presetInbound(local, 'lan', 'linux');
    expect(lan.id).toBe('stable');
    expect(proxyInstructions(lan)).toMatchObject({ local: false, host: 'your-device-ip', port: '9002' });
});

it('keeps tunneled or encrypted configurations in the advanced editor', () => {
    const value = initialInbound('stable');
    const tun = presetInbound(value, 'tun', 'darwin');
    expect(tun.protocol).toMatchObject({ type: 'tun', tun: { name: 'tun://utun8', routes: ['0.0.0.0/0'] } });
    expect(tun.network.type).toBe('empty');
    expect(supportsSimpleInbound(tun)).toBe(true);
    expect(proxyInstructions(tun)).toBeUndefined();
    const encrypted = { ...createDefaultInbound('encrypted'), transports: [createDefaultTransport('tls')] };
    expect(supportsSimpleInbound(encrypted)).toBe(false);
    expect(proxyInstructions(encrypted)).toBeUndefined();
});
