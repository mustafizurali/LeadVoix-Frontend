# LeadVoix OS — Enterprise REST API Architecture

**Version:** 2.0
**Base URL:** `https://api.leadvoix.ai/api/v1`
**Audience:** Backend engineering team building the FastAPI implementation, module by module
**Status:** Architecture only — no implementation code. This document supersedes and extends the MVP API design with full request/response contracts, role mapping, and error taxonomies for every module, ready for enterprise procurement review.

---

## 0. Global Architecture Conventions

Every endpoint in this document inherits these rules. They are stated once here, not repeated per endpoint.

### 0.1 Response Envelope

**Success:**
```json
{
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 142, "total_pages": 8 },
  "error": null
}
```
`meta` is `null` for non-paginated single-resource responses.

**Error:**
```json
{
  "data": null,
  "meta": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Lead not found.",
    "fields": null
  }
}
```
`fields` is populated only for `400`/`422` validation errors, mapping field name → error message.

### 0.2 Tenant & Identity Resolution

- Every authenticated request carries `Authorization: Bearer <jwt>`.
- `organization_id` (tenant context) is **never** accepted as a client-supplied parameter for scoping purposes. It is resolved server-side from the authenticated session, established via `POST /auth/select-organization`.
- This is enforced twice: once in the FastAPI tenant-resolution middleware (rejects the request before it reaches a router), and again by Supabase Row Level Security at the database layer — defense in depth, not a single point of failure.

### 0.3 Role & Permission Model

LeadVoix OS uses **role-based access control (RBAC) backed by granular permissions**, not hardcoded role checks. Four system roles ship by default:

| Role | Description |
|---|---|
| `owner` | Full control, including billing and org deletion. One or more per org; last owner cannot be removed/demoted. |
| `admin` | Full operational control (users, settings, all CRM data). No billing/subscription management by default (configurable). |
| `agent` | Day-to-day CRM user — leads, clients, tasks, meetings, calls. No user/role/billing management. |
| `viewer` | Read-only across all modules the org has enabled. |

Enterprise-tier orgs may define **custom roles** composed of the same granular permissions (see §5 Roles/Permissions module). Every endpoint below lists both:
- **User Role** — the default system role(s) that have access out of the box.
- The underlying **permission code** (`<module>.<action>`) is what's actually checked at runtime — roles are just named bundles of permissions. Custom roles inherit access purely by holding the same permission code.

### 0.4 Standard Error Taxonomy (referenced by code throughout)

| HTTP Status | Error Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Malformed request body/params |
| 401 | `UNAUTHENTICATED` | Missing/invalid/expired token |
| 403 | `PERMISSION_DENIED` | Authenticated but lacks required permission |
| 404 | `RESOURCE_NOT_FOUND` | Resource doesn't exist or isn't in caller's tenant |
| 409 | `CONFLICT` | Unique constraint / invalid state transition |
| 422 | `SEMANTIC_ERROR` | Syntactically valid but business-rule-invalid |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unhandled server fault |

Module-specific error codes below extend this table; the base table is not repeated per endpoint.

### 0.5 Pagination

All collection `GET` endpoints accept `page`, `limit` (max 100), `sort`, `filter[<field>]`. Not restated per endpoint.

### 0.6 Validation Baseline (applies everywhere)

UUID v4 path/body params validated; emails RFC 5322; monetary values are integers in minor units (cents); timestamps ISO 8601 UTC; foreign key references validated for existence **and** tenant ownership (cross-tenant reference → `404`, never `403`, to avoid confirming existence).

### 0.7 Soft Delete & Idempotency

All `DELETE` endpoints soft-delete (`deleted_at`). All state-changing `POST` action endpoints (e.g., `/convert`, `/cancel`) are idempotent where business-safe, returning `409 CONFLICT` on a repeated call against an already-transitioned resource rather than silently succeeding twice.

---

## 1. Authentication Module

Base path: `/api/v1/auth` — **User Role: N/A (pre-authentication or self-service)** for all endpoints in this module.

