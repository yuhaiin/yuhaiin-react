import { afterEach, expect, it, vi } from 'vitest';
import { AndroidAPIError, getAndroidCapabilities, nativeActionURL, saveAndroidSettings, setAndroidVpn, vpnActive } from './android';

afterEach(() => vi.unstubAllGlobals());

function stubFetch(status: number, body: unknown) {
    const fetch = vi.fn(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }));
    vi.stubGlobal('fetch', fetch);
    return fetch;
}

it('detects Android only through the capability endpoint', async () => {
    stubFetch(404, '404 page not found');
    expect(await getAndroidCapabilities()).toBeNull();
    stubFetch(200, { platform: 'android', version: 1, features: ['vpn'], session: false });
    expect(await getAndroidCapabilities()).toMatchObject({ platform: 'android', session: false });
    stubFetch(200, '<!doctype html>');
    expect(await getAndroidCapabilities()).toBeNull();
});

it('sends state changes same-origin with the platform request header', async () => {
    const fetch = stubFetch(200, { platform: 'android' });
    await setAndroidVpn(true);
    const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/android/v1/vpn');
    expect(init.credentials).toBe('same-origin');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['X-Yuhaiin-Platform-Request']).toBe('1');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual({ enabled: true });
});

it('surfaces stable error codes', async () => {
    stubFetch(409, { error: { code: 'permission_required', message: 'grant it' } });
    const error = await setAndroidVpn(true).catch(e => e);
    expect(error).toBeInstanceOf(AndroidAPIError);
    expect(error).toMatchObject({ status: 409, code: 'permission_required', message: 'grant it' });
    stubFetch(400, { error: { code: 'invalid_request', message: 'bad' } });
    await expect(saveAndroidSettings({ perApp: true })).rejects.toMatchObject({ code: 'invalid_request' });
});

it('builds fixed native action links and VPN state helpers', () => {
    expect(nativeActionURL('vpn/authorize')).toBe('yuhaiin-android://action/vpn/authorize');
    expect(vpnActive('running')).toBe(true);
    expect(vpnActive('reconfiguring')).toBe(true);
    expect(vpnActive('failed')).toBe(false);
});
