import { describe, expect, it } from 'vitest';
import { createDefaultInbound, createDefaultTransport, normalizeInbound, selectInboundProtocol, type InboundTransport } from './inbound';
import { createDefaultProtocol, normalizeNode } from './node';

describe('Hysteria 2 contracts', () => {
    it('keeps Hysteria 2 client configuration through normalization and JSON reload', () => {
        const config = {
            host: 'server.example:443', auth: 'secret', upload_bps: 25000000,
            download_bps: 12500000, salamander_password: 'separate-secret',
            tls: { servernames: ['sni.example'], ca_cert: ['Y2E='], insecure_skip_verify: false },
        };
        const saved = normalizeNode({ chain: [{ type: 'hysteria2', hysteria2: config }] });
        const restored = normalizeNode(JSON.parse(JSON.stringify(saved)));
        expect(restored.chain).toEqual([{ type: 'hysteria2', hysteria2: config }]);
        expect(createDefaultProtocol('hysteria2')).toMatchObject({
            type: 'hysteria2', hysteria2: { upload_bps: 0, download_bps: 0, tls: { enable: true } },
        });
    });

    it('prepares a UDP-only listener and TLS-auto when selected on a new inbound', () => {
        const selected = selectInboundProtocol(createDefaultInbound('hy2'), 'hysteria2');
        expect(selected.network).toEqual({ type: 'tcp_udp', tcp_udp: { host: ':9002', udp: 'udp_only' } });
        expect(selected.transports).toEqual([createDefaultTransport('tls_auto')]);
        expect(selected.protocol).toMatchObject({ type: 'hysteria2', hysteria2: { auth: '' } });
    });

    it('preserves listener address and persisted CA while replacing incompatible transports', () => {
        const inbound = createDefaultInbound('hy2');
        inbound.network = { type: 'quic', quic: { host: '127.0.0.1:443' } };
        const certificate: InboundTransport = { type: 'tls_auto', tls_auto: {
            serverNames: ['sni.example'], nextProtos: [], caCertBase64: 'Y2E=', caKeyBase64: 'a2V5',
        } };
        const selected = selectInboundProtocol({ ...inbound, transports: [createDefaultTransport('mux'), certificate] }, 'hysteria2');
        expect(selected.network).toEqual({ type: 'tcp_udp', tcp_udp: { host: '127.0.0.1:443', udp: 'udp_only' } });
        expect(selected.transports).toEqual([certificate]);
        expect(normalizeInbound(JSON.parse(JSON.stringify(selected)))).toEqual(selected);
        if (selected.protocol.type !== 'hysteria2') throw new Error('unexpected protocol');
        selected.protocol.hysteria2.auth = 'keep-secret';
        expect(selectInboundProtocol(selected, 'hysteria2')).toEqual(selected);
        expect(inbound.network.type).toBe('quic');
    });

    it('preserves a static certificate and keeps other protocol selections unchanged', () => {
        const inbound = { ...createDefaultInbound('hy2'), transports: [createDefaultTransport('tls')] };
        expect(selectInboundProtocol(inbound, 'hysteria2').transports).toEqual(inbound.transports);
        const socks = selectInboundProtocol(inbound, 'socks5');
        expect(socks.network).toEqual(inbound.network);
        expect(socks.transports).toEqual(inbound.transports);
    });
});
