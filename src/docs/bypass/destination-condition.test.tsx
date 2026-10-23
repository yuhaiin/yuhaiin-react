import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { DestinationCondition } from './destination-condition';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
it('preserves trailing separators and keeps original domains separate from resolved CIDRs', () => {
    function Form() { const [value, setValue] = useState({ domains: ['service.example'], cidrs: ['192.0.2.0/24'] }); return <><DestinationCondition value={value} onChange={setValue} /><output>{JSON.stringify(value)}</output></>; }
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); act(() => root.render(<Form />));
    const domain = host.querySelector('textarea')!;
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!;
    act(() => { setValue.call(domain, 'service.example,'); domain.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(domain.value).toBe('service.example,');
    act(() => { setValue.call(domain, 'service.example,other.example\n'); domain.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(domain.value).toBe('service.example,other.example\n');
    expect(JSON.parse(host.querySelector('output')!.textContent!)).toEqual({ domains: ['service.example', 'other.example'], cidrs: ['192.0.2.0/24'] });
    act(() => root.unmount()); host.remove();
});
