// @generated by protoc-gen-es v2.2.3 with parameter "target=ts,js_import_style=legacy_commonjs"
// @generated from file node/node.proto (package yuhaiin.node, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { point } from "./point/point_pb";
import { file_node_point_point } from "./point/point_pb";
import type { link } from "./subscribe/subscribe_pb";
import { file_node_subscribe_subscribe } from "./subscribe/subscribe_pb";
import type { tags } from "./tag/tag_pb";
import { file_node_tag_tag } from "./tag/tag_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file node/node.proto.
 */
export const file_node_node: GenFile = /*@__PURE__*/
  fileDesc("Cg9ub2RlL25vZGUucHJvdG8SDHl1aGFpaW4ubm9kZSLpAQoEbm9kZRIhCgN0Y3AYBCABKAsyFC55dWhhaWluLnBvaW50LnBvaW50EiEKA3VkcBgFIAEoCzIULnl1aGFpaW4ucG9pbnQucG9pbnQSLAoFbGlua3MYAiADKAsyHS55dWhhaWluLm5vZGUubm9kZS5MaW5rc0VudHJ5EiYKB21hbmFnZXIYAyABKAsyFS55dWhhaWluLm5vZGUubWFuYWdlchpFCgpMaW5rc0VudHJ5EgsKA2tleRgBIAEoCRImCgV2YWx1ZRgCIAEoCzIXLnl1aGFpaW4uc3Vic2NyaWJlLmxpbms6AjgBInkKBW5vZGVzEkAKB25vZGVzVjIYAyADKAsyIC55dWhhaWluLm5vZGUubm9kZXMuTm9kZXNWMkVudHJ5Ug1ub2RlX2hhc2hfbWFwGi4KDE5vZGVzVjJFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAk6AjgBIvsCCgdtYW5hZ2VyEkYKCGdyb3Vwc1YyGAIgAygLMiMueXVoYWlpbi5ub2RlLm1hbmFnZXIuR3JvdXBzVjJFbnRyeVIPZ3JvdXBfbm9kZXNfbWFwEi8KBW5vZGVzGAMgAygLMiAueXVoYWlpbi5ub2RlLm1hbmFnZXIuTm9kZXNFbnRyeRItCgR0YWdzGAQgAygLMh8ueXVoYWlpbi5ub2RlLm1hbmFnZXIuVGFnc0VudHJ5GkQKDUdyb3Vwc1YyRW50cnkSCwoDa2V5GAEgASgJEiIKBXZhbHVlGAIgASgLMhMueXVoYWlpbi5ub2RlLm5vZGVzOgI4ARpCCgpOb2Rlc0VudHJ5EgsKA2tleRgBIAEoCRIjCgV2YWx1ZRgCIAEoCzIULnl1aGFpaW4ucG9pbnQucG9pbnQ6AjgBGj4KCVRhZ3NFbnRyeRILCgNrZXkYASABKAkSIAoFdmFsdWUYAiABKAsyES55dWhhaWluLnRhZy50YWdzOgI4AUIuWixnaXRodWIuY29tL0FzdXRvcnVmYS95dWhhaWluL3BrZy9wcm90b3Mvbm9kZWIGcHJvdG8z", [file_node_point_point, file_node_subscribe_subscribe, file_node_tag_tag]);

/**
 * @generated from message yuhaiin.node.node
 */
export type node = Message<"yuhaiin.node.node"> & {
  /**
   * @generated from field: yuhaiin.point.point tcp = 4;
   */
  tcp?: point;

  /**
   * @generated from field: yuhaiin.point.point udp = 5;
   */
  udp?: point;

  /**
   * @generated from field: map<string, yuhaiin.subscribe.link> links = 2;
   */
  links: { [key: string]: link };

  /**
   * @generated from field: yuhaiin.node.manager manager = 3;
   */
  manager?: manager;
};

/**
 * Describes the message yuhaiin.node.node.
 * Use `create(nodeSchema)` to create a new message.
 */
export const nodeSchema: GenMessage<node> = /*@__PURE__*/
  messageDesc(file_node_node, 0);

/**
 * @generated from message yuhaiin.node.nodes
 */
export type nodes = Message<"yuhaiin.node.nodes"> & {
  /**
   * @generated from field: map<string, string> nodesV2 = 3 [json_name = "node_hash_map"];
   */
  nodesV2: { [key: string]: string };
};

/**
 * Describes the message yuhaiin.node.nodes.
 * Use `create(nodesSchema)` to create a new message.
 */
export const nodesSchema: GenMessage<nodes> = /*@__PURE__*/
  messageDesc(file_node_node, 1);

/**
 * @generated from message yuhaiin.node.manager
 */
export type manager = Message<"yuhaiin.node.manager"> & {
  /**
   * @generated from field: map<string, yuhaiin.node.nodes> groupsV2 = 2 [json_name = "group_nodes_map"];
   */
  groupsV2: { [key: string]: nodes };

  /**
   * @generated from field: map<string, yuhaiin.point.point> nodes = 3;
   */
  nodes: { [key: string]: point };

  /**
   * @generated from field: map<string, yuhaiin.tag.tags> tags = 4;
   */
  tags: { [key: string]: tags };
};

/**
 * Describes the message yuhaiin.node.manager.
 * Use `create(managerSchema)` to create a new message.
 */
export const managerSchema: GenMessage<manager> = /*@__PURE__*/
  messageDesc(file_node_node, 2);

