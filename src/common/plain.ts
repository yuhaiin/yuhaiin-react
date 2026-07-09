export type JsonValue =
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | { [key: string]: JsonValue };

export type DescMessage<T = any> = {
    typeName?: string;
    create?: () => T;
};

export type JsonReadOptions = {
    ignoreUnknownFields?: boolean;
};

export type JsonWriteOptions = {
    emitDefaultValues?: boolean;
    enumAsInteger?: boolean;
    prettySpaces?: number;
};

export type MessageShape<T> = T extends DescMessage<infer U> ? U : T;

export type DescEnumValue = {
    name: string;
    number: number;
};

export type DescEnum = {
    values: DescEnumValue[];
};

export type Duration = {
    seconds?: bigint | number | string;
    nanos?: number;
};

export function schema<T = Record<string, any>>(typeName?: string, create?: () => T): DescMessage<T> {
    return { typeName, create };
}

export function enumSchema(values: Record<string, string | number>): DescEnum {
    return {
        values: Object.entries(values)
            .filter(([, value]) => typeof value === "number")
            .map(([name, number]) => ({ name, number: number as number })),
    };
}

export function create<T>(desc: DescMessage<T>, init?: Partial<T>): T {
    return { ...(desc.create?.() ?? {}), ...(init ?? {}) } as T;
}

export function clone<T>(value: T): T;
export function clone<T>(_desc: DescMessage<T>, value: T): T;
export function clone<T>(valueOrDesc: T | DescMessage<T>, maybeValue?: T): T {
    const value = arguments.length > 1 ? maybeValue : valueOrDesc;
    if (typeof structuredClone === "function") {
        return structuredClone(value) as T;
    }
    return JSON.parse(toJsonString(schema<T>(), value as T));
}

export function fromJson<T>(_desc: DescMessage<T>, value: unknown, _options?: JsonReadOptions): T {
    return value as T;
}

export function fromJsonString<T>(desc: DescMessage<T>, value: string, options?: JsonReadOptions): T {
    return fromJson(desc, JSON.parse(value), options);
}

export function toJson<T>(_desc: DescMessage<T>, value: T, _options?: JsonWriteOptions): JsonValue {
    return jsonSafe(value) as JsonValue;
}

export function toJsonString<T>(_desc: DescMessage<T>, value: T, options?: JsonWriteOptions): string {
    return JSON.stringify(jsonSafe(value), null, options?.prettySpaces);
}

export function toBinary<T>(desc: DescMessage<T>, value: T, options?: JsonWriteOptions): Uint8Array {
    return new TextEncoder().encode(toJsonString(desc, value, options));
}

function jsonSafe(value: unknown): unknown {
    if (typeof value === "bigint") return value.toString();
    if (value instanceof Date) return value.toISOString();
    if (value instanceof Uint8Array) {
        let binary = "";
        value.forEach((byte) => { binary += String.fromCharCode(byte); });
        return btoa(binary);
    }
    if (Array.isArray(value)) return value.map(jsonSafe);
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .filter(([, v]) => v !== undefined)
                .map(([k, v]) => [k, jsonSafe(v)]),
        );
    }
    return value;
}

export const EmptySchema = schema<Record<string, never>>("empty");
export const StringValueSchema = schema<{ value: string }>("string_value", () => ({ value: "" }));
export const TimestampSchema = schema<{ seconds: bigint; nanos: number }>("timestamp", () => ({ seconds: BigInt(0), nanos: 0 }));
