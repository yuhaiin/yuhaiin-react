// @generated by protoc-gen-es v1.8.0 with parameter "target=ts"
// @generated from file config/bypass/bypass.proto (package yuhaiin.bypass, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from enum yuhaiin.bypass.mode
 */
export enum mode {
  /**
   * @generated from enum value: bypass = 0;
   */
  bypass = 0,

  /**
   * @generated from enum value: direct = 1;
   */
  direct = 1,

  /**
   * @generated from enum value: proxy = 2;
   */
  proxy = 2,

  /**
   * @generated from enum value: block = 3;
   */
  block = 3,
}
// Retrieve enum metadata with: proto3.getEnumType(mode)
proto3.util.setEnumType(mode, "yuhaiin.bypass.mode", [
  { no: 0, name: "bypass" },
  { no: 1, name: "direct" },
  { no: 2, name: "proxy" },
  { no: 3, name: "block" },
]);

/**
 * @generated from enum yuhaiin.bypass.resolve_strategy
 */
export enum resolve_strategy {
  /**
   * @generated from enum value: default = 0;
   */
  default = 0,

  /**
   * @generated from enum value: prefer_ipv4 = 1;
   */
  prefer_ipv4 = 1,

  /**
   * @generated from enum value: only_ipv4 = 2;
   */
  only_ipv4 = 2,

  /**
   * @generated from enum value: prefer_ipv6 = 3;
   */
  prefer_ipv6 = 3,

  /**
   * @generated from enum value: only_ipv6 = 4;
   */
  only_ipv6 = 4,
}
// Retrieve enum metadata with: proto3.getEnumType(resolve_strategy)
proto3.util.setEnumType(resolve_strategy, "yuhaiin.bypass.resolve_strategy", [
  { no: 0, name: "default" },
  { no: 1, name: "prefer_ipv4" },
  { no: 2, name: "only_ipv4" },
  { no: 3, name: "prefer_ipv6" },
  { no: 4, name: "only_ipv6" },
]);

/**
 * @generated from message yuhaiin.bypass.bypass_config
 */
export class bypass_config extends Message<bypass_config> {
  /**
   * @generated from field: yuhaiin.bypass.mode tcp = 3;
   */
  tcp = mode.bypass;

  /**
   * @generated from field: yuhaiin.bypass.mode udp = 4;
   */
  udp = mode.bypass;

  /**
   * @generated from field: string bypass_file = 2 [json_name = "bypass_file"];
   */
  bypassFile = "";

  /**
   * @generated from field: repeated yuhaiin.bypass.mode_config custom_rule_v3 = 7 [json_name = "custom_rule_v3"];
   */
  customRuleV3: mode_config[] = [];

  constructor(data?: PartialMessage<bypass_config>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.bypass.bypass_config";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 3, name: "tcp", kind: "enum", T: proto3.getEnumType(mode) },
    { no: 4, name: "udp", kind: "enum", T: proto3.getEnumType(mode) },
    { no: 2, name: "bypass_file", jsonName: "bypass_file", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 7, name: "custom_rule_v3", jsonName: "custom_rule_v3", kind: "message", T: mode_config, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): bypass_config {
    return new bypass_config().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): bypass_config {
    return new bypass_config().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): bypass_config {
    return new bypass_config().fromJsonString(jsonString, options);
  }

  static equals(a: bypass_config | PlainMessage<bypass_config> | undefined, b: bypass_config | PlainMessage<bypass_config> | undefined): boolean {
    return proto3.util.equals(bypass_config, a, b);
  }
}

/**
 * @generated from message yuhaiin.bypass.mode_config
 */
export class mode_config extends Message<mode_config> {
  /**
   * @generated from field: yuhaiin.bypass.mode mode = 1;
   */
  mode = mode.bypass;

  /**
   * @generated from field: string tag = 2;
   */
  tag = "";

  /**
   * @generated from field: repeated string hostname = 3;
   */
  hostname: string[] = [];

  /**
   * @generated from field: yuhaiin.bypass.resolve_strategy resolve_strategy = 4 [json_name = "resolve_strategy"];
   */
  resolveStrategy = resolve_strategy.default;

  constructor(data?: PartialMessage<mode_config>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "yuhaiin.bypass.mode_config";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "mode", kind: "enum", T: proto3.getEnumType(mode) },
    { no: 2, name: "tag", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "hostname", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 4, name: "resolve_strategy", jsonName: "resolve_strategy", kind: "enum", T: proto3.getEnumType(resolve_strategy) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): mode_config {
    return new mode_config().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): mode_config {
    return new mode_config().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): mode_config {
    return new mode_config().fromJsonString(jsonString, options);
  }

  static equals(a: mode_config | PlainMessage<mode_config> | undefined, b: mode_config | PlainMessage<mode_config> | undefined): boolean {
    return proto3.util.equals(mode_config, a, b);
  }
}

