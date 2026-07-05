# LeadVoix OS — Database Architecture Document

**Version:** 1.0
**Engine:** PostgreSQL 15+ (Supabase-managed)
**Scope:** Complete schema design for LeadVoix CRM MVP and adjacent verticals (Real Estate, Logistics, Billing, AI)
**Format:** Architecture only — no SQL. This document is the contract the migration files will be written against.

---

## 0. Design Conventions (Apply to Every Table Below)

These conventions are not repeated table-by-table — assume every table described in this document follows them unless explicitly stated otherwise.

### 0.1 Primary Keys
- Every table uses a **UUID (v4) primary key**, not an auto-incrementing integer.
- Why: in a multi-tenant system, sequential integer IDs leak business intelligence (e.g., "how many leads does a competitor have") and complicate merges between environments. UUIDs also let the frontend/AI layer generate IDs client-side when needed (idempotent writes) without a round-trip.

### 0.2 Tenant Isolation
- Every tenant-owned table carries an `organization_id` (foreign key → `organizations.id`).
- **Row Level Security (RLS)** is enabled on every tenant-owned table in Supabase. The policy pattern is uniform: a row is only visible/writable if `organization_id` matches the `organization_id` embedded in the requester's JWT claims.
- This is enforced at the **database layer**, not just the application layer — even a bug in the FastAPI service layer that forgets a tenant filter cannot leak cross-tenant data, because Postgres itself refuses the row.
- A small number of platform-level tables (`roles`, `permissions`, subscription `plans`) are **global/shared reference tables** and intentionally have no `organization_id` — noted explicitly where relevant.

### 0.3 Audit Columns (standard on every table)
- `created_at` — timestamp, set on insert.
- `updated_at` — timestamp, auto-updated on every modification (via trigger).
- `created_by` — foreign key → `users.id`. Who created the row. Nullable only for system/automation-generated rows, in which case a companion `created_by_system` flag identifies the originating process (e.g., `automation_engine`, `voice_agent`).
- `updated_by` — foreign key → `users.id`. Who last modified the row.

### 0.4 Soft Delete
- Every business-data table carries `deleted_at` (nullable timestamp) instead of hard deletes.
- A row with `deleted_at IS NULL` is active; a non-null value marks it archived.
- All application queries filter `deleted_at IS NULL` by default (enforced centrally in the repository layer, not repeated per query).
- Hard deletes are reserved for GDPR/CCPA "right to be forgotten" workflows only, run through a dedicated, audited purge process — never through normal application code paths.
- Why this matters for a CRM specifically: sales and support teams routinely need to recover an "accidentally deleted" lead or client record. Hard deletes in a CRM are a support-ticket generator.

