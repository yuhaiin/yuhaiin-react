import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import type { Go } from '@/api/generated-contracts';
import { RenewalInfoDetails } from './renewal-info';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const available: Go.certificate.RenewalInfoStatus = { state: 'available', checkedAt: '2030-01-01T00:00:00Z', nextCheck: '2030-01-01T06:00:00Z', windowStart: '2030-01-02T00:00:00Z', windowEnd: '2030-01-03T00:00:00Z', explanationUrl: 'https://ca.example/explanation', failures: 0 };

it('shows public advice timing and opens an explanation only on operator action', async () => {
  const host = document.createElement('div'); const root = createRoot(host);
  try {
    await act(async () => root.render(<RenewalInfoDetails info={available} />));
    expect(host.textContent).toContain('ari_available'); expect(host.textContent).toContain('ariNextCheck');
    const link = host.querySelector('a')!;
    expect(link.href).toBe(available.explanationUrl); expect(link.rel).toContain('noopener'); expect(link.rel).toContain('noreferrer');
    expect(host.querySelectorAll('iframe, img').length).toBe(0);
  } finally { act(() => root.unmount()); }
});

it('retains a visible retry explanation and excludes unsafe CA links', async () => {
  const host = document.createElement('div'); const root = createRoot(host);
  try {
    for (const explanationUrl of ['javascript:alert(1)', 'http://ca.example/explanation', 'https://user:secret@ca.example/explanation']) {
      await act(async () => root.render(<RenewalInfoDetails info={{ ...available, state: 'unavailable', failures: 3, explanationUrl }} />));
      expect(host.textContent).toContain('ari_unavailable'); expect(host.textContent).toContain('ariFailures'); expect(host.querySelector('a')).toBeNull();
    }
    await act(async () => root.render(<RenewalInfoDetails />)); expect(host.textContent).toBe('');
  } finally { act(() => root.unmount()); }
});
