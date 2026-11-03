import { expect, it, vi } from 'vitest';
import type { NodeProtocol } from '@/contract/node';
import { protocolSummary } from './NodeEditor';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const labels = { noAuth: 'no auth', sharedCredential: 'shared', via: (name: string) => `via ${name}` };
const summary = (protocol: unknown) => protocolSummary(protocol as NodeProtocol, labels);

it('summarises fixed hosts with the extra count and interface', () => {
    expect(summary({ type: 'fixedv2', fixedv2: { addresses: [{ host: '100.106.150.61:1080', port: 0, network_interface: 'tailscale0' }, { host: 'backup.example', port: 1080 }] } }))
        .toBe('100.106.150.61:1080 +1 · via tailscale0');
    expect(summary({ type: 'fixed', fixed: { host: 'a.example', port: 443, alternate_host: [] } })).toBe('a.example:443');
    expect(summary({ type: 'fixedv2', fixedv2: { addresses: [] } })).toBe('');
});

it('summarises the authentication state of proxy steps', () => {
    expect(summary({ type: 'socks5', socks5: { hostname: '100.106.150.61', user: '' } })).toBe('100.106.150.61 · no auth');
    expect(summary({ type: 'http', http: { user: 'alice' } })).toBe('alice');
    expect(summary({ type: 'socks5', credentialRef: 'cred-1', socks5: { user: '' } })).toBe('shared');
});
