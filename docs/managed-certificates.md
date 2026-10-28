# Managed certificate controls

Open **Certificates** from the System navigation. Readers need
`certificates:read`; changes need `certificates:manage`. The page uses real backend
RPC and SWR state and requires the [backend companion PR](https://github.com/yuhaiin/yuhaiin/pull/622).

Add a Cloudflare provider with its authoritative zone ID/name and a scoped DNS
read/write token. The token field is write-only; a blank edit retains the saved
token. Then create an ACME resource with DNS names/SANs, email, explicit CA terms
consent, auto-renew setting and HTTP-01 or DNS-01. Start with Let's Encrypt Staging
to test deployment; staging certificates are not publicly trusted. Custom CA
directories require HTTPS. Optional public trust roots apply only to that CA job.

HTTP-01 selects an existing enabled plaintext Gateway on port 80 with **ACME
HTTP-01** explicitly enabled. It keeps the listener source ACL and never opens an
extra port. DNS-01 selects a provider and supports wildcard names. The backend
checks propagation and cleans only records owned by its challenge.

In Gateway TLS termination, choose **Managed certificates**, select resource IDs
and save. Pending/expired resources fail TLS handshakes until valid material is
available. Valid renewed material is loaded for new connections without restarting
the Gateway. Existing streams continue. Referenced certificates cannot be deleted
or incompatibly edited; remove references first. File certificate/key settings
remain supported. To bind Management HTTPS, first issue a valid certificate, expand **Use for
Management HTTPS**, then add the shown `-https-certificate-id <id>` argument to
the installed service and restart with reviewed host settings. Use the certificate
DNS name. Do not combine with file-pair/generated-name arguments. Invalid material
fails startup without a plaintext fallback. Renewals then apply automatically and
actual management references prevent deletion. Host settings remain authoritative,
matching existing self-signed/file deployment configuration. Removing the argument
returns to that host mode. Restored deployments which adopted startup inputs also
require explicit review of `-recovery-startup=false` before changing host settings.
Clone recovery instead creates a new self-signed management identity and warns
about re-enrollment. Restore confirmation shows the managed resource ID; Software
Update explains targets without managed TLS support before replacement.

Resource cards expose raw domains, issuer, validity, next attempt, last success,
auto-renew status, failure explanation and listener references. Expiry/failure
alerts are explicit. **Renew now** obeys backend retry/rate protection. Delete uses
a confirmation. Provider tokens and certificate private keys are never returned.
The page does not own background renewal; work continues when the browser closes.

Validation passes lint, typecheck, style/translation checks, build and all 364
tests in 116 files. `scripts/check-certificates.mjs` also runs native Chrome against
a real isolated backend/SQLite at 1440, 360 and 320 pixels. It initializes a real
administrator, saves a provider/resource, reads persisted settings back, observes
a local CA request failure and checks token redaction and horizontal overflow.
This browser check does not contact a public CA; successful issuance is covered
by separate backend local signing-CA/provider/TLS tests. Reproduce after building:

```sh
CERTIFICATES_BACKEND=/path/to/yuhaiin ARTIFACT_DIR=/tmp/certificate-checks \
CHROME_PATH=/path/to/chrome node scripts/check-certificates.mjs
```

The harness creates and removes its own private data/profile and service processes.
Its test-only loopback management HTTP does not change production TLS defaults.
Artifacts remain outside Git. Live ARI retrieval and final
whole-application lifecycle qualification remain in progress in the same two PRs.
