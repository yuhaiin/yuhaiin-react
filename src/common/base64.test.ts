import { expect, it } from 'vitest';
import { base64ToBytes, bytesToBase64 } from './base64';

it('round trips large binary inputs without spreading the whole array onto the stack', () => {
    const bytes = Uint8Array.from({ length: 200000 }, (_, index) => index % 256);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
});

it('preserves legacy plain-text certificates', () => {
    expect(new TextDecoder().decode(base64ToBytes('-----BEGIN CERTIFICATE-----'))).toBe('-----BEGIN CERTIFICATE-----');
});
