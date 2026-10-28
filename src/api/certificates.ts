import type { Go } from './generated-contracts';
import { requestJSON } from './client';

export const getCertificates = () => requestJSON<Go.certificate.Overview>('GET', '/api/v2/certificates');
export const saveCertificate = (request: Go.certificate.SaveRequest) => requestJSON<Go.certificate.Resource>('PUT', '/api/v2/certificates', request);
export const renewCertificate = (id: string, revision: number) => requestJSON<Go.certificate.Resource>('POST', `/api/v2/certificates/${encodeURIComponent(id)}/renew`, { revision });
export const deleteCertificate = (id: string, revision: number) => requestJSON<Record<string, never>>('DELETE', `/api/v2/certificates/${encodeURIComponent(id)}`, { revision });
export const saveCertificateProvider = (request: Go.certificate.ProviderWrite) => requestJSON<Go.certificate.DNSProvider>('PUT', '/api/v2/certificates/providers', request);
export const deleteCertificateProvider = (id: string, revision: number) => requestJSON<Record<string, never>>('DELETE', `/api/v2/certificates/providers/${encodeURIComponent(id)}`, { revision });
