# Management accounts and permissions

This UI requires the management identity API in [yuhaiin PR #608](https://github.com/yuhaiin/yuhaiin/pull/608), implementing [issue #607](https://github.com/yuhaiin/yuhaiin/issues/607). Upgrade the frontend and backend together; the old Basic login and query-string credentials are no longer supported.

## First login and recovery

Start the controller normally, then open the Web UI and choose its URL. An uninitialized controller automatically shows **Create administrator**. Copy the **Initialization code** from the controller's startup output, choose your login and password, and submit. Then sign in with those credentials. No extra bootstrap command is required.

The code lasts 15 minutes. Restarting before setup finishes generates a new code and invalidates the old one, even if the first run received no interaction. If the code expires, restart the controller and use the newest startup output. Creating the administrator permanently closes first-time setup; later restarts and password resets cannot reopen it. No account is created just by starting the service or opening this page. Public setup status never includes the code, and the UI never stores it persistently.

Remote controllers require HTTPS; HTTP is accepted only on loopback. A separately hosted UI must also be allowed by the backend's trusted-origin configuration. Optional manual `auth bootstrap` capabilities and user invitations still use **Activate account** on the login screen.

**Account & security** provides local user creation, role/status updates, credential resets and security events for administrators. New users and credential resets issue an enrollment capability that expires after 15 minutes. The UI displays it once. Preserve a copy until enrollment finishes. If all access is lost, use the backend's local `auth recover` command.

Changing your own password starts enrollment and immediately invalidates your old password, sessions and API tokens. Finish setting the new password before the capability expires. Refreshing the page during this exchange discards the capability; local recovery may then be needed.

## Sessions and API tokens

The browser derives the credential with WebCrypto PBKDF2-SHA-256 using the backend's versioned parameters (NFC, 600,000 iterations, 32 bytes). Plaintext passwords are not sent to the server. The derived credential remains password-equivalent and needs HTTPS protection.

Sessions stay in memory, use explicit Authorization headers and expire after eight hours. Refreshing the page, signing out, changing controllers or receiving a 401 requires signing in again. Credentials are absent from cookies, URL queries, persistent storage and SWR cache keys. Controller/account changes discard the previous data cache.

Create API tokens with selected scopes and an optional expiry. Administrators can choose another enrolled, enabled owner. The secret is displayed once and is absent from subsequent listings; store it before dismissing the dialog. Rotation invalidates the old token immediately while keeping its scopes and expiry. Revocation is immediate. External clients use `Authorization: Bearer <secret>`.

## Permission behavior

The UI consumes `/api/v2/auth/me` permissions. Navigation and protected pages check read permissions; mutation buttons check the corresponding write permissions. Read-only accounts can inspect configuration and manage their own tokens. They cannot save configuration, run diagnostics or administer users. Backend authorization remains authoritative. Permissions refresh on focus, every 30 seconds and after a forbidden response.

Log and connection streams use fetch-based SSE with Authorization headers and cancellation. Profiler assets and downloads also use authenticated fetch. Its viewer runs in an opaque-origin sandbox with network access disabled; the parent handles navigation without passing it credentials.

`src/auth/operations.ts` mirrors the backend RPC permission registry and is exhaustive over the generated operation type. Update it when adding operations. Development MSW previews establish a synthetic memory session exclusively from `tests/msw/fixtures.js`; production startup has no automatic login.

## Validation

Run `npm run test`, `npx tsc --noEmit`, `npm run lint`, `npm run i18n:check`, `npm run style:audit` and `npm run build`. For connection browser checks, start `npm run dev:msw` and run `CHROME_PATH=/path/to/chrome node scripts/check-connections.mjs`.
