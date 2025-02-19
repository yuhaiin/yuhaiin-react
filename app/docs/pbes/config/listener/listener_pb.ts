// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file config/listener/listener.proto (package yuhaiin.listener, edition 2023)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_google_protobuf_go_features } from "../../google/protobuf/go_features_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file config/listener/listener.proto.
 */
export const file_config_listener_listener: GenFile = /*@__PURE__*/
  fileDesc("Ch5jb25maWcvbGlzdGVuZXIvbGlzdGVuZXIucHJvdG8SEHl1aGFpaW4ubGlzdGVuZXIiowIKDmluYm91bmRfY29uZmlnEh4KCmhpamFja19kbnMYAiABKAhSCmhpamFja19kbnMSLAoRaGlqYWNrX2Ruc19mYWtlaXAYAyABKAhSEWhpamFja19kbnNfZmFrZWlwEkAKCGluYm91bmRzGAEgAygLMi4ueXVoYWlpbi5saXN0ZW5lci5pbmJvdW5kX2NvbmZpZy5JbmJvdW5kc0VudHJ5EiYKBXNuaWZmGAQgASgLMhcueXVoYWlpbi5saXN0ZW5lci5zbmlmZhpKCg1JbmJvdW5kc0VudHJ5EgsKA2tleRgBIAEoCRIoCgV2YWx1ZRgCIAEoCzIZLnl1aGFpaW4ubGlzdGVuZXIuaW5ib3VuZDoCOAFKBAgFEAZSB3NlcnZlcnMiigYKB2luYm91bmQSDAoEbmFtZRgNIAEoCRIPCgdlbmFibGVkGA4gASgIEigKBWVtcHR5GBUgASgLMhcueXVoYWlpbi5saXN0ZW5lci5lbXB0eUgAEioKBnRjcHVkcBgPIAEoCzIYLnl1aGFpaW4ubGlzdGVuZXIudGNwdWRwSAASJgoEcXVpYxgQIAEoCzIWLnl1aGFpaW4ubGlzdGVuZXIucXVpY0gAEi4KCXRyYW5zcG9ydBgCIAMoCzIbLnl1aGFpaW4ubGlzdGVuZXIudHJhbnNwb3J0EiYKBGh0dHAYAyABKAsyFi55dWhhaWluLmxpc3RlbmVyLmh0dHBIARIqCgZzb2NrczUYBCABKAsyGC55dWhhaWluLmxpc3RlbmVyLnNvY2tzNUgBEjAKCXl1dWJpbnN5YRgHIAEoCzIbLnl1aGFpaW4ubGlzdGVuZXIueXV1Ymluc3lhSAESLQoDbWl4GAggASgLMhcueXVoYWlpbi5saXN0ZW5lci5taXhlZEgBUgVtaXhlZBIsCgdzb2NrczRhGAkgASgLMhkueXVoYWlpbi5saXN0ZW5lci5zb2NrczRhSAESKgoGdHByb3h5GBQgASgLMhgueXVoYWlpbi5saXN0ZW5lci50cHJveHlIARIoCgVyZWRpchgSIAEoCzIXLnl1aGFpaW4ubGlzdGVuZXIucmVkaXJIARIkCgN0dW4YEyABKAsyFS55dWhhaWluLmxpc3RlbmVyLnR1bkgBEkQKDHJldmVyc2VfaHR0cBgWIAEoCzIeLnl1aGFpaW4ubGlzdGVuZXIucmV2ZXJzZV9odHRwSAFSDHJldmVyc2VfaHR0cBJBCgtyZXZlcnNlX3RjcBgXIAEoCzIdLnl1aGFpaW4ubGlzdGVuZXIucmV2ZXJzZV90Y3BIAVILcmV2ZXJzZV90Y3ASJwoEbm9uZRgYIAEoCzIXLnl1aGFpaW4ubGlzdGVuZXIuZW1wdHlIAUIJCgduZXR3b3JrQgoKCHByb3RvY29sSgQIERASUgRJUHY2IvwCCgl0cmFuc3BvcnQSKgoGbm9ybWFsGAwgASgLMhgueXVoYWlpbi5saXN0ZW5lci5ub3JtYWxIABIkCgN0bHMYASABKAsyFS55dWhhaWluLmxpc3RlbmVyLnRsc0gAEiQKA211eBgCIAEoCzIVLnl1aGFpaW4ubGlzdGVuZXIubXV4SAASKAoFaHR0cDIYBSABKAsyFy55dWhhaWluLmxpc3RlbmVyLmh0dHAySAASMAoJd2Vic29ja2V0GAYgASgLMhsueXVoYWlpbi5saXN0ZW5lci53ZWJzb2NrZXRIABImCgRncnBjGAsgASgLMhYueXVoYWlpbi5saXN0ZW5lci5ncnBjSAASLAoHcmVhbGl0eRgKIAEoCzIZLnl1aGFpaW4ubGlzdGVuZXIucmVhbGl0eUgAEjgKCHRsc19hdXRvGA0gASgLMhoueXVoYWlpbi5saXN0ZW5lci50bHNfYXV0b0gAUgh0bHNfYXV0b0ILCgl0cmFuc3BvcnQiBwoFZW1wdHkiBQoDbXV4IkoKBnRjcHVkcBIMCgRob3N0GAEgASgJEjIKB2NvbnRyb2wYAiABKA4yIS55dWhhaWluLmxpc3RlbmVyLnRjcF91ZHBfY29udHJvbCI/CgRxdWljEgwKBGhvc3QYASABKAkSKQoDdGxzGAMgASgLMhwueXVoYWlpbi5saXN0ZW5lci50bHNfY29uZmlnIjYKBGh0dHASEAoIdXNlcm5hbWUYAyABKAkSEAoIcGFzc3dvcmQYBCABKAlKBAgBEAJSBGhvc3QiRQoGc29ja3M1EhAKCHVzZXJuYW1lGAMgASgJEhAKCHBhc3N3b3JkGAQgASgJEgsKA3VkcBgFIAEoCEoECAEQAlIEaG9zdCInCgdzb2NrczRhEhAKCHVzZXJuYW1lGAIgASgJSgQIARACUgRob3N0IjcKBW1peGVkEhAKCHVzZXJuYW1lGAMgASgJEhAKCHBhc3N3b3JkGAQgASgJSgQIARACUgRob3N0IhUKBXJlZGlyEgwKBGhvc3QYASABKAkiYAoGdHByb3h5EgwKBGhvc3QYASABKAkSJAoNZG5zX2hpamFja2luZxgCIAEoCFINZG5zX2hpamFja2luZxIiCgxmb3JjZV9mYWtlaXAYAyABKAhSDGZvcmNlX2Zha2VpcCKVAwoDdHVuEgwKBG5hbWUYASABKAkSCwoDbXR1GAIgASgFEiIKDGZvcmNlX2Zha2VpcBgJIAEoCFIMZm9yY2VfZmFrZWlwEiYKDnNraXBfbXVsdGljYXN0GAYgASgIUg5za2lwX211bHRpY2FzdBI1CgZkcml2ZXIYByABKA4yJS55dWhhaWluLmxpc3RlbmVyLnR1bi5lbmRwb2ludF9kcml2ZXISDgoGcG9ydGFsGAggASgJEhwKCXBvcnRhbF92NhgLIAEoCVIJcG9ydGFsX3Y2EiYKBXJvdXRlGAogASgLMhcueXVoYWlpbi5saXN0ZW5lci5yb3V0ZRIYCgdwb3N0X3VwGAwgAygJUgdwb3N0X3VwEhwKCXBvc3RfZG93bhgNIAMoCVIJcG9zdF9kb3duIj4KD2VuZHBvaW50X2RyaXZlchILCgdmZGJhc2VkEAASCwoHY2hhbm5lbBABEhEKDXN5c3RlbV9ndmlzb3IQAkoECAMQBEoECAQQBVIHZ2F0ZXdheVINZG5zX2hpamFja2luZyIpCgVyb3V0ZRIOCgZyb3V0ZXMYASADKAkSEAoIZXhjbHVkZXMYAiADKAki8wEKCXl1dWJpbnN5YRIQCghwYXNzd29yZBgCIAEoCRIgCgt0Y3BfZW5jcnlwdBgMIAEoCFILdGNwX2VuY3J5cHQSIAoLdWRwX2VuY3J5cHQYDSABKAhSC3VkcF9lbmNyeXB0SgQIARACSgQIAxAESgQIBBAFSgQIBRAGSgQIBhAHSgQIBxAISgQICBAJSgQICRAKSgQIChALSgQICxAMUgRob3N0UhVmb3JjZV9kaXNhYmxlX2VuY3J5cHRSBm5vcm1hbFIDdGxzUgRxdWljUgl3ZWJzb2NrZXRSBGdycGNSBWh0dHAyUgdyZWFsaXR5UgNtdXgiCAoGbm9ybWFsIhYKCXdlYnNvY2tldEoECAEQAlIDdGxzIjAKA3RscxIpCgN0bHMYASABKAsyHC55dWhhaWluLmxpc3RlbmVyLnRsc19jb25maWciEQoEZ3JwY0oECAEQAlIDdGxzIhIKBWh0dHAySgQIARACUgN0bHMipgEKB3JlYWxpdHkSGgoIc2hvcnRfaWQYASADKAlSCHNob3J0X2lkEiAKC3NlcnZlcl9uYW1lGAIgAygJUgtzZXJ2ZXJfbmFtZRIMCgRkZXN0GAMgASgJEiAKC3ByaXZhdGVfa2V5GAQgASgJUgtwcml2YXRlX2tleRIeCgpwdWJsaWNfa2V5GAYgASgJUgpwdWJsaWNfa2V5Eg0KBWRlYnVnGAUgASgIIrMCCgp0bHNfY29uZmlnEjMKDGNlcnRpZmljYXRlcxgBIAMoCzIdLnl1aGFpaW4ubGlzdGVuZXIuY2VydGlmaWNhdGUSIAoLbmV4dF9wcm90b3MYAyADKAlSC25leHRfcHJvdG9zEnEKF3NlcnZlcl9uYW1lX2NlcnRpZmljYXRlGAQgAygLMjcueXVoYWlpbi5saXN0ZW5lci50bHNfY29uZmlnLlNlcnZlck5hbWVDZXJ0aWZpY2F0ZUVudHJ5UhdzZXJ2ZXJfbmFtZV9jZXJ0aWZpY2F0ZRpbChpTZXJ2ZXJOYW1lQ2VydGlmaWNhdGVFbnRyeRILCgNrZXkYASABKAkSLAoFdmFsdWUYAiABKAsyHS55dWhhaWluLmxpc3RlbmVyLmNlcnRpZmljYXRlOgI4ASKeAQoIdGxzX2F1dG8SEwoLc2VydmVybmFtZXMYASADKAkSIAoLbmV4dF9wcm90b3MYAiADKAlSC25leHRfcHJvdG9zEhgKB2NhX2NlcnQYAyABKAxSB2NhX2NlcnQSFgoGY2Ffa2V5GAQgASgMUgZjYV9rZXkSKQoDZWNoGAUgASgLMhwueXVoYWlpbi5saXN0ZW5lci5lY2hfY29uZmlnImAKCmVjaF9jb25maWcSDgoGZW5hYmxlGAEgASgIEg4KBmNvbmZpZxgCIAEoDBIgCgtwcml2YXRlX2tleRgDIAEoDFILcHJpdmF0ZV9rZXkSEAoIT3V0ZXJTTkkYBCABKAkidgoLY2VydGlmaWNhdGUSDAoEY2VydBgBIAEoDBILCgNrZXkYAiABKAwSJgoOY2VydF9maWxlX3BhdGgYAyABKAlSDmNlcnRfZmlsZV9wYXRoEiQKDWtleV9maWxlX3BhdGgYBCABKAlSDWtleV9maWxlX3BhdGgiGAoFc25pZmYSDwoHZW5hYmxlZBgBIAEoCCIbCgxyZXZlcnNlX2h0dHASCwoDdXJsGAEgASgJIhsKC3JldmVyc2VfdGNwEgwKBGhvc3QYASABKAkqTAoPdGNwX3VkcF9jb250cm9sEhcKE3RjcF91ZHBfY29udHJvbF9hbGwQABIPCgtkaXNhYmxlX3RjcBABEg8KC2Rpc2FibGVfdWRwEAJCQVo3Z2l0aHViLmNvbS9Bc3V0b3J1ZmEveXVoYWlpbi9wa2cvcHJvdG9zL2NvbmZpZy9saXN0ZW5lcpIDBdI+AhADYghlZGl0aW9uc3DoBw", [file_google_protobuf_go_features]);

