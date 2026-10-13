import { createDefaultInbound, createDefaultProtocol, inboundListen, normalizeInbound, type Inbound } from '@/contract/inbound';

export type InboundPreset = 'local' | 'lan' | 'tun';

export function presetInbound(value: Inbound, preset: InboundPreset, platform: string): Inbound {
    if (preset === 'tun') {
        const protocol = createDefaultProtocol('tun');
        if (protocol.type !== 'tun') throw new Error('Unexpected TUN protocol');
        protocol.tun = { ...protocol.tun, name: platform === 'darwin' ? 'tun://utun8' : 'tun://yuhaiin', mtu: 1500,
            portal: '172.19.0.1/30', portalV6: 'fdfe:dcba:9876::1/126', routes: ['0.0.0.0/0'], skipMulticast: true };
        return normalizeInbound({ ...value, network: { type: 'empty', empty: {} }, transports: [], protocol });
    }
    return normalizeInbound({ ...value,
        network: { type: 'tcp_udp', tcp_udp: { host: preset === 'local' ? '127.0.0.1:9002' : '0.0.0.0:9002', udp: 'enabled' } },
        transports: [], protocol: createDefaultProtocol('mixed'),
    });
}

export function initialInbound(id: string): Inbound {
    return presetInbound({ ...createDefaultInbound(id), name: '', enabled: true }, 'local', '');
}

export function supportsSimpleInbound(value: Inbound): boolean {
    return value.protocol.type === 'tun' && value.network.type === 'empty' && value.transports.length === 0
        || ['mixed', 'http', 'socks5'].includes(value.protocol.type) && value.network.type === 'tcp_udp'
        && value.transports.every(transport => transport.type === 'normal');
}

export function proxyInstructions(value: Inbound): { local: boolean; host: string; port: string; http: boolean; socks: boolean; auth: boolean } | undefined {
    if (!supportsSimpleInbound(value) || value.protocol.type === 'tun') return;
    const listen = inboundListen(value);
    try {
        const address = new URL(`http://${listen.startsWith(':') ? `0.0.0.0${listen}` : listen}`);
        const host = address.hostname;
        const local = host === 'localhost' || host === '[::1]' || host.startsWith('127.');
        const wildcard = ['0.0.0.0', '[::]', ''].includes(host);
        const protocol = value.protocol;
        const auth = protocol.type === 'mixed' ? Boolean(protocol.mixed.username || protocol.mixed.password)
            : protocol.type === 'http' ? Boolean(protocol.http.username || protocol.http.password)
                : protocol.type === 'socks5' ? Boolean(protocol.socks5.username || protocol.socks5.password) : false;
        return { local, host: wildcard ? 'your-device-ip' : host, port: address.port || '80',
            http: protocol.type === 'mixed' || protocol.type === 'http', socks: protocol.type === 'mixed' || protocol.type === 'socks5', auth };
    } catch { return; }
}