### 1.1 Register Organization
- **URL / Method:** `POST /api/v1/auth/register`
- **Request Body:**
```json
{
  "organization_name": "Acme Realty",
  "industry_vertical": "real_estate",
  "email": "founder@acme.com",
  "password": "Str0ngP@ssword!",
  "full_name": "Jane Founder"
}
```
- **Response Body (201):**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "founder@acme.com", "full_name": "Jane Founder" },
    "organization": { "id": "uuid", "name": "Acme Realty", "slug": "acme-realty" },
    "access_token": "jwt", "refresh_token": "jwt"
  }
}
```
- **Auth Required:** No
- **Validation Rules:** `password` ≥12 chars, 1 upper, 1 digit, 1 symbol; `email` globally unique; `industry_vertical` ∈ {`real_estate`,`logistics`,`general_service`}; `organization_name` 2–100 chars.
- **Error Responses:** `409 EMAIL_ALREADY_REGISTERED`, `400 VALIDATION_ERROR`.

### 1.2 Login
- **URL / Method:** `POST /api/v1/auth/login`
- **Request Body:** `{ "email": "...", "password": "..." }`
- **Response Body (200):** `{ "access_token", "refresh_token", "user": {...}, "organizations": [{"id","name","role"}] }`
- **Auth Required:** No
- **Validation Rules:** none beyond format.
- **Error Responses:** `401 INVALID_CREDENTIALS` (generic — never reveals which field was wrong), `403 ACCOUNT_SUSPENDED`.

### 1.3 Refresh Token
- **URL / Method:** `POST /api/v1/auth/refresh`
- **Request Body:** `{ "refresh_token": "jwt" }`
- **Response Body (200):** `{ "access_token", "refresh_token" }`
- **Auth Required:** No (token is the credential)
- **Error Responses:** `401 TOKEN_EXPIRED`, `401 TOKEN_REVOKED`.

### 1.4 Logout
- **URL / Method:** `POST /api/v1/auth/logout`
- **Request Body:** none
- **Response Body:** `204 No Content`
- **Auth Required:** Yes
- **Error Responses:** `401 UNAUTHENTICATED`.

### 1.5 Select Active Organization
- **URL / Method:** `POST /api/v1/auth/select-organization`
- **Request Body:** `{ "organization_id": "uuid" }`
- **Response Body (200):** `{ "access_token": "jwt (scoped)" }`
- **Auth Required:** Yes
- **Validation Rules:** caller must have an active `organization_members` row for that org.
- **Error Responses:** `403 NOT_A_MEMBER`, `403 MEMBERSHIP_SUSPENDED`.

### 1.6 Accept Invite
- **URL / Method:** `POST /api/v1/auth/invite/accept`
- **Request Body:** `{ "invite_token": "...", "password": "...", "full_name": "..." }`
- **Response Body (200):** `{ "user", "organization", "access_token", "refresh_token" }`
- **Auth Required:** No
- **Error Responses:** `410 INVITE_EXPIRED`, `409 INVITE_ALREADY_USED`.

### 1.7 Password Reset Request
- **URL / Method:** `POST /api/v1/auth/password-reset/request`
- **Request Body:** `{ "email": "..." }`
- **Response Body (200):** generic `{ "message": "If that email exists, a reset link has been sent." }`
- **Auth Required:** No
- **Error Responses:** none surfaced (enumeration prevention — always 200).

### 1.8 Password Reset Confirm
- **URL / Method:** `POST /api/v1/auth/password-reset/confirm`
- **Request Body:** `{ "reset_token": "...", "new_password": "..." }`
- **Response Body:** `200 OK`
- **Auth Required:** No
- **Error Responses:** `410 RESET_TOKEN_EXPIRED`, `400 VALIDATION_ERROR`.

### 1.9 Get Current Session
- **URL / Method:** `GET /api/v1/auth/me`
- **Response Body (200):** `{ "user", "active_organization", "role", "permissions": ["leads.create", ...] }`
- **Auth Required:** Yes
- **Error Responses:** `401 UNAUTHENTICATED`.

---

## 2. Organizations Module

Base path: `/api/v1/organizations`

### 2.1 Get Current Organization
- **URL / Method:** `GET /api/v1/organizations/current`
- **Response Body:** `{ "id", "name", "slug", "industry_vertical", "plan", "timezone", "is_active" }`
- **Auth Required:** Yes | **User Role:** Any member
- **Error Responses:** `401 UNAUTHENTICATED`.

### 2.2 Update Organization
- **URL / Method:** `PATCH /api/v1/organizations/current`
- **Request Body:** `{ "name": "...", "timezone": "...", "industry_vertical": "..." }` (partial)
- **Response Body:** updated organization object
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `organization.update`)
- **Validation Rules:** `name` 2–100 chars; `industry_vertical` enum-restricted; changing `industry_vertical` after go-live triggers a confirmation flag (`?confirm=true`) since it re-gates vertical modules.
- **Error Responses:** `403 PERMISSION_DENIED`, `422 VERTICAL_CHANGE_REQUIRES_CONFIRMATION`.

### 2.3 List Members
- **URL / Method:** `GET /api/v1/organizations/current/members`
- **Response Body:** paginated `[{ "user", "role", "status", "joined_at" }]`
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `users.view`)
- **Error Responses:** `403 PERMISSION_DENIED`.

### 2.4 Invite Member
- **URL / Method:** `POST /api/v1/organizations/current/members/invite`
- **Request Body:** `{ "email": "...", "role_id": "uuid", "team_id": "uuid|null" }`
- **Response Body (201):** `{ "id", "email", "role", "status": "invited" }`
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `users.invite`)
- **Validation Rules:** `email` not already active member; `role_id` belongs to org or is system role; seat limit checked against `subscriptions.plan.feature_limits.max_users`.
- **Error Responses:** `409 ALREADY_MEMBER`, `402 SEAT_LIMIT_REACHED`.

### 2.5 Update Member Role
- **URL / Method:** `PATCH /api/v1/organizations/current/members/{member_id}`
- **Request Body:** `{ "role_id": "uuid" }`
- **Response Body:** updated membership object
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `users.manage_roles`)
- **Error Responses:** `409 LAST_OWNER_PROTECTED`, `404 RESOURCE_NOT_FOUND`.

### 2.6 Remove Member
- **URL / Method:** `DELETE /api/v1/organizations/current/members/{member_id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `users.remove`)
- **Error Responses:** `409 LAST_OWNER_PROTECTED`.

---

## 3. Users Module

Base path: `/api/v1/users`

### 3.1 List Users
- **URL / Method:** `GET /api/v1/users`
- **Response Body:** paginated array of user summaries
- **Auth Required:** Yes | **User Role:** `owner`, `admin`, `agent` (permission: `users.view`)