/**
 * @generated from message yuhaiin.listener.inbound_config
 */
export type inbound_config = Message<"yuhaiin.listener.inbound_config"> & {
  /**
   * @generated from field: bool hijack_dns = 2 [json_name = "hijack_dns"];
   */
  hijackDns: boolean;

  /**
   * @generated from field: bool hijack_dns_fakeip = 3 [json_name = "hijack_dns_fakeip"];
   */
  hijackDnsFakeip: boolean;

  /**
   * @generated from field: map<string, yuhaiin.listener.inbound> inbounds = 1;
   */
  inbounds: { [key: string]: inbound };

  /**
   * @generated from field: yuhaiin.listener.sniff sniff = 4;
   */
  sniff?: sniff;
};

/**
 * Describes the message yuhaiin.listener.inbound_config.
 * Use `create(inbound_configSchema)` to create a new message.
 */
export const inbound_configSchema: GenMessage<inbound_config> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 0);

/**
 * @generated from message yuhaiin.listener.inbound
 */
export type inbound = Message<"yuhaiin.listener.inbound"> & {
  /**
   * @generated from field: string name = 13;
   */
  name: string;

  /**
   * @generated from field: bool enabled = 14;
   */
  enabled: boolean;

  /**
   * @generated from oneof yuhaiin.listener.inbound.network
   */
  network: {
    /**
     * @generated from field: yuhaiin.listener.empty empty = 21;
     */
    value: empty;
    case: "empty";
  } | {
    /**
     * @generated from field: yuhaiin.listener.tcpudp tcpudp = 15;
     */
    value: tcpudp;
    case: "tcpudp";
  } | {
    /**
     * @generated from field: yuhaiin.listener.quic quic = 16;
     */
    value: quic;
    case: "quic";
  } | { case: undefined; value?: undefined };

  /**
   * @generated from field: repeated yuhaiin.listener.transport transport = 2;
   */
  transport: transport[];

  /**
   * @generated from oneof yuhaiin.listener.inbound.protocol
   */
  protocol: {
    /**
     * @generated from field: yuhaiin.listener.http http = 3;
     */
    value: http;
    case: "http";
  } | {
    /**
     * @generated from field: yuhaiin.listener.socks5 socks5 = 4;
     */
    value: socks5;
    case: "socks5";
  } | {
    /**
     * @generated from field: yuhaiin.listener.yuubinsya yuubinsya = 7;
     */
    value: yuubinsya;
    case: "yuubinsya";
  } | {
    /**
     * @generated from field: yuhaiin.listener.mixed mix = 8 [json_name = "mixed"];
     */
    value: mixed;
    case: "mix";
  } | {
    /**
     * @generated from field: yuhaiin.listener.socks4a socks4a = 9;
     */
    value: socks4a;
    case: "socks4a";
  } | {
    /**
     * @generated from field: yuhaiin.listener.tproxy tproxy = 20;
     */
    value: tproxy;
    case: "tproxy";
  } | {
    /**
     * @generated from field: yuhaiin.listener.redir redir = 18;
     */
    value: redir;
    case: "redir";
  } | {
    /**
     * @generated from field: yuhaiin.listener.tun tun = 19;
     */
    value: tun;
    case: "tun";
  } | {
    /**
     * @generated from field: yuhaiin.listener.reverse_http reverse_http = 22 [json_name = "reverse_http"];
     */
    value: reverse_http;
    case: "reverseHttp";
  } | {
    /**
     * @generated from field: yuhaiin.listener.reverse_tcp reverse_tcp = 23 [json_name = "reverse_tcp"];
     */
    value: reverse_tcp;
    case: "reverseTcp";
  } | {
    /**
     * @generated from field: yuhaiin.listener.empty none = 24;
     */
    value: empty;
    case: "none";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message yuhaiin.listener.inbound.
 * Use `create(inboundSchema)` to create a new message.
 */
export const inboundSchema: GenMessage<inbound> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 1);

/**
 * @generated from message yuhaiin.listener.transport
 */
export type transport = Message<"yuhaiin.listener.transport"> & {
  /**
   * @generated from oneof yuhaiin.listener.transport.transport
   */
  transport: {
    /**
     * @generated from field: yuhaiin.listener.normal normal = 12;
     */
    value: normal;
    case: "normal";
  } | {
    /**
     * @generated from field: yuhaiin.listener.tls tls = 1;
     */
    value: tls;
    case: "tls";
  } | {
    /**
     * @generated from field: yuhaiin.listener.mux mux = 2;
     */
    value: mux;
    case: "mux";
  } | {
    /**
     * @generated from field: yuhaiin.listener.http2 http2 = 5;
     */
    value: http2;
    case: "http2";
  } | {
    /**
     * @generated from field: yuhaiin.listener.websocket websocket = 6;
     */
    value: websocket;
    case: "websocket";
  } | {
    /**
     * @generated from field: yuhaiin.listener.grpc grpc = 11;
     */
    value: grpc;
    case: "grpc";
  } | {
    /**
     * @generated from field: yuhaiin.listener.reality reality = 10;
     */
    value: reality;
    case: "reality";
  } | {
    /**
     * @generated from field: yuhaiin.listener.tls_auto tls_auto = 13 [json_name = "tls_auto"];
     */
    value: tls_auto;
    case: "tlsAuto";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message yuhaiin.listener.transport.
 * Use `create(transportSchema)` to create a new message.
 */
export const transportSchema: GenMessage<transport> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 2);

/**
 * @generated from message yuhaiin.listener.empty
 */
export type empty = Message<"yuhaiin.listener.empty"> & {
};

/**
 * Describes the message yuhaiin.listener.empty.
 * Use `create(emptySchema)` to create a new message.
 */
export const emptySchema: GenMessage<empty> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 3);

/**
 * @generated from message yuhaiin.listener.mux
 */
export type mux = Message<"yuhaiin.listener.mux"> & {
};

/**
 * Describes the message yuhaiin.listener.mux.
 * Use `create(muxSchema)` to create a new message.
 */
export const muxSchema: GenMessage<mux> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 4);

