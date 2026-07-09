/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type configv2 = Record<string, any>;
export type maxminddb_geoip = Record<string, any>;
export type bypass_config = Record<string, any>;
export type refresh_config = Record<string, any>;
export type mode_config = Record<string, any>;
export type remote_rule = Record<string, any>;
export type remote_rule_file = Record<string, any>;
export type remote_rule_http = Record<string, any>;
export type host = Record<string, any>;
export type process = Record<string, any>;
export type source = Record<string, any>;
export type port = Record<string, any>;
export type geoip = Record<string, any>;
export type rule = Record<string, any>;
export type network = Record<string, any>;
export type or = Record<string, any>;
export type rulev2 = Record<string, any>;
export type list = Record<string, any>;
export type list_local = Record<string, any>;
export type list_remote = Record<string, any>;

export enum network_network_type {
  /**
   * @generated from enum value: unknown = 0;
   */
  unknown = 0,

  /**
   * @generated from enum value: tcp = 1;
   */
  tcp = 1,

  /**
   * @generated from enum value: udp = 2;
   */
  udp = 2,
}

export enum list_list_type_enum {
  /**
   * @generated from enum value: host = 0;
   */
  host = 0,

  /**
   * @generated from enum value: process = 1;
   */
  process = 1,

  /**
   * parse hosts file, and just use domain as host list
   *
   * @generated from enum value: hosts_as_host = 2;
   */
  hosts_as_host = 2,
}

export enum mode {
  /**
   * @generated from enum value: bypass = 0;
   */
  bypass = 0,

  /**
   * @generated from enum value: direct = 1;
   */
  direct = 1,

  /**
   * @generated from enum value: proxy = 2;
   */
  proxy = 2,

  /**
   * @generated from enum value: block = 3;
   */
  block = 3,
}

export enum resolve_strategy {
  /**
   * @generated from enum value: default = 0;
   */
  default = 0,

  /**
   * @generated from enum value: prefer_ipv4 = 1;
   */
  prefer_ipv4 = 1,

  /**
   * @generated from enum value: only_ipv4 = 2;
   */
  only_ipv4 = 2,

  /**
   * @generated from enum value: prefer_ipv6 = 3;
   */
  prefer_ipv6 = 3,

  /**
   * @generated from enum value: only_ipv6 = 4;
   */
  only_ipv6 = 4,
}

export enum udp_proxy_fqdn_strategy {
  /**
   * @generated from enum value: udp_proxy_fqdn_strategy_default = 0;
   */
  udp_proxy_fqdn_strategy_default = 0,

  /**
   * @generated from enum value: resolve = 1;
   */
  resolve = 1,

  /**
   * @generated from enum value: skip_resolve = 2;
   */
  skip_resolve = 2,
}

export const configv2Schema = schema<configv2>("configv2");
export const maxminddb_geoipSchema = schema<maxminddb_geoip>("maxminddb_geoip");
export const bypass_configSchema = schema<bypass_config>("bypass_config");
export const refresh_configSchema = schema<refresh_config>("refresh_config");
export const mode_configSchema = schema<mode_config>("mode_config");
export const remote_ruleSchema = schema<remote_rule>("remote_rule");
export const remote_rule_fileSchema = schema<remote_rule_file>("remote_rule_file");
export const remote_rule_httpSchema = schema<remote_rule_http>("remote_rule_http");
export const hostSchema = schema<host>("host");
export const processSchema = schema<process>("process");
export const sourceSchema = schema<source>("source");
export const portSchema = schema<port>("port");
export const geoipSchema = schema<geoip>("geoip");
export const ruleSchema = schema<rule>("rule");
export const networkSchema = schema<network>("network");
export const orSchema = schema<or>("or");
export const rulev2Schema = schema<rulev2>("rulev2");
export const listSchema = schema<list>("list");
export const list_localSchema = schema<list_local>("list_local");
export const list_remoteSchema = schema<list_remote>("list_remote");
export const network_network_typeSchema = enumSchema(network_network_type);
export const list_list_type_enumSchema = enumSchema(list_list_type_enum);
export const modeSchema = enumSchema(mode);
export const resolve_strategySchema = enumSchema(resolve_strategy);
export const udp_proxy_fqdn_strategySchema = enumSchema(udp_proxy_fqdn_strategy);
