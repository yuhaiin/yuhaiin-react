import { expect, it } from 'vitest';
import { fromBase64URL, toBase64URL } from './passkey';

it('roundtrips WebAuthn credential identifiers and challenges', () => {
    const bytes = Uint8Array.from([0, 1, 2, 127, 128, 254, 255]);
    const encoded = toBase64URL(bytes.buffer);
    expect(encoded).toBe('AAECf4D-_w');
    expect([...fromBase64URL(encoded)]).toEqual([...bytes]);
});