/**
 * @generated from message yuhaiin.listener.tcpudp
 */
export type tcpudp = Message<"yuhaiin.listener.tcpudp"> & {
  /**
   * @generated from field: string host = 1;
   */
  host: string;

  /**
   * @generated from field: yuhaiin.listener.tcp_udp_control control = 2;
   */
  control: tcp_udp_control;
};

/**
 * Describes the message yuhaiin.listener.tcpudp.
 * Use `create(tcpudpSchema)` to create a new message.
 */
export const tcpudpSchema: GenMessage<tcpudp> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 5);

/**
 * @generated from message yuhaiin.listener.quic
 */
export type quic = Message<"yuhaiin.listener.quic"> & {
  /**
   * @generated from field: string host = 1;
   */
  host: string;

  /**
   * @generated from field: yuhaiin.listener.tls_config tls = 3;
   */
  tls?: tls_config;
};

/**
 * Describes the message yuhaiin.listener.quic.
 * Use `create(quicSchema)` to create a new message.
 */
export const quicSchema: GenMessage<quic> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 6);

/**
 * @generated from message yuhaiin.listener.http
 */
export type http = Message<"yuhaiin.listener.http"> & {
  /**
   * @generated from field: string username = 3;
   */
  username: string;

  /**
   * @generated from field: string password = 4;
   */
  password: string;
};

