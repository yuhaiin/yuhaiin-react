/* Plain TypeScript schema shim. */
import { enumSchema, schema } from "@/common/plain";

export type node = Record<string, any>;
export type manager = Record<string, any>;

export const nodeSchema = schema<node>("node");
export const managerSchema = schema<manager>("manager");
