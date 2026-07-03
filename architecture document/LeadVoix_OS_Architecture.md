# LeadVoix OS — System Architecture Document

**Version:** 1.0
**Scope:** LeadVoix CRM MVP (Phase 1 of the LeadVoix OS platform)
**Author:** Chief Software Architect, LeadVoix AI
**Date:** July 2026

---

## 0. Architectural Principles

Before the diagrams and folder trees, the ground rules that every decision below is derived from:

1. **Modular monolith first, microservices later.** At MVP stage, a distributed system is a tax you pay before you have the revenue to justify it. We build a *modular monolith* — strict internal module boundaries, single deployable backend — so that any module (AI Voice Agent, Logistics, Real Estate) can be peeled off into its own service later without a rewrite.
2. **Domain-driven module boundaries.** Each business capability (Leads, Clients, Follow-ups, Billing, etc.) is a self-contained vertical slice: its own models, schemas, services, and routes. No module reaches into another module's database tables directly — only through its service interface.
3. **Separation of concerns is non-negotiable.** UI never contains business logic. Routes never contain business logic. Business logic lives in a service layer that is framework-agnostic and unit-testable in isolation.
4. **Multi-tenant from day one.** LeadVoix OS sells to many companies (real estate, logistics, services). Tenant isolation is architected in at the database and API layer now — retrofitting multi-tenancy later is one of the most expensive mistakes a SaaS company can make.
5. **API-first.** The backend is a REST API consumed by the web frontend today, and by mobile apps / third-party integrations / the AI Voice Agent tomorrow. No frontend-coupled backend logic.
6. **Everything is environment-configured.** No secrets, URLs, or environment-specific values hardcoded anywhere.

---

## 1. High-Level Architecture

```
                              ┌─────────────────────────┐
                              │        Clients          │
                              │  Web App (React/Vite)   │
                              │  Mobile (future)        │
                              │  Voice Agent (Twilio)   │
                              └────────────┬─────────────┘
                                           │ HTTPS / REST (JSON)
                              ┌────────────▼─────────────┐
                              │      API Gateway Layer    │
                              │  (FastAPI — single entry) │
                              │  - Auth middleware         │
                              │  - Tenant resolution        │
                              │  - Rate limiting              │
                              │  - Request validation           │
                              └────────────┬─────────────────┘
                                           │
        ┌──────────────────────────────────┼──────────────────────────────────┐
        │                                  │                                  │
┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐   ┌────────────▼──────┐
│  Core Modules    │   │  Vertical Modules │  │  AI Layer        │   │  Platform Modules  │
│  - Auth          │   │  - Real Estate    │  │  - Voice Agent   │   │  - Billing         │
│  - Dashboard     │   │  - Logistics      │  │  - LLM Orchestr. │   │  - Analytics       │
│  - Leads         │   │                   │  │  - Automation    │   │  - Notifications   │
│  - Clients       │   │                   │  │    Engine        │   │                    │
│  - Follow-ups    │   │                   │  │                  │   │                    │
└───────┬──────────┘   └────────┬──────────┘  └────────┬─────────┘   └────────┬───────────┘
        │                       │                       │                       │
        └───────────────────────┴───────────┬───────────┴───────────────────────┘
                                             │
                              ┌──────────────▼───────────────┐
                              │      Service / Repository       │
                              │        Layer (business logic)   │
                              └──────────────┬───────────────┘
                                             │
                              ┌──────────────▼───────────────┐
                              │   Supabase (PostgreSQL + RLS)   │
                              │   - Row Level Security per tenant │
                              │   - Realtime (future)              │
                              │   - Storage (files/attachments)     │
                              └──────────────────────────────────┘

        External integrations (async, decoupled via queue/webhooks):
        Twilio (Voice/SMS) · OpenAI/Anthropic (LLM) · Payment gateway · Email (Resend/SES)
```

**Key architectural decision:** the backend is one FastAPI application internally organized into modules (see §2), not ten microservices. This gives us enterprise-grade separation without the operational overhead of distributed systems at MVP stage.

---