/**
 * Describes the message yuhaiin.listener.http.
 * Use `create(httpSchema)` to create a new message.
 */
export const httpSchema: GenMessage<http> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 7);

/**
 * @generated from message yuhaiin.listener.socks5
 */
export type socks5 = Message<"yuhaiin.listener.socks5"> & {
  /**
   * @generated from field: string username = 3;
   */
  username: string;

  /**
   * @generated from field: string password = 4;
   */
  password: string;

  /**
   * @generated from field: bool udp = 5;
   */
  udp: boolean;
};

/**
 * Describes the message yuhaiin.listener.socks5.
 * Use `create(socks5Schema)` to create a new message.
 */
export const socks5Schema: GenMessage<socks5> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 8);

/**
 * @generated from message yuhaiin.listener.socks4a
 */
export type socks4a = Message<"yuhaiin.listener.socks4a"> & {
  /**
   * @generated from field: string username = 2;
   */
  username: string;
};

/**
 * Describes the message yuhaiin.listener.socks4a.
 * Use `create(socks4aSchema)` to create a new message.
 */
export const socks4aSchema: GenMessage<socks4a> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 9);

/**
 * @generated from message yuhaiin.listener.mixed
 */
export type mixed = Message<"yuhaiin.listener.mixed"> & {
  /**
   * @generated from field: string username = 3;
   */
  username: string;

  /**
   * @generated from field: string password = 4;
   */
  password: string;
};

