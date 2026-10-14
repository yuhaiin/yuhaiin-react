import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import SetupCard from './SetupCard';

let selection: unknown;
let inbounds: unknown;
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('wouter', () => ({ useLocation: () => ['/', vi.fn()] }));
vi.mock('@/component/default-selection-editor', () => ({ DefaultSelectionEditor: () => null }));
vi.mock('swr', () => ({ default: (key: string) => ({ data: key === '/api/v2/nodes/selected' ? selection : key === '/api/v2/inbounds' ? inbounds : undefined }) }));
let root: Root;
let host: HTMLDivElement;
afterEach(() => { act(() => root.unmount()); host.remove(); });
function mount() { host = document.createElement('div'); document.body.append(host); root = createRoot(host); act(() => root.render(<SetupCard />)); }
it('collapses only when both default destinations and an enabled inbound are known', () => {
    selection = { tcp: { id: 'tcp', name: 'TCP' }, udp: { id: 'udp', name: 'UDP' } };
    inbounds = { items: [{ enabled: true }] };
    mount();
    const details = host.querySelector('details')!;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);
    expect(host.querySelector('summary')?.textContent).toContain('separateDestinations');
    // Existing configure and diagnostics actions remain reachable on expansion.
    details.open = true;
    expect([...host.querySelectorAll('button')].map(button => button.textContent)).toContain('setupRunTest');
});
it('keeps guidance visible while data is missing or a required configuration is absent', () => {
    selection = undefined; inbounds = undefined; mount();
    expect(host.querySelector('details')).toBeNull();
    selection = { tcp: { id: 'tcp' } }; inbounds = { items: [{ enabled: true }] };
    act(() => root.render(<SetupCard />));
    expect(host.querySelector('details')).toBeNull();
    selection = { tcp: { id: 'tcp' }, udp: { id: 'udp' } }; inbounds = { items: [{ enabled: false }] };
    act(() => root.render(<SetupCard />));
    expect(host.querySelector('details')).toBeNull();
    expect(host.textContent).toContain('setupChooseEntry');
});