## 2. Folder Structure (Enterprise Monorepo)

```
leadvoix-os/
├── apps/
│   ├── backend/                        # FastAPI application
│   │   ├── app/
│   │   │   ├── main.py                 # App entrypoint, middleware registration
│   │   │   ├── core/                   # Cross-cutting concerns
│   │   │   │   ├── config.py           # Pydantic Settings (env vars)
│   │   │   │   ├── security.py         # JWT, password hashing
│   │   │   │   ├── database.py         # Supabase/SQLAlchemy session
│   │   │   │   ├── exceptions.py       # Custom exception classes
│   │   │   │   ├── middleware.py       # Tenant resolution, logging, CORS
│   │   │   │   └── dependencies.py     # Shared FastAPI dependencies
│   │   │   │
│   │   │   ├── modules/                # Domain modules (vertical slices)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── router.py
│   │   │   │   │   ├── schemas.py      # Pydantic request/response models
│   │   │   │   │   ├── service.py      # Business logic
│   │   │   │   │   ├── repository.py   # DB access only
│   │   │   │   │   └── models.py       # ORM models
│   │   │   │   │
│   │   │   │   ├── leads/
│   │   │   │   ├── clients/
│   │   │   │   ├── followups/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── voice_agent/
│   │   │   │   ├── real_estate/
│   │   │   │   ├── logistics/
│   │   │   │   ├── automation/
│   │   │   │   ├── analytics/
│   │   │   │   └── billing/
│   │   │   │
│   │   │   ├── shared/                 # Shared kernel across modules
│   │   │   │   ├── enums.py
│   │   │   │   ├── base_models.py      # TenantMixin, TimestampMixin
│   │   │   │   ├── pagination.py
│   │   │   │   └── validators.py
│   │   │   │
│   │   │   └── integrations/           # External service adapters
│   │   │       ├── twilio_client.py
│   │   │       ├── llm_client.py       # Anthropic/OpenAI wrapper
│   │   │       ├── email_client.py
│   │   │       └── payment_client.py
│   │   │
│   │   ├── alembic/                    # DB migrations
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── .env.example
│   │
│   └── frontend/                       # React application
│       ├── src/
│       │   ├── app/                    # App shell, routing, providers
│       │   ├── modules/                # Mirrors backend modules
│       │   │   ├── auth/
│       │   │   ├── leads/
│       │   │   ├── clients/
│       │   │   ├── followups/
│       │   │   ├── dashboard/
│       │   │   ├── realEstate/
│       │   │   ├── logistics/
│       │   │   ├── billing/
│       │   │   └── analytics/
│       │   │       (each module: components/, hooks/, api/, types/, pages/)
│       │   ├── shared/
│       │   │   ├── components/         # Design system components
│       │   │   ├── hooks/
│       │   │   ├── lib/                # API client, utils
│       │   │   └── styles/
│       │   ├── store/                  # Global state (Zustand/Redux)
│       │   └── main.tsx
│       ├── Dockerfile
│       ├── package.json
│       └── .env.example
│
├── packages/                           # Shared code across apps
│   ├── types/                          # Shared TypeScript types (API contracts)
│   └── config/                         # Shared eslint/tsconfig/prettier
│
├── infra/
│   ├── docker-compose.yml              # Local dev orchestration
│   ├── docker-compose.prod.yml
│   └── supabase/
│       ├── migrations/
│       └── seed.sql
│
├── docs/
│   └── architecture/                   # This document and future ADRs
│
└── .github/
    └── workflows/                      # CI/CD pipelines
```

**Rule enforced by this structure:** every backend module and frontend module maps 1:1. `modules/leads/` on the backend has a matching `modules/leads/` on the frontend. This makes the system predictable to navigate as it grows.

---

## 3. Backend Architecture (FastAPI)

### 3.1 Layered design within each module

```
Router (HTTP layer)
   │  - Parses request, calls service, returns response
   │  - Zero business logic
   ▼
Service (business logic layer)
   │  - Orchestrates use cases, enforces business rules
   │  - Framework-agnostic (no FastAPI imports here)
   ▼
Repository (data access layer)
   │  - Raw DB queries only, no business logic
   ▼
Database (PostgreSQL via Supabase)
```