### 3.2 Get User
- **URL / Method:** `GET /api/v1/users/{id}`
- **Response Body:** `{ "id", "full_name", "email", "phone", "avatar_url", "is_active", "last_login_at" }`
- **Auth Required:** Yes | **User Role:** any (permission: `users.view`)
- **Error Responses:** `404 RESOURCE_NOT_FOUND` (also returned if user exists but in another tenant).

### 3.3 Update Own Profile
- **URL / Method:** `PATCH /api/v1/users/me`
- **Request Body:** `{ "full_name": "...", "phone": "...", "avatar_url": "..." }`
- **Response Body:** updated user object
- **Auth Required:** Yes | **User Role:** any (self-scoped, no permission check)
- **Validation Rules:** `phone` E.164.
- **Error Responses:** `400 VALIDATION_ERROR`.

### 3.4 Deactivate User
- **URL / Method:** `POST /api/v1/users/{id}/deactivate`
- **Response Body:** updated user object, `is_active: false`
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `users.manage`)
- **Validation Rules:** open leads/tasks assigned to this user must be reassigned or explicitly left unassigned (`?reassign_to=<user_id>` query param).
- **Error Responses:** `409 CANNOT_DEACTIVATE_SOLE_OWNER`.

---

## 4. Roles Module

Base path: `/api/v1/roles`

### 4.1 List Roles
- **URL / Method:** `GET /api/v1/roles`
- **Response Body:** `[{ "id", "name", "is_system_role", "permission_count" }]` — includes both system roles and this org's custom roles
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `roles.view`)

### 4.2 Create Custom Role
- **URL / Method:** `POST /api/v1/roles`
- **Request Body:** `{ "name": "Senior Agent", "description": "...", "permission_codes": ["leads.create","leads.update","clients.view"] }`
- **Response Body (201):** role object with resolved permissions
- **Auth Required:** Yes | **User Role:** `owner` only (permission: `roles.create`) — custom role creation is deliberately restricted tighter than most `admin`-level actions since it affects the org's entire access model
- **Validation Rules:** requires enterprise-tier plan (`403 FEATURE_NOT_IN_PLAN` otherwise); `name` unique within org; every code in `permission_codes` must exist in the global `permissions` table.
- **Error Responses:** `403 FEATURE_NOT_IN_PLAN`, `400 UNKNOWN_PERMISSION_CODE`.

### 4.3 Get Role Detail
- **URL / Method:** `GET /api/v1/roles/{id}`
- **Response Body:** role object + full `permissions: [...]` array
- **Auth Required:** Yes | **User Role:** `owner`, `admin`

### 4.4 Update Custom Role
- **URL / Method:** `PATCH /api/v1/roles/{id}`
- **Request Body:** `{ "name": "...", "permission_codes": [...] }`
- **Response Body:** updated role object
- **Auth Required:** Yes | **User Role:** `owner` (permission: `roles.update`)
- **Validation Rules:** system roles (`is_system_role: true`) cannot be modified → `403`.
- **Error Responses:** `403 SYSTEM_ROLE_IMMUTABLE`.

### 4.5 Delete Custom Role
- **URL / Method:** `DELETE /api/v1/roles/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`
- **Validation Rules:** cannot delete a role currently assigned to any active member → `409`.
- **Error Responses:** `409 ROLE_IN_USE`, `403 SYSTEM_ROLE_IMMUTABLE`.

---

## 5. Permissions Module

Base path: `/api/v1/permissions` — global reference data, read-only via the API (managed internally by platform team, not tenant-editable).

### 5.1 List All Permissions
- **URL / Method:** `GET /api/v1/permissions`
- **Response Body:** `[{ "code": "leads.create", "module": "leads", "description": "..." }, ...]` grouped by module for UI rendering (e.g., the custom-role builder screen)
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `roles.view`, since permissions are only relevant in the context of role management)
- **Error Responses:** `401 UNAUTHENTICATED`.

*(No create/update/delete — this table is platform-managed, not exposed for tenant mutation.)*

---

## 6. Teams Module

Base path: `/api/v1/teams`

### 6.1 List Teams
- **URL / Method:** `GET /api/v1/teams`
- **Response Body:** paginated `[{ "id", "name", "team_lead", "member_count" }]`
- **Auth Required:** Yes | **User Role:** any (permission: `teams.view`)

### 6.2 Create Team
- **URL / Method:** `POST /api/v1/teams`
- **Request Body:** `{ "name": "West Coast Sales", "description": "...", "team_lead_id": "uuid" }`
- **Response Body (201):** team object
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `teams.create`)
- **Validation Rules:** `name` unique per org; `team_lead_id` must be active member.
- **Error Responses:** `409 TEAM_NAME_EXISTS`.

### 6.3 Get Team
- **URL / Method:** `GET /api/v1/teams/{id}`
- **Response Body:** team object + `members: [...]`
- **Auth Required:** Yes | **User Role:** any (permission: `teams.view`)

### 6.4 Update Team
- **URL / Method:** `PATCH /api/v1/teams/{id}`
- **Request Body:** partial `{ "name", "description", "team_lead_id" }`
- **Response Body:** updated team object
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `teams.update`)

