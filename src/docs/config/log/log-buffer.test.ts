import { describe, expect, it, vi } from 'vitest';
import { LogRingBuffer, parseLogFields, parseLogLine, passesMinLevel, type LogEntry } from './log-buffer';

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
    const format = vi.spyOn(Intl, 'DateTimeFormat');
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

it('reads quoted slog values with escapes', () => {
    const parsed = parseLogLine('level=WARN msg="say \\"hi\\" to C:\\\\tmp" k=v');
    expect(parsed.level).toBe('WARN');
    expect(parsed.message).toBe('say "hi" to C:\\tmp');
    expect(parseLogLine('msg="unterminated').message).toBe('unterminated');
});

it('parses logcat threadtime lines into level, time, tag and message', () => {
    const parsed = parseLogLine('11-09 17:56:33.850 19078 19078 W View    : setRequestedFrameRate frameRate=-4.0');
    expect(parsed).toMatchObject({ level: 'WARN', displayTime: '17:56:33.850', source: 'View', message: 'setRequestedFrameRate frameRate=-4.0' });
    expect(parseLogLine('11-09 17:56:33.850 1 2 E AndroidRuntime: FATAL EXCEPTION').level).toBe('ERROR');
    expect(parseLogLine('11-09 17:56:33.850 1 2 V Tag: verbose').level).toBe('TRACE');
});

it('keeps the core slog level and fields when logcat forwards its lines', () => {
    const parsed = parseLogLine('11-09 17:56:49.021 7 8 I yuhaiin: time=2026-11-09T17:56:49Z level=ERROR source=handler.go:79 msg="inbound handler stream" err=boom');
    expect(parsed).toMatchObject({ level: 'ERROR', message: 'inbound handler stream', source: 'handler.go:79', displayTime: '17:56:49.021' });
    expect(parsed.details).toBe('err=boom');
});

it('leaves lines logcat did not format, such as buffer headers, unfiltered', () => {
    expect(parseLogLine('--------- beginning of main')).toMatchObject({ level: 'LOG', message: '--------- beginning of main' });
});

it('filters by minimum level and never hides unparsed lines', () => {
    const entry = (line: string): LogEntry => ({ id: 1, line });
    const info = entry('level=INFO msg=a');
    const warn = entry('level=WARN msg=b');
    const header = entry('--------- beginning of main');
    expect(passesMinLevel(info, 'TRACE')).toBe(true);
    expect(passesMinLevel(info, 'WARN')).toBe(false);
    expect(passesMinLevel(warn, 'WARN')).toBe(true);
    expect(passesMinLevel(header, 'ERROR')).toBe(true);
});

it('splits slog attributes into ordered fields and undoes quoting', () => {
    expect(parseLogFields('err="use of \\"closed\\" connection" attempt=3 empty= tail="open')).toEqual([
        { key: 'err', value: 'use of "closed" connection' },
        { key: 'attempt', value: '3' },
        { key: 'empty', value: '' },
        { key: 'tail', value: 'open' },
    ]);
    expect(parseLogFields(undefined)).toEqual([]);
});

describe('countNewerThan', () => {
    it('counts only retained lines after the given id that pass the level and search filter', () => {
        const buffer = new LogRingBuffer(100);
        buffer.append(['level=INFO msg=old']);
        const shown = buffer.latestId;
        // Batches arrive newest first.
        buffer.append(['level=ERROR msg="DNS failed"', 'level=DEBUG msg="dns query"', 'level=WARN msg=tcp', 'plain dns line']);

        expect(buffer.countNewerThan(shown, 'TRACE', '')).toBe(4);
        expect(buffer.countNewerThan(shown, 'WARN', '')).toBe(3);
        expect(buffer.countNewerThan(shown, 'TRACE', 'dns')).toBe(3);
        expect(buffer.countNewerThan(shown, 'WARN', 'dns')).toBe(2);
        expect(buffer.countNewerThan(shown, 'TRACE', 'nothing')).toBe(0);
        expect(buffer.countNewerThan(buffer.latestId, 'TRACE', '')).toBe(0);
    });

    it('is bounded by what the ring still holds, however far the ids have advanced', () => {
        const buffer = new LogRingBuffer(5);
        buffer.append(['seed']);
        const shown = buffer.latestId;
        for (let i = 0; i < 1000; i++) buffer.append([i % 2 ? 'odd' : 'even']);

        expect(buffer.latestId - shown).toBe(1000);
        expect(buffer.countNewerThan(shown, 'TRACE', '')).toBe(5);
        expect(buffer.countNewerThan(shown, 'TRACE', 'odd')).toBe(3);
    });

    it('follows capacity changes, the retained-size limit and clearing', () => {
        const buffer = new LogRingBuffer(10);
        buffer.append(Array.from({ length: 10 }, (_, index) => `line ${index}`));
        buffer.setCapacity(4);
        expect(buffer.countNewerThan(0, 'TRACE', '')).toBe(4);

        buffer.setCapacity(2000);
        buffer.append(Array.from({ length: 600 }, () => 'x'.repeat(8000)));
        expect(buffer.countNewerThan(0, 'TRACE', '')).toBe(buffer.size);
        expect(buffer.size).toBeLessThan(600);

        buffer.clear();
        expect(buffer.countNewerThan(0, 'TRACE', '')).toBe(0);
    });
});
