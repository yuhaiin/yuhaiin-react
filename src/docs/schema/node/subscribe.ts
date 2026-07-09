/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type link = Record<string, any>;
export type Publish = Record<string, any>;
export type YuhaiinUrl = Record<string, any>;
export type YuhaiinUrl_Remote = Record<string, any>;
export type YuhaiinUrl_Points = Record<string, any>;

export enum type {
  /**
   * @generated from enum value: reserve = 0;
   */
  reserve = 0,

  /**
   * @generated from enum value: trojan = 1;
   */
  trojan = 1,

  /**
   * @generated from enum value: vmess = 2;
   */
  vmess = 2,

  /**
   * @generated from enum value: shadowsocks = 3;
   */
  shadowsocks = 3,

  /**
   * @generated from enum value: shadowsocksr = 4;
   */
  shadowsocksr = 4,
}

export const linkSchema = schema<link>("link");
export const PublishSchema = schema<Publish>("Publish");
export const YuhaiinUrlSchema = schema<YuhaiinUrl>("YuhaiinUrl");
export const YuhaiinUrl_RemoteSchema = schema<YuhaiinUrl_Remote>("YuhaiinUrl_Remote");
export const YuhaiinUrl_PointsSchema = schema<YuhaiinUrl_Points>("YuhaiinUrl_Points");
export const typeSchema = enumSchema(type);
