import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { analyzeCidrs, checkCidr, cidrLines } from '@/common/cidr';
import { createDefaultProtocol, type TunProtocol } from '@/contract/inbound';
import { presetInbound } from './presets';
import { createDefaultInbound } from '@/contract/inbound';
import { TunRoutingEditor, tunRoutingHasErrors } from './tun-routing';

const api = vi.hoisted(() => ({ listGeoIPCountries: vi.fn() }));
vi.mock('@/api/route', () => api);
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, unknown>) => options ? `${key}:${JSON.stringify(options)}` : key,
        i18n: { language: 'en', resolvedLanguage: 'en' },
    }),
}));

let host: HTMLDivElement, root: Root;
const latest: { value?: TunProtocol } = {};
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

function baseTun(fields: Partial<TunProtocol> = {}): TunProtocol {
    const protocol = createDefaultProtocol('tun');
    if (protocol.type !== 'tun') throw new Error('unexpected protocol');
    return { ...protocol.tun, name: 'tun://utun8', portal: '172.19.0.1/30', portalV6: '', ...fields };
}

function Probe({ initial, platform }: { initial: TunProtocol; platform?: string }) {
    const [value, setValue] = useState(initial);
    useEffect(() => { latest.value = value; }, [value]);
    return <TunRoutingEditor value={value} platform={platform} onChange={patch => setValue(previous => ({ ...previous, ...patch }))} />;
}

async function render(initial: TunProtocol, platform?: string) {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, errorRetryCount: 0 }}>
        <Probe initial={initial} platform={platform} /></SWRConfig>));
}

