# LeadVoix OS — Authentication & Authorization Architecture

**Version:** 1.0
**Scope:** Identity, session, and access-control architecture underpinning every module in the Enterprise API Architecture
**Status:** Architecture only — no code. This is the design the Auth module's FastAPI implementation will be built against once confirmed.

---

## 0. Design Principles

1. **Never roll our own cryptography or password storage.** Identity (credential storage, password hashing, email verification delivery, OAuth provider handshakes) is delegated to **Supabase Auth**, which sits on top of GoTrue — a hardened, audited identity provider. LeadVoix's own backend never sees or stores a raw password.
2. **Two-layer identity model.** Supabase's `auth.users` is the *authentication* record (credentials, verification status, MFA factors). LeadVoix's own `public.users` table (from the database design) is the *application* profile (name, avatar, phone, tenant memberships). The two are linked by `auth_user_id`, never merged — this keeps identity concerns and business-profile concerns independently evolvable.
3. **Authorization is enforced in three independent layers**, not one: (a) JWT claims scope what a token *can even represent*, (b) FastAPI dependency-injected permission checks scope what a *request* can do, (c) Postgres Row Level Security scopes what a *query* can ever return or write, regardless of what the application layer intended. A bug in any single layer cannot alone cause a cross-tenant leak or privilege escalation.
4. **Every credential type (session JWT, refresh token, API key, MFA factor) has an independent revocation path.** Compromise of one must never require rotating the others.
5. **Security posture scales with plan tier.** MFA, custom roles, and API keys are gated features on top of a common architecture — not different codepaths — so enterprise requirements don't fork the auth system.

---

## 1. Identity Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Supabase Auth (GoTrue)                       │
│  - auth.users (credentials, email verification, MFA factors)         │
│  - Handles: password hashing (bcrypt/argon2), email delivery,          │
│    OAuth provider handshakes, MFA (TOTP) enrollment & verification     │
└───────────────────────────────┬───────────────────────────────────────┘
                                │ auth_user_id (1:1)
┌───────────────────────────────▼───────────────────────────────────────┐
│                    LeadVoix Backend (FastAPI)                          │
│  public.users            — application profile                         │
│  organization_members    — tenant membership + role                     │
│  roles / permissions     — RBAC model                                    │
│  api_keys                — machine-to-machine credentials                 │
│  refresh_tokens (tracked)— session/device registry for revocation          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why not just use Supabase Auth's JWT directly end-to-end?** Supabase's default JWT only knows about the Supabase identity — it has no concept of LeadVoix's `organization_id`, `role`, or resolved `permissions`. The backend issues its **own signed session JWT** after validating the Supabase credential, embedding LeadVoix-specific claims. Supabase Auth is the *credential verifier*; LeadVoix's Auth module is the *session issuer*. This separation is what makes multi-org membership, custom roles, and tenant-switching possible without fighting the identity provider's data model.

---

## 2. Registration Architecture

### 2.1 Flow

```
1. Client submits: organization_name, industry_vertical, email, password, full_name
2. Backend → Supabase Auth: create auth.users record (email, password)
      → Supabase sends verification email (GoTrue-managed template, branded)
3. Backend, in a single DB transaction:
      a. Create `organizations` row
      b. Create `public.users` row (auth_user_id = Supabase user id, is_active=true, email_verified=false)
      c. Create `organization_members` row (role = system 'owner')
      d. Create default `subscriptions` row (trial plan)
4. Backend issues a LeadVoix session JWT (see §4) — user is logged in immediately,
   but flagged `email_verified: false` in the token claims
5. Certain actions (see §11) are gated behind email verification; core CRM use is not blocked
```

### 2.2 Why registration doesn't block on email verification

Blocking signup on email verification is a conversion killer for B2B SaaS trials. Instead, verification status is a **claim carried in every token** and specific sensitive actions (inviting team members, changing billing, enabling API keys) require `email_verified: true`, checked as an additional dependency alongside the permission check. This gives security where it matters without adding friction to the trial funnel.

### 2.3 Atomicity guarantee

Step 3 above is wrapped in a database transaction with a compensating action: if any sub-step fails, the transaction rolls back **and** the Supabase `auth.users` record created in step 2 is deleted via a cleanup call — an orphaned auth identity with no organization is a data-integrity bug, not an acceptable edge case.

