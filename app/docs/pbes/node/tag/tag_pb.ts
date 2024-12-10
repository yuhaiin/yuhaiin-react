// @generated by protoc-gen-es v2.2.3 with parameter "target=ts,js_import_style=legacy_commonjs"
// @generated from file node/tag/tag.proto (package yuhaiin.tag, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file node/tag/tag.proto.
 */
export const file_node_tag_tag: GenFile = /*@__PURE__*/
  fileDesc("ChJub2RlL3RhZy90YWcucHJvdG8SC3l1aGFpaW4udGFnIkYKBHRhZ3MSCwoDdGFnGAEgASgJEiMKBHR5cGUYAyABKA4yFS55dWhhaWluLnRhZy50YWdfdHlwZRIMCgRoYXNoGAIgAygJKiAKCHRhZ190eXBlEggKBG5vZGUQABIKCgZtaXJyb3IQAUIyWjBnaXRodWIuY29tL0FzdXRvcnVmYS95dWhhaWluL3BrZy9wcm90b3Mvbm9kZS90YWdiBnByb3RvMw");

/**
 * @generated from message yuhaiin.tag.tags
 */
export type tags = Message<"yuhaiin.tag.tags"> & {
  /**
   * @generated from field: string tag = 1;
   */
  tag: string;

  /**
   * @generated from field: yuhaiin.tag.tag_type type = 3;
   */
  type: tag_type;

  /**
   * @generated from field: repeated string hash = 2;
   */
  hash: string[];
};

/**
 * Describes the message yuhaiin.tag.tags.
 * Use `create(tagsSchema)` to create a new message.
 */
export const tagsSchema: GenMessage<tags> = /*@__PURE__*/
  messageDesc(file_node_tag_tag, 0);

/**
 * @generated from enum yuhaiin.tag.tag_type
 */
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

/**
 * Describes the enum yuhaiin.tag.tag_type.
 */
export const tag_typeSchema: GenEnum<tag_type> = /*@__PURE__*/
  enumDesc(file_node_tag_tag, 0);

