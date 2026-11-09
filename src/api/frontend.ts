import { directJSON } from '@/auth/transport';

export interface FrontendBuild {
  version: string;
  buildNumber: number;
  apiContract: number;
  requiredCapabilities?: string[];
  optionalCapabilities?: string[];
  minAndroidBridge?: number;
}
export interface FrontendStatus {
  source: 'embedded' | 'downloaded' | 'previous' | 'external';
  active: FrontendBuild;
  embedded: FrontendBuild;
  installed?: FrontendBuild;
  previous?: FrontendBuild;
  capabilities: string[];
  reason?: string;
}
export interface FrontendRelease extends FrontendBuild {
  url: string;
  sha256: string;
  size: number;
}
export interface FrontendCheck {
  status: FrontendStatus;
  release: FrontendRelease;
  available: boolean;
  compatible: boolean;
  reason?: string;
}
const rpc = <T>(action: string, body: unknown = {}) =>
  directJSON<T>('POST', '/api/v2/rpc/frontend.' + action, body);

export const frontendStatus = () => rpc<FrontendStatus>('status');
export const frontendCheck = () => rpc<FrontendCheck>('check');
export const frontendApply = (version: string, sha256: string) =>
  rpc<FrontendStatus>('apply', { version, sha256 });
export const frontendRollback = () => rpc<FrontendStatus>('rollback');
