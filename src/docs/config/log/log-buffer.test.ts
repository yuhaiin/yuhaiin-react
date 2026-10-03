import { expect, it } from 'vitest';
import { LogRingBuffer } from './log-buffer';

it('keeps the newest lines and frees entries when retention is reduced or cleared', () => {
    const buffer = new LogRingBuffer(3);
    buffer.append(['new', 'middle', 'old', 'discarded']);
    expect(buffer.size).toBe(3);
    expect(buffer.get(0)?.line).toBe('new');
    buffer.setCapacity(1);
    expect(buffer.size).toBe(1);
    expect(buffer.get(0)?.line).toBe('new');
    buffer.clear();
    expect(buffer.size).toBe(0);
    expect(buffer.get(0)).toBeUndefined();
});

it('bounds oversized lines and total retained text independently of entry count', () => {
    const buffer = new LogRingBuffer(10000);
    buffer.append(Array.from({ length: 10000 }, () => 'x'.repeat(10000)));
    let chars = 0;
    for (let index = 0; index < buffer.size; index++) {
        const line = buffer.get(index)!.line;
        expect(line.length).toBeLessThan(8250);
        chars += line.length;
    }
    expect(chars).toBeLessThanOrEqual(2 * 1024 * 1024);
    expect(buffer.size).toBeLessThan(300);
});
