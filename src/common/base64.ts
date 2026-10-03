export function bytesToBase64(bytes?: Uint8Array): string {
    if (!bytes?.length) return '';
    const chunks: string[] = [];
    for (let offset = 0; offset < bytes.length; offset += 8192) {
        chunks.push(String.fromCharCode(...bytes.subarray(offset, offset + 8192)));
    }
    return btoa(chunks.join(''));
}

/** Legacy PEM/plain-text configuration values remain readable. */
export function base64ToBytes(value: unknown): Uint8Array {
    if (value instanceof Uint8Array) return value;
    if (Array.isArray(value)) return Uint8Array.from(value.filter((item): item is number => typeof item === 'number'));
    if (typeof value !== 'string' || !value) return new Uint8Array(0);
    try { return Uint8Array.from(atob(value), char => char.charCodeAt(0)); }
    catch { return new TextEncoder().encode(value); }
}