This is a simplified Clean Architecture / Hexagonal pattern adapted for pragmatic team velocity — not full DDD ceremony, but enough separation that business logic is testable without spinning up a database or an HTTP server.

### 3.2 Cross-cutting middleware (applied globally)

- **Tenant Resolution Middleware** — extracts `tenant_id` from the authenticated JWT and attaches it to the request context. Every repository query is automatically scoped to this tenant.
- **Auth Middleware** — validates Supabase JWT on every protected route.
- **Request Logging / Correlation ID** — every request gets a trace ID for observability.
- **Rate Limiting** — per-tenant and per-IP limits (Redis-backed once volume justifies it; in-memory for MVP).
- **Global Exception Handler** — converts internal exceptions into consistent JSON error responses.

### 3.3 Configuration

All configuration flows through a single `Settings` class (Pydantic Settings) reading from environment variables — `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `TWILIO_*`, `LLM_API_KEY`, `ENVIRONMENT` (dev/staging/prod). No module reads `os.environ` directly; everything goes through `core/config.py`.

---

## 4. Frontend Architecture (React)

### 4.1 Structure philosophy

Feature-based (not type-based) organization, mirroring the backend module boundaries described in §2. Each module owns its own components, API hooks, and types — no shared "God folder" of all components.

### 4.2 Layers

- **API layer** (`modules/*/api/`) — typed fetch/axios wrappers per module, built on a shared base client that injects auth headers and handles tenant context.
- **State layer** — server state via React Query (cache, retries, optimistic updates); client/UI state via a lightweight store (Zustand) for things like sidebar state, active tenant, etc. These are deliberately kept separate — server state and client state are different problems and mixing them is a common source of bugs.
- **Component layer** — presentational components are pure and reusable (`shared/components`); module components compose them with module-specific logic.
- **Routing** — route-based code splitting per module so the initial bundle stays lean as modules are added.

### 4.3 Design system

A shared component library (`shared/components`) — buttons, forms, tables, modals, data grids — used consistently across Leads, Clients, Real Estate, Logistics, etc. so the product feels like one system, not ten bolted-together tools.

---

## 5. Database Architecture (PostgreSQL via Supabase)

### 5.1 Multi-tenancy strategy

**Shared database, shared schema, row-level isolation** — the standard SaaS pattern at this scale (cheaper to operate than schema-per-tenant, easier to migrate than database-per-tenant). Every tenant-owned table includes:

```
tenant_id UUID NOT NULL REFERENCES tenants(id)
```

**Supabase Row Level Security (RLS) policies** enforce that a query can only ever see rows matching the requesting user's `tenant_id` — this is a hard database-level guarantee, not just an application-level convention. Even if a bug in application code forgets a `WHERE tenant_id = ...` clause, the database itself refuses to leak cross-tenant data.

### 5.2 Core schema (conceptual, not exhaustive)

```
tenants            (id, name, plan, created_at, ...)
users              (id, tenant_id, email, role, ...)
leads              (id, tenant_id, source, status, owner_id, ...)
clients            (id, tenant_id, lead_id?, name, contact_info, ...)
followups          (id, tenant_id, lead_id/client_id, due_at, status, ...)
voice_calls        (id, tenant_id, lead_id, transcript, outcome, ...)
real_estate_listings (id, tenant_id, ...)
logistics_shipments  (id, tenant_id, ...)
automations        (id, tenant_id, trigger, action, ...)
invoices / billing (id, tenant_id, amount, status, ...)
audit_logs         (id, tenant_id, actor_id, action, entity, ...)
```

Every table also carries `created_at`, `updated_at`, and soft-delete (`deleted_at`) via a shared `TimestampMixin` / `SoftDeleteMixin` so nothing is ever hard-deleted by accident in a production CRM.

### 5.3 Migrations

Schema changes are managed through Alembic (backend-owned migrations) rather than ad-hoc changes in the Supabase dashboard, so schema history is version-controlled and reproducible across dev/staging/prod.

---

## 6. Authentication Flow

We use **Supabase Auth** (JWT-based) rather than hand-rolling auth — it's a solved problem and rolling your own is a security liability with no upside.

```
1. User submits credentials → Frontend
2. Frontend → Supabase Auth (sign in) → receives JWT (access + refresh token)
3. Frontend stores tokens (httpOnly cookie preferred over localStorage)
4. Every API request → Authorization: Bearer <JWT> → FastAPI backend
5. FastAPI Auth Middleware validates JWT signature against Supabase JWKS
6. Middleware extracts user_id + tenant_id, attaches to request context
7. Service layer uses request context — never trusts client-supplied tenant_id
8. Refresh token flow handled silently by frontend before access token expiry
```

**Role-Based Access Control (RBAC):** roles (`owner`, `admin`, `agent`, `viewer`) stored per user per tenant; permission checks happen in the service layer via a `@requires_role()` decorator — never left to the frontend to enforce (frontend hides UI for UX only; backend is the actual gate).

---

## 7. API Architecture

### 7.1 Conventions

- **REST, resource-oriented:** `/api/v1/leads`, `/api/v1/leads/{id}`, `/api/v1/clients/{id}/followups`
- **Versioned from day one:** `/api/v1/...` so breaking changes never break existing clients (including the AI Voice Agent and future mobile app).
- **Consistent envelope:**
  ```json
  { "data": {...}, "meta": { "page": 1, "total": 42 }, "error": null }
  ```
- **Consistent error shape:** `{ "error": { "code": "LEAD_NOT_FOUND", "message": "..." } }` with correct HTTP status codes.
- **Pagination, filtering, sorting** standardized via shared query params (`?page=`, `?limit=`, `?sort=`, `?filter[status]=`) implemented once in `shared/pagination.py` and reused by every module.
- **Idempotency keys** on write endpoints that may be retried (e.g., billing, automation triggers).

### 7.2 Documentation

FastAPI's built-in OpenAPI/Swagger generation is treated as the single source of truth for the API contract — the frontend's TypeScript types in `packages/types` are generated from it, so frontend and backend can never silently drift out of sync.

---

## 8. AI Architecture

### 8.1 AI Voice Agent pipeline

```
Inbound/Outbound Call (Twilio)
        │
        ▼
Speech-to-Text (streaming)
        │
        ▼
LLM Orchestration Layer (backend service, provider-agnostic)
   - Injects lead/client context from DB
   - Applies conversation policy / guardrails
   - Decides: answer directly, trigger a tool call, or escalate to human
        │
        ▼
Text-to-Speech (streaming) → back to caller
        │
        ▼
Post-call: transcript + summary + extracted intents
   written to `voice_calls` table → triggers Automation Engine
```

### 8.2 Design decisions

- **Provider abstraction:** `integrations/llm_client.py` wraps whichever LLM provider is used (Anthropic/OpenAI) behind a single interface, so switching providers or using different models for different tasks (e.g., a cheaper model for intent classification, a stronger model for conversation) never touches business logic.
- **Tool-use pattern:** the LLM doesn't get raw DB access. It gets a constrained, explicitly-defined set of "tools" (e.g., `create_followup`, `update_lead_status`, `schedule_callback`) that map to service-layer functions — this bounds what the AI can actually do in the system and keeps every AI action auditable.
- **Asynchronous by default:** voice/AI workloads run through a task queue (e.g., Celery/RQ or Supabase Edge Functions for lighter tasks) rather than blocking API request/response cycles.
- **Full auditability:** every AI-initiated action is logged in `audit_logs` with the reasoning/trigger, so a human can always see *why* the AI did something — critical for a CRM handling real customer relationships.

### 8.3 Automation Engine

A rules/trigger engine (`modules/automation`) that listens for domain events (`lead.created`, `followup.overdue`, `call.completed`) and executes configured actions (send email, create task, notify agent). Built on a simple internal event bus now; can be swapped for a message broker (e.g., Redis Streams/SQS) once volume demands it — the interface is designed so that swap doesn't touch calling code.

---

## 9. Module Communication

### 9.1 Internal (within the monolith)

- Modules communicate **only through service-layer function calls**, never through direct database access into another module's tables. E.g., the Follow-ups module calls `leads_service.get_lead(lead_id)` — it never queries the `leads` table directly.
- **Domain events** for decoupled side effects: when `leads_service` creates a lead, it emits a `LeadCreated` event; the Automation module and Analytics module subscribe independently. This means Leads doesn't need to know Automation or Analytics exist — new subscribers can be added without touching the publisher.

### 9.2 External

- Third-party services (Twilio, LLM provider, payment gateway, email) are only ever called through the `integrations/` adapters — never directly from a service or router. This keeps external API changes isolated to one file per integration.
- Webhooks (e.g., Twilio call status, payment confirmation) land on dedicated webhook routes that verify signatures, then delegate to the relevant service.

### 9.3 Why this matters for the "billion-dollar OS" vision

Because every module is decoupled through service interfaces and domain events rather than direct table access, **any module can be extracted into its own microservice later** (e.g., Voice Agent under heavy load, or Logistics sold as a standalone product) without rewriting the modules that depend on it — only the communication mechanism changes (function call → API call/event), not the business logic itself.

---

## 10. Deployment Architecture

```
┌────────────────────┐        ┌────────────────────┐
│   Vercel             │        │   Railway            │
│   (Frontend - React) │◄──────►│   (Backend - FastAPI)│
│   - Edge CDN          │  REST  │   - Auto-deploy from  │
│   - Preview deploys    │        │     GitHub main       │
│   - Env vars per env    │        │   - Dockerized         │
└────────────────────┘        └──────────┬─────────────┘
                                          │
                              ┌───────────▼────────────┐
                              │   Supabase (managed)      │
                              │   - PostgreSQL              │
                              │   - Auth                     │
                              │   - Storage                   │
                              │   - Row Level Security          │
                              └────────────────────────────────┘

CI/CD (GitHub Actions):
   PR opened → lint + unit tests + type-check
   Merge to main → build Docker image → deploy backend to Railway
                 → build frontend → deploy to Vercel
                 → run DB migrations (Alembic) against Supabase
```

### 10.1 Environments

Three isolated environments — `development`, `staging`, `production` — each with its own Supabase project, its own env vars, and its own Railway/Vercel deployment target. Nothing in staging can touch production data.

### 10.2 Docker

The backend is fully Dockerized (`apps/backend/Dockerfile`) so it runs identically on a developer's laptop, in CI, and on Railway — eliminating "works on my machine" failures. `docker-compose.yml` orchestrates backend + local Postgres (or Supabase local dev) for local development.

### 10.3 Observability (baseline for MVP, expandable later)

- Structured JSON logging with correlation IDs (already threaded through via middleware in §3.2)
- Error tracking (e.g., Sentry) wired into both frontend and backend
- Basic uptime/health-check endpoint (`/health`) polled by Railway and an external monitor

---

## Summary: Why This Architecture Scales With the Vision

| Concern | How this architecture addresses it |
|---|---|
| Multiple verticals (Real Estate, Logistics, Services) | Vertical-specific modules plug into the same core (Leads, Clients, Auth) without duplicating it |
| Many tenants, data isolation | RLS-enforced multi-tenancy at the database layer, not just app-layer trust |
| AI as a first-class citizen, not a bolt-on | Provider-agnostic LLM layer, tool-use pattern, full audit trail |
| Team growth | Clear module ownership boundaries — new engineers can own a module without needing to understand the whole system |
| Future microservices split | Modules already communicate through service interfaces/events, not shared tables — extraction is mechanical, not a rewrite |
| Enterprise buyers' due diligence | Versioned API, RBAC, audit logs, environment isolation, Dockerized deployment — all expected at enterprise sales stage |

---

**Next recommended step:** pick the first module to build end-to-end (Auth → Dashboard → Leads is the natural MVP path) and I'll produce the detailed module-level design (schemas, endpoints, service contracts) before any code is written, per your workflow rules.
