// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file config/dns/dns.proto (package yuhaiin.dns, edition 2023)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_google_protobuf_go_features } from "../../google/protobuf/go_features_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file config/dns/dns.proto.
 */
export const file_config_dns_dns: GenFile = /*@__PURE__*/
  fileDesc("ChRjb25maWcvZG5zL2Rucy5wcm90bxILeXVoYWlpbi5kbnMibAoDZG5zEgwKBGhvc3QYASABKAkSHwoEdHlwZRgFIAEoDjIRLnl1aGFpaW4uZG5zLnR5cGUSDgoGc3VibmV0GAQgASgJEiYKDnRsc19zZXJ2ZXJuYW1lGAIgASgJUg50bHNfc2VydmVybmFtZSLcAwoKZG5zX2NvbmZpZxIOCgZzZXJ2ZXIYBCABKAkSDwoHZmFrZWRucxgFIAEoCBIqChBmYWtlZG5zX2lwX3JhbmdlGAYgASgJUhBmYWtlZG5zX2lwX3JhbmdlEi4KEmZha2VkbnNfaXB2Nl9yYW5nZRgNIAEoCVISZmFrZWRuc19pcHY2X3JhbmdlEiwKEWZha2VkbnNfd2hpdGVsaXN0GAkgAygJUhFmYWtlZG5zX3doaXRlbGlzdBIxCgVob3N0cxgIIAMoCzIiLnl1aGFpaW4uZG5zLmRuc19jb25maWcuSG9zdHNFbnRyeRI3CghyZXNvbHZlchgKIAMoCzIlLnl1aGFpaW4uZG5zLmRuc19jb25maWcuUmVzb2x2ZXJFbnRyeRosCgpIb3N0c0VudHJ5EgsKA2tleRgBIAEoCRINCgV2YWx1ZRgCIAEoCToCOAEaQQoNUmVzb2x2ZXJFbnRyeRILCgNrZXkYASABKAkSHwoFdmFsdWUYAiABKAsyEC55dWhhaWluLmRucy5kbnM6AjgBSgQIBxAISgQIARACSgQIAhADSgQIAxAEUhRyZXNvbHZlX3JlbW90ZV9kb21haVIFbG9jYWxSBnJlbW90ZVIJYm9vdHN0cmFwInQKDmZha2VkbnNfY29uZmlnEg8KB2VuYWJsZWQYASABKAgSHgoKaXB2NF9yYW5nZRgCIAEoCVIKaXB2NF9yYW5nZRIeCgppcHY2X3JhbmdlGAMgASgJUgppcHY2X3JhbmdlEhEKCXdoaXRlbGlzdBgEIAMoCSpKCgR0eXBlEgsKB3Jlc2VydmUQABIHCgN1ZHAQARIHCgN0Y3AQAhIHCgNkb2gQAxIHCgNkb3QQBBIHCgNkb3EQBRIICgRkb2gzEAZCPFoyZ2l0aHViLmNvbS9Bc3V0b3J1ZmEveXVoYWlpbi9wa2cvcHJvdG9zL2NvbmZpZy9kbnOSAwXSPgIQA2IIZWRpdGlvbnNw6Ac", [file_google_protobuf_go_features]);

/**
 * @generated from message yuhaiin.dns.dns
 */
export type dns = Message<"yuhaiin.dns.dns"> & {
  /**
   * @generated from field: string host = 1;
   */
  host: string;

  /**
   * @generated from field: yuhaiin.dns.type type = 5;
   */
  type: type;

  /**
   * @generated from field: string subnet = 4;
   */
  subnet: string;

  /**
   * @generated from field: string tls_servername = 2 [json_name = "tls_servername"];
   */
  tlsServername: string;
};

/**
 * Describes the message yuhaiin.dns.dns.
 * Use `create(dnsSchema)` to create a new message.
 */
export const dnsSchema: GenMessage<dns> = /*@__PURE__*/
  messageDesc(file_config_dns_dns, 0);

/**
 * @generated from message yuhaiin.dns.dns_config
 */
export type dns_config = Message<"yuhaiin.dns.dns_config"> & {
  /**
   * @generated from field: string server = 4;
   */
  server: string;

  /**
   * @generated from field: bool fakedns = 5;
   */
  fakedns: boolean;

  /**
   * @generated from field: string fakedns_ip_range = 6 [json_name = "fakedns_ip_range"];
   */
  fakednsIpRange: string;

  /**
   * @generated from field: string fakedns_ipv6_range = 13 [json_name = "fakedns_ipv6_range"];
   */
  fakednsIpv6Range: string;

  /**
   * @generated from field: repeated string fakedns_whitelist = 9 [json_name = "fakedns_whitelist"];
   */
  fakednsWhitelist: string[];

  /**
   * @generated from field: map<string, string> hosts = 8;
   */
  hosts: { [key: string]: string };

  /**
   * @generated from field: map<string, yuhaiin.dns.dns> resolver = 10;
   */
  resolver: { [key: string]: dns };
};

/**
 * Describes the message yuhaiin.dns.dns_config.
 * Use `create(dns_configSchema)` to create a new message.
 */
export const dns_configSchema: GenMessage<dns_config> = /*@__PURE__*/
  messageDesc(file_config_dns_dns, 1);

/**
 * @generated from message yuhaiin.dns.fakedns_config
 */
export type fakedns_config = Message<"yuhaiin.dns.fakedns_config"> & {
  /**
   * @generated from field: bool enabled = 1;
   */
  enabled: boolean;

  /**
   * @generated from field: string ipv4_range = 2 [json_name = "ipv4_range"];
   */
  ipv4Range: string;

  /**
   * @generated from field: string ipv6_range = 3 [json_name = "ipv6_range"];
   */
  ipv6Range: string;

  /**
   * @generated from field: repeated string whitelist = 4;
   */
  whitelist: string[];
};

/**
 * Describes the message yuhaiin.dns.fakedns_config.
 * Use `create(fakedns_configSchema)` to create a new message.
 */
export const fakedns_configSchema: GenMessage<fakedns_config> = /*@__PURE__*/
  messageDesc(file_config_dns_dns, 2);

/**
 * @generated from enum yuhaiin.dns.type
 */
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

/**
 * Describes the enum yuhaiin.dns.type.
 */
export const typeSchema: GenEnum<type> = /*@__PURE__*/
  enumDesc(file_config_dns_dns, 0);