const radio = (mode: string) => host.querySelector<HTMLButtonElement>(`[role="radio"][value="${mode}"]`)!;
const textarea = (label: string) => {
    const element = [...host.querySelectorAll('label')].find(item => item.textContent === label)!;
    return host.querySelector<HTMLTextAreaElement>(`[id="${CSS.escape(element.htmlFor)}"]`)!;
};
function type(input: HTMLTextAreaElement | HTMLInputElement, value: string) {
    const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    act(() => {
        Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

it('validates CIDRs like the core parser', () => {
    for (const value of ['192.168.20.0/24', '10.0.0.0/8', '8.8.8.8/32', '8.8.8.8', '2001:4860::/32', '::/0', '::ffff:192.0.2.1/128', 'fe80::1', '0.0.0.0/0'])
        expect(checkCidr(value), value).not.toHaveProperty('error');
    expect(checkCidr('2001:4860::/32')).toEqual({ family: 6 });
    expect(checkCidr('10.0.0.0/33')).toEqual({ error: 'prefix' });
    expect(checkCidr('2001:db8::/129')).toEqual({ error: 'prefix' });
    expect(checkCidr('10.0.0.0/08')).toEqual({ error: 'prefix' });
    expect(checkCidr('fe80::1%en0')).toEqual({ error: 'zone' });
    for (const value of ['256.0.0.0/8', '10.0.0/8', 'example.com', '1:2:3:4:5:6:7:8:9', '1::2::3', 'file:/etc/routes', '010.0.0.1'])
        expect(checkCidr(value), value).toEqual({ error: 'cidr' });
    expect(cidrLines(' 10.0.0.0/8 \n\n2001:db8::/32\r\n')).toEqual(['10.0.0.0/8', '2001:db8::/32']);
    expect(analyzeCidrs(['10.0.0.0/8', 'bad', '::/0'])).toEqual({ errors: [{ line: 2, value: 'bad', reason: 'cidr' }], ipv4: 1, ipv6: 1 });
});

it('switches between the three modes, shows only their settings and keeps values', async () => {
    await render(baseTun({ routing: { mode: 'non_private' } }));
    expect(radio('non_private').getAttribute('aria-checked')).toBe('true');
    expect(host.textContent).toContain('tunRouting.defaults.title');
    expect(host.textContent).toContain('tunRouting.additionalInclude.label');
    type(textarea('tunRouting.bypass.label'), '203.0.113.0/24\n2001:db8:100::/48');
    expect(latest.value!.routing?.bypassCidrs).toEqual(['203.0.113.0/24', '2001:db8:100::/48']);

    await act(async () => radio('global').click());
    expect(latest.value!.routing?.mode).toBe('global');
    expect(host.textContent).not.toContain('tunRouting.additionalInclude.label');
    expect(host.textContent).not.toContain('tunRouting.defaults.title');
    // The bypass list follows the user across modes.
    expect(textarea('tunRouting.bypass.label').value).toBe('203.0.113.0/24\n2001:db8:100::/48');

    await act(async () => radio('custom').click());
    expect(latest.value!.routing?.mode).toBe('custom');
    for (const section of ['cidrTitle', 'countriesTitle', 'invertTitle', 'bypassTitle'])
        expect(host.textContent).toContain(`tunRouting.custom.${section}`);
    type(textarea('tunRouting.custom.cidrLabel'), '192.168.20.0/24\n10.0.0.0/8');
    expect(host.textContent).toContain('tunRouting.custom.summary');

    await act(async () => radio('non_private').click());
    expect(latest.value!.routing).toMatchObject({ mode: 'non_private', includeCidrs: ['192.168.20.0/24', '10.0.0.0/8'], bypassCidrs: ['203.0.113.0/24', '2001:db8:100::/48'] });
    expect(textarea('tunRouting.additionalInclude.label').value).toBe('192.168.20.0/24\n10.0.0.0/8');
});

it('reports invalid CIDRs inline and blocks saving without dropping the input', async () => {
    await render(baseTun({ routing: { mode: 'custom', includeCidrs: ['10.0.0.0/8'] } }));
    const input = textarea('tunRouting.custom.cidrLabel');
    type(input, '10.0.0.0/8\n10.0.0.0/33\nnot-an-ip');
    expect(latest.value!.routing?.includeCidrs).toEqual(['10.0.0.0/8', '10.0.0.0/33', 'not-an-ip']);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const alert = host.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('tunRouting.cidr.prefix:{"line":2,"value":"10.0.0.0/33"}');
    expect(alert.textContent).toContain('tunRouting.cidr.cidr:{"line":3,"value":"not-an-ip"}');
    expect(input.getAttribute('aria-describedby')).toContain(alert.id);
    expect(tunRoutingHasErrors(latest.value!.routing)).toBe(true);
    // Typing a trailing newline keeps the caret line instead of being normalized away.
    type(input, '10.0.0.0/8\n');
    expect(input.value).toBe('10.0.0.0/8\n');
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(tunRoutingHasErrors(latest.value!.routing)).toBe(false);
    expect(tunRoutingHasErrors({ mode: 'custom' })).toBe(true);
    expect(tunRoutingHasErrors({ mode: 'custom', geoipInvert: true })).toBe(false);
    expect(tunRoutingHasErrors(undefined)).toBe(false);
});

it('selects GeoIP countries with the shared picker and explains the reverse toggle', async () => {
    api.listGeoIPCountries.mockResolvedValue({ codes: ['JP', 'US', 'CN'], loaded: true });
    await render(baseTun({ routing: { mode: 'custom' } }));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('tunRouting.custom.empty');
    await act(async () => host.querySelector<HTMLButtonElement>('button[aria-label="countryCodes"]')!.click());
    await vi.waitFor(() => expect(document.querySelector('[role="checkbox"][aria-label="Japan (JP)"]')).not.toBeNull());
    await act(async () => document.querySelector<HTMLButtonElement>('[role="checkbox"][aria-label="Japan (JP)"]')!.click());
    await act(async () => document.querySelector<HTMLButtonElement>('[role="checkbox"][aria-label="United States (US)"]')!.click());
    expect(latest.value!.routing?.geoipCountries).toEqual(['JP', 'US']);
    expect(host.textContent).toMatch(/summaryCountries:\{\\"countries\\":\\"JP, US\\"\}/);

    const toggle = [...host.querySelectorAll<HTMLButtonElement>('[role="switch"]')].find(item => item.textContent?.includes('tunRouting.custom.invertLabel'))!;
    expect(toggle.textContent).toContain('tunRouting.custom.invertOff');
    await act(async () => toggle.click());
    expect(latest.value!.routing?.geoipInvert).toBe(true);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(toggle.textContent).toContain('tunRouting.custom.invertOn');
    expect(host.textContent).toMatch(/summaryInverted:\{\\"countries\\":\\"JP, US\\"\}/);

    // Manual codes are normalized to the stored array form.
    const manual = host.querySelector<HTMLInputElement>('input[aria-label="manualCountryCodes"]')!;
    type(manual, 'jp, de');
    expect(latest.value!.routing?.geoipCountries).toEqual(['JP', 'DE']);
});

it('keeps legacy route lists, converts them when a mode is chosen and can switch back', async () => {
    await render(baseTun({ routing: undefined, routes: ['192.0.2.0/24', 'file:/etc/routes'], excludes: ['198.51.100.0/24', 'bad'] }));
    expect(host.querySelector('[role="note"]')?.textContent).toContain('tunRouting.legacy.notice');
    expect(host.querySelectorAll('[role="radio"][aria-checked="true"]')).toHaveLength(0);
    expect(host.textContent).toContain('routes');

    await act(async () => radio('custom').click());
    expect(latest.value!.routing).toEqual({ mode: 'custom', bypassCidrs: ['198.51.100.0/24'], includeCidrs: ['192.0.2.0/24'] });
    expect(latest.value!.routes).toEqual(['192.0.2.0/24', 'file:/etc/routes']);
    expect(latest.value!.excludes).toEqual(['198.51.100.0/24', 'bad']);

    await act(async () => [...host.querySelectorAll<HTMLButtonElement>('button')].find(item => item.textContent === 'tunRouting.legacy.restore')!.click());
    expect(latest.value!.routing?.mode).toBe('');
    expect(host.querySelector('[role="note"]')).not.toBeNull();
});

it('shows IPv4 and IPv6 coverage and the Android note', async () => {
    await render(baseTun({ routing: { mode: 'global' }, portal: '172.19.0.1/30', portalV6: '' }));
    const families = host.querySelector('[aria-label="tunRouting.families.label"]')!;
    expect(families.textContent).toContain('tunRouting.families.v4On');
    expect(families.textContent).toContain('tunRouting.families.v6Off');
    expect(host.textContent).not.toContain('tunRouting.androidNote');
    act(() => root.unmount());
    root = createRoot(host);
    await render(baseTun({ routing: { mode: 'global' }, portal: '', portalV6: '' }), 'android');
    expect(host.textContent).toContain('tunRouting.families.v6On');
    expect(host.textContent).toContain('tunRouting.androidNote');
});

it('stacks mode cards in narrow panes and on mobile, using three columns only in wide panes', async () => {
    await render(baseTun({ routing: { mode: 'non_private' } }));
    const group = host.querySelector('[role="radiogroup"]')!;
    expect(group.className).toContain('grid-cols-1');
    // Container breakpoint: the editor pane beside the directory is narrower than the viewport.
    expect(group.className).toContain('@3xl:grid-cols-3');
    expect(group.className).not.toMatch(/(^|\s)(sm|md|lg):grid-cols/);
    for (const item of host.querySelectorAll('[role="radio"]')) expect(item.className).toContain('min-h-11');
    expect(textarea('tunRouting.bypass.label').className).toContain('w-full');
});

it('creates new TUNs with non-private routing instead of a raw default route', () => {
    const protocol = createDefaultProtocol('tun');
    expect(protocol.type === 'tun' && protocol.tun.routing).toEqual({ mode: 'non_private' });
    const preset = presetInbound(createDefaultInbound('tun'), 'tun', 'darwin');
    if (preset.protocol.type !== 'tun') throw new Error('unexpected protocol');
    expect(preset.protocol.tun.routes).toEqual([]);
    expect(preset.protocol.tun.routing).toEqual({ mode: 'non_private' });
});
