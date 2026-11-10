import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { LogDetailModal } from './log-detail';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(() => vi.unstubAllGlobals());

const line = 'time=2026-11-09T17:56:27.023Z level=WARN source=udp.go:142 msg="dns udp read failed" err="use of closed network connection" attempt=3';

async function render(entry: { id: number; line: string }, open = true, onClose = vi.fn()) {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<LogDetailModal entry={entry} open={open} onClose={onClose} />));
    return { host, root, onClose };
}

it('shows the unwrapped message, each field and the raw line', async () => {
    const { host, root } = await render({ id: 1, line });
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('WARN');
    expect(dialog.textContent).toContain('dns udp read failed');
    expect(dialog.textContent).toContain('udp.go:142');
    expect(dialog.textContent).toContain('use of closed network connection');
    expect(dialog.textContent).toContain('attempt');
    expect(dialog.querySelector('details pre')?.textContent).toBe(line);
    act(() => root.unmount());
    host.remove();
});

it('stays closed until opened and copies the raw line', async () => {
    const closed = await render({ id: 1, line }, false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    act(() => closed.root.unmount());
    closed.host.remove();

    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const { host, root } = await render({ id: 2, line });
    const copy = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(b => b.textContent?.includes('log.copyLine'))!;
    await act(async () => copy.click());
    expect(writeText).toHaveBeenCalledWith(line);
    act(() => root.unmount());
    host.remove();
});
