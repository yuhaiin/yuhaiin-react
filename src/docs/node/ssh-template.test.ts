import { expect, it } from 'vitest';
import { templateChain, chainTemplate } from './templates';
import { normalizeProtocol } from '@/contract/node';

it('offers an SSH TCP outbound with an upstream endpoint and pinned-key fields', () => {
    const chain = templateChain('ssh');
    expect(chain.map(({ type }) => type)).toEqual(['simple', 'ssh']);
    expect(chainTemplate(chain)).toBe('ssh');
    expect(chain[1]).toEqual({
        type: 'ssh',
        ssh: { user: '', password: '', private_key: '', private_key_passphrase: '', host_key: '', keep_alive_seconds: 0 },
    });
    expect(normalizeProtocol({ type: 'ssh', ssh: { user: 'alice', host_key: 'SHA256:example' } })).toMatchObject({
        type: 'ssh',
        ssh: { user: 'alice', host_key: 'SHA256:example' },
    });
});
