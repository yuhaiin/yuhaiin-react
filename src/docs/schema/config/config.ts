/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type s3 = Record<string, any>;
export type backup_option = Record<string, any>;
export type setting = Record<string, any>;
export type advanced_config = Record<string, any>;
export type system_proxy = Record<string, any>;
export type info = Record<string, any>;
export type config_version = Record<string, any>;
export type platform = Record<string, any>;

export const s3Schema = schema<s3>("s3");
export const backup_optionSchema = schema<backup_option>("backup_option");
export const settingSchema = schema<setting>("setting");
export const advanced_configSchema = schema<advanced_config>("advanced_config");
export const system_proxySchema = schema<system_proxy>("system_proxy");
export const infoSchema = schema<info>("info");
export const config_versionSchema = schema<config_version>("config_version");
export const platformSchema = schema<platform>("platform");
