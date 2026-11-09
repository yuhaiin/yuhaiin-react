import { afterEach, describe, expect, it, vi } from 'vitest';
import { previewAndroidBackup, startDownload } from '@/api/android';
import { routeLines } from './routes/page';
import { updateBusy } from './update/page';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(() => vi.unstubAllGlobals());

it('counts route lines ignoring blanks', () => {
    expect(routeLines('10.0.0.0/8\n\n  \n1.1.1.1\n')).toBe(2);
});

it('treats only in-flight update stages as busy', () => {
    const base = { channel: 'stable', channels: [], checking: false, progress: 0, downloadedBytes: 0, totalBytes: 0, currentVersion: 'v' };
    expect(updateBusy({ ...base, stage: 'DOWNLOADING' })).toBe(true);
    expect(updateBusy({ ...base, stage: 'IDLE', checking: true })).toBe(true);
    expect(updateBusy({ ...base, stage: 'WAITING_PERMISSION' })).toBe(false);
    expect(updateBusy({ ...base, stage: 'ERROR' })).toBe(false);
});

it('sends backups verbatim, not JSON-encoded twice', async () => {
    const fetch = vi.fn(async () => new Response('{"createdAt":"now","nodes":1,"routes":2,"preferences":3}'));
    vi.stubGlobal('fetch', fetch);
    await previewAndroidBackup('{"format":"yuhaiin-config"}');
    const init = (fetch.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.body).toBe('{"format":"yuhaiin-config"}');
    expect((init.headers as Record<string, string>)['X-Yuhaiin-Platform-Request']).toBe('1');
});

it('starts downloads with a same-origin one-time link', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    startDownload({ url: '/android/v1/download/abc', name: 'backup.json' });
    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download]')).toBeNull();
    click.mockRestore();
});

describe('per-app helpers', () => {
    it('lists selected packages that are not installed', async () => {
        const { missingApps } = await import('./page');
        const apps = [{ name: 'A', packageName: 'a.app', system: false }];
        expect(missingApps(apps, new Set(['a.app', 'z.gone', 'b.gone']))).toEqual(['b.gone', 'z.gone']);
    });
    it('builds same-origin icon URLs with the package encoded', async () => {
        const { androidAppIconURL } = await import('@/api/android');
        expect(androidAppIconURL('a.b')).toBe('/android/v1/apps/icon?package=a.b');
        expect(androidAppIconURL('a&b')).toBe('/android/v1/apps/icon?package=a%26b');
    });
});
