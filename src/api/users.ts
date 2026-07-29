import type { Go } from "@/api/generated-contracts";
import { requestJSON } from "@/api/client";

export type User = Go.user.UserView;
export type UserWrite = Go.user.UserWrite;
export type UserList = { items: User[]; page: Go.route.Page };

export type UserListQuery = {
    page?: number;
    pageSize?: number;
    query?: string;
};

export function listUsers(query?: string | UserListQuery): Promise<UserList> {
    const params = typeof query === "string"
        ? { page: 1, page_size: 1000, query }
        : { page: query?.page, page_size: query?.pageSize, query: query?.query };
    return requestJSON<UserList>("GET", "/api/v2/users", undefined, params);
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
