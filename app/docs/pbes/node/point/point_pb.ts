// @generated by protoc-gen-es v2.0.0 with parameter "target=ts,js_import_style=legacy_commonjs"
// @generated from file node/point/point.proto (package yuhaiin.point, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { protocol } from "../protocol/protocol_pb";
import { file_node_protocol_protocol } from "../protocol/protocol_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file node/point/point.proto.
 */
export const file_node_point_point: GenFile = /*@__PURE__*/
  fileDesc("ChZub2RlL3BvaW50L3BvaW50LnByb3RvEg15dWhhaWluLnBvaW50IogBCgVwb2ludBIMCgRoYXNoGAEgASgJEgwKBG5hbWUYAiABKAkSDQoFZ3JvdXAYAyABKAkSJQoGb3JpZ2luGAQgASgOMhUueXVoYWlpbi5wb2ludC5vcmlnaW4SLQoJcHJvdG9jb2xzGAUgAygLMhoueXVoYWlpbi5wcm90b2NvbC5wcm90b2NvbCotCgZvcmlnaW4SCwoHcmVzZXJ2ZRAAEgoKBnJlbW90ZRBlEgoKBm1hbnVhbBBmQjRaMmdpdGh1Yi5jb20vQXN1dG9ydWZhL3l1aGFpaW4vcGtnL3Byb3Rvcy9ub2RlL3BvaW50YgZwcm90bzM", [file_node_protocol_protocol]);

/**
 * @generated from message yuhaiin.point.point
 */
export type point = Message<"yuhaiin.point.point"> & {
  /**
   * @generated from field: string hash = 1;
   */
  hash: string;

  /**
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * @generated from field: string group = 3;
   */
  group: string;

  /**
   * @generated from field: yuhaiin.point.origin origin = 4;
   */
  origin: origin;

  /**
   * will use protocols' order to create dialer
   *
   * @generated from field: repeated yuhaiin.protocol.protocol protocols = 5;
   */
  protocols: protocol[];
};

/**
 * Describes the message yuhaiin.point.point.
 * Use `create(pointSchema)` to create a new message.
 */
export const pointSchema: GenMessage<point> = /*@__PURE__*/
  messageDesc(file_node_point_point, 0);

/**
 * @generated from enum yuhaiin.point.origin
 */
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

/**
 * Describes the enum yuhaiin.point.origin.
 */
export const originSchema: GenEnum<origin> = /*@__PURE__*/
  enumDesc(file_node_point_point, 0);

