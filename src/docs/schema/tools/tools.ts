/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type Interfaces = Record<string, any>;
export type Interface = Record<string, any>;
export type Licenses = Record<string, any>;
export type License = Record<string, any>;
export type Log = Record<string, any>;
export type Logv2 = Record<string, any>;

export const InterfacesSchema = schema<Interfaces>("Interfaces");
export const InterfaceSchema = schema<Interface>("Interface");
export const LicensesSchema = schema<Licenses>("Licenses");
export const LicenseSchema = schema<License>("License");
export const LogSchema = schema<Log>("Log");
export const Logv2Schema = schema<Logv2>("Logv2");
