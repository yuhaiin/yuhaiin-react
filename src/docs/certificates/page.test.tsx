import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import type { Go } from '@/api/generated-contracts';
import { authorizeTest, resetTestAuth } from '@/test/auth';
import { establishSession } from '@/auth/session';
import { getApiUrl } from '@/common/apiurl';
import Page from './page';

const api = vi.hoisted(() => ({ getCertificates: vi.fn(), saveCertificate: vi.fn(), renewCertificate: vi.fn(), deleteCertificate: vi.fn(), saveCertificateProvider: vi.fn(), deleteCertificateProvider: vi.fn(), getGatewayConfig: vi.fn() }));
vi.mock('@/api/certificates', () => api);
vi.mock('@/api/gateway', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(() => { resetTestAuth(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

const resource = (): Go.certificate.Resource => ({ config: { id: 'certificate', name: 'Site', domains: ['site.example'], directoryUrl: 'https://ca.example/directory', email: 'ops@example.com', termsAccepted: true, challenge: { type: 'dns-01', dnsProviderId: 'provider' }, autoRenew: true }, revision: 2, status: { state: 'failed', failureCode: 'ca_rate_limited', nextAttempt: '2030-01-01T00:00:00Z' }, references: [] });
const provider = (): Go.certificate.DNSProvider => ({ id: 'provider', name: 'Zone', type: 'cloudflare', zoneName: 'site.example', zoneId: 'a'.repeat(32), revision: 3, hasCredential: true });
const setup = async (readOnly = false, bound = false) => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  authorizeTest();
  if (readOnly) establishSession('', { userId: 'reader', credentialType: 'session', permissions: ['certificates:read'] }, Math.floor(Date.now() / 1000) + 600, getApiUrl());
  const overview: Go.certificate.Overview = { certificates: [resource()], providers: [provider()], events: [] };
  if (bound) overview.certificates[0].references = [{ kind: 'management', id: 'cli', name: 'Management HTTPS' }];
  api.getCertificates.mockImplementation(async () => structuredClone(overview));
  api.getGatewayConfig.mockResolvedValue({ gateways: [] });
  api.saveCertificate.mockImplementation(async (request: Go.certificate.SaveRequest) => { overview.certificates[0] = { ...overview.certificates[0], config: request.certificate, revision: 3 }; return overview.certificates[0]; });
  api.saveCertificateProvider.mockResolvedValue(provider());
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><Page /></SWRConfig>));
  return { host, close: () => { act(() => root.unmount()); host.remove(); } };
};
async function click(host: ParentNode, label: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent?.trim() === label);
  if (!button) throw Error(`Missing button ${label}`); await act(async () => button.click());
}
async function input(host: ParentNode, label: string, value: string) {
  const element = [...host.querySelectorAll('label')].find(item => item.textContent === label);
  const field = element?.htmlFor ? document.getElementById(element.htmlFor) : element?.querySelector('input');
  if (!(field instanceof HTMLInputElement)) throw Error(`Missing field ${label}`);
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(field, value); field.dispatchEvent(new Event('input', { bubbles: true })); });
}

it('edits the persisted resource and keeps manual renewal on the real action', async () => {
  const { host, close } = await setup();
  try {
    expect(host.textContent).toContain('failure_ca_rate_limited');
    const card = host.querySelector('article')!;
    await click(card, 'renew'); expect(api.renewCertificate).toHaveBeenCalledWith('certificate', 2);
    await click(card, 'edit');
    const form = host.querySelector<HTMLFormElement>('form[aria-label="certificateForm"]')!;
    await input(form, 'name', 'Changed site'); await input(form, 'domains', 'site.example, other.example');
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(api.saveCertificate).toHaveBeenCalledWith(expect.objectContaining({ revision: 2, certificate: expect.objectContaining({ name: 'Changed site', domains: ['site.example', 'other.example'], autoRenew: true }) }));
    expect(host.querySelector('form')).toBeNull();
  } finally { close(); }
});

it('requires confirmation for deletion and preserves a write-only token on ordinary edits', async () => {
  const { host, close } = await setup();
  try {
    await click(host.querySelector('article')!, 'delete'); expect(api.deleteCertificate).not.toHaveBeenCalled();
    await click(host.querySelector('[role="group"]')!, 'confirmDelete'); expect(api.deleteCertificate).toHaveBeenCalledWith('certificate', 2);
    const edit = [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'edit' && !button.closest('article'))!;
    await act(async () => edit.click());
    const form = host.querySelector<HTMLFormElement>('form[aria-label="providerForm"]')!;
    const token = form.querySelector<HTMLInputElement>('input[type="password"]')!; expect(token.value).toBe('');
    await input(form, 'name', 'Renamed provider');
    await act(async () => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(api.saveCertificateProvider).toHaveBeenCalledWith(expect.objectContaining({ token: '', provider: expect.objectContaining({ name: 'Renamed provider', revision: 3 }) }));
  } finally { close(); }
});

it('shows public state without credentials or mutation controls for a reader', async () => {
  const { host, close } = await setup(true);
  try {
    expect(host.textContent).toContain('Site'); expect(host.textContent).toContain('credentialConfigured');
    expect([...host.querySelectorAll('button')].some(button => ['create', 'edit', 'renew', 'delete', 'addProvider'].includes(button.textContent ?? ''))).toBe(false);
    expect(host.querySelector('input[type="password"]')).toBeNull(); expect(host.textContent).not.toContain('managementBindingSafety'); expect(api.getGatewayConfig).not.toHaveBeenCalled();
  } finally { close(); }
});

it('shows the actual management reference and prevents deleting its certificate', async () => {
 const { host, close } = await setup(false, true);
 try {
  const card = host.querySelector('article')!;
  expect(card.textContent).toContain('reference_management');
  expect(card.textContent).toContain('-https-certificate-id certificate');
  const remove = [...card.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'delete')!;
  expect(remove.disabled).toBe(true);
  expect(api.deleteCertificate).not.toHaveBeenCalled();
 } finally { close(); }
});
