import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { setApiUrl } from "@/common/apiurl";
import { createUser, deleteUser, listUsers, updateUser } from "@/api/users";

const apiOrigin = "http://127.0.0.1:4178";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => {
    localStorage.clear();
    setApiUrl(apiOrigin);
});

describe("user management API", () => {
    it("lists users through the generated RPC route and forwards query fields", async () => {
        server.use(http.post(`${apiOrigin}/api/v2/rpc/users.get`, async ({ request }) => {
            const body = await request.json() as Record<string, unknown>;
            expect(body).toMatchObject({ page: 1, pageSize: 1000, query: "alice" });
            return HttpResponse.json({ items: [{ id: "u1", name: "Alice", enabled: true, origin: "manual", usage: "both", credential: { type: "basic", username: "alice", hasUsername: true, hasSecret: true } }], page: { page: 1, pageSize: 1000, total: 1 } });
        }));

        await expect(listUsers("alice")).resolves.toMatchObject({ items: [{ id: "u1", name: "Alice" }] });
    });

    it("creates, updates, and deletes a user without sending masked secrets back", async () => {
        const requests: Array<{ operation: string; body: Record<string, unknown> }> = [];
        server.use(
            http.post(`${apiOrigin}/api/v2/rpc/users.post`, async ({ request }) => {
                requests.push({ operation: "create", body: await request.json() as Record<string, unknown> });
                return HttpResponse.json({ id: "u1", name: "Alice", enabled: true, origin: "manual", usage: "outbound", credential: { type: "basic", username: "alice", hasUsername: true, hasSecret: true } });
            }),
            http.post(`${apiOrigin}/api/v2/rpc/user.put`, async ({ request }) => {
                requests.push({ operation: "update", body: await request.json() as Record<string, unknown> });
                return HttpResponse.json({ id: "u1", name: "Alice 2", enabled: true, origin: "manual", usage: "outbound", credential: { type: "basic", username: "alice", hasUsername: true, hasSecret: true } });
            }),
            http.post(`${apiOrigin}/api/v2/rpc/user.delete`, async ({ request }) => {
                requests.push({ operation: "delete", body: await request.json() as Record<string, unknown> });
                return HttpResponse.json({});
            }),
        );

        await expect(createUser({ name: "Alice", enabled: true, usage: "outbound", credential: { type: "basic", basic: { username: "alice", password: "secret" } } })).resolves.toMatchObject({ id: "u1" });
        await expect(updateUser("u1", { name: "Alice 2", enabled: true, usage: "outbound" })).resolves.toMatchObject({ name: "Alice 2" });
        await expect(deleteUser("u1")).resolves.toEqual({});

        expect(requests).toHaveLength(3);
        expect(requests[0].body).toMatchObject({ name: "Alice", credential: { type: "basic", basic: { password: "secret" } } });
        expect(requests[1].body).toMatchObject({ id: "u1", name: "Alice 2" });
        expect(requests[1].body).not.toHaveProperty("credential");
        expect(requests[2].body).toMatchObject({ id: "u1" });
    });
});
