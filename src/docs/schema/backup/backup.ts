/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type nodes = Record<string, any>;
export type subscribes = Record<string, any>;
export type rules = Record<string, any>;
export type tags = Record<string, any>;
export type backup_content = Record<string, any>;
export type restore_option = Record<string, any>;

export enum restore_option_restore_source {
  /**
   * @generated from enum value: unknown = 0;
   */
  unknown = 0,

  /**
   * @generated from enum value: s3 = 1;
   */
  s3 = 1,
}

export const nodesSchema = schema<nodes>("nodes");
export const subscribesSchema = schema<subscribes>("subscribes");
export const rulesSchema = schema<rules>("rules");
export const tagsSchema = schema<tags>("tags");
export const backup_contentSchema = schema<backup_content>("backup_content");
export const restore_optionSchema = schema<restore_option>("restore_option");
export const restore_option_restore_sourceSchema = enumSchema(restore_option_restore_source);