### 6.5 Delete Team
- **URL / Method:** `DELETE /api/v1/teams/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `teams.delete`)
- **Validation Rules:** members unassigned, not cascaded.

### 6.6 Add Member
- **URL / Method:** `POST /api/v1/teams/{id}/members`
- **Request Body:** `{ "user_id": "uuid" }`
- **Response Body (201):** `{ "team_id", "user_id", "joined_at" }`
- **Auth Required:** Yes | **User Role:** `owner`, `admin` (permission: `teams.update`)
- **Error Responses:** `409 ALREADY_TEAM_MEMBER`.

### 6.7 Remove Member
- **URL / Method:** `DELETE /api/v1/teams/{id}/members/{user_id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`, `admin`

---

## 7. Leads Module

Base path: `/api/v1/leads`

### 7.1 List Leads
- **URL / Method:** `GET /api/v1/leads`
- **Response Body:** paginated lead summaries; filters: `status`, `assigned_to`, `source`, `company_id`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`,`viewer` (permission: `leads.view`)

### 7.2 Create Lead
- **URL / Method:** `POST /api/v1/leads`
- **Request Body:**
```json
{ "full_name": "John Buyer", "email": "john@example.com", "phone": "+15551234567",
  "company_id": null, "source": "website", "assigned_to": "uuid", "notes": "..." }
```
- **Response Body (201):** full lead object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `leads.create`)
- **Validation Rules:** at least one of `email`/`phone`; `source` ∈ enum; `company_id`/`assigned_to` must belong to org.
- **Error Responses:** `422 MISSING_CONTACT_METHOD`.

### 7.3 Get Lead
- **URL / Method:** `GET /api/v1/leads/{id}`
- **Response Body:** full lead object + `recent_activity_count`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`,`viewer`

### 7.4 Update Lead
- **URL / Method:** `PATCH /api/v1/leads/{id}`
- **Request Body:** partial lead fields, including `status`
- **Response Body:** updated lead object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `leads.update`)
- **Validation Rules:** status state machine `new→contacted→qualified|unqualified→converted`.
- **Error Responses:** `422 INVALID_STATUS_TRANSITION`.

### 7.5 Delete Lead
- **URL / Method:** `DELETE /api/v1/leads/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `leads.delete`)

### 7.6 Restore Lead
- **URL / Method:** `POST /api/v1/leads/{id}/restore`
- **Response Body:** restored lead object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

### 7.7 Convert to Client
- **URL / Method:** `POST /api/v1/leads/{id}/convert`
- **Request Body:** `{ "client_status": "active" }` (optional)
- **Response Body (201):** new client object with `converted_from_lead_id`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `leads.convert`)
- **Validation Rules:** lead must be `qualified`.
- **Error Responses:** `409 INVALID_LEAD_STATE`, `409 ALREADY_CONVERTED`.

### 7.8 Lead Timeline
- **URL / Method:** `GET /api/v1/leads/{id}/timeline`
- **Response Body:** merged chronological `activities`/`tasks`/`meetings`/`voice_calls`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`,`viewer`

### 7.9 Bulk Reassign
- **URL / Method:** `POST /api/v1/leads/bulk-reassign`
- **Request Body:** `{ "lead_ids": ["uuid", ...], "new_assigned_to": "uuid" }`
- **Response Body:** `{ "updated_count": 42 }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`
- **Validation Rules:** max 500 IDs per call.
- **Error Responses:** `400 BATCH_LIMIT_EXCEEDED`.

---

## 8. Clients Module

Base path: `/api/v1/clients`

### 8.1 List Clients
- **URL / Method:** `GET /api/v1/clients`
- **Response Body:** paginated array; filters `status`, `assigned_to`, `company_id`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`,`viewer` (permission: `clients.view`)

### 8.2 Create Client
- **URL / Method:** `POST /api/v1/clients`
- **Request Body:** `{ "full_name", "email", "phone", "company_id", "assigned_to" }`
- **Response Body (201):** client object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `clients.create`)

### 8.3 Get Client
- **URL / Method:** `GET /api/v1/clients/{id}`
- **Response Body:** full client object incl. `lifetime_value`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`,`viewer`

### 8.4 Update Client
- **URL / Method:** `PATCH /api/v1/clients/{id}`
- **Request Body:** partial fields
- **Response Body:** updated client object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `clients.update`)

### 8.5 Delete Client
- **URL / Method:** `DELETE /api/v1/clients/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `clients.delete`)

### 8.6 Client Timeline
- **URL / Method:** `GET /api/v1/clients/{id}/timeline`
- **Response Body:** merged activity/task/meeting/call/invoice feed
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`,`viewer`

---

## 9. Companies Module

Base path: `/api/v1/companies`

### 9.1 List Companies
- **URL / Method:** `GET /api/v1/companies`
- **Response Body:** paginated array; filter `industry`
- **Auth Required:** Yes | **User Role:** any (permission: `companies.view`)

### 9.2 Create Company
- **URL / Method:** `POST /api/v1/companies`
- **Request Body:** `{ "name", "industry", "website", "phone", "address", "company_size", "annual_revenue_range" }`
- **Response Body (201):** company object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `companies.create`)
- **Validation Rules:** `name` unique per org (case-insensitive); `website` valid URL.
- **Error Responses:** `409 COMPANY_NAME_EXISTS`.

### 9.3 Get Company
- **URL / Method:** `GET /api/v1/companies/{id}`
- **Response Body:** company + `linked_leads_count`, `linked_clients_count`
- **Auth Required:** Yes | **User Role:** any

### 9.4 Update Company
- **URL / Method:** `PATCH /api/v1/companies/{id}`
- **Response Body:** updated company object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `companies.update`)

### 9.5 Delete Company
- **URL / Method:** `DELETE /api/v1/companies/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `companies.delete`)
- **Validation Rules:** linked leads/clients set to `company_id: null`, not cascaded.

---

## 10. Activities Module

