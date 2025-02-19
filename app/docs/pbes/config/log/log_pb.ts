// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file config/log/log.proto (package yuhaiin.log, edition 2023)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_google_protobuf_go_features } from "../../google/protobuf/go_features_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file config/log/log.proto.
 */
export const file_config_log_log: GenFile = /*@__PURE__*/
  fileDesc("ChRjb25maWcvbG9nL2xvZy5wcm90bxILeXVoYWlpbi5sb2cinQEKBmxvZ2NhdBIlCgVsZXZlbBgBIAEoDjIWLnl1aGFpaW4ubG9nLmxvZ19sZXZlbBIMCgRzYXZlGAIgASgIEjIKFGlnbm9yZV90aW1lb3V0X2Vycm9yGAMgASgIUhRpZ25vcmVfdGltZW91dF9lcnJvchIqChBpZ25vcmVfZG5zX2Vycm9yGAQgASgIUhBpZ25vcmVfZG5zX2Vycm9yKlAKCWxvZ19sZXZlbBILCgd2ZXJib3NlEAASCQoFZGVidWcQARIICgRpbmZvEAISCwoHd2FybmluZxADEgkKBWVycm9yEAQSCQoFZmF0YWwQBUI8WjJnaXRodWIuY29tL0FzdXRvcnVmYS95dWhhaWluL3BrZy9wcm90b3MvY29uZmlnL2xvZ5IDBdI+AhADYghlZGl0aW9uc3DoBw", [file_google_protobuf_go_features]);

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

  /**
   * @generated from field: bool ignore_timeout_error = 3 [json_name = "ignore_timeout_error"];
   */
  ignoreTimeoutError: boolean;

  /**
   * @generated from field: bool ignore_dns_error = 4 [json_name = "ignore_dns_error"];
   */
  ignoreDnsError: boolean;
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

