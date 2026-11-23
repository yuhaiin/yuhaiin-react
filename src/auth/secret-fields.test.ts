import { expect, it } from 'vitest';
import { isSecretReferenceConflict, refreshSecretReferences, secretPlaceholder } from './secret-fields';

const stale = `${secretPlaceholder}.old.signature`;
const fresh = `${secretPlaceholder}.new.signature`;

it('recognizes only the secret reference conflict error code', () => {
    expect(isSecretReferenceConflict({ code: 409, msg: 'x', raw: { error: { code: 'secret_reference_conflict', message: 'x' } } })).toBe(true);
    expect(isSecretReferenceConflict({ code: 409, msg: 'x', raw: { error: { code: 'conflict' } } })).toBe(false);
    expect(isSecretReferenceConflict(new Error('secret_reference_conflict'))).toBe(false);
    expect(isSecretReferenceConflict(undefined)).toBe(false);
});

it('replaces stale secret references and keeps every other edit', () => {
    const draft = { name: 'edited', protocol: { ssh: { hostKey: stale, username: 'bob' } }, list: [{ password: stale }, { password: 'typed-new-password' }] };
    const latest = { name: 'server', protocol: { ssh: { hostKey: fresh, username: 'alice' } }, list: [{ password: fresh }, { password: fresh }] };
    expect(refreshSecretReferences(draft, latest)).toEqual({
        name: 'edited', protocol: { ssh: { hostKey: fresh, username: 'bob' } },
        list: [{ password: fresh }, { password: 'typed-new-password' }],
    });
});

it('leaves a masked value without a fresh counterpart unchanged', () => {
    expect(refreshSecretReferences({ token: stale }, { token: 'plaintext' })).toEqual({ token: stale });
    expect(refreshSecretReferences({ token: stale }, {})).toEqual({ token: stale });
});
