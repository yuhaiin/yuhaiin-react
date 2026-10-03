import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import Loading from './loading';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
it('shows an actionable error even when the response has only a status code', () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    const retry = vi.fn();
    act(() => root.render(<Loading code={503} onRetry={retry} />));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('503');
    expect(host.querySelector('[role="status"]')).toBeNull();
    act(() => host.querySelector('button')!.click());
    expect(retry).toHaveBeenCalledTimes(1);
    act(() => root.unmount());
});
