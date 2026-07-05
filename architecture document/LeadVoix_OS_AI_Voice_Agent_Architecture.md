# LeadVoix OS — AI Voice Agent Architecture

**Version:** 1.0
**Scope:** Production-grade, multi-tenant AI Voice Agent serving Real Estate, Logistics, Healthcare, Legal, Hotels, and general service verticals
**Stack:** FastAPI, Python, OpenAI, Twilio, Supabase/PostgreSQL, Redis, n8n, Docker
**Status:** Architecture only — no code. This is the design the Voice Agent module's implementation will be built against, module by module, once confirmed.

---

## 0. Design Philosophy

A voice agent that merely "answers the phone with an LLM" is a demo. A production voice agent for six different verticals, running for enterprise customers, has to solve five hard problems simultaneously: **latency** (a human notices a 2-second pause), **context** (the AI must know who it's talking to and why), **correctness** (it must not hallucinate prices, availability, or medical/legal claims), **auditability** (every action must be traceable), and **isolation** (one tenant's data must never leak into another tenant's call). Every section below is designed against these five constraints, not just "does it technically work."

The architecture treats the voice agent as **one consumer of the existing LeadVoix CRM core**, not a parallel system. It reuses the multi-tenant database, RBAC, and API layer already established — it does not duplicate leads, clients, or auth. The Voice Agent module is additive infrastructure on top of the platform we've already designed.

---

## 1. High-Level AI Voice Architecture

```
                         ┌───────────────────────────┐
                         │        Twilio               │
                         │  PSTN / SIP / WhatsApp        │
                         │  Voice + Media Streams          │
                         └──────────────┬───────────────────┘
                                        │ WebSocket (bidirectional audio) + Webhooks
                         ┌──────────────▼───────────────────┐
                         │     Voice Gateway Service            │
                         │     (FastAPI, async, WebSocket)        │
                         │  - Call session lifecycle                │
                         │  - Audio stream in/out                     │
                         │  - Tenant + call context resolution          │
                         └───────┬─────────────────┬───────────────────┘
                                 │                 │
                    ┌────────────▼───────┐ ┌───────▼─────────────┐
                    │   STT Engine          │ │   TTS Engine           │
                    │  (streaming, provider-  │ │  (streaming, provider-  │
                    │   abstracted)             │ │   abstracted)             │
                    └────────────┬───────────┘ └───────▲─────────────────┘
                                 │ partial/final transcript          │ synthesized audio
                         ┌───────▼─────────────────────────────────┴────────┐
                         │           Conversation Orchestrator                  │
                         │        (the "brain" — FastAPI service)                │
                         │  - Turn-taking & interruption handling                  │
                         │  - Memory assembly (§7)                                   │
                         │  - RAG retrieval (§8)                                       │
                         │  - LLM call with tool-calling (§6)                            │
                         │  - Tool execution → CRM / Calendar / Email / WhatsApp (§9-12)  │
                         │  - Escalation rule evaluation (§13)                              │
                         └───────┬───────────────────────────────┬────────────────────────┘
                                 │                               │
                    ┌────────────▼───────────┐        ┌──────────▼─────────────┐
                    │   Redis                    │        │   n8n                     │
                    │  - Live call state           │        │  - Automation workflows      │
                    │  - Short-term memory            │        │  - Follow-up, reminders,       │
                    │  - Rate limiting / queues          │        │    CRM updates, notifications    │
                    └────────────────────────────┘        └────────────────────────────────┘
                                 │
                    ┌────────────▼─────────────────────────────────────────────┐
                    │            Supabase (PostgreSQL + pgvector + Storage)         │
                    │  - CRM core (leads, clients, tasks, activities)                   │
                    │  - Vertical data (properties, shipments, ...)                       │
                    │  - Vector store (knowledge base embeddings, RAG)                        │
                    │  - voice_calls, ai_logs, call_transcripts                                  │
                    │  - Call recordings (Storage buckets, tenant-scoped)                           │
                    └────────────────────────────────────────────────────────────────────────────┘
```

**Key architectural decision:** the **Voice Gateway** (handles raw audio/WebSocket concerns) and the **Conversation Orchestrator** (handles reasoning/business logic) are separate services, not one monolith. This split lets us scale audio-handling infrastructure (I/O-bound, needs many concurrent WebSocket connections) independently from LLM-orchestration infrastructure (CPU/API-latency-bound, needs different scaling characteristics) — critical once call volume grows into the hundreds of concurrent calls.

---

## 2. Incoming Call Flow

```
1. Caller dials the tenant's LeadVoix phone number (provisioned per-organization in Twilio)
2. Twilio → webhook → Voice Gateway: POST /voice-agent/webhook/incoming
      - Payload includes: From, To, CallSid
3. Voice Gateway resolves tenant: `To` number → organization_id (phone_numbers mapping table)
4. Voice Gateway checks: does `From` match an existing lead/client in this tenant? (CRM lookup)
      - Match found  → load existing context (lead/client record, history, timeline)
      - No match     → create a new `leads` row (source: 'voice_agent_inbound')
5. Voice Gateway responds to Twilio with TwiML/Media Streams instruction to open a
   bidirectional WebSocket for real-time audio
6. Conversation Orchestrator initializes the call session:
      - Loads vertical-specific system prompt (Real Estate vs Logistics vs Healthcare, etc.)
      - Loads short-term memory scaffold (§7.1) + relevant long-term memory (§7.2)
      - Loads RAG context: company knowledge base + FAQ relevant to inbound intent (§8)
7. Live conversation loop begins:
      Caller speaks → STT (streaming) → Orchestrator → LLM (+ tools) → TTS → Caller hears response
      (See §5, §6 for the mechanics of this loop)
8. Throughout the call: Orchestrator may invoke tools — check calendar availability,
   create a task, update lead status, escalate to human (§9-13)
9. On call end (caller hangs up or AI completes the objective):
      - Recording finalized (§14), transcript finalized (§15)
      - Post-call summary generated asynchronously (§16)
      - Lead qualification score computed (§17)
      - Automation triggers fired via n8n (§18) — e.g., send follow-up email,
        create a CRM task, notify the assigned agent
```

---

## 3. Outbound AI Calling Flow

Two distinct outbound modes are supported, since they have different risk/control profiles:

### 3.1 Single, agent-triggered outbound call
```
1. A human agent (or automation rule) triggers: POST /api/v1/voice-calls/initiate
   { lead_id, objective: "book_meeting" }
2. Backend validates plan quota (AI call minutes remaining), then enqueues the call
   request onto a Redis-backed queue (not a synchronous Twilio call — see §21)
3. A Call Worker picks up the job, places the call via Twilio's outbound API
4. Once Twilio confirms the callee has answered, the same Conversation Orchestrator
   loop from §2 step 6-8 takes over — the inbound/outbound paths converge into one
   orchestration engine after connection is established, avoiding duplicated
   conversation logic
5. If unanswered/voicemail detected (Twilio AMD — Answering Machine Detection):
   configurable behavior per tenant — leave a pre-approved voicemail script,
   or simply log the attempt and schedule a retry via automation (§18)
```

### 3.2 Campaign-based outbound (bulk)
```
1. A campaign is defined: a saved lead segment/filter + a call objective + a
   calling-hours window (respecting time-zone and do-not-call policy per region)
2. The Campaign Scheduler (a background service) enqueues calls at a controlled
   rate (configurable calls-per-minute per tenant) — never a burst-dial, both to
   respect Twilio/carrier rate limits and to keep AI-minute cost predictable
3. Each call proceeds identically to §3.1 from the "Call Worker" step onward
4. Campaign-level analytics roll up individual call outcomes (§19)
```

**Compliance note (architectural, not legal advice):** outbound calling is gated by a per-tenant, per-region configuration of consent and calling-hours rules, enforced by the Campaign Scheduler before a call is ever placed — the system defaults to the most restrictive interpretation until a tenant explicitly configures otherwise for their jurisdiction.

---

## 4. Twilio Integration Architecture

### 4.1 Phone number provisioning

Each tenant is provisioned one or more Twilio phone numbers via a `phone_numbers` table (`organization_id`, `twilio_number`, `twilio_sid`, `assigned_vertical_module`, `is_active`). Provisioning happens through a dedicated onboarding flow — not exposed as raw Twilio account access to tenants.

### 4.2 Media Streams (real-time audio)

Twilio's **Media Streams** feature is used (not simple TwiML `<Say>`/`<Gather>` loops) — it opens a raw, bidirectional WebSocket carrying audio chunks in near-real-time, which is what makes low-latency streaming STT/TTS possible. This is the correct architectural choice over polling-based approaches, which cannot achieve natural conversational latency.

### 4.3 Webhook surface

| Webhook | Purpose |
|---|---|
| `/voice-agent/webhook/incoming` | New inbound call notification |
| `/voice-agent/webhook/status` | Call status changes (ringing, answered, completed, failed) |
| `/voice-agent/webhook/recording` | Recording ready notification |
| `/voice-agent/webhook/amd` | Answering Machine Detection result (outbound only) |
| `/voice-agent/webhook/whatsapp` | Inbound WhatsApp message (§12) |

Every webhook validates Twilio's `X-Twilio-Signature` header against the request payload before processing — an unsigned or invalid request is rejected with `403`, exactly as designed in the Auth Architecture's API-key/system-to-system pattern.

### 4.4 Number-to-tenant resolution caching

`To`-number → `organization_id` resolution is cached in Redis (rarely changes, looked up on every single inbound call) to avoid a database round-trip on the hottest path in the entire system — the first few hundred milliseconds of call setup are the most latency-sensitive.

---

## 5. Speech-to-Text (STT) Architecture

### 5.1 Streaming, not batch

STT must be **streaming** — audio chunks are transcribed incrementally as they arrive, producing partial transcripts the Orchestrator can act on (e.g., detect the caller has started speaking, to implement interruption handling) rather than waiting for the caller to finish speaking before starting to process.

### 5.2 Provider abstraction

An `STTProvider` interface abstracts the concrete engine (e.g., Deepgram, OpenAI's real-time transcription, or a self-hosted Whisper deployment) behind one contract: `stream_audio(chunk) → partial_transcript_event | final_transcript_event`. This lets us choose different providers per latency/cost/language trade-offs without touching the Orchestrator — critical since STT vendor landscape and pricing shift quickly, and different verticals may eventually want different accuracy/latency profiles (e.g., legal transcription may prioritize accuracy over Real Estate's cold-call speed).

### 5.3 End-of-turn detection

Determining "has the caller finished their turn" is not just silence detection — it uses a combination of (a) a configurable silence threshold, (b) semantic completeness heuristics from the LLM layer for ambiguous pauses ("um, so..."), and (c) explicit interruption handling — if the caller starts speaking while the AI's TTS audio is still playing, the Orchestrator immediately halts TTS playback and treats the new input as an interruption, not an overlap to ignore. Natural-feeling interruption handling is one of the primary differentiators between a good and bad voice agent.

---

## 6. Large Language Model (LLM) Architecture

### 6.1 Provider abstraction

An `LLMProvider` interface (mirroring the pattern already established in the System Architecture document's `integrations/llm_client.py`) wraps OpenAI (or any future provider) behind: `generate(messages, tools, system_prompt) → response | tool_call`. Model selection is configurable per task, not hardcoded to one model everywhere:
- **Real-time conversation turns:** a fast, lower-latency model tier.
- **Post-call summarization (§16), lead qualification (§17):** can tolerate more latency, so a stronger/cheaper-per-quality model tier is used instead — these run asynchronously after the call ends.

### 6.2 System prompt architecture (vertical-specific)

Each vertical (Real Estate, Logistics, Healthcare, Legal, Hotels, general service) has a **base system prompt template** plus **vertical-specific injected sections**:
```
[Base identity + tone + compliance guardrails — shared across all verticals]
+
[Vertical section — e.g., Real Estate: property terminology, qualification
 questions (budget, timeline, financing); Healthcare: appointment types,
 explicit prohibition on giving medical advice or diagnoses; Legal: explicit
 prohibition on giving legal advice, intake-only framing]
+
[Tenant-specific customization — business hours, tone preferences, specific
 do's/don'ts configured by the tenant in Settings]
```
This layered composition means adding a new vertical is a matter of writing one new template section, not forking the entire orchestration logic.

### 6.3 Tool-calling architecture

The LLM never has direct database or API access. It is given a constrained, explicitly-defined set of **tools** (function-calling schema) — e.g., `check_calendar_availability`, `book_appointment`, `create_lead`, `update_lead_status`, `create_task`, `escalate_to_human`, `send_followup_email`. Each tool call the LLM emits is:
1. Validated against a JSON schema
2. Executed by the Orchestrator against the actual CRM/Calendar/Email service (§9-12) — using the same service layer and RBAC-scoped context as any human-triggered API call
3. Logged to `ai_logs` (per the Database Architecture's AI audit design) with the full input/output and reasoning context
4. The tool's result is fed back to the LLM as part of the conversation so it can continue naturally ("I've booked you for Thursday at 2pm")

This bounds what the AI can actually *do* in the system to an explicit, auditable, reviewable list — never arbitrary code execution or unconstrained data access.

### 6.4 Guardrails

- **Hallucination guardrails:** the LLM is instructed (and RAG-grounded, §8) to never state specific prices, availability, medical/legal facts, or commitments that aren't sourced from retrieved CRM/knowledge-base data — if it doesn't have grounded data, its instructed fallback is to offer to have a human follow up, not to guess.
- **Vertical compliance guardrails:** Healthcare and Legal system prompts include explicit, hard-coded prohibitions (no diagnosis, no legal advice, no treatment recommendations) reinforced at the prompt layer — this is a product-safety requirement, not just a nicety, for those two verticals specifically.
- **Off-topic/abuse handling:** a lightweight content-moderation pass on both inbound transcript and outbound generated text, with a defined graceful de-escalation script if triggered.

---

## 7. Memory Architecture

Three distinct memory layers, each solving a different problem:

### 7.1 Short-term memory (within a single call)

- **Storage:** Redis, keyed by `call_session_id`, TTL'd to the call duration.
- **Contents:** the running conversation turn history for *this call only*, plus any tool results already retrieved this call (so the AI doesn't re-fetch the same calendar availability twice in one conversation).
- **Why Redis, not just an in-memory Python list in the Orchestrator process:** if the Orchestrator process handling a call needs to restart or the call is picked up by a different worker instance (horizontal scaling, §21), the in-flight conversation state must not be lost — Redis externalizes it from any single process.

### 7.2 Long-term memory (across calls, per lead/client)

- **Storage:** PostgreSQL — this is not a separate memory system, it **is** the CRM data already designed (leads, clients, activities, previous voice_calls and their summaries).
- **What's loaded at call start:** the Orchestrator queries the lead/client's recent `activities`, prior `voice_calls.summary` entries, and any explicit notes — composed into a condensed "here's what we know about this person" context block injected into the system prompt, not the full raw history (which would blow the context window on a long-tenured client).
- **Why this is the correct design over a separate "AI memory" database:** the CRM is already the long-term memory. Building a parallel memory store would create two sources of truth about the same lead — a well-known anti-pattern. The AI reads from and writes to the same CRM a human agent would.

### 7.3 Conversation history

- Full turn-by-turn transcripts are persisted to `call_transcripts` (linked to `voice_calls`, §15) — this is the durable, complete record, distinct from the condensed "long-term memory summary" used to prime future calls. Summaries are derived from transcripts (§16), not the other way around — the transcript is always the source of truth.

---

## 8. Retrieval-Augmented Generation (RAG) Architecture

### 8.1 Vector store

**Supabase's `pgvector` extension** is used — keeping embeddings in the same PostgreSQL instance as the rest of tenant data (rather than a separate vector database like Pinecone) means RLS-based tenant isolation (already established for every other table) applies identically here, with no separate access-control system to keep in sync.

### 8.2 Knowledge sources, each with its own ingestion pipeline

```
┌─────────────────────┐   ┌──────────────────┐   ┌────────────────────┐
│  Company Knowledge     │   │   FAQ                │   │   CRM Context           │
│  Base (docs, policies,   │   │   (structured Q&A)     │   │   (live query, NOT          │
│   uploaded PDFs/pages)    │   │                          │   │   pre-embedded — see 8.4)      │
└──────────┬──────────────┘   └────────┬────────────────┘   └────────────────────────────────┘
           │                          │
           ▼                          ▼
   Chunking + Embedding      Embedding (Q&A pairs
   (background job)           embedded together)
           │                          │
           └──────────┬───────────────┘
                      ▼
         knowledge_base_embeddings table
         (organization_id, source_type, content, embedding vector, metadata)

┌────────────────────────┐   ┌────────────────────────┐
│  Property Data (RE)        │   │  Logistics Data           │
│  (structured — retrieved     │   │  (structured — retrieved     │
│   via direct query, not        │   │   via direct query, not        │
│   embedding, see 8.4)             │   │   embedding, see 8.4)             │
└────────────────────────────┘   └────────────────────────────────┘
```

### 8.3 Retrieval flow during a call

```
1. Latest caller utterance (+ short conversation context) is embedded
2. Vector similarity search against `knowledge_base_embeddings`,
   filtered by organization_id (RLS-enforced) and optionally source_type
3. Top-k relevant chunks (k configurable, typically 3-5, capped by
   context-window/latency budget) are injected into the LLM call as
   grounding context, clearly delimited from the system prompt and
   conversation history
4. The LLM is instructed to prefer retrieved facts over its own general
   knowledge, and to say "let me have someone follow up on that" rather
   than answer from ungrounded general knowledge for business-specific facts
```

### 8.4 Why structured data (Properties, Logistics, CRM context) is NOT embedded

Property listings, shipment statuses, and lead/client CRM records are **highly structured, frequently-changing, exact-match data** — embedding them into a vector store and retrieving by semantic similarity is the wrong tool: it risks retrieving a *similar but stale or wrong* property/shipment instead of the *exact* one relevant to this call. Instead, these are retrieved via **direct, parameterized service-layer queries** (the same `properties_service`/`logistics_service`/`leads_service` used by the REST API), triggered either by tool-calling (§6.3, e.g., the LLM calls `search_properties(criteria)`) or pre-loaded at call start when the calling context already identifies the specific record (e.g., an outbound call about a specific shipment loads that shipment's exact current status). **RAG is for unstructured knowledge (policies, FAQs, general company info); direct queries are for structured, live, exact-match business data.** Conflating the two is a common and costly RAG design mistake.

### 8.5 Knowledge base management

Tenants manage their knowledge base (upload docs, edit FAQ entries) through a dedicated Knowledge Base module in the CRM UI — ingestion (chunking, embedding, storage) runs as an async background job so large document uploads don't block the request cycle.

---

## 9. CRM Integration Architecture

The Orchestrator's tools call directly into the **same service layer** the REST API uses (per the System Architecture's layered design) — there is no separate "AI version" of CRM logic.

| Tool | Underlying service call | Notes |
|---|---|---|
| `create_lead` | `leads_service.create()` | Used for new inbound callers not yet in CRM |
| `update_lead_status` | `leads_service.update()` | State-machine-validated, same as human-triggered updates |
| `log_activity` | `activities_service.create()` | Every meaningful conversational moment can be logged as a timeline activity |
| `create_task` | `tasks_service.create()` | E.g., "send the caller our pricing sheet" becomes a task for a human, when the AI can't complete an action itself |
| `create_followup` | wraps `tasks_service` + `automations` trigger | Schedules a future touchpoint |

Every AI-initiated CRM write carries `created_by_system: 'voice_agent'` (per the Database Architecture's audit-column design) so it's always distinguishable from human-entered data in reporting and audit review.

---

## 10. Calendar Integration Architecture

### 10.1 Provider abstraction

A `CalendarProvider` interface (Google Calendar, Outlook Calendar, or a native LeadVoix scheduling table for tenants without an external calendar) behind: `get_availability(user_id, date_range) → slots`, `book(slot, attendee_info) → confirmation`.

### 10.2 Booking flow during a call

```
1. LLM determines caller wants to schedule a meeting/viewing/consultation
2. Tool call: check_calendar_availability(assigned_agent_id, preferred_window)
3. Orchestrator queries the CalendarProvider, returns available slots to the LLM
4. LLM proposes slots conversationally ("I have Thursday at 2pm or Friday at 10am")
5. On caller confirmation → tool call: book_appointment(slot, lead_id)
6. Orchestrator creates the `meetings` row (per CRM design) AND the external
   calendar event via the provider — CRM meeting record and external calendar
   event share a `meetings.external_calendar_event_id` link for two-way sync
7. Confirmation is read back to the caller, and a confirmation is sent via
   Email/WhatsApp (§11, §12) as a durable record the caller can reference
```

### 10.3 Double-booking prevention

Availability checks and booking are wrapped in a short-lived distributed lock (Redis) per agent-calendar to prevent a race condition where two concurrent calls (or a call and a human using the CRM UI simultaneously) both book the same slot before either write completes.

---

## 11. Email Integration Architecture

- A transactional email provider (e.g., Resend/SES, abstracted behind an `EmailProvider` interface, consistent with the pattern established for STT/LLM/Calendar) sends: meeting confirmations, post-call summaries to the assigned agent, follow-up content the AI promised during the call.
- Emails are **triggered by the automation layer (§18)**, not sent synchronously mid-call — call-time latency budget cannot afford waiting on an email API round-trip, and email delivery failures must not disrupt an active conversation.
- Every sent email is logged as an `activities` entry on the relevant lead/client for a complete timeline.

---

## 12. WhatsApp Integration Architecture

- Delivered via **Twilio's WhatsApp Business API** (reusing the same Twilio account/infrastructure already integrated for voice, minimizing new integration surface).
- Two use cases:
  1. **Post-call follow-through:** sending a booking confirmation, a requested document/link, or a follow-up message — triggered by automation (§18), same pattern as email.
  2. **Inbound WhatsApp conversations:** a lighter-weight, text-based counterpart to the voice agent for tenants who want AI-assisted WhatsApp lead engagement — routed through the same Conversation Orchestrator, minus the STT/TTS layers (text in, text out), reusing the same memory, RAG, and tool-calling architecture. This is why the Orchestrator is designed decoupled from the audio layer (§1) — the same "brain" serves both channels.

---

## 13. Human Handoff Architecture

### 13.1 Transfer to a human agent (live, mid-call)

```
1. Escalation condition met (§13.2) during an active call
2. Orchestrator tool call: escalate_to_human(reason)
3. Voice Gateway initiates a Twilio conference/transfer:
      - AI informs the caller a team member is joining ("Let me connect you
        with someone who can help further")
      - Twilio dials the assigned human agent's number, bridges the call
      - AI provides a brief spoken or CRM-visible handoff summary
        ("Caller is asking about X, already qualified as Y") so the human
        doesn't start from zero
4. If no human answers within a configurable timeout: fallback to voicemail/
   callback-scheduling, never leaving the caller in dead air
```

### 13.2 Escalation rules (configurable per tenant)

- **Explicit request:** caller asks for a human at any point — always honored immediately, no AI gatekeeping.
- **Low AI confidence:** the LLM's own confidence signal on a response falls below a threshold, or the conversation has looped without progress for N turns.
- **Sensitive topics:** complaint/legal-threat/medical-emergency language detected (a moderation/classification pass, not the primary conversational LLM call, to keep this check fast and reliable) — routes to human immediately, no AI attempt to handle.
- **High-value trigger:** lead score or deal size above a tenant-configured threshold — some tenants want a human on every high-value conversation regardless of how well the AI is doing.
- **Business hours:** outside configured hours, calls route to voicemail-with-AI-callback-scheduling rather than attempting a live human transfer.

Escalation rules are stored as tenant-level configuration (extending the `automations`-style trigger/condition pattern already established) — not hardcoded, since what counts as "escalate" varies enormously between a Real Estate cold-call agent and a Healthcare intake line.

---

## 14. Call Recording Architecture

- Twilio records the call (both legs); the recording is delivered via the `/voice-agent/webhook/recording` callback and stored in a **tenant-scoped Supabase Storage bucket** (`recordings/{organization_id}/{voice_call_id}.mp3`), never a shared/global bucket — storage-layer tenant isolation mirrors the database-layer RLS pattern.
- `voice_calls.recording_url` stores a pointer, not the file itself, consistent with the Database Architecture's guidance on large content (transcripts, recordings) being offloaded from the primary relational table.
- **Consent is a first-class, jurisdiction-aware setting** (§20.4) — recording is only enabled where the tenant has configured that recording/consent requirements are met for their region and use case; the AI includes a recording disclosure in the call opening where required, driven by that same setting, not hardcoded into the base system prompt.
- **Retention policy:** configurable per tenant (default 90 days for MVP), after which recordings are purged by a scheduled job — balancing dispute-resolution/QA needs against storage cost and data-minimization best practice.

---

## 15. Call Transcript Architecture

- Built incrementally, turn-by-turn, as the STT/LLM loop produces finalized (not partial) transcript segments — stored in a `call_transcripts` table (`voice_call_id`, `turn_number`, `speaker` [`caller`/`ai`], `text`, `timestamp_offset_seconds`) rather than one large text blob, so specific moments in a call are individually queryable/searchable (e.g., "find all calls where the caller mentioned 'competitor pricing'").
- The full concatenated transcript is denormalized onto `voice_calls.transcript` for fast whole-call display, while `call_transcripts` remains the structured source of truth — an explicit, documented denormalization (consistent with the Database Architecture's §11 pattern), kept in sync at call-end finalization.
- Transcripts are tenant-isolated via the same RLS pattern as every other table — no separate access model for this sensitive content.

---

## 16. AI Call Summary Architecture

```
1. On call completion, an async job (not blocking call teardown) sends the
   full transcript to the LLM with a dedicated summarization prompt
   (distinct from the real-time conversation prompt — optimized for
   accuracy over latency, can use a stronger model tier)
2. Output is structured, not free text:
   { summary: "...", key_points: [...], caller_sentiment: "positive|neutral|negative",
     next_steps_suggested: [...], objection_raised: "..." | null }
3. Stored on voice_calls.summary (+ structured fields), logged to ai_logs
   with the full prompt/response for auditability
4. Summary feeds: the agent's CRM view (so a human can catch up in 10 seconds
   instead of listening to the whole call), long-term memory for future calls
   (§7.2), and lead qualification scoring (§17)
```

---

## 17. Lead Qualification Architecture

### 17.1 Scoring approach

A **hybrid rule-based + LLM-assessed** score, not a pure black-box model — enterprise buyers and sales teams need to understand *why* a lead scored the way it did, which a fully opaque ML score undermines.

- **Rule-based signals** (deterministic, always computed): source quality, response time, prior engagement count, explicit stated budget/timeline if captured.
- **LLM-assessed signals** (from the call summary, §16): caller sentiment, expressed urgency, objections raised, stated intent alignment with a vertical-specific qualification framework (e.g., Real Estate: budget/timeline/financing status; Logistics: shipment volume/frequency; Healthcare: appointment type/urgency).

### 17.2 Output

`leads.score` (per the Database Architecture) is updated with a numeric score **and** a stored `score_rationale` (short text explaining the key factors) — the rationale is what makes this defensible and debuggable rather than a mystery number.

### 17.3 Vertical-specific qualification frameworks

Each vertical's system prompt (§6.2) includes its own qualification question set, configured as tenant-editable templates (Settings module) rather than hardcoded — a Legal intake line and a Hotel booking line need entirely different qualifying questions, and enterprise tenants will want to customize even within a vertical.

---

## 18. Automation Architecture

The Voice Agent **feeds** the automation layer rather than duplicating it — this reuses the `automations`/`automation_logs` design from the Database Architecture, with voice-specific trigger events added to the existing event vocabulary (`call.completed`, `call.escalated`, `lead.qualified_by_ai`, `appointment.booked`).

### 18.1 Why n8n sits alongside the internal Automation Engine, not instead of it

The internal Automation Engine (already designed) handles **in-product, low-latency, tightly-coupled actions** (create a task, update a lead status) — these run in-process against the same database transaction boundary as the triggering event, for consistency. **n8n handles tenant-configurable, cross-system workflows** that benefit from a visual builder and third-party connectors the internal engine doesn't natively support (posting to Slack, updating a Google Sheet, hitting an arbitrary customer webhook, multi-step branching logic a non-engineer admin can configure themselves). The internal engine emits domain events; n8n subscribes to a webhook feed of those same events for tenants who've configured n8n workflows — n8n is additive automation surface for power users, not a replacement for the core engine.

### 18.2 Flow

```
call.completed event fires (from Conversation Orchestrator, post-summary)
        │
        ├──► Internal Automation Engine evaluates configured rules
        │        → e.g., create_task if objection_raised != null
        │        → e.g., update_lead_status based on outcome
        │
        └──► Webhook dispatched to n8n (if tenant has n8n workflows configured)
                 → n8n workflow: e.g., "if sentiment negative, notify manager
                    via Slack AND create a Zendesk ticket AND wait 2 days
                    then send a re-engagement WhatsApp message"
```

### 18.3 Follow-up & reminder scheduling

Follow-ups/reminders created by either engine become standard `tasks`/`automations` rows with `due_at` timestamps — a scheduled job (already part of the platform, not voice-specific) sweeps due automations and fires the configured action (send email, send WhatsApp, place an outbound AI callback via §3.1).

---

## 19. Analytics Architecture

### 19.1 Call Success Rate
Defined per-tenant-configurable "success" criteria (e.g., "meeting booked," "qualified," "resolved without escalation") computed from `voice_calls.outcome` and `ai_logs`, aggregated by day/week/campaign/agent-vs-AI.

### 19.2 Conversion Rate
Joins `voice_calls` → `leads`/`clients` conversion events — reuses the Lead Funnel Report design from the Enterprise API Architecture, with a `source = voice_agent` filter to isolate AI-driven conversion specifically from other channels.

### 19.3 AI Performance
- Average confidence score, escalation rate (and top escalation reasons), average call duration by objective, transcript-derived sentiment distribution — all sourced from `ai_logs` and `voice_calls`, exposed via `GET /api/v1/analytics/ai-performance` (already specified in the Enterprise API doc).

### 19.4 Cost Tracking
A dedicated `ai_usage_logs` table (`organization_id`, `voice_call_id`, `stt_seconds`, `llm_input_tokens`, `llm_output_tokens`, `tts_characters`, `computed_cost_cents`) — cost is computed **per call**, not just estimated in aggregate, so the platform can (a) enforce plan-tier usage quotas accurately (per the Subscriptions module's usage tracking), and (b) eventually offer tenants transparent per-call cost visibility, which matters a great deal for a product literally selling AI-minutes as part of its value proposition.

---

## 20. Security Architecture

### 20.1 Authentication
The Voice Agent module's own configuration/log endpoints (`/api/v1/ai-agent/*`, `/api/v1/voice-calls/*`) use the exact same JWT session architecture already designed — no separate auth system for AI-specific endpoints. Twilio/system webhooks use signature verification (§4.3), not JWTs, since there's no user session on that path.

### 20.2 Authorization
Same RBAC model — `voice_calls.initiate`, `ai_agent.manage`, `ai_logs.review` etc. are permission codes exactly like any other module's, assignable to system or custom roles. No parallel permission system for AI features.

### 20.3 Data Privacy
- Call transcripts/recordings/summaries are tenant-owned data, subject to the same RLS tenant isolation as every other table — an OpenAI/STT provider processing a call's audio/text is a data processor under a data-processing agreement, and provider selection favors vendors offering **no training on customer data** commitments, configured explicitly in provider account settings (an operational/procurement requirement, not just an architectural one, but the architecture must support swapping providers if this requirement isn't met — hence the provider-abstraction pattern used throughout §5, §6, §10, §11).
- PII in transcripts (caller-stated SSNs, card numbers, health details) is a known LLM-pipeline risk — a redaction pass (regex + lightweight classifier) runs on transcripts before they're used as RAG context for *other* calls or long-term memory summarization, reducing the chance sensitive data surfaces in an unrelated future conversation.

### 20.4 Recording Permissions
- A per-tenant, per-region `recording_consent_mode` setting (`all_party_consent`, `one_party_consent`, `disabled`) drives both (a) whether recording is enabled at all for that tenant/number, and (b) whether the AI includes a spoken consent disclosure at call start — this is enforced at the Voice Gateway level (§4) before a Twilio recording instruction is ever issued, not left to be "configured correctly" by each tenant unassisted; the default for a newly provisioned number is the most conservative mode until explicitly changed.

---

## 21. Scalability Architecture

### 21.1 Stateless, horizontally-scaled services
Both the Voice Gateway and Conversation Orchestrator are designed **stateless at the process level** — all session state lives in Redis (§7.1), not in-process memory — so either service can be scaled horizontally behind a load balancer with no sticky-session requirement beyond the initial WebSocket connection itself.

### 21.2 Queue-based outbound calling
Outbound call requests (§3) are never placed synchronously from the API request — they're enqueued (Redis-backed queue, e.g., using Redis Streams or a lightweight task queue like Celery/RQ atop Redis) and processed by a pool of **Call Worker** processes, whose concurrency is tuned independently from the web API's concurrency — this decouples "how many API requests we can accept" from "how many simultaneous outbound calls we can place," which have very different resource profiles (the latter is bounded by Twilio account concurrency limits and per-tenant plan quotas, not just server capacity).

### 21.3 Latency budget management
Given the five-way pipeline (STT → Orchestrator → RAG → LLM → TTS), each stage has an explicit latency budget monitored in production; RAG retrieval and tool-calling are parallelized wherever the conversation state allows (e.g., speculatively checking calendar availability while the LLM is still formulating whether to ask about scheduling), rather than a strictly serial pipeline, to keep total round-trip time within the ~1-2 second window that feels conversational rather than robotic.

### 21.4 Multi-region consideration (forward-looking)
As call volume grows internationally, Voice Gateway instances and STT/TTS provider endpoints should be deployed in the region closest to the tenant's Twilio number's typical caller geography — flagged as a future scaling lever, not required for MVP concurrency levels.

---

## 22. Deployment Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌───────────────────────┐
│  Vercel                 │     │  Railway (or equiv.)    │     │  Supabase (managed)      │
│  Frontend (React)         │◄───►│  - Core API (FastAPI)     │◄───►│  - PostgreSQL + pgvector    │
└─────────────────────┘     │  - Voice Gateway              │     │  - Storage (recordings)        │
                             │  - Conversation Orchestrator     │     │  - Auth                           │
                             │  - Call Worker pool                 │     └───────────────────────────────┘
                             │  - Campaign Scheduler                  │
                             └────────────┬───────────────────────────┘
                                          │
                             ┌────────────▼─────────────────┐
                             │  Redis (managed)                  │
                             │  - Session state, queues,           │
                             │    rate limiting, caching              │
                             └───────────────────────────────────┘
                                          │
                             ┌────────────▼─────────────────┐
                             │  n8n (self-hosted or n8n Cloud)   │
                             │  - Tenant-configurable workflows      │
                             └───────────────────────────────────┘

External:  Twilio (Voice/WhatsApp) · OpenAI (LLM) · STT/TTS provider · Email provider
```

Every backend service (Core API, Voice Gateway, Conversation Orchestrator, Call Workers) is independently Dockerized, sharing a common base image for dependency consistency but deployed and scaled as **separate containers/services** — this directly enables the independent-scaling requirement from §21.1 and keeps a Voice Gateway incident from taking down core CRM API availability, and vice versa.

---

## 23. Folder Structure (Voice Agent Module, extending the established backend structure)

```
apps/backend/app/modules/voice_agent/
├── router.py                    # REST endpoints (§9-13's ai-agent/voice-calls routes)
├── schemas.py                   # Pydantic request/response models
├── service.py                   # Business logic: call lifecycle, tool orchestration
├── repository.py                # DB access: voice_calls, call_transcripts, ai_logs
├── models.py                    # ORM models
│
├── gateway/                     # Voice Gateway (WebSocket/Twilio audio handling)
│   ├── websocket_handler.py
│   ├── twilio_webhooks.py
│   └── call_session.py
│
├── orchestrator/                # Conversation Orchestrator (the "brain")
│   ├── conversation_loop.py
│   ├── memory.py                # Short-term (Redis) + long-term (CRM) assembly
│   ├── rag.py                   # Retrieval logic (§8)
│   ├── tools/                   # One file per tool, matching §6.3, §9-12
│   │   ├── crm_tools.py
│   │   ├── calendar_tools.py
│   │   ├── email_tools.py
│   │   ├── whatsapp_tools.py
│   │   └── escalation_tools.py
│   └── prompts/                 # Vertical-specific system prompt templates (§6.2)
│       ├── base_prompt.py
│       ├── real_estate_prompt.py
│       ├── logistics_prompt.py
│       ├── healthcare_prompt.py
│       ├── legal_prompt.py
│       └── hotels_prompt.py
│
├── stt/                         # STT provider abstraction (§5)
│   └── providers/
├── tts/                         # TTS provider abstraction
│   └── providers/
├── llm/                         # LLM provider abstraction (§6.1)
│   └── providers/
├── calendar/                    # Calendar provider abstraction (§10)
│   └── providers/
│
├── summarization/                # Post-call summary pipeline (§16)
├── qualification/                # Lead scoring engine (§17)
├── campaigns/                    # Outbound campaign scheduler (§3.2)
└── workers/                      # Call Worker processes (§21.2)
    └── outbound_call_worker.py
```

This structure keeps the existing module convention (`router/schemas/service/repository/models`) at the top level for everything that behaves like a normal CRM resource (voice call records, AI logs as data), while clearly separating the **real-time audio/AI pipeline** (`gateway/`, `orchestrator/`, `stt/`, `tts/`, `llm/`) as its own well-bounded subsystem — this is the part of the codebase that will change fastest (new providers, prompt iteration, new tools) and benefits from being isolated from the more stable CRUD-style module code around it.

---

## 24. Future Expansion Architecture

### 24.1 Multi-language
The provider-abstraction pattern already accommodates this: STT/TTS providers are selected per detected/configured language, and system prompts (§6.2) are templated with language as a parameter rather than hardcoded English strings — the architectural hook is in place now (`language` as a first-class field on the call session context) even though MVP ships English-only, so this becomes a content/configuration expansion rather than a redesign.

### 24.2 Voice Cloning
A tenant-specific custom TTS voice (for brand consistency — "sounds like our own receptionist") slots into the existing `TTSProvider` abstraction as simply another provider configuration (`voice_id` per organization) — no architectural change required, contingent on provider support (e.g., ElevenLabs-style custom voice cloning) and additional consent/ethical-use safeguards specific to voice cloning that would need their own review at that time.

### 24.3 Custom AI Agents
Beyond the six built-in verticals, enterprise tenants defining fully custom agent behavior (custom tools, custom prompt sections, custom escalation rules) is a natural extension of the tenant-configurable prompt/settings pattern already established (§6.2, §13.2, §17.3) — the schema and orchestration logic don't assume a fixed vertical enum, they assume a **configuration object per organization**, of which the six built-in verticals are simply the shipped presets.

### 24.4 Multi-tenant AI (model/config isolation)
Already substantially designed-in from day one, not deferred: every AI configuration (`ai_agent` config, prompts, knowledge base, escalation rules) is `organization_id`-scoped exactly like every other tenant-owned resource (per §0's design philosophy — the voice agent is a consumer of the existing multi-tenant platform, not a bolt-on). The "future expansion" here is less architectural and more about giving enterprise tenants **per-team or per-campaign** AI configuration variants within their own org (e.g., a logistics tenant wanting different AI behavior for "new customer intake" vs. "existing shipment status" call lines) — a natural extension of scoping configuration one level deeper (team/campaign) rather than only at the organization level.

---

## 25. Summary: How This Fits the Broader LeadVoix OS Architecture

| Concern | How the Voice Agent architecture stays consistent with the rest of the platform |
|---|---|
| Multi-tenancy | Every voice-agent table/config is `organization_id`-scoped, RLS-enforced, identical pattern to CRM Core |
| RBAC | Voice-agent permissions (`voice_calls.initiate`, `ai_agent.manage`, etc.) are ordinary entries in the same `permissions`/`role_permissions` system |
| Auth | Same JWT session architecture; Twilio webhooks use signature verification, consistent with the API-key/system-to-system pattern already designed |
| CRM data | The AI reads/writes leads, clients, activities, tasks through the same service layer as the human-facing REST API — no parallel data model |
| Automation | Extends the existing `automations` engine's event vocabulary; n8n is additive, not a replacement |
| Auditability | Every AI action logged to `ai_logs`, exactly as designed in the Database and API Architecture documents |
| Deployment | Dockerized services on the same Railway/Supabase/Vercel stack, scaled independently per §21-22 |

---

**Next recommended step, per your workflow rules:** confirm this AI Voice Agent architecture (or flag any section to adjust — particularly the RAG structured-vs-unstructured data split in §8.4 and the escalation rules in §13.2, since those most directly shape the caller experience) before implementation begins. Once confirmed, the natural build order is: (1) Twilio webhook + Voice Gateway skeleton (§4, §2) with a minimal STT/TTS/LLM loop, before (2) tool-calling into CRM (§9), before (3) RAG (§8) and the remaining integrations — each stage independently testable with a real phone call before the next is layered on.
