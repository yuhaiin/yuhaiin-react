import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { getTotalFlow } from '@/api/connections';
import { useFlow } from '@/docs/connections/components';

vi.mock('@/api/connections', () => ({ getTotalFlow: vi.fn() }));
afterEach(() => vi.useRealTimers());

it('clears a previous error after an unchanged successful response', async () => {
  vi.useFakeTimers();
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  const unchanged = { download: '0', upload: '0', counters: {} };
  vi.mocked(getTotalFlow)
    .mockResolvedValueOnce(unchanged)
    .mockRejectedValueOnce({ msg: 'Synthetic network error' })
    .mockResolvedValue(unchanged);
  let observed: ReturnType<typeof useFlow>;
  function Probe() { observed = useFlow({ refreshInterval: 2000 }); return null; }
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => { root.render(createElement(Probe)); });
  await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
  expect(observed!.error).toBe('Synthetic network error');
  await act(async () => { await vi.advanceTimersByTimeAsync(2000); });
  expect(vi.mocked(getTotalFlow)).toHaveBeenCalledTimes(3);
  expect(observed!.error).toBeUndefined();
  await act(async () => root.unmount());
  host.remove();
});

it('does not overlap slow requests and aborts polling when hidden or unmounted', async () => {
  vi.useFakeTimers();
  vi.mocked(getTotalFlow).mockReset();
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  const signals: AbortSignal[] = [];
  vi.mocked(getTotalFlow).mockImplementation(signal => new Promise((_, reject) => {
    signals.push(signal!);
    signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  }));
  function Probe() { useFlow({ refreshInterval: 2000 }); return null; }
  const root = createRoot(document.createElement('div'));
  await act(async () => root.render(createElement(Probe)));
  await act(async () => vi.advanceTimersByTimeAsync(10000));
  expect(signals).toHaveLength(1);
  await act(async () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(signals[0].aborted).toBe(true);
  await act(async () => vi.advanceTimersByTimeAsync(10000));
  expect(signals).toHaveLength(1);
  await act(async () => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(signals).toHaveLength(2);
  await act(async () => root.unmount());
  expect(signals[1].aborted).toBe(true);
});
