/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type tags = Record<string, any>;

export enum tag_type {
  /**
   * @generated from enum value: node = 0;
   */
  node = 0,

  /**
   * @generated from enum value: mirror = 1;
   */
  mirror = 1,
}

export const tagsSchema = schema<tags>("tags");
export const tag_typeSchema = enumSchema(tag_type);
