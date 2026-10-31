import { expect, it } from 'vitest';
import { parseThresholds, validQuotaBytes } from './resource-policy';

it('keeps quota byte limits exact above the JavaScript integer range', () => {
    expect(validQuotaBytes('9007199254740993')).toBe(true);
    expect(validQuotaBytes('9223372036854775807')).toBe(true);
    for (const value of ['9223372036854775808', '-1', '1e6', '1.5', '+1', ' 1']) expect(validQuotaBytes(value)).toBe(false);
});
it('validates thresholds without accepting duplicates or partial values', () => {
    expect(parseThresholds('80, 90,100')).toEqual([80, 90, 100]);
    expect(parseThresholds('')).toEqual([]);
    for (const value of ['80,', '80,80', '0,100', '101', '1.5', 'NaN']) expect(parseThresholds(value)).toBeNull();
});