/**
 * Describes the message yuhaiin.listener.mixed.
 * Use `create(mixedSchema)` to create a new message.
 */
export const mixedSchema: GenMessage<mixed> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 10);

/**
 * @generated from message yuhaiin.listener.redir
 */
export type redir = Message<"yuhaiin.listener.redir"> & {
  /**
   * @generated from field: string host = 1;
   */
  host: string;
};

/**
 * Describes the message yuhaiin.listener.redir.
 * Use `create(redirSchema)` to create a new message.
 */
export const redirSchema: GenMessage<redir> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 11);

/**
 * @generated from message yuhaiin.listener.tproxy
 */
export type tproxy = Message<"yuhaiin.listener.tproxy"> & {
  /**
   * @generated from field: string host = 1;
   */
  host: string;

  /**
   * @generated from field: bool dns_hijacking = 2 [json_name = "dns_hijacking"];
   */
  dnsHijacking: boolean;

  /**
   * @generated from field: bool force_fakeip = 3 [json_name = "force_fakeip"];
   */
  forceFakeip: boolean;
};

/**
 * Describes the message yuhaiin.listener.tproxy.
 * Use `create(tproxySchema)` to create a new message.
 */
export const tproxySchema: GenMessage<tproxy> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 12);

/**
 * @generated from message yuhaiin.listener.tun
 */
