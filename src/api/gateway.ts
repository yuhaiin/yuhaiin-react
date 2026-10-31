import type { Go } from "./generated-contracts";
import type { Config, GatewayWorkspaceDocument } from "@/contract/gateway";
import { flattenWorkspace, groupWorkspace } from "@/contract/gateway";
import { requestJSON } from "./client";

export const getGatewayConfig = async (): Promise<Config> =>
  flattenWorkspace(await requestJSON<GatewayWorkspaceDocument>("GET", "/api/v2/gateway/workspace"));
export const saveGatewayConfig = async (config: Config): Promise<Config> =>
  flattenWorkspace(await requestJSON<GatewayWorkspaceDocument>(
    "PUT", "/api/v2/gateway/workspace", groupWorkspace(config),
  ));
export const gatewayStatus = () =>
  requestJSON<Go.gateway.RuntimeStatus>("GET", "/api/v2/gateway/status");
export const resetGatewayStatistics = (id = "") =>
  requestJSON<Record<string, never>>("POST", "/api/v2/gateway/statistics/reset", { id });
export const testGateway = (request: Go.gateway.TestRequest) =>
  requestJSON<Go.gateway.TestResult>("POST", "/api/v2/gateway/test", request);
export const getGatewayCA = () =>
  requestJSON<Go.gateway.CAStatus>("GET", "/api/v2/gateway/ca");
export const generateGatewayCA = (revision: number) =>
  requestJSON<Go.gateway.CAStatus>("POST", "/api/v2/gateway/ca/generate", {
    revision,
  });
export const importGatewayCA = (request: Go.gateway.CAImport) =>
  requestJSON<Go.gateway.CAStatus>(
    "POST",
    "/api/v2/gateway/ca/import",
    request,
  );
export const refreshGatewayFilter = async (id: string): Promise<Config> =>
  flattenWorkspace(await requestJSON<GatewayWorkspaceDocument>(
    "POST", "/api/v2/gateway/filters/refresh", { id },
  ));

export async function getGatewaySecrets(signal?: AbortSignal): Promise<Config> {
 return flattenWorkspace(await requestJSON<GatewayWorkspaceDocument>("GET", "/api/v2/gateway/workspace", undefined, undefined, signal, { revealSecrets: true }));
}
