/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type dns = Record<string, any>;
export type dns_config = Record<string, any>;
export type fakedns_config = Record<string, any>;
export type server = Record<string, any>;
export type dns_config_v2 = Record<string, any>;

export enum type {
  /**
   * @generated from enum value: reserve = 0;
   */
  reserve = 0,

  /**
   * @generated from enum value: udp = 1;
   */
  udp = 1,

  /**
   * @generated from enum value: tcp = 2;
   */
  tcp = 2,

  /**
   * @generated from enum value: doh = 3;
   */
  doh = 3,

  /**
   * @generated from enum value: dot = 4;
   */
  dot = 4,

  /**
   * @generated from enum value: doq = 5;
   */
  doq = 5,

  /**
   * @generated from enum value: doh3 = 6;
   */
  doh3 = 6,
}

export const dnsSchema = schema<dns>("dns");
export const dns_configSchema = schema<dns_config>("dns_config");
export const fakedns_configSchema = schema<fakedns_config>("fakedns_config");
export const serverSchema = schema<server>("server");
export const dns_config_v2Schema = schema<dns_config_v2>("dns_config_v2");
export const typeSchema = enumSchema(type);
