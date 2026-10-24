# Management accounts and permissions

This UI requires the management identity API in [yuhaiin PR #608](https://github.com/yuhaiin/yuhaiin/pull/608), implementing [issue #607](https://github.com/yuhaiin/yuhaiin/issues/607). Upgrade the frontend and backend together; the old Basic login and query-string credentials are no longer supported.

## First login and recovery

The UI first checks `/api/v2/management` for an explicit authentication mode.
Android omits the identity middleware and reports `none` on its loopback
controller: the UI opens directly, without login/setup, account controls,
credentials or identity polling. This connection has no fabricated user or
session secret. Changing controllers clears it. Only loopback URLs can use this
mode; a missing endpoint or unknown mode is an error, never an anonymous-access
fallback. The server executable installs the identity middleware and reports
`local-users`, using the setup/login flow below.

Start the controller normally, then open the Web UI and choose its URL. An uninitialized controller automatically shows **Create administrator**. Copy the **Initialization code** from the controller's startup output, choose your login and password, and submit. Then sign in with those credentials. No extra bootstrap command is required.

The code lasts 15 minutes. Restarting before setup finishes generates a new code and invalidates the old one, even if the first run received no interaction. If the code expires, restart the controller and use the newest startup output. Creating the administrator permanently closes first-time setup; later restarts and password resets cannot reopen it. No account is created just by starting the service or opening this page. Public setup status never includes the code, and the UI never stores it persistently.

Remote controllers require HTTPS; HTTP is accepted only on loopback. A separately hosted UI must also be allowed by the backend's trusted-origin configuration. Optional manual `auth bootstrap` capabilities and user invitations still use **Activate account** on the login screen.

**Account & security** provides local user creation, role/status updates, credential resets and security events for administrators. New users and credential resets issue an enrollment capability that expires after 15 minutes. The UI displays it once. Preserve a copy until enrollment finishes. If all access is lost, use the backend's local `auth recover` command.

Changing your own password starts enrollment and immediately invalidates your old password, sessions and API tokens. Finish setting the new password before the capability expires. Refreshing the page during this exchange discards the capability; local recovery may then be needed.

## Sessions and API tokens

The browser derives the credential with WebCrypto PBKDF2-SHA-256 using the backend's versioned parameters (NFC, 600,000 iterations, 32 bytes). Plaintext passwords are not sent to the server. The derived credential remains password-equivalent and needs HTTPS protection.

Sessions expire after eight hours. Password and OAuth login set a host-only HttpOnly cookie on the controller. After refreshing, the UI restores the existing principal and expiry before routing, preserving the requested page. It never extends the session or stores a secret in localStorage/sessionStorage, IndexedDB, URLs or SWR cache keys. Explicit header sessions remain supported. Signing out, expiry, account reset/disable or session revocation prevents restoration. Controller/account changes discard the previous data cache.

Management fetches (including SSE) use `credentials: 'include'` and the controller accepts credentialed CORS only for trusted origins. HTTPS cookies use Secure and SameSite=None, supporting the official separately hosted UI; loopback HTTP uses SameSite=Lax. If the browser blocks third-party cookies, serve the UI from the controller origin or allow its cookies for the trusted UI site. Draft-controller discovery stays anonymous.

**Signed-in sessions** shows your active sessions, marks the current one, and displays browser, actual connection address, login method, creation, expiry and recent activity. You can sign out any of your sessions, including the current one. Revoking another session leaves this one logged in. New requests fail immediately after revocation; active streams stop within the backend's one-second recheck interval.

Create API tokens with selected scopes and an optional expiry. Administrators can choose another enrolled, enabled owner. The secret is displayed once and is absent from subsequent listings; store it before dismissing the dialog. Rotation invalidates the old token immediately while keeping its scopes and expiry. Revocation is immediate. External clients use `Authorization: Bearer <secret>`.

## Permission behavior

The UI consumes `/api/v2/auth/me` permissions. Navigation and protected pages check read permissions; mutation buttons check the corresponding write permissions. Read-only accounts can inspect configuration and manage their own tokens. They cannot save configuration, run diagnostics or administer users. Backend authorization remains authoritative. Permissions refresh on focus, every 30 seconds and after a forbidden response.

Log and connection streams use fetch-based SSE with session cookies or Authorization headers and cancellation. Profiler assets and downloads also use authenticated fetch. Its viewer runs in an opaque-origin sandbox with network access disabled; the parent handles navigation without passing it credentials.

`src/auth/operations.ts` mirrors the backend RPC permission registry and is exhaustive over the generated operation type. Update it when adding operations. Development MSW previews establish a synthetic memory session exclusively from `tests/msw/fixtures.js`; production startup restores only an existing valid controller cookie.

## Validation

Run `npm run test`, `npx tsc --noEmit`, `npm run lint`, `npm run i18n:check`, `npm run style:audit` and `npm run build`. For connection browser checks, start `npm run dev:msw` and run `CHROME_PATH=/path/to/chrome node scripts/check-connections.mjs`.

## GitHub and Google sign-in

Both providers are supported. An administrator opens **Account & security → Connected accounts → OAuth application settings** and saves the OAuth web application's client ID, secret and exact callback URL:

- `https://YOUR_CONTROLLER/api/v2/auth/oauth/github/callback`
- `https://YOUR_CONTROLLER/api/v2/auth/oauth/google/callback`

Remote callbacks require public HTTPS. Google also requires a configured consent screen/audience and test users while the application is in testing. The UI must be a trusted controller Origin and popups must be allowed. Existing app secrets are never returned to the browser; leaving the secret blank keeps it. Disabling a provider retains user connections.

Activate a local account first, then connect GitHub or Google under **Connected accounts**. Enabled providers appear on the login screen. OAuth sign-in requires an existing connection and respects the local user's current role and disabled status. There is no public registration or automatic email-based account merge. Disconnecting signs out sessions authenticated with that provider. A password credential reset also clears connected accounts.

The popup returns a one-use completion proof to the exact initiating UI. The parent checks popup identity, controller origin and state before completing the exchange with its memory-only start secret. Neither provider tokens nor session secrets are placed in callback URLs or messages. Cancelling, switching controllers or unmounting the page cancels the flow. Provider tokens are not stored by the backend.

Administrator app settings open in a dialog from **Connected accounts**, rather
than appearing as always-visible account-binding fields. When no provider is
configured, the page explains the setup step. After saving, it refreshes enabled
providers and closes the dialog; click **Connect GitHub** or **Connect Google**
to open that provider's authorization page for the currently signed-in admin.
Saving configuration alone never binds an external identity. Ordinary users see
account binding controls and a contact-administrator notice when unavailable,
without client-ID/secret settings.

## User traffic and audit

**Account & security → User traffic and audit** reads the paired backend's
`/api/v2/auth/usage` endpoints. Proxy-only users see their own lifetime/period
payload usage, transfer rates, activity minutes, session duration, node/inbound/
credential/protocol breakdowns and cursor-paged session audits. Read-only operators
and administrators may select another owner or unattributed traffic. Administrators
can change retention. Counters use decimal strings/BigInt; dates and presets use
UTC. Session duration includes idle and parallel sessions. This view does not
apply quotas or rate limits.

The owner selector combines known users with the first 200 historical IDs. Audit
filters match exact source/target addresses and session start times. Errors and
incomplete audit coverage remain visible. Cache keys include controller, identity,
owner and filters to isolate data across accounts.

For a real browser check, build the paired backend and this frontend first, then:

```sh
USAGE_BACKEND=/absolute/path/to/yuhaiin \
CHROME_PATH=/opt/google/chrome/chrome \
ARTIFACT_DIR=/tmp/user-usage-ui \
node scripts/check-user-usage.mjs
```

The script launches an isolated Chrome profile unless `CHROME_DEBUG_PORT` selects
an existing disposable CDP browser. It creates temporary backend state, enrolls
two users, sends real authenticated HTTP proxy traffic, verifies separated totals
and 55 independent audit rows, exercises owner selection/pagination and proxy-only
self-service, checks 360px layout, and saves screenshots. It leaves production
state and browser profiles untouched. Its backend logs contain disposable setup
capabilities and are created with private file permissions.

## Traffic groups and identity conditions

Account & Security includes Traffic groups for identities with `users:manage`.
Create a named group, expand its form to edit the description and select multiple
members, then save. A conflicting revision leaves the unsaved form visible for
review. Deletion requires confirmation and removes memberships; the backend
retains the stable ID as an immutable tombstone. Deleted groups are omitted from
the active list. Management roles remain separate from traffic memberships.

Both routing condition editors support user, group and credential ID leaves
inside the existing Boolean expressions. Administrators can select users/groups
by name; stable IDs remain visible and can be entered directly. The trace viewer
shows translated identity condition labels and evaluation results. Connection
audits include the group IDs recorded at observation time.

Inbound user authentication now has explicit legacy, users and mixed modes.
Newly enabling user authentication chooses users-only with no users selected.
Existing objects without a mode remain mixed. Mixed mode displays a shared-secret
revocation warning, and saving membership changes preserves the selected mode.
No UI control grants permissions independently of the backend.

## Traffic Access Policy

Account & Security includes the active policy and status for `traffic-access:read`.
The editor also requires `traffic-access:write` to validate or activate changes.
The backend enforces both permissions. Existing scoped tokens do not acquire the
new scopes automatically; issue a suitably scoped token where needed.

Choose all inbounds or explicit stable inbound IDs, an explicit default action,
and ordered allow/deny rules. The existing route expression editor supports
identity, inbound IDs, domain/IP destinations, network, port and nested AND/OR/NOT
conditions. It omits routing-only host/process lists and GeoIP from access policy
choices. Rules use first-match precedence, with no implicit group or deny
priority. Top-level conditions are OR; the initial rule template uses AND for a
group and destination. Domains and CIDRs in one leaf are OR: separate them inside
AND when both original name and resolved address must match.

Validate leaves the active policy unchanged. Save and activate asks for
confirmation because sessions that lose access close. Validation failures and
revision conflicts retain the draft. Reload explicitly discards it after
confirmation. Policy-referenced groups cannot be deleted until the references
are removed; disabled rules also retain their group references.

Effective access preview takes an active proxy credential ID, trusted inbound ID,
TCP/UDP, destination host:port and an explicit resolved IP. It uses the current
active policy, not the draft, and never looks up DNS. Inspecting another owner's
credential requires `users:manage`. Credential/inbound authentication restrictions
are still applied by the listener separately from this authorization preview.
The result distinguishes allowed, denied and unprotected scope, and shows the
revision, reason and matched rule ID. Connection audit details include historical
access decision metadata and distinguish policy denial/revocation from ordinary
close and credential invalidation.

Protected scope requires a valid authenticated user even with default allow.
Legacy shared/anonymous traffic does not acquire user identity. A direct Gateway
listener currently lacks proxy-user authentication and is denied when protected;
use an authenticated proxy inbound with Gateway interception for that flow.
Review all alternate listeners before selecting only a subset of inbounds.

User resource policies and reports extend the existing Traffic Control and usage
pages; see [resource governance](resource-governance.md). Custom roles, security
change history and generic OIDC are subsequent work. Routing conditions alone
remain insufficient as an enterprise authorization boundary.


## Custom management roles

Account & Security shows effective permissions for the current session or scoped
API token. The Management roles card requires `roles:read`; definition edits
require `roles:write`, and assignments also require `users:manage`. Built-in
Administrator, Read-only and Proxy-only roles remain protected. Custom roles add
permission collections to the base role; use Proxy-only as the base for a narrowly
scoped operator, auditor or helpdesk account. Traffic groups remain independent.
The backend rejects grants above the actor's current permissions, changes to
stronger accounts and deletion of assigned roles. Old scoped tokens do not gain
new scopes after a promotion. Active requests recheck permissions within one
second. Revision conflicts retain drafts, and reload confirms discard.

Password changes keep the old local verifier until replacement enrollment
commits, then revoke earlier credentials atomically. Abandoning a change cannot
remove the last administrator's login. Administrative enrollment reset is disabled
for that last active local administrator; its own password-change flow remains
available. Deliberate local recovery retains its separate backend capability.