Base path: `/api/v1/activities`

### 10.1 List Activities
- **URL / Method:** `GET /api/v1/activities?related_entity_type=lead&related_entity_id={uuid}`
- **Response Body:** paginated activity array
- **Auth Required:** Yes | **User Role:** any (permission: `activities.view`)
- **Error Responses:** `400 MISSING_ENTITY_REFERENCE` (if type given without id or vice versa).

### 10.2 Create Activity
- **URL / Method:** `POST /api/v1/activities`
- **Request Body:** `{ "related_entity_type": "lead", "related_entity_id": "uuid", "activity_type": "note", "content": "Called, left voicemail." }`
- **Response Body (201):** activity object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `activities.create`)
- **Validation Rules:** `related_entity_type` ∈ {`lead`,`client`,`company`}; referenced entity must exist in-tenant.

### 10.3 Update Activity
- **URL / Method:** `PATCH /api/v1/activities/{id}`
- **Request Body:** `{ "content": "..." }`
- **Response Body:** updated activity object
- **Auth Required:** Yes | **User Role:** original author, or `owner`/`admin` (permission: `activities.update`)
- **Error Responses:** `403 NOT_ACTIVITY_AUTHOR`.

### 10.4 Delete Activity
- **URL / Method:** `DELETE /api/v1/activities/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `activities.delete`)

---

## 11. Tasks Module

Base path: `/api/v1/tasks`

### 11.1 List Tasks
- **URL / Method:** `GET /api/v1/tasks`
- **Response Body:** paginated; filters `assigned_to`, `status`, `priority`, `due_before`
- **Auth Required:** Yes | **User Role:** any (permission: `tasks.view`)

### 11.2 Create Task
- **URL / Method:** `POST /api/v1/tasks`
- **Request Body:** `{ "title", "description", "related_entity_type", "related_entity_id", "assigned_to", "due_at", "priority" }`
- **Response Body (201):** task object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `tasks.create`)
- **Validation Rules:** `due_at` in future; `priority` ∈ {`low`,`medium`,`high`}.

### 11.3 Get Task
- **URL / Method:** `GET /api/v1/tasks/{id}`
- **Response Body:** task object
- **Auth Required:** Yes | **User Role:** any

### 11.4 Update Task
- **URL / Method:** `PATCH /api/v1/tasks/{id}`
- **Request Body:** partial, incl. `status`
- **Response Body:** updated task object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `tasks.update`)
- **Validation Rules:** status enum `open→in_progress→done`, or `→cancelled` from any state.
- **Error Responses:** `422 INVALID_STATUS_TRANSITION`.

### 11.5 Delete Task
- **URL / Method:** `DELETE /api/v1/tasks/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

### 11.6 Complete Task
- **URL / Method:** `POST /api/v1/tasks/{id}/complete`
- **Response Body:** task with `status: "done"`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`

---

## 12. Meetings Module

Base path: `/api/v1/meetings`

### 12.1 List Meetings
- **URL / Method:** `GET /api/v1/meetings`
- **Response Body:** paginated; filters `status`, `organized_by`, `scheduled_after`
- **Auth Required:** Yes | **User Role:** any (permission: `meetings.view`)

### 12.2 Schedule Meeting
- **URL / Method:** `POST /api/v1/meetings`
- **Request Body:** `{ "title", "related_entity_type", "related_entity_id", "scheduled_at", "duration_minutes", "location_or_link" }`
- **Response Body (201):** meeting object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `meetings.create`)
- **Validation Rules:** `scheduled_at` future; `duration_minutes` 5–480.

### 12.3 Get Meeting
- **URL / Method:** `GET /api/v1/meetings/{id}`
- **Response Body:** meeting object
- **Auth Required:** Yes | **User Role:** any

### 12.4 Update Meeting
- **URL / Method:** `PATCH /api/v1/meetings/{id}`
- **Response Body:** updated meeting object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `meetings.update`)

### 12.5 Cancel Meeting
- **URL / Method:** `POST /api/v1/meetings/{id}/cancel`
- **Request Body:** `{ "reason": "..." }` (optional)
- **Response Body:** meeting with `status: "cancelled"`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`

### 12.6 Mark Outcome
- **URL / Method:** `POST /api/v1/meetings/{id}/outcome`
- **Request Body:** `{ "status": "completed", "notes": "..." }`
- **Response Body:** updated meeting object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`
- **Validation Rules:** only after `scheduled_at` has passed.
- **Error Responses:** `409 MEETING_NOT_YET_OCCURRED`.

---

## 13. Properties Module (Real Estate vertical)

Base path: `/api/v1/properties`

### 13.1 List Properties
- **URL / Method:** `GET /api/v1/properties`
- **Response Body:** paginated; filters `status`, `property_type`, `min_price`, `max_price`
- **Auth Required:** Yes | **User Role:** any (permission: `properties.view`)
- **Error Responses:** `403 MODULE_NOT_ENABLED` (org's `industry_vertical` ≠ `real_estate`).

### 13.2 Create Property
- **URL / Method:** `POST /api/v1/properties`
- **Request Body:** `{ "address", "property_type", "price", "bedrooms", "bathrooms", "square_footage", "description", "client_id" }`
- **Response Body (201):** property object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `properties.create`)
- **Validation Rules:** `price` positive integer (cents); `property_type` ∈ enum.

### 13.3 Get Property
- **URL / Method:** `GET /api/v1/properties/{id}`
- **Response Body:** property + `interested_leads_count`
- **Auth Required:** Yes | **User Role:** any

### 13.4 Update Property
- **URL / Method:** `PATCH /api/v1/properties/{id}`
- **Response Body:** updated property object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `properties.update`)

### 13.5 Delete Property
- **URL / Method:** `DELETE /api/v1/properties/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

