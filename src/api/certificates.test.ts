import { afterEach, expect, it, vi } from 'vitest';
import { getCertificates, renewCertificate } from './certificates';
import { authorizeTest, resetTestAuth } from '@/test/auth';
afterEach(() => { resetTestAuth(); vi.unstubAllGlobals(); });
it('uses the registered certificate RPC operations and carries the revision fence', async () => {
  authorizeTest();
  const fetch = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => Response.json({ certificates: [], providers: [], events: [] })); vi.stubGlobal('fetch', fetch);
  await getCertificates(); await renewCertificate('site id', 4);
  const calls = fetch.mock.calls;
  expect(String(calls[0][0])).toContain('/api/v2/rpc/certificates.list');
  expect(String(calls[1][0])).toContain('/api/v2/rpc/certificate.renew');
  expect(JSON.parse(String(calls[1][1]?.body))).toEqual({ id: 'site id', revision: 4 });
});
