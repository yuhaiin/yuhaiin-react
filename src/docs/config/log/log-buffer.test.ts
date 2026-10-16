import { expect, it, vi } from 'vitest';
import { LogRingBuffer, parseLogLine } from './log-buffer';

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

it('keeps streamed entries cheap and formats slog fields only when a row needs them', () => {
    const original = 'time=2026-10-16T12:00:00.123Z level=INFO source=main.go:2 msg="ready to serve" extra=1';
    const format = vi.spyOn(Date.prototype, 'toLocaleTimeString');
    try {
        const buffer = new LogRingBuffer(1000);
        buffer.append(Array.from({ length: 1000 }, () => original));
        expect(format).not.toHaveBeenCalled();
        expect(buffer.get(0)).not.toHaveProperty('parsed');

        const parsed = parseLogLine(buffer.get(0)!.line);
        expect(parsed.level).toBe('INFO');
        expect(parsed.source).toBe('main.go:2');
        expect(parsed.message).toBe('ready to serve');
        expect(parsed.details).toBe('extra=1');
        expect(format).toHaveBeenCalledTimes(1);
    } finally {
        format.mockRestore();
    }
});
