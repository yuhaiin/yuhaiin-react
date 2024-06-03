// @generated by protoc-gen-es v1.10.0 with parameter "target=ts,js_import_style=legacy_commonjs"
// @generated from file node/point/point.proto (package yuhaiin.point, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
import { protocol } from "../protocol/protocol_pb.js";

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
// Retrieve enum metadata with: proto3.getEnumType(origin)
proto3.util.setEnumType(origin, "yuhaiin.point.origin", [
  { no: 0, name: "reserve" },
  { no: 101, name: "remote" },
  { no: 102, name: "manual" },
]);

/**
 * @generated from message yuhaiin.point.point
 */
export class point extends Message<point> {
  /**
   * @generated from field: string hash = 1;
   */
  hash = "";

  /**
   * @generated from field: string name = 2;
   */
  name = "";

  /**
   * @generated from field: string group = 3;
   */
  group = "";

  /**
   * @generated from field: yuhaiin.point.origin origin = 4;
   */
  origin = origin.reserve;

  /**
   * will use protocols' order to create dialer
   *
   * @generated from field: repeated yuhaiin.protocol.protocol protocols = 5;
   */
  protocols: protocol[] = [];

  constructor(data?: PartialMessage<point>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.point.point";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "hash", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "group", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "origin", kind: "enum", T: proto3.getEnumType(origin) },
    { no: 5, name: "protocols", kind: "message", T: protocol, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): point {
    return new point().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): point {
    return new point().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): point {
    return new point().fromJsonString(jsonString, options);
  }

  static equals(a: point | PlainMessage<point> | undefined, b: point | PlainMessage<point> | undefined): boolean {
    return proto3.util.equals(point, a, b);
  }
}

