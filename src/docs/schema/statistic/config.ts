/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type net_type = Record<string, any>;
export type connection = Record<string, any>;
export type match_result = Record<string, any>;
export type match_history_entry = Record<string, any>;

export enum type {
  /**
   * @generated from enum value: unknown = 0;
   */
  unknown = 0,

  /**
   * @generated from enum value: tcp = 1;
   */
  tcp = 1,

  /**
   * @generated from enum value: tcp4 = 2;
   */
  tcp4 = 2,

  /**
   * @generated from enum value: tcp6 = 3;
   */
  tcp6 = 3,

  /**
   * @generated from enum value: udp = 4;
   */
  udp = 4,

  /**
   * @generated from enum value: udp4 = 5;
   */
  udp4 = 5,

  /**
   * @generated from enum value: udp6 = 6;
   */
  udp6 = 6,

  /**
   * @generated from enum value: ip = 7;
   */
  ip = 7,

  /**
   * @generated from enum value: ip4 = 8;
   */
  ip4 = 8,

  /**
   * @generated from enum value: ip6 = 9;
   */
  ip6 = 9,

  /**
   * @generated from enum value: unix = 10;
   */
  unix = 10,

  /**
   * @generated from enum value: unixgram = 11;
   */
  unixgram = 11,

  /**
   * @generated from enum value: unixpacket = 12;
   */
  unixpacket = 12,
}

export const net_typeSchema = schema<net_type>("net_type");
export const connectionSchema = schema<connection>("connection");
export const match_resultSchema = schema<match_result>("match_result");
export const match_history_entrySchema = schema<match_history_entry>("match_history_entry");
export const typeSchema = enumSchema(type);
