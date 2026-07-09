/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type http_test = Record<string, any>;
export type dns_test = Record<string, any>;
export type dns_over_quic = Record<string, any>;
export type ip = Record<string, any>;
export type ip_response = Record<string, any>;
export type error = Record<string, any>;
export type stun = Record<string, any>;
export type stun_response = Record<string, any>;
export type request = Record<string, any>;
export type request_protocol = Record<string, any>;
export type requests = Record<string, any>;
export type response = Record<string, any>;
export type reply = Record<string, any>;

export enum nat_type {
  /**
   * @generated from enum value: NAT_UNKNOWN = 0;
   */
  NAT_UNKNOWN = 0,

  /**
   * @generated from enum value: NAT_NO_RESULT = 1;
   */
  NAT_NO_RESULT = 1,

  /**
   * @generated from enum value: NAT_EndpointIndependentNoNAT = 2;
   */
  NAT_EndpointIndependentNoNAT = 2,

  /**
   * @generated from enum value: NAT_EndpointIndependent = 3;
   */
  NAT_EndpointIndependent = 3,

  /**
   * @generated from enum value: NAT_AddressDependent = 4;
   */
  NAT_AddressDependent = 4,

  /**
   * @generated from enum value: NAT_AddressAndPortDependent = 5;
   */
  NAT_AddressAndPortDependent = 5,

  /**
   * @generated from enum value: NAT_ServerNotSupportChangePort = 6;
   */
  NAT_ServerNotSupportChangePort = 6,
}

export const http_testSchema = schema<http_test>("http_test");
export const dns_testSchema = schema<dns_test>("dns_test");
export const dns_over_quicSchema = schema<dns_over_quic>("dns_over_quic");
export const ipSchema = schema<ip>("ip");
export const ip_responseSchema = schema<ip_response>("ip_response");
export const errorSchema = schema<error>("error");
export const stunSchema = schema<stun>("stun");
export const stun_responseSchema = schema<stun_response>("stun_response");
export const requestSchema = schema<request>("request");
export const request_protocolSchema = schema<request_protocol>("request_protocol");
export const requestsSchema = schema<requests>("requests");
export const responseSchema = schema<response>("response");
export const replySchema = schema<reply>("reply");
export const nat_typeSchema = enumSchema(nat_type);
