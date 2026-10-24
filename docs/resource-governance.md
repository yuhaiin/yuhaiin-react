# Resource governance

The existing Traffic Control page includes **Identity resource policies** when
the connected server exposes the identity module and the current principal has
`resources:read`. Editing additionally requires `resources:write`; server-side
checks independently enforce these permissions. Old scoped tokens do not gain
new permissions automatically.

The editor supports a default user policy, shared group caps, per-member group
caps, user overrides, and credential caps. Shared group limits apply to the
whole membership; per-member limits apply separately to each user. All applicable
groups and credential constraints remain in force when a user overrides the
default. Rates reuse the existing Traffic Control profile editor. User and
credential policies include TCP/UDP/total sessions, CPS and PPS.

Daily and monthly windows reset at midnight UTC; lifetime has no reset. Quota
bytes remain decimal strings through editing, validation and activation, even
above JavaScript's safe integer range. Changing a quota period requires a new
ID. Reusing a quota ID preserves its budget. Reduced-speed and warn actions
permit bytes after the threshold; block-new pauses existing TCP and drops UDP
in addition to rejecting new sessions, and terminate interrupts affected traffic.

Validation does not publish a draft. Activation asks for confirmation, detects
stale revisions and retains rejected drafts. Reload explicitly confirms draft
discard. Identity selectors load only metadata available to the principal;
stable IDs remain editable where credential/user enumeration is unavailable.
No proxy proof or reusable secret is fetched by these controls. Controller and
session changes invalidate editor ownership before a pending save can continue.

The Account & Security usage report adds five-second live resource updates:
scope speeds, active sessions and caps, admission rates, rejection reasons,
quota remaining/reset, measured bytes and conservative crash-recovery charges.
Separate scope constraints do not predict remote connection throughput. Exact
values are retained in meter titles. Alert history uses exact decimal cursor
IDs, resets pagination when the owner changes and refreshes only its first
page. The backend retains at most 10,000 alerts. Persistence/overflow diagnostics
are visible; this is a bounded operational history, not a lossless audit ledger.
Unattributed traffic has no identity resource request. Owners see their own
records; viewing another owner requires `usage:read`. Group reports expose shared
aggregate quota to current members. Missing endpoints hide the optional feature.

The backend's [resource documentation](https://github.com/yuhaiin/yuhaiin/blob/codex/enterprise-resource-governance/docs/resource-governance.md)
defines composition, database migration 8, durable credit bounds and native
build compatibility. UI tests cover exact byte values, validation/activation,
conflict draft retention, read-only access, request errors, UTC display and
owner/cursor isolation. EN/JA/KO translations are complete. Browser visual
verification remains separate from these automated DOM tests.
