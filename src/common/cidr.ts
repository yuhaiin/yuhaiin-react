export type CidrFamily = 4 | 6;

export type CidrLineError = { line: number; value: string; reason: 'cidr' | 'prefix' | 'zone' };

function parseIPv4(value: string): boolean {
    const parts = value.split('.');
    return parts.length === 4 && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255 && (part === '0' || !part.startsWith('0')));
}

function parseIPv6(value: string): boolean {
    if (!/^[0-9a-fA-F:.]+$/.test(value)) return false;
    const halves = value.split('::');
    if (halves.length > 2) return false;
    const groups = (half: string) => half === '' ? [] : half.split(':');
    const head = groups(halves[0]);
    const tail = halves.length === 2 ? groups(halves[1]) : [];
    const all = [...head, ...tail];
    let count = all.length;
    // An embedded IPv4 address (::ffff:192.0.2.1) takes two groups.
    const last = all[all.length - 1];
    if (last?.includes('.')) {
        if (!parseIPv4(last)) return false;
        all.pop();
        count += 1;
    }
    if (!all.every(group => /^[0-9a-fA-F]{1,4}$/.test(group))) return false;
    return halves.length === 2 ? count <= 7 : count === 8;
}

/**
 * Validates a CIDR or single address like the core's TUN routing parser:
 * "192.0.2.0/24", "2001:db8::/32" or "8.8.8.8". Returns its family, or an error reason.
 */
export function checkCidr(input: string): { family: CidrFamily } | { error: CidrLineError['reason'] } {
    const value = input.trim();
    if (value.includes('%')) return { error: 'zone' };
    const slash = value.indexOf('/');
    const address = slash < 0 ? value : value.slice(0, slash);
    const family: CidrFamily | undefined = parseIPv4(address) ? 4 : parseIPv6(address) ? 6 : undefined;
    if (!family) return { error: 'cidr' };
    if (slash >= 0) {
        const bits = value.slice(slash + 1);
        if (!/^\d{1,3}$/.test(bits) || Number(bits) > (family === 4 ? 32 : 128) || (bits.length > 1 && bits.startsWith('0'))) return { error: 'prefix' };
    }
    return { family };
}

/** Splits multi-line input into entries, keeping invalid ones so they can be shown. */
export function cidrLines(text: string): string[] {
    return text.split(/[\r\n]+/).map(line => line.trim()).filter(Boolean);
}

export function analyzeCidrs(values: readonly string[]) {
    const errors: CidrLineError[] = [];
    let ipv4 = 0, ipv6 = 0;
    values.forEach((value, index) => {
        const result = checkCidr(value);
        if ('error' in result) errors.push({ line: index + 1, value, reason: result.error });
        else if (result.family === 4) ipv4++;
        else ipv6++;
    });
    return { errors, ipv4, ipv6 };
}
