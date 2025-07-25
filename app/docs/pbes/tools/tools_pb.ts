// @generated by protoc-gen-es v2.6.1 with parameter "target=ts"
// @generated from file tools/tools.proto (package yuhaiin.tools, edition 2023)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv2";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv2";
import type { EmptySchema } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_empty, file_google_protobuf_go_features } from "@bufbuild/protobuf/wkt";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file tools/tools.proto.
 */
export const file_tools_tools: GenFile = /*@__PURE__*/
  fileDesc("ChF0b29scy90b29scy5wcm90bxINeXVoYWlpbi50b29scyI6CgpJbnRlcmZhY2VzEiwKCmludGVyZmFjZXMYASADKAsyGC55dWhhaWluLnRvb2xzLkludGVyZmFjZSIsCglJbnRlcmZhY2USDAoEbmFtZRgBIAEoCRIRCglhZGRyZXNzZXMYAiADKAkiXAoITGljZW5zZXMSJwoHeXVoYWlpbhgBIAMoCzIWLnl1aGFpaW4udG9vbHMuTGljZW5zZRInCgdhbmRyb2lkGAIgAygLMhYueXVoYWlpbi50b29scy5MaWNlbnNlIlcKB0xpY2Vuc2USDAoEbmFtZRgBIAEoCRILCgN1cmwYAiABKAkSDwoHbGljZW5zZRgDIAEoCRIgCgtsaWNlbnNlX3VybBgEIAEoCVILbGljZW5zZV91cmwiEgoDTG9nEgsKA2xvZxgBIAEoCSIUCgVMb2d2MhILCgNsb2cYASADKAky9gEKBXRvb2xzEkIKDWdldF9pbnRlcmZhY2USFi5nb29nbGUucHJvdG9idWYuRW1wdHkaGS55dWhhaWluLnRvb2xzLkludGVyZmFjZXMSOwoIbGljZW5zZXMSFi5nb29nbGUucHJvdG9idWYuRW1wdHkaFy55dWhhaWluLnRvb2xzLkxpY2Vuc2VzEjMKA2xvZxIWLmdvb2dsZS5wcm90b2J1Zi5FbXB0eRoSLnl1aGFpaW4udG9vbHMuTG9nMAESNwoFbG9ndjISFi5nb29nbGUucHJvdG9idWYuRW1wdHkaFC55dWhhaWluLnRvb2xzLkxvZ3YyMAFCN1otZ2l0aHViLmNvbS9Bc3V0b3J1ZmEveXVoYWlpbi9wa2cvcHJvdG9zL3Rvb2xzkgMF0j4CEANiCGVkaXRpb25zcOgH", [file_google_protobuf_empty, file_google_protobuf_go_features]);

/**
 * @generated from message yuhaiin.tools.Interfaces
 */
export type Interfaces = Message<"yuhaiin.tools.Interfaces"> & {
  /**
   * @generated from field: repeated yuhaiin.tools.Interface interfaces = 1;
   */
  interfaces: Interface[];
};

/**
 * Describes the message yuhaiin.tools.Interfaces.
 * Use `create(InterfacesSchema)` to create a new message.
 */
export const InterfacesSchema: GenMessage<Interfaces> = /*@__PURE__*/
  messageDesc(file_tools_tools, 0);

/**
 * @generated from message yuhaiin.tools.Interface
 */
export type Interface = Message<"yuhaiin.tools.Interface"> & {
  /**
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * @generated from field: repeated string addresses = 2;
   */
  addresses: string[];
};

/**
 * Describes the message yuhaiin.tools.Interface.
 * Use `create(InterfaceSchema)` to create a new message.
 */
export const InterfaceSchema: GenMessage<Interface> = /*@__PURE__*/
  messageDesc(file_tools_tools, 1);

/**
 * @generated from message yuhaiin.tools.Licenses
 */
export type Licenses = Message<"yuhaiin.tools.Licenses"> & {
  /**
   * @generated from field: repeated yuhaiin.tools.License yuhaiin = 1;
   */
  yuhaiin: License[];

  /**
   * @generated from field: repeated yuhaiin.tools.License android = 2;
   */
  android: License[];
};

/**
 * Describes the message yuhaiin.tools.Licenses.
 * Use `create(LicensesSchema)` to create a new message.
 */
export const LicensesSchema: GenMessage<Licenses> = /*@__PURE__*/
  messageDesc(file_tools_tools, 2);

/**
 * @generated from message yuhaiin.tools.License
 */
export type License = Message<"yuhaiin.tools.License"> & {
  /**
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * @generated from field: string url = 2;
   */
  url: string;

  /**
   * @generated from field: string license = 3;
   */
  license: string;

  /**
   * @generated from field: string license_url = 4 [json_name = "license_url"];
   */
  licenseUrl: string;
};

/**
 * Describes the message yuhaiin.tools.License.
 * Use `create(LicenseSchema)` to create a new message.
 */
export const LicenseSchema: GenMessage<License> = /*@__PURE__*/
  messageDesc(file_tools_tools, 3);

/**
 * @generated from message yuhaiin.tools.Log
 */
export type Log = Message<"yuhaiin.tools.Log"> & {
  /**
   * @generated from field: string log = 1;
   */
  log: string;
};

/**
 * Describes the message yuhaiin.tools.Log.
 * Use `create(LogSchema)` to create a new message.
 */
export const LogSchema: GenMessage<Log> = /*@__PURE__*/
  messageDesc(file_tools_tools, 4);

/**
 * @generated from message yuhaiin.tools.Logv2
 */
export type Logv2 = Message<"yuhaiin.tools.Logv2"> & {
  /**
   * @generated from field: repeated string log = 1;
   */
  log: string[];
};

/**
 * Describes the message yuhaiin.tools.Logv2.
 * Use `create(Logv2Schema)` to create a new message.
 */
export const Logv2Schema: GenMessage<Logv2> = /*@__PURE__*/
  messageDesc(file_tools_tools, 5);

/**
 * @generated from service yuhaiin.tools.tools
 */
export const tools: GenService<{
  /**
   * @generated from rpc yuhaiin.tools.tools.get_interface
   */
  get_interface: {
    methodKind: "unary";
    input: typeof EmptySchema;
    output: typeof InterfacesSchema;
  },
  /**
   * @generated from rpc yuhaiin.tools.tools.licenses
   */
  licenses: {
    methodKind: "unary";
    input: typeof EmptySchema;
    output: typeof LicensesSchema;
  },
  /**
   * @generated from rpc yuhaiin.tools.tools.log
   */
  log: {
    methodKind: "server_streaming";
    input: typeof EmptySchema;
    output: typeof LogSchema;
  },
  /**
   * @generated from rpc yuhaiin.tools.tools.logv2
   */
  logv2: {
    methodKind: "server_streaming";
    input: typeof EmptySchema;
    output: typeof Logv2Schema;
  },
}> = /*@__PURE__*/
  serviceDesc(file_tools_tools, 0);

