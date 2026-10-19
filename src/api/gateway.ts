import type { Go } from "./generated-contracts";
import type { Config } from "@/contract/gateway";
import { requestJSON } from "./client";

export const getGatewayConfig = () =>
  requestJSON<Config>("GET", "/api/v2/gateway/config");
export const saveGatewayConfig = (config: Config) =>
  requestJSON<Config>("PUT", "/api/v2/gateway/config", config);
export const gatewayStatus = () =>
  requestJSON<Go.gateway.RuntimeStatus>("GET", "/api/v2/gateway/status");
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
export const refreshGatewayFilter = (id: string) =>
  requestJSON<Config>("POST", "/api/v2/gateway/filters/refresh", { id });
