/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "yuhaiin.log";

export enum log_level {
  verbose = 0,
  debug = 1,
  info = 2,
  warning = 3,
  error = 4,
  fatal = 5,
  UNRECOGNIZED = -1,
}

export function log_levelFromJSON(object: any): log_level {
  switch (object) {
    case 0:
    case "verbose":
      return log_level.verbose;
    case 1:
    case "debug":
      return log_level.debug;
    case 2:
    case "info":
      return log_level.info;
    case 3:
    case "warning":
      return log_level.warning;
    case 4:
    case "error":
      return log_level.error;
    case 5:
    case "fatal":
      return log_level.fatal;
    case -1:
    case "UNRECOGNIZED":
    default:
      return log_level.UNRECOGNIZED;
  }
}

export function log_levelToJSON(object: log_level): string {
  switch (object) {
    case log_level.verbose:
      return "verbose";
    case log_level.debug:
      return "debug";
    case log_level.info:
      return "info";
    case log_level.warning:
      return "warning";
    case log_level.error:
      return "error";
    case log_level.fatal:
      return "fatal";
    case log_level.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface logcat {
  level: log_level;
  save: boolean;
}

function createBaselogcat(): logcat {
  return { level: 0, save: false };
}

export const logcat = {
  encode(message: logcat, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.level !== 0) {
      writer.uint32(8).int32(message.level);
    }
    if (message.save === true) {
      writer.uint32(16).bool(message.save);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): logcat {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaselogcat();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.level = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.save = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): logcat {
    return {
      level: isSet(object.level) ? log_levelFromJSON(object.level) : 0,
      save: isSet(object.save) ? Boolean(object.save) : false,
    };
  },

  toJSON(message: logcat): unknown {
    const obj: any = {};
    if (message.level !== 0) {
      obj.level = log_levelToJSON(message.level);
    }
    if (message.save === true) {
      obj.save = message.save;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<logcat>, I>>(base?: I): logcat {
    return logcat.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<logcat>, I>>(object: I): logcat {
    const message = createBaselogcat();
    message.level = object.level ?? 0;
    message.save = object.save ?? false;
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
