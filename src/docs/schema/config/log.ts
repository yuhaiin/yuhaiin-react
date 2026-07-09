/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type logcat = Record<string, any>;

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

export const logcatSchema = schema<logcat>("logcat");
export const log_levelSchema = enumSchema(log_level);
