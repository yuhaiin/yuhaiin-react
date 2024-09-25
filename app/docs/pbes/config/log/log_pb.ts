// @generated by protoc-gen-es v2.1.0 with parameter "target=ts"
// @generated from file config/log/log.proto (package yuhaiin.log, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file config/log/log.proto.
 */
export const file_config_log_log: GenFile = /*@__PURE__*/
  fileDesc("ChRjb25maWcvbG9nL2xvZy5wcm90bxILeXVoYWlpbi5sb2ciPQoGbG9nY2F0EiUKBWxldmVsGAEgASgOMhYueXVoYWlpbi5sb2cubG9nX2xldmVsEgwKBHNhdmUYAiABKAgqUAoJbG9nX2xldmVsEgsKB3ZlcmJvc2UQABIJCgVkZWJ1ZxABEggKBGluZm8QAhILCgd3YXJuaW5nEAMSCQoFZXJyb3IQBBIJCgVmYXRhbBAFQjRaMmdpdGh1Yi5jb20vQXN1dG9ydWZhL3l1aGFpaW4vcGtnL3Byb3Rvcy9jb25maWcvbG9nYgZwcm90bzM");

/**
 * @generated from message yuhaiin.log.logcat
 */
export type logcat = Message<"yuhaiin.log.logcat"> & {
  /**
   * @generated from field: yuhaiin.log.log_level level = 1;
   */
  level: log_level;

  /**
   * @generated from field: bool save = 2;
   */
  save: boolean;
};

/**
 * Describes the message yuhaiin.log.logcat.
 * Use `create(logcatSchema)` to create a new message.
 */
export const logcatSchema: GenMessage<logcat> = /*@__PURE__*/
  messageDesc(file_config_log_log, 0);

/**
 * @generated from enum yuhaiin.log.log_level
 */
export enum log_level {
  /**
   * @generated from enum value: verbose = 0;
   */
  verbose = 0,

  /**
   * @generated from enum value: debug = 1;
   */
  debug = 1,

  /**
   * @generated from enum value: info = 2;
   */
  info = 2,

  /**
   * @generated from enum value: warning = 3;
   */
  warning = 3,

  /**
   * @generated from enum value: error = 4;
   */
  error = 4,

  /**
   * @generated from enum value: fatal = 5;
   */
  fatal = 5,
}

/**
 * Describes the enum yuhaiin.log.log_level.
 */
export const log_levelSchema: GenEnum<log_level> = /*@__PURE__*/
  enumDesc(file_config_log_log, 0);

