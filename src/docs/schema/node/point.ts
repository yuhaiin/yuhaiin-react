/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type point = Record<string, any>;

export enum origin {
  /**
   * @generated from enum value: reserve = 0;
   */
  reserve = 0,

  /**
   * @generated from enum value: remote = 101;
   */
  remote = 101,

  /**
   * @generated from enum value: manual = 102;
   */
  manual = 102,
}

export const pointSchema = schema<point>("point");
export const originSchema = enumSchema(origin);