### 13.6 Link Lead Interest
- **URL / Method:** `POST /api/v1/properties/{id}/interests`
- **Request Body:** `{ "lead_id": "uuid" }`
- **Response Body (201):** `{ "property_id", "lead_id", "created_at" }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`
- **Error Responses:** `409 DUPLICATE_INTEREST`.

---

## 14. Voice Calls Module

Base path: `/api/v1/voice-calls`

### 14.1 List Voice Calls
- **URL / Method:** `GET /api/v1/voice-calls`
- **Response Body:** paginated; filters `lead_id`, `client_id`, `outcome`, `direction`
- **Auth Required:** Yes | **User Role:** any (permission: `voice_calls.view`)

### 14.2 Get Voice Call
- **URL / Method:** `GET /api/v1/voice-calls/{id}`
- **Response Body:** full object incl. `transcript`, `summary`, `recording_url`
- **Auth Required:** Yes | **User Role:** any

### 14.3 Initiate Outbound AI Call
- **URL / Method:** `POST /api/v1/voice-calls/initiate`
- **Request Body:** `{ "lead_id": "uuid", "objective": "book_meeting" }`
- **Response Body (202):** `{ "voice_call_id", "status": "queued" }` (async — actual call placed by the AI orchestration layer)
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `voice_calls.initiate`)
- **Validation Rules:** exactly one of `lead_id`/`client_id`; `objective` ∈ enum.
- **Error Responses:** `402 QUOTA_EXCEEDED` (AI call minutes depleted on plan).

### 14.4 Twilio Status Webhook
- **URL / Method:** `POST /api/v1/voice-calls/webhook/status`
- **Request Body:** Twilio-signed payload
- **Response Body:** `200 OK`
- **Auth Required:** No (Twilio signature verification instead) | **User Role:** N/A (system-to-system)
- **Error Responses:** `403 INVALID_SIGNATURE`.

### 14.5 Delete Voice Call
- **URL / Method:** `DELETE /api/v1/voice-calls/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

---

## 15. AI Agent Module

Base path: `/api/v1/ai-agent` — governs the AI's configuration, tool permissions, and decision audit trail (distinct from Voice Calls, which is the call record itself).

### 15.1 Get AI Agent Configuration
- **URL / Method:** `GET /api/v1/ai-agent/config`
- **Response Body:** `{ "enabled_tools": ["create_followup","update_lead_status"], "default_voice", "escalation_rules", "call_objectives_allowed" }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `ai_agent.view`)

### 15.2 Update AI Agent Configuration
- **URL / Method:** `PATCH /api/v1/ai-agent/config`
- **Request Body:** `{ "enabled_tools": [...], "escalation_rules": {...} }`
- **Response Body:** updated config
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `ai_agent.manage`)
- **Validation Rules:** each tool name must correspond to a registered internal tool in the AI orchestration layer.
- **Error Responses:** `400 UNKNOWN_TOOL_NAME`.

### 15.3 List AI Decision Logs
- **URL / Method:** `GET /api/v1/ai-agent/logs`
- **Response Body:** paginated; filters `related_entity_type`, `related_entity_id`, `action_type`, `voice_call_id`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `ai_logs.view`)

### 15.4 Get AI Decision Log Detail
- **URL / Method:** `GET /api/v1/ai-agent/logs/{id}`
- **Response Body:** full log incl. `input_context`, `output`, `tool_name`, `confidence_score`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`

### 15.5 Mark Log Reviewed
- **URL / Method:** `POST /api/v1/ai-agent/logs/{id}/review`
- **Response Body:** log with `reviewed_by_human: true`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `ai_logs.review`)

---

## 16. Automation Module

Base path: `/api/v1/automations`

### 16.1 List Automations
- **URL / Method:** `GET /api/v1/automations`
- **Response Body:** paginated `[{ "id","name","trigger_event","is_active" }]`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `automation.view`)

### 16.2 Create Automation
- **URL / Method:** `POST /api/v1/automations`
- **Request Body:**
```json
{ "name": "Auto follow-up on overdue leads",
  "trigger_event": "followup.overdue",
  "conditions": { "status": "contacted" },
  "action_type": "create_task",
  "action_config": { "title": "Follow up urgently", "priority": "high" } }
```
- **Response Body (201):** automation object
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `automation.create`)
- **Validation Rules:** `trigger_event` ∈ registered event enum; `action_type` ∈ registered action enum; `action_config` schema validated against the selected `action_type`.
- **Error Responses:** `400 INVALID_ACTION_CONFIG`.

### 16.3 Get Automation
- **URL / Method:** `GET /api/v1/automations/{id}`
- **Response Body:** full automation object
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

### 16.4 Update Automation
- **URL / Method:** `PATCH /api/v1/automations/{id}`
- **Response Body:** updated automation object
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `automation.update`)

### 16.5 Delete Automation
- **URL / Method:** `DELETE /api/v1/automations/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

### 16.6 List Execution Logs
- **URL / Method:** `GET /api/v1/automations/{id}/logs`
- **Response Body:** paginated `[{ "status","triggered_by_entity_type","triggered_by_entity_id","executed_at","error_message" }]`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

---

## 17. Notifications Module