export type tun = Message<"yuhaiin.listener.tun"> & {
  /**
   * name of the tun device
   * eg: tun://tun0, fd://123
   *
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * @generated from field: int32 mtu = 2;
   */
  mtu: number;

  /**
   * @generated from field: bool force_fakeip = 9 [json_name = "force_fakeip"];
   */
  forceFakeip: boolean;

  /**
   * @generated from field: bool skip_multicast = 6 [json_name = "skip_multicast"];
   */
  skipMulticast: boolean;

  /**
   * @generated from field: yuhaiin.listener.tun.endpoint_driver driver = 7;
   */
  driver: tun_endpoint_driver;

  /**
   * @generated from field: string portal = 8;
   */
  portal: string;

  /**
   * @generated from field: string portal_v6 = 11 [json_name = "portal_v6"];
   */
  portalV6: string;

  /**
   * @generated from field: yuhaiin.listener.route route = 10;
   */
  route?: route;

  /**
   * @generated from field: repeated string post_up = 12 [json_name = "post_up"];
   */
  postUp: string[];

  /**
   * @generated from field: repeated string post_down = 13 [json_name = "post_down"];
   */
  postDown: string[];
};

/**
 * Describes the message yuhaiin.listener.tun.
 * Use `create(tunSchema)` to create a new message.
 */
export const tunSchema: GenMessage<tun> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 13);

/**
 * @generated from enum yuhaiin.listener.tun.endpoint_driver
 */
export enum tun_endpoint_driver {
  /**
   * @generated from enum value: fdbased = 0;
   */
  fdbased = 0,

  /**
   * @generated from enum value: channel = 1;
   */
  channel = 1,

  /**
   * @generated from enum value: system_gvisor = 2;
   */
  system_gvisor = 2,
}

/**
 * Describes the enum yuhaiin.listener.tun.endpoint_driver.
 */
export const tun_endpoint_driverSchema: GenEnum<tun_endpoint_driver> = /*@__PURE__*/
  enumDesc(file_config_listener_listener, 13, 0);

/**
 * @generated from message yuhaiin.listener.route
 */
export type route = Message<"yuhaiin.listener.route"> & {
  /**
   * @generated from field: repeated string routes = 1;
   */
  routes: string[];

  /**
   * @generated from field: repeated string excludes = 2;
   */
  excludes: string[];
};

/**
 * Describes the message yuhaiin.listener.route.
 * Use `create(routeSchema)` to create a new message.
 */
export const routeSchema: GenMessage<route> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 14);

/**
 * @generated from message yuhaiin.listener.yuubinsya
 */
