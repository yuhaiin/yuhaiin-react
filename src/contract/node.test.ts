import { expect, it } from 'vitest';
import { chainTemplate, templateChain } from '@/docs/node/templates';
import { createDefaultProtocol, normalizeProtocol, patchProtocolConfig } from './node';

it('creates a Nebula config and retains multiline YAML through JSON normalization', () => {
    const protocol = createDefaultProtocol('nebula');
    expect(protocol).toEqual({ type: 'nebula', nebula: { config_yaml: '' } });
    const yaml = 'pki:\n  ca: |\n    example\nlighthouse:\n  hosts:\n    - 10.42.0.1\n';
    const source = patchProtocolConfig(protocol, { config_yaml: yaml });
    expect(normalizeProtocol(JSON.parse(JSON.stringify(source)))).toEqual(source);
});

it('creates a root ZeroTier template and preserves 64-bit Moon IDs as strings', () => {
    const protocol = createDefaultProtocol('zerotier');
    expect(protocol).toEqual({
        type: 'zerotier',
        zerotier: { network_id: '', identity: '', listen: '', moons: [], low_bandwidth: false },
    });
    expect(templateChain('zerotier')).toEqual([protocol]);
    expect(chainTemplate(templateChain('zerotier'))).toBe('zerotier');
    const source = patchProtocolConfig(protocol, {
        network_id: '8056c2e21c000001', identity: 'my-home', listen: ':0',
        moons: [{ id: 'fffffffffffffffe', seed: '0123456789abcdef' }],
    });
    expect(normalizeProtocol(JSON.parse(JSON.stringify(source)))).toEqual(source);
});

it('offers an SSH TCP template and preserves pinned keys during normalization', () => {
    const chain = templateChain('ssh');
    expect(chain.map(({ type }) => type)).toEqual(['simple', 'ssh']);
    expect(chainTemplate(chain)).toBe('ssh');
    expect(chain[1]).toEqual({
        type: 'ssh',
        ssh: { user: '', password: '', private_key: '', private_key_passphrase: '', host_key: '', keep_alive_seconds: 0 },
    });
    expect(normalizeProtocol({ type: 'ssh', ssh: { user: 'alice', host_key: 'SHA256:example' } })).toMatchObject({
        type: 'ssh', ssh: { user: 'alice', host_key: 'SHA256:example' },
    });
});
