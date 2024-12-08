// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file tools/tools.proto (package yuhaiin.tools, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage, GenService } from "@bufbuild/protobuf/codegenv1";
import { fileDesc, messageDesc, serviceDesc } from "@bufbuild/protobuf/codegenv1";
import type { EmptySchema } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_empty } from "@bufbuild/protobuf/wkt";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file tools/tools.proto.
 */
export const file_tools_tools: GenFile = /*@__PURE__*/
  fileDesc("ChF0b29scy90b29scy5wcm90bxINeXVoYWlpbi50b29scyI6CgpJbnRlcmZhY2VzEiwKCmludGVyZmFjZXMYASADKAsyGC55dWhhaWluLnRvb2xzLkludGVyZmFjZSIsCglJbnRlcmZhY2USDAoEbmFtZRgBIAEoCRIRCglhZGRyZXNzZXMYAiADKAkySwoFdG9vbHMSQgoNZ2V0X2ludGVyZmFjZRIWLmdvb2dsZS5wcm90b2J1Zi5FbXB0eRoZLnl1aGFpaW4udG9vbHMuSW50ZXJmYWNlc0IvWi1naXRodWIuY29tL0FzdXRvcnVmYS95dWhhaWluL3BrZy9wcm90b3MvdG9vbHNiBnByb3RvMw", [file_google_protobuf_empty]);

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
}> = /*@__PURE__*/
  serviceDesc(file_tools_tools, 0);