export type yuubinsya = Message<"yuhaiin.listener.yuubinsya"> & {
  /**
   * @generated from field: string password = 2;
   */
  password: string;

  /**
   * @generated from field: bool tcp_encrypt = 12 [json_name = "tcp_encrypt"];
   */
  tcpEncrypt: boolean;

  /**
   * @generated from field: bool udp_encrypt = 13 [json_name = "udp_encrypt"];
   */
  udpEncrypt: boolean;
};

/**
 * Describes the message yuhaiin.listener.yuubinsya.
 * Use `create(yuubinsyaSchema)` to create a new message.
 */
export const yuubinsyaSchema: GenMessage<yuubinsya> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 15);

/**
 * @generated from message yuhaiin.listener.normal
 */
export type normal = Message<"yuhaiin.listener.normal"> & {
};

/**
 * Describes the message yuhaiin.listener.normal.
 * Use `create(normalSchema)` to create a new message.
 */
export const normalSchema: GenMessage<normal> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 16);

/**
 * @generated from message yuhaiin.listener.websocket
 */
export type websocket = Message<"yuhaiin.listener.websocket"> & {
};

/**
 * Describes the message yuhaiin.listener.websocket.
 * Use `create(websocketSchema)` to create a new message.
 */
export const websocketSchema: GenMessage<websocket> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 17);

/**
 * @generated from message yuhaiin.listener.tls
 */
export type tls = Message<"yuhaiin.listener.tls"> & {
  /**
   * @generated from field: yuhaiin.listener.tls_config tls = 1;
   */
  tls?: tls_config;
};

/**
 * Describes the message yuhaiin.listener.tls.
 * Use `create(tlsSchema)` to create a new message.
 */
export const tlsSchema: GenMessage<tls> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 18);

/**
 * @generated from message yuhaiin.listener.grpc
 */
export type grpc = Message<"yuhaiin.listener.grpc"> & {
};

/**
 * Describes the message yuhaiin.listener.grpc.
 * Use `create(grpcSchema)` to create a new message.
 */
export const grpcSchema: GenMessage<grpc> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 19);

/**
 * @generated from message yuhaiin.listener.http2
 */
export type http2 = Message<"yuhaiin.listener.http2"> & {
};

/**
 * Describes the message yuhaiin.listener.http2.
 * Use `create(http2Schema)` to create a new message.
 */
export const http2Schema: GenMessage<http2> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 20);

/**
 * @generated from message yuhaiin.listener.reality
 */
export type reality = Message<"yuhaiin.listener.reality"> & {
  /**
   * @generated from field: repeated string short_id = 1 [json_name = "short_id"];
   */
  shortId: string[];

  /**
   * @generated from field: repeated string server_name = 2 [json_name = "server_name"];
   */
  serverName: string[];

  /**
   * @generated from field: string dest = 3;
   */
  dest: string;

  /**
   * @generated from field: string private_key = 4 [json_name = "private_key"];
   */
  privateKey: string;

  /**
   * @generated from field: string public_key = 6 [json_name = "public_key"];
   */
  publicKey: string;

  /**
   * @generated from field: bool debug = 5;
   */
  debug: boolean;
};

/**
 * Describes the message yuhaiin.listener.reality.
 * Use `create(realitySchema)` to create a new message.
 */
export const realitySchema: GenMessage<reality> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 21);

/**
 * @generated from message yuhaiin.listener.tls_config
 */
export type tls_config = Message<"yuhaiin.listener.tls_config"> & {
  /**
   * @generated from field: repeated yuhaiin.listener.certificate certificates = 1;
   */
  certificates: certificate[];

  /**
   * @generated from field: repeated string next_protos = 3 [json_name = "next_protos"];
   */
  nextProtos: string[];

  /**
   * @generated from field: map<string, yuhaiin.listener.certificate> server_name_certificate = 4 [json_name = "server_name_certificate"];
   */
  serverNameCertificate: { [key: string]: certificate };
};

/**
 * Describes the message yuhaiin.listener.tls_config.
 * Use `create(tls_configSchema)` to create a new message.
 */
export const tls_configSchema: GenMessage<tls_config> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 22);

/**
 * @generated from message yuhaiin.listener.tls_auto
 */