---

## 3. Login Architecture

### 3.1 Flow

```
1. Client submits: email, password
2. Backend → Supabase Auth: verify credentials
      - On failure: generic 401 (no distinction between "no such email" and "wrong password")
      - On success: Supabase returns its own short-lived auth confirmation
3. Backend checks: does this user have MFA enrolled? (see §12)
      - If yes → return a `mfa_challenge_token` (short-lived, single-purpose), require §12.2 before issuing a session
      - If no → proceed
4. Backend resolves all `organization_members` rows for this user
      - Single org membership → auto-select, issue full session JWT + refresh token
      - Multiple org memberships → issue a limited "pre-tenant" token (can only call
        /auth/select-organization) + return the list of orgs for the client to present a picker
5. Backend records the login: updates `users.last_login_at`, writes an `audit_logs` entry
   (action: 'login', includes ip_address, user_agent)
```

### 3.2 Brute-force protection

- Failed login attempts are rate-limited per `email` **and** per source IP independently (defends against both credential stuffing across many accounts from one IP, and distributed attempts against one account).
- After 5 failed attempts against a single account within 15 minutes, that account requires a CAPTCHA challenge on the next attempt (progressive friction, not an outright lockout — outright lockouts are themselves a denial-of-service vector against a known victim's email).
- All failed attempts are logged to `audit_logs` for security review and anomaly alerting.

---

## 4. JWT Architecture

### 4.1 Token structure

LeadVoix issues its own **RS256-signed** session JWT (asymmetric signing — the backend holds the private key; any service that only needs to *verify* tokens, like a future edge function or CDN-level auth check, only needs the public key, never the signing secret).

**Claims (conceptual, not exhaustive):**
```
{
  "sub": "<user_id>",                  // LeadVoix public.users.id, not the Supabase auth id
  "auth_user_id": "<supabase_uid>",
  "organization_id": "<org_id>",       // null if pre-tenant-selection token
  "role": "admin",
  "permissions": ["leads.create", "leads.update", ...],   // resolved, flattened list
  "email_verified": true,
  "mfa_verified": true,
  "token_type": "access",
  "iat": ..., "exp": ..., "jti": "<unique_token_id>"
}
```

### 4.2 Why permissions are embedded, not looked up per-request

Embedding the resolved permission list in the JWT means every request's authorization check is a pure in-memory claim check — **zero database round-trips** for the common case of "does this user have permission X." This is a deliberate performance decision at scale: authorization is the single most frequently executed check in the entire system, and it must not be a database query on every single request.

**Trade-off and mitigation:** if a role's permissions change mid-session, the currently-issued tokens are stale until they expire. This is mitigated by (a) a short access token lifetime (§4.3), and (b) a **token version** claim (`role_version`) checked against a `role_version` counter on `organization_members` — incrementing that counter (done automatically whenever a role/permission changes) invalidates all outstanding tokens for that membership without a database lookup on every request; it's only checked, not fetched, via a lightweight cache (Redis) keyed by `user_id:organization_id`.

### 4.3 Token lifetime

- **Access token:** 15 minutes. Short enough that a leaked token has a small blast radius; long enough to not force constant refreshes under normal use.
- **Pre-tenant token** (multi-org login, before org selection): 5 minutes, scoped to only the `select-organization` endpoint.
- **MFA challenge token:** 5 minutes, single-use, scoped to only the MFA verification endpoint.

### 4.4 Signature verification

Every protected FastAPI route runs through a shared `get_current_user` dependency that: verifies the RS256 signature against the cached public key, checks `exp`, checks the `role_version` claim against the live counter (Redis-cached), and attaches the resolved identity/tenant context to the request scope. This is the single choke point all downstream permission checks read from — no route re-implements token parsing.

---

## 5. Refresh Token Architecture

### 5.1 Why refresh tokens are tracked server-side (not purely stateless)

Access tokens are stateless JWTs by design (§4), but refresh tokens are **opaque, database-tracked records** — this is the deliberate asymmetry that makes real revocation possible. A purely stateless refresh token cannot be revoked before its natural expiry; a tracked one can be killed instantly (stolen device, logout-everywhere, offboarded employee).

### 5.2 Refresh token record (conceptual)

A `refresh_tokens` table (tenant-scoped through `user_id`, not a system-wide free-for-all):
- `id`, `user_id`, `organization_id`, `token_hash` (the raw token is never stored, only a hash — same principle as password storage), `device_info` (user agent, approximate location from IP), `issued_at`, `expires_at`, `revoked_at` (nullable), `last_used_at`.

### 5.3 Rotation policy

**Refresh token rotation with reuse detection:**
```
1. Client calls /auth/refresh with refresh_token_A
2. Backend validates token_A is active (not expired, not revoked)
3. Backend issues a new access token AND a new refresh_token_B
4. token_A is immediately marked revoked
5. If token_A is ever presented again after being revoked →
   this indicates token theft (an attacker replaying a stolen token
   after the legitimate client already rotated past it) →
   backend revokes the ENTIRE refresh token family for that user/device
   and forces re-authentication, and logs a security event
```
This is the same rotation-with-reuse-detection pattern used by major identity providers (Auth0, Okta) — it turns refresh token theft from a silent, ongoing compromise into a detectable, single-use event.

### 5.4 Multi-device support

Each login issues its own refresh token tied to a distinct `device_info` record — a user logged in on both a laptop and phone has two independent refresh token chains. Revoking one device's session (§10) never affects the other.

---

## 6. RBAC Architecture

### 6.1 Model recap (fully detailed in the Database & API Architecture docs)

- **`permissions`** — global, atomic capability codes (`leads.create`, `billing.manage`, etc.), platform-managed.
- **`roles`** — named bundles of permissions; four system roles (`owner`, `admin`, `agent`, `viewer`) plus tenant-defined custom roles on enterprise plans.
- **`role_permissions`** — the many-to-many resolving which permissions a role grants.
- **`organization_members.role_id`** — the actual assignment: this user, in this org, holds this role.

### 6.2 Enforcement layers

```
Layer 1 — JWT claim check (in-memory, §4.2)
   FastAPI dependency: `require_permission("leads.delete")`
   Reads the pre-resolved `permissions` claim from the verified token.
   Rejects with 403 before any database or business logic executes.

Layer 2 — Service-layer business rules
   Some rules aren't expressible as a static permission (e.g., "cannot demote
   the last owner", "only the activity's original author can edit it").
   These are explicit checks written in the service layer, not derived from RBAC —
   RBAC answers "can this role generally do X", business rules answer
   "is this specific action valid given this specific state."

Layer 3 — Row Level Security (database)
   Even if Layers 1–2 were somehow bypassed (a bug, a compromised service
   credential), Postgres RLS still restricts every row to the caller's
   organization_id, and write-policies further restrict certain tables
   (e.g., subscriptions, settings) to roles carrying the relevant permission,
   mirrored as a Postgres policy predicate — not just an application-side check.
```

### 6.3 Custom role resolution at token-issue time

When a session JWT is issued (login, refresh, org-select), the backend resolves the user's `role_id` → `role_permissions` → flattened permission code list, and embeds it fresh in the token. Custom roles are treated identically to system roles at this resolution step — there is no special-cased code path for "custom" vs. "system" roles downstream of this point, which is what keeps RBAC enforcement code simple regardless of plan tier.

---

## 7. Multi-Tenant Security Architecture

### 7.1 The core guarantee

**No request can ever act on tenant data outside the `organization_id` embedded in its verified JWT — this is enforced redundantly, not singularly:**

1. **Application layer:** every repository method requires an `organization_id` parameter sourced only from the request's verified token context — never from a path/query/body parameter. Code review and a lint rule flag any repository call that doesn't thread this through.
2. **Database layer:** RLS policies on every tenant-owned table filter on `organization_id = current_setting('request.jwt.claims.organization_id')` (Supabase's standard RLS-JWT integration pattern) — enforced even against direct database access, migrations aside.
3. **Cross-tenant reference checks:** any foreign key the client supplies (e.g., `assigned_to`, `company_id`) is validated to belong to the requester's own tenant before use — a syntactically valid UUID belonging to another tenant is treated identically to a nonexistent one (`404`, never `403`), so the API never confirms the existence of other tenants' data.

### 7.2 Tenant-switching security

Because a single `public.users` record can belong to multiple organizations (§1), the "active organization" is a property of the **session**, not the user. Switching organizations (`/auth/select-organization`) always re-verifies membership server-side and issues a **brand-new token** scoped to the new org — the client can never simply edit a claim to switch tenants, since the token is signed server-side and any tampering invalidates the signature.

### 7.3 Service-role isolation

Backend-internal operations that need to bypass RLS (scheduled jobs, admin tooling, the Automation engine acting on behalf of the system) use a distinct **Supabase service-role key**, never exposed to any client-facing code path, and every such operation is required to explicitly pass and check `organization_id` in application code even though RLS wouldn't otherwise block it — belt-and-suspenders for the one place where the database-layer guarantee is deliberately bypassed.

---

## 8. API Key Authentication (Machine-to-Machine)

Distinct from JWT session auth — designed for server-to-server integrations (Zapier, custom customer integrations, future public API), where there's no "user session" concept.

### 8.1 Key structure and storage

- A generated API key has the form `lv_live_<32 random chars>` (or `lv_test_` prefix for a sandbox environment, mirroring Stripe's well-understood convention).
- Only a **prefix** (first 8 chars, e.g., `lv_live_ab12`) is stored in plaintext for display/identification in the UI ("last used key ending in ...ab12"). The full key is **hashed** (SHA-256) and only the hash is stored — identical principle to password/refresh-token storage. The raw key is shown to the user exactly once, at creation time, and never retrievable again.

### 8.2 Scoping

Each API key carries an explicit `scopes` array (a subset of permission codes) chosen at creation time — a key does not inherit the creating user's full permission set by default. This lets an org issue a read-only integration key for a reporting tool without also granting it write access to leads.

### 8.3 Request authentication

```
Header: Authorization: Bearer lv_live_ab12cd34...
Backend: hash the presented key → look up by hash → resolve organization_id + scopes
         → treat identically to a JWT's resolved context from that point on
         (same downstream permission-check code path as §6.2, just a different
         upstream resolution mechanism)
```

### 8.4 Lifecycle & revocation

- Keys have an optional `expires_at`; enterprise plans can enforce mandatory expiry (e.g., 90-day max) as an org-level security policy.
- `revoked_at` provides instant revocation, independent of expiry.
- Every API key use updates `last_used_at`, surfaced in the UI so an org can spot stale/unused keys and prune them — a routine security hygiene feature, not an afterthought.
- API key creation/revocation is itself a permission-gated, audit-logged action (`api_keys.manage`), defaulting to `owner`/`admin` only.

---

## 9. OAuth-Ready Architecture

MVP ships with email/password only, but the architecture is built so social/enterprise SSO login is a **configuration addition, not a redesign**.

### 9.1 Why this is "free" given the identity model in §1

Because credential verification is fully delegated to Supabase Auth, and Supabase Auth natively supports OAuth providers (Google, Microsoft, GitHub) and SAML/OIDC for enterprise SSO, adding a provider is a matter of: (a) enabling it in Supabase project config, (b) adding the corresponding button/redirect flow on the frontend, (c) the backend's post-authentication steps (§2.1 step 3, §3.1 step 4-5) are **completely unchanged** — they already operate on "a verified Supabase identity exists," regardless of whether that identity came from a password or an OAuth handshake.

### 9.2 New-user-via-OAuth edge case

The one net-new decision OAuth introduces: what happens when someone logs in via Google with an email that has no existing `organization_members` row? The architecture handles this identically to email/password registration's incomplete state — the backend detects "authenticated identity, zero org memberships" and routes the client to an **organization creation or invite-acceptance flow**, rather than assuming registration intent. This is the same branch already required for invited users who haven't set a password yet, not a new code path.

### 9.3 Enterprise SSO (SAML/OIDC) — forward-looking note

For enterprise customers requiring SAML-based SSO tied to their own identity provider (Okta, Azure AD), Supabase supports SSO configuration per-project; the multi-tenant nuance to design for when this is prioritized is **domain-based org routing** (a SAML assertion for `@acmecorp.com` should resolve to Acme's specific `organization_id`), which will need a `sso_domains` mapping table — flagged here as a known future schema addition, not designed in detail now since it's outside current MVP scope.

---

## 10. Session Management

### 10.1 What a "session" means in this architecture

A session is the pairing of one refresh token record (§5.2) with the access tokens minted from it over time. A user can hold multiple concurrent sessions (one per device/browser), each independently visible and revocable.

### 10.2 Active session visibility

`GET /api/v1/auth/sessions` returns the user's own active refresh token records (device info, last used, issued at) — **never the tokens themselves**, only metadata — so a user can review "where am I logged in."

### 10.3 Revocation actions

- **Revoke one session:** `DELETE /api/v1/auth/sessions/{session_id}` — marks that specific refresh token revoked; that device is logged out on its next API call (access token expires within 15 minutes regardless, refresh fails immediately).
- **Revoke all other sessions ("log out everywhere else"):** a dedicated endpoint that revokes every refresh token for the user except the calling session — standard "I think my account is compromised" self-service action.
- **Admin-forced revocation:** an `owner`/`admin` can revoke all sessions for another member of their org (e.g., offboarding an employee) — this action is itself audit-logged and permission-gated (`users.manage`).

### 10.4 Idle and absolute timeout policy

- **Idle timeout:** if a refresh token isn't used for 30 days, it expires naturally (`expires_at` set at issuance, not sliding indefinitely) — bounds the lifetime of a forgotten, logged-in device.
- **Absolute session cap:** enterprise-tier orgs can configure a stricter max session age (e.g., 8 hours) as a compliance control, stored as an org-level setting (§21 of the Enterprise API doc) and enforced at token-refresh time.

---

## 11. Password Reset Architecture

### 11.1 Flow

```
1. POST /auth/password-reset/request { email }
      → Backend always returns a generic 200, regardless of whether the
        email exists (enumeration prevention — this is non-negotiable)
      → If the email does exist: Supabase Auth generates a signed,
        single-use, time-limited (30 min) reset token and sends the email
2. User clicks link → frontend reset-password page → 
   POST /auth/password-reset/confirm { reset_token, new_password }
3. Backend validates the token via Supabase Auth, updates the password
4. On success: ALL existing refresh tokens for that user are revoked
   (§5.3-style full revocation) — a password reset is a strong signal
   the account may have been compromised, so every other session is
   forced to re-authenticate, not just left running
5. An audit_logs entry and a security-notification email
   ("Your password was just changed — wasn't you? Contact support")
   are triggered
```

### 11.2 Rate limiting

Reset requests are rate-limited per email (max 3 per hour) to prevent using the reset-email flow as a spam/harassment vector against a victim's inbox.

---

## 12. Email Verification Architecture

### 12.1 Flow

```
1. On registration, Supabase Auth sends a verification email with a
   signed, time-limited link
2. Clicking the link hits a Supabase-hosted (or backend-proxied) verify
   endpoint → Supabase marks auth.users.email_confirmed_at
3. Backend syncs this to public.users.email_verified via a Supabase Auth
   webhook (auth event: user.updated) — kept as a webhook-driven sync
   rather than checked live against Supabase on every request, so the
   JWT claim in §4.1 stays a fast local read
4. Next token issuance (login/refresh) picks up the updated verification
   status in its claims
```

### 12.2 Resend verification

`POST /auth/verify-email/resend` — rate-limited (max 3 per hour per account) — re-triggers the Supabase verification email for users who missed/lost the original.

### 12.3 What verification gates

As established in §2.2: core CRM usage is never blocked, but the following require `email_verified: true`:
- Inviting other team members
- Managing billing/subscription
- Creating API keys
- Enabling custom roles

This list mirrors "actions that affect other people or money" — exactly the set where confirming the account owner is a real, reachable person matters most.

---

## 13. Two-Factor Authentication (2FA / MFA)

### 13.1 Method: TOTP (Time-based One-Time Password)

Chosen over SMS-based 2FA deliberately — SMS is vulnerable to SIM-swapping and carries per-message cost at scale; TOTP (Google Authenticator, Authy, 1Password, etc.) is free, more secure, and is what Supabase Auth natively supports as a first-class MFA factor.

### 13.2 Enrollment flow

```
1. POST /auth/mfa/enroll → backend requests a TOTP factor from Supabase Auth
   → returns a QR code (otpauth:// URI) + manual entry secret
2. User scans QR in their authenticator app, then
   POST /auth/mfa/enroll/verify { code } to prove they've set it up correctly
   before it's activated (prevents a user locking themselves out with a
   miscopied secret)
3. On successful verification: Supabase marks the factor 'verified'
   AND the backend generates 10 single-use backup codes
   (hashed and stored, same pattern as passwords/API keys — shown once)
```

### 13.3 Login-time verification

As described in §3.1 step 3: after primary credential verification, if the user has a verified MFA factor, the backend issues a short-lived `mfa_challenge_token` instead of a full session, and requires:
```
POST /auth/mfa/verify { mfa_challenge_token, code }
   → validated against Supabase Auth's TOTP factor
   → on success: full session JWT + refresh token issued, `mfa_verified: true` claim set
   → on failure: standard rate-limited retry (5 attempts, then challenge token invalidated,
     forcing a fresh login)
```

### 13.4 Backup codes

`POST /auth/mfa/verify-backup-code` provides an alternate path if the user's authenticator device is unavailable — each backup code is single-use (marked consumed on use) and the user is prompted to regenerate a fresh set once they've used more than half.

### 13.5 Organization-enforced MFA (enterprise control)

Enterprise-tier orgs can set an org-level setting `require_mfa: true` — enforced at login: if a member without a verified MFA factor attempts to log in to an org with this policy, they're routed to mandatory enrollment (§13.2) before a session is issued, rather than merely nudged. This is a common enterprise procurement requirement and is designed as a policy flag layered on top of the same MFA mechanism, not a separate system.

### 13.6 MFA and account recovery balance

Losing both the authenticator device and all backup codes is handled via a **manual, audit-logged support-assisted recovery** (identity re-verification outside the automated flow) rather than an automated backdoor — an automated "reset MFA via email" would defeat the entire purpose of having a second factor.

---

## 14. Consolidated Threat Model Summary

| Threat | Mitigation |
|---|---|
| Stolen access token | 15-minute lifetime caps blast radius; cannot be used past expiry regardless of refresh token state |
| Stolen refresh token | Rotation + reuse detection (§5.3) — a replayed old token triggers full family revocation |
| Cross-tenant data access via app bug | RLS at the database layer independently enforces tenant boundary (§7.1) |
| Privilege escalation via forged claims | JWT is signed (RS256); any tampering invalidates signature; role changes propagate via `role_version` invalidation, not trusted client state |
| Credential stuffing / brute force | Per-account and per-IP rate limiting, progressive CAPTCHA (§3.2) |
| Account enumeration | Generic responses on login failure and password-reset request (§3.1, §11.1) |
| Stolen API key | Hash-only storage, scoped permissions, instant revocation, expiry policies (§8) |
| Compromised password | Password reset forces full session revocation across all devices (§11.1) |
| SIM-swap / phishing of 2FA | TOTP over SMS; backup codes single-use; org-enforced MFA available (§13) |
| Insider/offboarding risk | Admin-forced session revocation; last-owner protection prevents accidental lockout of the whole org (§10.3, and earlier RBAC design) |

---

## 15. Summary: Endpoints This Architecture Requires

*(Already specified in full in the Enterprise API Architecture document, §1 and §15; restated here only as a cross-reference so this document is self-contained for security review purposes.)*

- Registration, Login, Refresh, Logout, Select-Organization, Invite-Accept, Password Reset (request/confirm), Get Session
- Session management: list sessions, revoke session, revoke-all-others
- Email verification: resend, (verify itself is Supabase-hosted)
- MFA: enroll, enroll-verify, verify (login-time), verify-backup-code
- API Keys: create, list, revoke (module-gated under `api_keys.manage`)

---

**Next recommended step, per your workflow rules:** confirm this authentication and authorization architecture (or flag anything to adjust — particularly refresh token rotation policy and MFA enforcement rules, since those are the hardest to change after real user sessions exist). Once confirmed, I'll implement the Auth module first, in this order: (1) database migrations for `refresh_tokens` and MFA-related columns not yet in the schema, (2) `core/security.py` (JWT signing/verification utilities), (3) `modules/auth/` (router, schemas, service, repository) — with exact file paths called out against our locked folder structure before any file is created.
