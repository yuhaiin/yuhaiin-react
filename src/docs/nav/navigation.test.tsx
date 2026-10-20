import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { appRoutes } from '@/routes';
import Sidebar from './Sidebar';
import { navigationOrder } from './navigation';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => true }));
vi.mock('wouter', () => ({ useLocation: () => ['/', vi.fn()] }));
it('uses the rendered menu order for page transitions and keeps every route reachable', async () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    try {
        await act(async () => root.render(<Sidebar show={false} onHide={() => undefined} />));
        for (const button of host.querySelectorAll<HTMLButtonElement>('button[aria-expanded=false]')) {
            await act(async () => button.click());
        }
        const visiblePaths = [...host.querySelectorAll<HTMLAnchorElement>('nav a[href]')].map(link => link.getAttribute('href')!.slice(1));
        expect(visiblePaths).toEqual(navigationOrder.filter(path => path !== '/login'));
        expect(new Set(visiblePaths).size).toBe(26);
        expect([...navigationOrder].sort()).toEqual(appRoutes.map(route => route.path).sort());
    } finally { act(() => root.unmount()); host.remove(); }
});

it('uses the owning page label for mobile titles without resource query or trailing-slash differences', async () => {
    const { navigationLabel } = await import('./navigation');
    expect(navigationLabel('/docs/group/?node=node-1')).toEqual({ namespace: 'routing', key: 'nodesTask' });
    expect(navigationLabel('/docs/bypass?rule=rule-1')).toEqual({ namespace: 'nav', key: 'routeRules' });
    expect(navigationLabel('/docs/bypass/resolver')).toEqual({ namespace: 'routing', key: 'dnsTask' });
    expect(navigationLabel('/unknown')).toBeUndefined();
});