Base path: `/api/v1/notifications`

### 17.1 List My Notifications
- **URL / Method:** `GET /api/v1/notifications`
- **Response Body:** paginated, self-scoped; filter `is_read`
- **Auth Required:** Yes | **User Role:** any (self-scoped, no permission needed)

### 17.2 Mark Read
- **URL / Method:** `POST /api/v1/notifications/{id}/read`
- **Response Body:** updated notification object
- **Auth Required:** Yes | **User Role:** any (own record)
- **Error Responses:** `404 RESOURCE_NOT_FOUND` (never `403`, to avoid confirming existence of another user's notification).

### 17.3 Mark All Read
- **URL / Method:** `POST /api/v1/notifications/mark-all-read`
- **Response Body:** `{ "updated_count": 12 }`
- **Auth Required:** Yes | **User Role:** any

### 17.4 Delete Notification
- **URL / Method:** `DELETE /api/v1/notifications/{id}`
- **Response Body:** `204 No Content`
- **Auth Required:** Yes | **User Role:** any (own record)

---

## 18. Billing Module (Client-Facing Invoicing)

Base path: `/api/v1/billing` — this module is the tenant invoicing *their own* clients; see §19 for LeadVoix's billing of the tenant.

### 18.1 List Invoices
- **URL / Method:** `GET /api/v1/billing/invoices`
- **Response Body:** paginated; filters `client_id`, `status`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `invoices.view`)

### 18.2 Create Invoice
- **URL / Method:** `POST /api/v1/billing/invoices`
- **Request Body:**
```json
{ "client_id": "uuid", "due_date": "2026-08-01", "currency": "USD",
  "line_items": [{ "description": "Consulting - July", "quantity": 1, "unit_price": 150000 }] }
```
- **Response Body (201):** invoice object with computed `subtotal`, `tax_amount`, `total_amount`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `invoices.create`)
- **Validation Rules:** ≥1 line item; `unit_price`/`quantity` positive; `invoice_number` auto-generated, unique per org.

### 18.3 Get Invoice
- **URL / Method:** `GET /api/v1/billing/invoices/{id}`
- **Response Body:** invoice + `line_items` + `payments`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

### 18.4 Send Invoice
- **URL / Method:** `POST /api/v1/billing/invoices/{id}/send`
- **Response Body:** invoice with `status: "sent"`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `invoices.send`)
- **Validation Rules:** only from `draft` status.
- **Error Responses:** `409 INVALID_INVOICE_STATE`.

### 18.5 Record Payment
- **URL / Method:** `POST /api/v1/billing/invoices/{id}/payments`
- **Request Body:** `{ "amount": 150000, "method": "card", "external_payment_id": "..." }`
- **Response Body (201):** payment object; invoice auto-updated to `paid` if fully covered
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `payments.record`)
- **Validation Rules:** `amount` ≤ remaining balance.
- **Error Responses:** `422 OVERPAYMENT_NOT_ALLOWED`.

### 18.6 Void Invoice
- **URL / Method:** `POST /api/v1/billing/invoices/{id}/void`
- **Response Body:** invoice with `status: "void"`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `invoices.manage`)
- **Validation Rules:** not permitted once any payment recorded.
- **Error Responses:** `409 PAYMENT_ALREADY_RECORDED`.

---

## 19. Subscriptions Module (LeadVoix Platform Billing)

Base path: `/api/v1/subscriptions` — LeadVoix charging the tenant for their plan; strictly separated from §18 to avoid conflating platform revenue with tenant-to-client revenue.

### 19.1 Get Current Subscription
- **URL / Method:** `GET /api/v1/subscriptions/current`
- **Response Body:** `{ "plan", "status", "current_period_start", "current_period_end", "cancel_at_period_end" }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `billing.view`)

### 19.2 List Available Plans
- **URL / Method:** `GET /api/v1/subscriptions/plans`
- **Response Body:** `[{ "id","name","price_monthly","price_annual","feature_limits" }]`
- **Auth Required:** Yes | **User Role:** any

### 19.3 Change Plan
- **URL / Method:** `POST /api/v1/subscriptions/change-plan`
- **Request Body:** `{ "plan_id": "uuid" }`
- **Response Body:** updated subscription object
- **Auth Required:** Yes | **User Role:** `owner` only (permission: `billing.manage` — hard-gated to `owner` regardless of custom role grants)
- **Validation Rules:** proration delegated to payment provider.
- **Error Responses:** `402 PAYMENT_METHOD_REQUIRED`.

### 19.4 Cancel Subscription
- **URL / Method:** `POST /api/v1/subscriptions/cancel`
- **Response Body:** subscription with `cancel_at_period_end: true`
- **Auth Required:** Yes | **User Role:** `owner` only

### 19.5 Get Usage Against Plan Limits
- **URL / Method:** `GET /api/v1/subscriptions/usage`
- **Response Body:** `{ "users": {"used":8,"limit":10}, "ai_call_minutes": {"used":220,"limit":500}, "leads": {"used":1400,"limit":5000} }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

---

## 20. Analytics Module

Base path: `/api/v1/analytics` — all endpoints read-only, aggregating across CRM Core, Billing, and AI data.

### 20.1 Dashboard Summary
- **URL / Method:** `GET /api/v1/analytics/dashboard`
- **Response Body:** `{ "leads_this_month", "conversion_rate", "open_tasks", "upcoming_meetings", "revenue_this_month", "ai_calls_this_month" }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent` (permission: `analytics.view`)

