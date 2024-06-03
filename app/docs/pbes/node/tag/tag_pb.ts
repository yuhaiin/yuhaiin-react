// @generated by protoc-gen-es v1.10.0 with parameter "target=ts,js_import_style=legacy_commonjs"
// @generated from file node/tag/tag.proto (package yuhaiin.tag, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

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
// Retrieve enum metadata with: proto3.getEnumType(tag_type)
proto3.util.setEnumType(tag_type, "yuhaiin.tag.tag_type", [
  { no: 0, name: "node" },
  { no: 1, name: "mirror" },
]);

/**
 * @generated from message yuhaiin.tag.tags
 */
export class tags extends Message<tags> {
  /**
   * @generated from field: string tag = 1;
   */
  tag = "";

  /**
   * @generated from field: yuhaiin.tag.tag_type type = 3;
   */
  type = tag_type.node;

  /**
   * @generated from field: repeated string hash = 2;
   */
  hash: string[] = [];

  constructor(data?: PartialMessage<tags>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.tag.tags";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "tag", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "type", kind: "enum", T: proto3.getEnumType(tag_type) },
    { no: 2, name: "hash", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): tags {
    return new tags().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): tags {
    return new tags().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): tags {
    return new tags().fromJsonString(jsonString, options);
  }

  static equals(a: tags | PlainMessage<tags> | undefined, b: tags | PlainMessage<tags> | undefined): boolean {
    return proto3.util.equals(tags, a, b);
  }
}

