// @generated by protoc-gen-es v1.9.0 with parameter "target=ts,js_import_style=legacy_commonjs"
// @generated from file statistic/config.proto (package yuhaiin.statistic, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3, protoInt64 } from "@bufbuild/protobuf";

/**
 *
 * "tcp", "tcp4", "tcp6"
 * "udp", "udp4", "udp6"
 * "ip", "ip4", "ip6"
 * "unix", "unixgram", "unixpacket"
 *
 * @generated from enum yuhaiin.statistic.type
 */
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
// Retrieve enum metadata with: proto3.getEnumType(type)
proto3.util.setEnumType(type, "yuhaiin.statistic.type", [
  { no: 0, name: "unknown" },
  { no: 1, name: "tcp" },
  { no: 2, name: "tcp4" },
  { no: 3, name: "tcp6" },
  { no: 4, name: "udp" },
  { no: 5, name: "udp4" },
  { no: 6, name: "udp6" },
  { no: 7, name: "ip" },
  { no: 8, name: "ip4" },
  { no: 9, name: "ip6" },
  { no: 10, name: "unix" },
  { no: 11, name: "unixgram" },
  { no: 12, name: "unixpacket" },
]);

/**
 * @generated from message yuhaiin.statistic.net_type
 */
export class net_type extends Message<net_type> {
  /**
   * @generated from field: yuhaiin.statistic.type conn_type = 1 [json_name = "conn_type"];
   */
  connType = type.unknown;

  /**
   * @generated from field: yuhaiin.statistic.type underlying_type = 2 [json_name = "underlying_type"];
   */
  underlyingType = type.unknown;

  constructor(data?: PartialMessage<net_type>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.statistic.net_type";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "conn_type", jsonName: "conn_type", kind: "enum", T: proto3.getEnumType(type) },
    { no: 2, name: "underlying_type", jsonName: "underlying_type", kind: "enum", T: proto3.getEnumType(type) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): net_type {
    return new net_type().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): net_type {
    return new net_type().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): net_type {
    return new net_type().fromJsonString(jsonString, options);
  }

  static equals(a: net_type | PlainMessage<net_type> | undefined, b: net_type | PlainMessage<net_type> | undefined): boolean {
    return proto3.util.equals(net_type, a, b);
  }
}

/**
 * @generated from message yuhaiin.statistic.connection
 */
export class connection extends Message<connection> {
  /**
   * @generated from field: string addr = 1;
   */
  addr = "";

  /**
   * @generated from field: uint64 id = 2;
   */
  id = protoInt64.zero;

  /**
   * @generated from field: yuhaiin.statistic.net_type type = 3;
   */
  type?: net_type;

  /**
   * @generated from field: map<string, string> extra = 4;
   */
  extra: { [key: string]: string } = {};

  constructor(data?: PartialMessage<connection>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.statistic.connection";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "addr", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "id", kind: "scalar", T: 4 /* ScalarType.UINT64 */ },
    { no: 3, name: "type", kind: "message", T: net_type },
    { no: 4, name: "extra", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "scalar", T: 9 /* ScalarType.STRING */} },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): connection {
    return new connection().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): connection {
    return new connection().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): connection {
    return new connection().fromJsonString(jsonString, options);
  }

  static equals(a: connection | PlainMessage<connection> | undefined, b: connection | PlainMessage<connection> | undefined): boolean {
    return proto3.util.equals(connection, a, b);
  }
}