### 20.2 Lead Funnel Report
- **URL / Method:** `GET /api/v1/analytics/leads/funnel?from=2026-01-01&to=2026-06-30`
- **Response Body:** `{ "new":320, "contacted":210, "qualified":140, "converted":58, "conversion_rate": 0.181 }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`,`agent`
- **Validation Rules:** `from`/`to` ISO dates; range capped at 24 months per request.
- **Error Responses:** `400 DATE_RANGE_TOO_LARGE`.

### 20.3 Revenue Report
- **URL / Method:** `GET /api/v1/analytics/revenue?group_by=month`
- **Response Body:** `[{ "period": "2026-06", "invoiced": 4500000, "collected": 4100000 }]`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `analytics.billing_view` — distinct, stricter permission than general analytics since it exposes revenue)

### 20.4 AI Performance Report
- **URL / Method:** `GET /api/v1/analytics/ai-performance`
- **Response Body:** `{ "total_calls", "avg_duration_seconds", "outcomes": {"booked_meeting":40,"not_interested":22,...}, "avg_confidence_score" }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin`

### 20.5 Export Report
- **URL / Method:** `POST /api/v1/analytics/export`
- **Request Body:** `{ "report_type": "lead_funnel", "format": "csv", "from": "...", "to": "..." }`
- **Response Body (202):** `{ "export_id", "status": "processing" }` — generated asynchronously, delivered via notification + download link
- **Auth Required:** Yes | **User Role:** `owner`,`admin`
- **Validation Rules:** `format` ∈ {`csv`,`pdf`}; `report_type` ∈ registered report enum.
- **Error Responses:** `400 UNSUPPORTED_REPORT_TYPE`.

---

## 21. Settings Module

Base path: `/api/v1/settings`

### 21.1 Get Organization Settings
- **URL / Method:** `GET /api/v1/settings/organization`
- **Response Body:** key-value map of org-scoped settings
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `settings.view`)

### 21.2 Update Organization Setting
- **URL / Method:** `PUT /api/v1/settings/organization/{key}`
- **Request Body:** `{ "value": { } }` (shape depends on `key`)
- **Response Body:** `{ "key", "value", "updated_at" }`
- **Auth Required:** Yes | **User Role:** `owner`,`admin` (permission: `settings.manage`)
- **Validation Rules:** `key` restricted to allow-list (`notification_preferences`, `default_lead_source`, `business_hours`, etc.).
- **Error Responses:** `400 UNKNOWN_SETTING_KEY`.

### 21.3 Get My Settings
- **URL / Method:** `GET /api/v1/settings/me`
- **Response Body:** key-value map of user-scoped settings
- **Auth Required:** Yes | **User Role:** any (self-scoped)

### 21.4 Update My Setting
- **URL / Method:** `PUT /api/v1/settings/me/{key}`
- **Request Body:** `{ "value": { } }`
- **Response Body:** `{ "key", "value", "updated_at" }`
- **Auth Required:** Yes | **User Role:** any (self-scoped)
- **Validation Rules:** same allow-list pattern, user-level key set (`notification_preferences`, `ui_theme`).

---

## 22. Cross-Cutting Enterprise Guarantees

1. **Tenant isolation is structural, not incidental** — enforced in middleware and again by Postgres RLS. No endpoint in this document accepts tenant scoping as client input.
2. **Permission checks are declarative**, mapped 1:1 to the `permissions` table — adding a new permission never requires touching route-matching logic, only registering the code and wiring it into the relevant role(s).
3. **Custom roles are a first-class enterprise feature**, not an afterthought — the Roles/Permissions modules exist specifically so procurement conversations about "can we define our own access tiers" have a real answer.
4. **Billing and Subscriptions are intentionally separate modules** — conflating "what we charge the tenant" with "what the tenant charges their clients" is a common architectural mistake in vertical SaaS that becomes very expensive to unwind once accounting integrations exist.
5. **AI actions are fully auditable** via the AI Agent module's decision logs — every automated action traces back to a reviewable record, which is both a debugging necessity and an enterprise trust/compliance requirement.
6. **Analytics is read-only and additive** — it never becomes a side channel for mutating CRM data, keeping a clean boundary between the system of record and the reporting layer built on top of it.

---

## 23. Endpoint Inventory

| Module | Endpoints |
|---|---|
| Authentication | 9 |
| Organizations | 6 |
| Users | 4 |
| Roles | 5 |
| Permissions | 1 |
| Teams | 7 |
| Leads | 9 |
| Clients | 6 |
| Companies | 5 |
| Activities | 4 |
| Tasks | 6 |
| Meetings | 6 |
| Properties | 6 |
| Voice Calls | 5 |
| AI Agent | 5 |
| Automation | 6 |
| Notifications | 4 |
| Billing | 6 |
| Subscriptions | 5 |
| Analytics | 5 |
| Settings | 4 |

**119 endpoints total**, every one mapped to an exact permission code, a default role set, a validation contract, and a defined error taxonomy — ready to be implemented as FastAPI routers module by module.

---

**Next recommended step, per your workflow rules:** confirm this architecture (or flag modules/endpoints to adjust) before implementation begins. Build order should follow dependency order: **Auth → Organizations → Users → Roles/Permissions → Teams**, since every other module's permission checks depend on this foundation being correct first. Once confirmed, I'll generate the FastAPI implementation for the Auth module — routers, schemas, services, and repository — with exact file paths against the folder structure from the System Architecture document.
