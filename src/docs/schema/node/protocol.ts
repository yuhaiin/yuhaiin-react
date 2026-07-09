/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type protocol = Record<string, any>;
export type socks5 = Record<string, any>;
export type http = Record<string, any>;
export type shadowsocks = Record<string, any>;
export type shadowsocksr = Record<string, any>;
export type http2 = Record<string, any>;
export type vmess = Record<string, any>;
export type vless = Record<string, any>;
export type trojan = Record<string, any>;
export type yuubinsya = Record<string, any>;
export type websocket = Record<string, any>;
export type quic = Record<string, any>;
export type reality = Record<string, any>;
export type obfs_http = Record<string, any>;
export type none = Record<string, any>;
export type simple = Record<string, any>;
export type fixed = Record<string, any>;
export type tls_config = Record<string, any>;
export type certificate = Record<string, any>;
export type tls_server_config = Record<string, any>;
export type tls_termination = Record<string, any>;
export type http_termination = Record<string, any>;
export type http_termination_http_headers = Record<string, any>;
export type http_header = Record<string, any>;
export type direct = Record<string, any>;
export type reject = Record<string, any>;
export type drop = Record<string, any>;
export type host = Record<string, any>;
export type wireguard_peer_config = Record<string, any>;
export type wireguard = Record<string, any>;
export type mux = Record<string, any>;
export type bootstrap_dns_warp = Record<string, any>;
export type tailscale = Record<string, any>;
export type set = Record<string, any>;
export type http_mock = Record<string, any>;
export type aead = Record<string, any>;
export type network_split = Record<string, any>;
export type cloudflare_warp_masque = Record<string, any>;
export type proxy = Record<string, any>;
export type fixedv2 = Record<string, any>;
export type fixedv2_address = Record<string, any>;
export type point_as_endpoint = Record<string, any>;

export enum set_strategy_type {
  /**
   * @generated from enum value: random = 0;
   */
  random = 0,

  /**
   * @generated from enum value: round_robin = 1;
   */
  round_robin = 1,
}

export enum AeadCryptoMethod {
  /**
   * @generated from enum value: Chacha20Poly1305 = 0;
   */
  Chacha20Poly1305 = 0,

  /**
   * @generated from enum value: XChacha20Poly1305 = 1;
   */
  XChacha20Poly1305 = 1,
}

export const protocolSchema = schema<protocol>("protocol");
export const socks5Schema = schema<socks5>("socks5");
export const httpSchema = schema<http>("http");
export const shadowsocksSchema = schema<shadowsocks>("shadowsocks");
export const shadowsocksrSchema = schema<shadowsocksr>("shadowsocksr");
export const http2Schema = schema<http2>("http2");
export const vmessSchema = schema<vmess>("vmess");
export const vlessSchema = schema<vless>("vless");
export const trojanSchema = schema<trojan>("trojan");
export const yuubinsyaSchema = schema<yuubinsya>("yuubinsya");
export const websocketSchema = schema<websocket>("websocket");
export const quicSchema = schema<quic>("quic");
export const realitySchema = schema<reality>("reality");
export const obfs_httpSchema = schema<obfs_http>("obfs_http");
export const noneSchema = schema<none>("none");
export const simpleSchema = schema<simple>("simple");
export const fixedSchema = schema<fixed>("fixed");
export const tls_configSchema = schema<tls_config>("tls_config");
export const certificateSchema = schema<certificate>("certificate");
export const tls_server_configSchema = schema<tls_server_config>("tls_server_config");
export const tls_terminationSchema = schema<tls_termination>("tls_termination");
export const http_terminationSchema = schema<http_termination>("http_termination");
export const http_termination_http_headersSchema = schema<http_termination_http_headers>("http_termination_http_headers");
export const http_headerSchema = schema<http_header>("http_header");
export const directSchema = schema<direct>("direct");
export const rejectSchema = schema<reject>("reject");
export const dropSchema = schema<drop>("drop");
export const hostSchema = schema<host>("host");
export const wireguard_peer_configSchema = schema<wireguard_peer_config>("wireguard_peer_config");
export const wireguardSchema = schema<wireguard>("wireguard");
export const muxSchema = schema<mux>("mux");
export const bootstrap_dns_warpSchema = schema<bootstrap_dns_warp>("bootstrap_dns_warp");
export const tailscaleSchema = schema<tailscale>("tailscale");
export const setSchema = schema<set>("set");
export const http_mockSchema = schema<http_mock>("http_mock");
export const aeadSchema = schema<aead>("aead");
export const network_splitSchema = schema<network_split>("network_split");
export const cloudflare_warp_masqueSchema = schema<cloudflare_warp_masque>("cloudflare_warp_masque");
export const proxySchema = schema<proxy>("proxy");
export const fixedv2Schema = schema<fixedv2>("fixedv2");
export const fixedv2_addressSchema = schema<fixedv2_address>("fixedv2_address");
export const point_as_endpointSchema = schema<point_as_endpoint>("point_as_endpoint");
export const set_strategy_typeSchema = enumSchema(set_strategy_type);
export const AeadCryptoMethodSchema = enumSchema(AeadCryptoMethod);
