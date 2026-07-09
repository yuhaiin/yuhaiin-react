/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type inbound_config = Record<string, any>;
export type inbound = Record<string, any>;
export type transport = Record<string, any>;
export type empty = Record<string, any>;
export type mux = Record<string, any>;
export type tcpudp = Record<string, any>;
export type quic = Record<string, any>;
export type http = Record<string, any>;
export type socks5 = Record<string, any>;
export type socks4a = Record<string, any>;
export type mixed = Record<string, any>;
export type redir = Record<string, any>;
export type tproxy = Record<string, any>;
export type tun_platfrom = Record<string, any>;
export type tun_platfrom_platform_darwin = Record<string, any>;
export type tun = Record<string, any>;
export type route = Record<string, any>;
export type yuubinsya = Record<string, any>;
export type normal = Record<string, any>;
export type websocket = Record<string, any>;
export type tls = Record<string, any>;
export type http2 = Record<string, any>;
export type reality = Record<string, any>;
export type tls_auto = Record<string, any>;
export type ech_config = Record<string, any>;
export type sniff = Record<string, any>;
export type reverse_http = Record<string, any>;
export type reverse_tcp = Record<string, any>;
export type http_mock = Record<string, any>;
export type aead = Record<string, any>;
export type proxy = Record<string, any>;

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

export const inbound_configSchema = schema<inbound_config>("inbound_config");
export const inboundSchema = schema<inbound>("inbound");
export const transportSchema = schema<transport>("transport");
export const emptySchema = schema<empty>("empty");
export const muxSchema = schema<mux>("mux");
export const tcpudpSchema = schema<tcpudp>("tcpudp");
export const quicSchema = schema<quic>("quic");
export const httpSchema = schema<http>("http");
export const socks5Schema = schema<socks5>("socks5");
export const socks4aSchema = schema<socks4a>("socks4a");
export const mixedSchema = schema<mixed>("mixed");
export const redirSchema = schema<redir>("redir");
export const tproxySchema = schema<tproxy>("tproxy");
export const tun_platfromSchema = schema<tun_platfrom>("tun_platfrom");
export const tun_platfrom_platform_darwinSchema = schema<tun_platfrom_platform_darwin>("tun_platfrom_platform_darwin");
export const tunSchema = schema<tun>("tun");
export const routeSchema = schema<route>("route");
export const yuubinsyaSchema = schema<yuubinsya>("yuubinsya");
export const normalSchema = schema<normal>("normal");
export const websocketSchema = schema<websocket>("websocket");
export const tlsSchema = schema<tls>("tls");
export const http2Schema = schema<http2>("http2");
export const realitySchema = schema<reality>("reality");
export const tls_autoSchema = schema<tls_auto>("tls_auto");
export const ech_configSchema = schema<ech_config>("ech_config");
export const sniffSchema = schema<sniff>("sniff");
export const reverse_httpSchema = schema<reverse_http>("reverse_http");
export const reverse_tcpSchema = schema<reverse_tcp>("reverse_tcp");
export const http_mockSchema = schema<http_mock>("http_mock");
export const aeadSchema = schema<aead>("aead");
export const proxySchema = schema<proxy>("proxy");
export const tun_endpoint_driverSchema = enumSchema(tun_endpoint_driver);
export const tcp_udp_controlSchema = enumSchema(tcp_udp_control);
