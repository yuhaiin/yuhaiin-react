import type { Go } from "@/api/generated-contracts";
import { requestJSON } from "@/api/client";

export type User = Go.user.UserView;
export type UserWrite = Go.user.UserWrite;

export function listUsers(query?: string) {
    return requestJSON<{ items: User[]; page: Go.route.Page }>("GET", "/api/v2/users", undefined, { page: 1, pageSize: 1000, query });
}

export function createUser(value: UserWrite) {
    return requestJSON<User>("POST", "/api/v2/users", value);
}

export function updateUser(id: string, value: Omit<UserWrite, "origin" | "credential"> & { credential?: Go.user.Credential }) {
    return requestJSON<User>("PUT", `/api/v2/users/${id}`, { id, ...value });
}

export function deleteUser(id: string) {
    return requestJSON<Record<string, never>>("DELETE", `/api/v2/users/${id}`, { id });
}