### 0.5 Naming Conventions
- Tables: plural, snake_case (`leads`, `voice_calls`).
- Foreign keys: `<referenced_table_singular>_id` (e.g., `lead_id`, `organization_id`).
- Join/junction tables: `<table_a>_<table_b>` (e.g., `role_permissions`).
- Every foreign key column is indexed by default (Postgres does not do this automatically — it's a deliberate design step, listed per-table in §12).

### 0.6 Polymorphic Relationships
- Several modules (Activities, Tasks, Notifications, AI Logs, Attachments) need to reference "any kind of record" (a lead, a client, a shipment, a property). Rather than nullable FK-per-entity-type columns (which get unmanageable past 3–4 entity types), we use a **polymorphic pattern**: `related_entity_type` (enum/text: `lead`, `client`, `property`, `shipment`, etc.) + `related_entity_id` (UUID, not FK-constrained since it can point to multiple tables).
- Trade-off acknowledged: this sacrifices database-level referential integrity on that one column pair in exchange for extensibility. We compensate with an application-layer integrity check in the service layer and a periodic consistency-check job. This is the same trade-off Stripe and most large CRMs make for their "event" and "activity" tables — full FK constraints on every possible polymorphic target don't scale past a handful of entity types.

---

## 1. Identity & Tenancy Domain

### 1.1 `organizations`
The tenant itself. Every other tenant-owned table hangs off this table via `organization_id`.

- **Key columns (conceptual):** name, slug (unique, used in subdomain/URL routing), industry_vertical (`real_estate`, `logistics`, `general_service`), plan reference, timezone, is_active.
- **Relationships:** parent of virtually everything — `users`, `teams`, `leads`, `clients`, etc. all reference it.
- **No `organization_id` on itself** (it *is* the tenant boundary).

### 1.2 `users`
A person who can log in. A user's identity record is separate from Supabase Auth's own `auth.users` table — this table is the **application-level profile** that extends the auth identity with business data (name, avatar, phone, job title) and links to the auth system via `auth_user_id`.

- **Key columns:** auth_user_id (FK → Supabase `auth.users.id`), email, full_name, phone, avatar_url, is_active, last_login_at.
- **Relationships:** a user can belong to multiple organizations (see `organization_members` below) — this supports agencies/consultants who manage multiple client accounts, and supports the future "LeadVoix OS as a platform" vision where one person may wear multiple hats.

### 1.3 `organization_members`
Junction table resolving the many-to-many between `users` and `organizations`, and the point where **role** is attached to that membership.

- **Key columns:** organization_id (FK), user_id (FK), role_id (FK → `roles`), status (`invited`, `active`, `suspended`), invited_by (FK → users), joined_at.
- **Why a separate table instead of `organization_id` directly on `users`:** a single physical user needs a distinct role per organization (an admin at Company A might be a viewer at Company B). This table is the actual tenant-membership record; `users` itself stays organization-agnostic.
- **Unique constraint:** (organization_id, user_id) — a user has exactly one membership row per org.

### 1.4 `teams`
Sub-groups within an organization (e.g., "West Coast Sales", "Logistics Ops").

- **Key columns:** organization_id (FK), name, description, team_lead_id (FK → users).
- **Relationships:** referenced by `team_members` (junction) and optionally by `leads`/`clients` for team-based routing and reporting.

### 1.5 `team_members`
Junction table between `teams` and `users` (scoped implicitly through the team's organization).

- **Key columns:** team_id (FK), user_id (FK), joined_at.
- **Unique constraint:** (team_id, user_id).

### 1.6 `roles`
Named roles available in the system. Two categories live in this one table, distinguished by `organization_id` being null or not:
- **System roles** (organization_id = null): `owner`, `admin`, `agent`, `viewer` — available to every tenant, cannot be edited/deleted by tenants.
- **Custom roles** (organization_id = tenant's ID): enterprise customers on higher plans can define custom roles (e.g., "Senior Agent") — a deliberate extensibility point for enterprise sales.

- **Key columns:** organization_id (nullable FK), name, description, is_system_role (boolean).

### 1.7 `permissions`
Granular, atomic capabilities in the system — global reference table, not tenant-owned. Examples in concept (not exhaustive): `leads.create`, `leads.delete`, `billing.view`, `automation.manage`, `users.invite`.

- **Key columns:** code (unique, machine-readable, e.g., `leads.delete`), description, module (which module it belongs to, for grouping in the UI's permission management screen).

### 1.8 `role_permissions`
Junction table between `roles` and `permissions` — defines exactly what each role can do.

- **Key columns:** role_id (FK), permission_id (FK).
- **Unique constraint:** (role_id, permission_id).
- **Why granular permissions instead of a hardcoded 4-role enum:** this is what lets us sell to enterprise buyers who *always* ask "can we customize permissions" during procurement — the schema supports it from day one even if the MVP UI only exposes the 4 default roles initially.

---

## 2. CRM Core Domain

### 2.1 `companies`
A business entity — distinct from `clients`. A company can be the employer/organization behind multiple leads or clients (e.g., "Acme Logistics Inc." might have three separate contacts who are all leads).

- **Key columns:** organization_id (FK, tenant), name, industry, website, phone, address fields, company_size, annual_revenue_range.
- **Relationships:** referenced by `leads.company_id` and `clients.company_id` (both nullable — an individual lead/client may have no associated company).

### 2.2 `leads`
A prospective customer, pre-conversion. The central object of the CRM.

- **Key columns:** organization_id (FK), company_id (nullable FK → companies), assigned_to (FK → users), source (`website`, `referral`, `cold_call`, `voice_agent`, `import`), status (`new`, `contacted`, `qualified`, `unqualified`, `converted`), score (nullable numeric — for future lead-scoring AI), full_name, email, phone, notes.
- **Relationships:** parent to `activities`, `tasks`, `meetings`, `voice_calls` (via polymorphic pattern), and the source of a `clients` record upon conversion.
- **Lifecycle note:** on conversion, we do **not** delete the lead row — we set `status = 'converted'` and create a linked `clients` row with `converted_from_lead_id` pointing back. This preserves the full funnel history for analytics (critical — without this, conversion-rate reporting is impossible).

### 2.3 `clients`
A converted, paying (or actively engaged) customer.

- **Key columns:** organization_id (FK), company_id (nullable FK), converted_from_lead_id (nullable FK → leads), assigned_to (FK → users), status (`active`, `inactive`, `churned`), full_name, email, phone, lifetime_value (denormalized, recalculated periodically — see §11 on denormalization strategy).
- **Relationships:** parent to `activities`, `tasks`, `meetings`, `invoices`, `properties` (for real estate clients), `logistics_shipments` (for logistics clients).

### 2.4 `activities`
A generic, polymorphic timeline entry — the "what happened" log for a lead or client (call logged, email sent, note added, status changed). This is distinct from `audit_logs` (§8), which is a security/compliance trail; `activities` is a **business-facing** timeline shown directly in the CRM UI.

- **Key columns:** organization_id (FK), related_entity_type + related_entity_id (polymorphic, see §0.6), activity_type (`note`, `email`, `call`, `status_change`, `meeting_logged`), performed_by (FK → users, nullable if system-generated), content (text/JSON body), occurred_at.

### 2.5 `tasks`
An action item assigned to a user, optionally tied to a lead/client.

- **Key columns:** organization_id (FK), related_entity_type + related_entity_id (nullable — a task can be standalone), assigned_to (FK → users), title, description, due_at, status (`open`, `in_progress`, `done`, `cancelled`), priority (`low`, `medium`, `high`).

### 2.6 `meetings`
A scheduled meeting/call appointment, distinct from `voice_calls` (which is the AI Voice Agent's actual call record).

- **Key columns:** organization_id (FK), related_entity_type + related_entity_id, organized_by (FK → users), title, scheduled_at, duration_minutes, location_or_link, status (`scheduled`, `completed`, `cancelled`, `no_show`).
- **Relationships:** can reference `meeting_attendees` junction table if multiple internal users attend (deferred to Phase 2 unless immediately needed).

### 2.7 `voice_calls`
A record of an AI Voice Agent (or human) call — the concrete output of the AI architecture described in the system architecture doc.

- **Key columns:** organization_id (FK), lead_id (nullable FK), client_id (nullable FK), initiated_by (`ai_agent`, `human`), direction (`inbound`, `outbound`), phone_number, twilio_call_sid (external reference), duration_seconds, transcript (text, large — consider offloading to Supabase Storage if transcripts get long, with just a pointer stored here), summary (AI-generated), outcome (`booked_meeting`, `no_answer`, `not_interested`, `follow_up_needed`), recording_url.
- **Relationships:** parent to `ai_logs` for the granular reasoning trail behind this specific call.

---

## 3. AI & Automation Domain

### 3.1 `ai_logs`
The audit trail of every AI decision/action — separate from `voice_calls` because AI acts outside of calls too (e.g., auto-scoring a lead, auto-drafting a follow-up email, deciding to trigger an automation).

- **Key columns:** organization_id (FK), related_entity_type + related_entity_id (polymorphic), voice_call_id (nullable FK, when applicable), action_type (`tool_call`, `decision`, `summary_generation`), model_used, input_context (JSON), output (JSON), tool_name (nullable — which internal tool the AI invoked, e.g., `create_followup`), confidence_score (nullable), reviewed_by_human (boolean, default false).
- **Why this table is non-negotiable for an AI CRM:** every AI-initiated action in the system (creating a follow-up, updating a lead status, sending a message) must be traceable to *why* the AI did it. This table is what makes the AI layer auditable rather than a black box — essential both for debugging and for enterprise trust/compliance during sales cycles.

### 3.2 `automations`
A configured trigger → action rule (the Automation Engine's configuration store).

- **Key columns:** organization_id (FK), name, trigger_event (`lead.created`, `followup.overdue`, `call.completed`, etc.), conditions (JSON — filter logic), action_type (`send_email`, `create_task`, `notify_user`, `update_status`), action_config (JSON), is_active, created_by (FK → users).

### 3.3 `automation_logs`
Execution history of automations — every time a rule fires, a row is written here. Separate from `automations` (the config) for the same reason `voice_calls` is separate from `meetings` — config vs. execution history have very different read/write patterns and retention needs.

- **Key columns:** organization_id (FK), automation_id (FK), triggered_by_entity_type + triggered_by_entity_id (polymorphic), status (`success`, `failed`, `skipped`), error_message (nullable), executed_at.

### 3.4 `notifications`
In-app / email / SMS notifications delivered to users.

- **Key columns:** organization_id (FK), user_id (FK — the recipient), related_entity_type + related_entity_id (nullable, polymorphic), title, body, channel (`in_app`, `email`, `sms`), is_read, read_at, sent_at.

---

## 4. Vertical Modules Domain

### 4.1 `properties`
Real estate listings — used only by tenants with `industry_vertical = 'real_estate'`, but the table lives in the shared schema (not a separate database) so cross-vertical reporting stays possible.

- **Key columns:** organization_id (FK), listed_by (FK → users), client_id (nullable FK — owner/seller), address fields, property_type (`residential`, `commercial`, `land`), price, status (`available`, `under_offer`, `sold`, `withdrawn`), bedrooms, bathrooms, square_footage, description.
- **Relationships:** referenced by `leads`/`clients` interested in a given property via a `property_interests` junction table (buyer-side interest, many-to-many, since one lead may be interested in several properties and one property has several interested leads).

### 4.2 `logistics_shipments`
Shipment records — used by tenants with `industry_vertical = 'logistics'`.

- **Key columns:** organization_id (FK), client_id (FK — the shipper/customer), origin_address, destination_address, status (`pending`, `in_transit`, `delivered`, `delayed`, `cancelled`), carrier, tracking_number, scheduled_pickup_at, scheduled_delivery_at, actual_delivery_at, weight, cargo_description.

---

## 5. Billing Domain

### 5.1 `subscriptions`
LeadVoix OS's own billing relationship with each tenant (this is LeadVoix charging *its customers*, not the CRM's clients' invoicing — that's §5.2/5.3).

- **Key columns:** organization_id (FK, unique — one active subscription per org), plan_id (FK → `plans`), status (`trialing`, `active`, `past_due`, `cancelled`), current_period_start, current_period_end, external_subscription_id (Stripe/payment-provider reference), cancel_at_period_end (boolean).

### 5.2 `plans`
Global reference table (not tenant-owned) of available pricing plans.

- **Key columns:** name, price_monthly, price_annual, feature_limits (JSON — e.g., max_users, max_leads_per_month, ai_call_minutes_included), is_active.

### 5.3 `invoices`
Invoices raised **by a tenant to their own clients** — this is the CRM's client-billing feature, distinct from `subscriptions` (LeadVoix billing the tenant).

- **Key columns:** organization_id (FK), client_id (FK), invoice_number (unique per org), status (`draft`, `sent`, `paid`, `overdue`, `void`), issue_date, due_date, subtotal, tax_amount, total_amount, currency.
- **Relationships:** parent to `invoice_line_items` (a standard normalized child table for line-item detail — quantity, description, unit_price per line) and `payments`.

### 5.4 `payments`
A payment applied against an invoice (supports partial payments).

- **Key columns:** organization_id (FK), invoice_id (FK), amount, method (`card`, `bank_transfer`, `cash`, `other`), external_payment_id (payment gateway reference), status (`succeeded`, `failed`, `refunded`), paid_at.

---

## 6. Governance & Platform Domain

### 6.1 `audit_logs`
The security/compliance trail — distinct from `activities` (business timeline) and `ai_logs` (AI reasoning trail). This table answers "who did what to which record, from where, when" for every sensitive action in the system (login, permission change, data export, record deletion).

- **Key columns:** organization_id (nullable FK — some events like failed login attempts may pre-date tenant resolution), actor_id (FK → users, nullable for system actions), action (`create`, `update`, `delete`, `login`, `export`, `permission_change`), entity_type + entity_id (polymorphic), old_value (JSON, nullable), new_value (JSON, nullable), ip_address, user_agent, occurred_at.
- **Retention note:** this table grows fast and is append-only/never updated. It should be partitioned by month once volume justifies it (see §11) and is a strong candidate for eventual archival to cold storage rather than living in the primary operational database indefinitely.

### 6.2 `api_keys`
Programmatic access credentials issued per organization (for future public API / integrations).

- **Key columns:** organization_id (FK), name (label, e.g., "Zapier Integration"), key_prefix (short, displayable portion), hashed_key (never store the raw key — hash it, same pattern as password storage), scopes (JSON array of permission codes), created_by (FK → users), last_used_at, expires_at, revoked_at (nullable — soft revocation, distinct from `deleted_at`).

### 6.3 `settings`
Configuration key-value store, scoped at either the organization or user level.

- **Key columns:** organization_id (nullable FK), user_id (nullable FK — exactly one of the two is set, enforced at the application layer), key (e.g., `notification_preferences`, `default_lead_source`, `business_hours`), value (JSON), updated_at.
- **Design choice:** a flexible key-value table here (rather than dozens of nullable columns on `organizations`/`users`) keeps the core identity tables lean and lets new settings be added without a schema migration — a deliberate trade-off of query-time flexibility for schema stability, appropriate for genuinely optional/evolving configuration.

---

## 7. Entity Relationship Overview

```
organizations (tenant root)
   ├── organization_members ── users ── (auth.users via Supabase Auth)
   │        └── roles ── role_permissions ── permissions
   ├── teams ── team_members ── users
   │
   ├── companies
   │      ├── leads (company_id nullable)
   │      └── clients (company_id nullable)
   │
   ├── leads ──► clients (via converted_from_lead_id, on conversion)
   │
   ├── clients
   │      ├── properties (real estate)
   │      ├── logistics_shipments
   │      └── invoices ── invoice_line_items
   │                        └── payments
   │
   ├── [leads | clients] ◄── polymorphic ──┐
   │                                        ├── activities
   │                                        ├── tasks
   │                                        ├── meetings
   │                                        ├── notifications
   │                                        └── ai_logs
   │
   ├── leads/clients ── voice_calls ── ai_logs
   │
   ├── automations ── automation_logs
   │
   ├── subscriptions ── plans
   │
   ├── audit_logs (compliance trail, org-scoped)
   ├── api_keys
   └── settings
```

---

## 8. Indexing Strategy

Indexes are applied with a clear rationale per category — not blanket-indexed, since over-indexing hurts write performance:

1. **Every foreign key column** is indexed. Postgres does not do this automatically, and without it, every join and every cascading delete check does a sequential scan as tables grow.
2. **Composite `(organization_id, <common filter column>)` indexes** on every high-traffic tenant-owned table — e.g., `(organization_id, status)` on `leads`, `(organization_id, assigned_to)` on `tasks`. Because every query is tenant-scoped first, leading the composite index with `organization_id` makes these the most-used indexes in the system.
3. **Unique composite indexes** where business rules require uniqueness scoped to a tenant, not globally — e.g., `(organization_id, invoice_number)` on `invoices` rather than a globally unique invoice number (two different tenants can both have an "INV-0001").
4. **Partial indexes** on `deleted_at IS NULL` for the largest tables (`leads`, `clients`, `activities`) — since the vast majority of queries only care about active rows, a partial index keeps the index smaller and faster than indexing every historical soft-deleted row too.
5. **GIN indexes** on JSON columns that are queried into (e.g., `automations.conditions`, `ai_logs.input_context`) if/when filtering by JSON fields becomes a real query pattern — deferred until proven necessary rather than applied speculatively.
6. **Text search indexes** (Postgres `tsvector` or `pg_trgm`) on `leads.full_name`/`email` and `clients.full_name`/`email` to support the CRM's search bar without falling back to slow `ILIKE '%...%'` scans.

---

## 9. Foreign Key & Referential Integrity Policy

- **`ON DELETE RESTRICT`** is the default for foreign keys pointing to core identity tables (`users`, `organizations`) — you should never be able to delete a user or org out from under referencing records; soft-delete is the correct path instead.
- **`ON DELETE CASCADE`** is used only for true parent-child compositions where the child has no meaning without the parent — e.g., `invoice_line_items` cascades from `invoices`, `role_permissions` cascades from `roles`.
- **`ON DELETE SET NULL`** is used for optional, non-owning references — e.g., if a `user` who was `assigned_to` a lead is deactivated, the lead's `assigned_to` can be nulled out and reassigned rather than the lead becoming unreadable.
- Polymorphic pairs (`related_entity_type` + `related_entity_id`) are explicitly **not** database-FK-constrained (per §0.6) — integrity here is enforced in the service layer and validated by a scheduled consistency-check job that flags orphaned references for review.

---

## 10. Row Level Security (RLS) Policy Pattern

Applied uniformly across every tenant-owned table:

- **SELECT policy:** row visible only if `organization_id` = the organization_id claim in the requester's JWT.
- **INSERT policy:** row insertable only if the `organization_id` being written matches the requester's JWT claim (prevents a compromised frontend from writing into another tenant's data even if it tried).
- **UPDATE/DELETE policy:** same tenant match, additionally checked against the user's `role_permissions` for tables where role-gated actions apply (e.g., only `owner`/`admin` roles can update `subscriptions` or `settings` at the org level).
- Global reference tables (`permissions`, `plans`, system `roles`) have RLS enabled but with a permissive read-only policy for all authenticated users, and write access restricted to a service-role key used only by internal platform tooling — never exposed to tenant-facing API paths.

---

## 11. Denormalization & Performance Notes

A small number of deliberate denormalizations are called out explicitly (not accidental — every one is a documented trade-off):

- `clients.lifetime_value` — denormalized/cached sum of paid invoices, recalculated by a scheduled job or on-payment trigger, rather than computed live on every dashboard load. Avoids an expensive aggregate join on every page view of the client list.
- `leads.score` — if/when AI lead-scoring ships, the score is stored directly on the lead rather than recalculated per view, refreshed asynchronously by the AI layer.
- `audit_logs` and `ai_logs` are designed as **append-only, high-volume tables** — candidates for **monthly range partitioning** once row counts justify it (typically in the tens of millions), which keeps query performance stable on recent data without needing to touch application code — partitioning is a storage-layer concern in Postgres, transparent to the ORM/service layer above it.

---

## 12. Summary Table Inventory

| Domain | Tables |
|---|---|
| Identity & Tenancy | organizations, users, organization_members, teams, team_members, roles, permissions, role_permissions |
| CRM Core | companies, leads, clients, activities, tasks, meetings, voice_calls |
| AI & Automation | ai_logs, automations, automation_logs, notifications |
| Vertical Modules | properties, property_interests, logistics_shipments |
| Billing | subscriptions, plans, invoices, invoice_line_items, payments |
| Governance & Platform | audit_logs, api_keys, settings |

**33 tables total**, every tenant-owned table carrying `organization_id`, full audit columns, and soft delete — ready to be expressed as Alembic migrations against Supabase Postgres with RLS policies applied at creation time, per the conventions in §0.

---

**Next recommended step, per your workflow rules:** confirm this schema (or flag any table you want restructured) before I generate the actual Alembic migration files and Supabase RLS policy definitions — schema changes are expensive to walk back once real data exists, so this is the right point to catch adjustments.
