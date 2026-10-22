import { expect, it } from 'vitest';
import { normalizeProtocol, patchProtocolConfig } from '@/contract/node';
import { normalizeInbound, selectInboundProtocol } from '@/contract/inbound';
import { selectCredential } from './credential';

it('preserves a credential reference through normalization and unrelated protocol edits', () => {
    const value = normalizeProtocol({ type: 'hysteria2', credentialRef: 'shared', hysteria2: { host: 'example.com:443', salamander_password: 'separate-obfuscation' } });
    expect(value.credentialRef).toBe('shared');
    if (value.type !== 'hysteria2') throw new Error('wrong protocol');
    const edited = patchProtocolConfig(value, { upload_bps: 65536 });
    expect(normalizeProtocol(edited).credentialRef).toBe('shared');
    expect(selectCredential(edited, 'other')).toMatchObject({ credentialRef: 'other', hysteria2: { auth: '', salamander_password: 'separate-obfuscation', upload_bps: 65536 } });
});
it('clears inline authentication when selecting a shared credential and preserves other fields', () => {
    const value = normalizeProtocol({ type: 'socks5', socks5: { user: 'old', password: 'old-secret', hostname: 'example.com', override_port: 1080 } });
    const selected = selectCredential(value, 'shared');
    expect(selected).toMatchObject({ credentialRef: 'shared', socks5: { user: '', password: '', hostname: 'example.com', override_port: 1080 } });
    expect(selectCredential(selected, '').credentialRef).toBeUndefined();
});
it('preserves inbound authentication during edits and removes it when selecting a local-only protocol', () => {
    const value = normalizeInbound({ id: 'entry', protocol: { type: 'http', http: { username: '', password: '' } }, authentication: { users: ['alice', 'bob'] } });
    expect(normalizeInbound({ ...value, name: 'changed' }).authentication).toEqual({ users: ['alice', 'bob'] });
    expect(selectInboundProtocol(value, 'tun').authentication).toBeUndefined();
});