export type tls_auto = Message<"yuhaiin.listener.tls_auto"> & {
  /**
   * @generated from field: repeated string servernames = 1;
   */
  servernames: string[];

  /**
   * @generated from field: repeated string next_protos = 2 [json_name = "next_protos"];
   */
  nextProtos: string[];

  /**
   * ca cert and key will auto generate
   * so they will be empty
   *
   * @generated from field: bytes ca_cert = 3 [json_name = "ca_cert"];
   */
  caCert: Uint8Array;

  /**
   * @generated from field: bytes ca_key = 4 [json_name = "ca_key"];
   */
  caKey: Uint8Array;

  /**
   * @generated from field: yuhaiin.listener.ech_config ech = 5;
   */
  ech?: ech_config;
};

/**
 * Describes the message yuhaiin.listener.tls_auto.
 * Use `create(tls_autoSchema)` to create a new message.
 */
export const tls_autoSchema: GenMessage<tls_auto> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 23);

/**
 * @generated from message yuhaiin.listener.ech_config
 */
export type ech_config = Message<"yuhaiin.listener.ech_config"> & {
  /**
   * @generated from field: bool enable = 1;
   */
  enable: boolean;

  /**
   * @generated from field: bytes config = 2;
   */
  config: Uint8Array;

  /**
   * @generated from field: bytes private_key = 3 [json_name = "private_key"];
   */
  privateKey: Uint8Array;

  /**
   * @generated from field: string OuterSNI = 4;
   */
  OuterSNI: string;
};

/**
 * Describes the message yuhaiin.listener.ech_config.
 * Use `create(ech_configSchema)` to create a new message.
 */
export const ech_configSchema: GenMessage<ech_config> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 24);

/**
 * @generated from message yuhaiin.listener.certificate
 */
export type certificate = Message<"yuhaiin.listener.certificate"> & {
  /**
   * @generated from field: bytes cert = 1;
   */
  cert: Uint8Array;

  /**
   * @generated from field: bytes key = 2;
   */
  key: Uint8Array;

  /**
   * @generated from field: string cert_file_path = 3 [json_name = "cert_file_path"];
   */
  certFilePath: string;

  /**
   * @generated from field: string key_file_path = 4 [json_name = "key_file_path"];
   */
  keyFilePath: string;
};

/**
 * Describes the message yuhaiin.listener.certificate.
 * Use `create(certificateSchema)` to create a new message.
 */
export const certificateSchema: GenMessage<certificate> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 25);

/**
 * @generated from message yuhaiin.listener.sniff
 */
export type sniff = Message<"yuhaiin.listener.sniff"> & {
  /**
   * @generated from field: bool enabled = 1;
   */
  enabled: boolean;
};

/**
 * Describes the message yuhaiin.listener.sniff.
 * Use `create(sniffSchema)` to create a new message.
 */
export const sniffSchema: GenMessage<sniff> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 26);

/**
 * @generated from message yuhaiin.listener.reverse_http
 */
export type reverse_http = Message<"yuhaiin.listener.reverse_http"> & {
  /**
   * @generated from field: string url = 1;
   */
  url: string;
};

/**
 * Describes the message yuhaiin.listener.reverse_http.
 * Use `create(reverse_httpSchema)` to create a new message.
 */
export const reverse_httpSchema: GenMessage<reverse_http> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 27);

/**
 * @generated from message yuhaiin.listener.reverse_tcp
 */
export type reverse_tcp = Message<"yuhaiin.listener.reverse_tcp"> & {
  /**
   * @generated from field: string host = 1;
   */
  host: string;
};

/**
 * Describes the message yuhaiin.listener.reverse_tcp.
 * Use `create(reverse_tcpSchema)` to create a new message.
 */
export const reverse_tcpSchema: GenMessage<reverse_tcp> = /*@__PURE__*/
  messageDesc(file_config_listener_listener, 28);

/**
 * @generated from enum yuhaiin.listener.tcp_udp_control
 */
export enum tcp_udp_control {
  /**
   * @generated from enum value: tcp_udp_control_all = 0;
   */
  tcp_udp_control_all = 0,

  /**
   * @generated from enum value: disable_tcp = 1;
   */
  disable_tcp = 1,

  /**
   * @generated from enum value: disable_udp = 2;
   */
  disable_udp = 2,
}

/**
 * Describes the enum yuhaiin.listener.tcp_udp_control.
 */
export const tcp_udp_controlSchema: GenEnum<tcp_udp_control> = /*@__PURE__*/
  enumDesc(file_config_listener_listener, 0);

