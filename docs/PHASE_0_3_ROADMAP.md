# OpenClaw Skills: Phase 0-3 Roadmap

## Objective

Ship `openclaw-skills` as a local-first OSS plugin pack for OpenClaw, with optional EchoMem cloud storage and social discovery integrations.

## Scope Boundary

This repo should own:

- Skill contracts (`SKILL.md`) and capability declarations.
- Provider adapters (`local_openclaw`, `echomem_cloud`, `social_feed`).
- Compatibility checks for required routes/RPCs/tables.
- OSS docs for setup, privacy, and troubleshooting.

This repo should not own:

- EchoMem backend internals.
- MemoryFeed deployment/runtime internals.
- Mercury ETL app internals.

## Canonical Data Surfaces

- `public.memory_new`
- `public.source_of_truth`
- `public.context`
- `public.api_keys`
- `public.prompt_templates`
- `public.memory_neighbors`
- `public.memory_clusters`
- `public.social_canvas`
- `public.user_preferences`
- `report.user_visibility_blocks`
- `pair.paired`
- `echo.echoMessage`
- `story.doors`
- `gold_mine.source_of_truth`
- `gold_mine.memory`
- `gold_mine.third_party_user_map`
- `gold_mine.third_party_ingestion_job`
- `gold_mine.third_party_ingestion_log`

## Skill-to-Endpoint/Table Matrix

| Skill | Exact endpoints in current stack | Tables / RPC used | Feasibility now | Gap to close |
| --- | --- | --- | --- | --- |
| `echo-memory` | EchoMem: `GET /api/extension/memories`, `POST /api/extension/memories/ingest`, `POST /api/extension/memories/search`, `POST /api/extension/memories/time-range`, `PATCH /api/extension/memories/[id]`, `DELETE /api/extension/memories/[id]`; MCP: `GET|POST /api/extension/mcp` | `memory_new`, `source_of_truth`, `context`, `api_keys`; RPC: `dev_memory_description_similar_embedding` | High | Align MCP package server vs remote MCP tool parity |
| `memory-graph` | Profile A (EchoMem Extension): `GET /api/extension/memories/graph-data`, `GET /api/extension/memories/narrative-context`, `POST /api/extension/memories/narrative-text`; Profile B (Iditor User Graph): `GET /api/user-memory/graph-data`, `GET /api/user-memory/narrative-context`, `POST /api/user-memory/narrative-context` | `memory_new`, `memory_neighbors`, `memory_clusters`, `source_of_truth`, `narrative_chains`; optional `public_graph_index` for public preview mode | Medium-high | Need shared graph DTO + explicit backend profile/auth mode support (`api_key` vs `supabase_jwt`) |
| `memory-map` | Mercury: `GET /api/memory-map`, `GET /api/memory-map-search`, `GET /api/memory-map-convergence`, `POST /api/memory-map-convergence/compute` | `memory_map_projection`, `memory_map_base`, `memory_map_convergence_runs`; RPC: `memory_map_hybrid_candidates`, `get_convergence_memories`, `get_convergence_run_memories`, `get_convergence_run_paths`; `social_canvas` | Medium | Mark as experimental until convergence schema + API contract are versioned |
| `memory-network` | MemoryFeed: `POST /api/search`, `POST /api/friends-prior-search`; Mercury: `GET /api/friends`; MCP tool path via `search_others_memories` | `memory_new`, `social_canvas`, `pair.paired`, `report.user_visibility_blocks` | Medium | Missing durable network-edge materialization API/table |
| `connect` | MemoryFeed: `POST /api/search`, `POST /api/friends-prior-search`, `GET /api/similar` | `memory_new`, `social_canvas`, `pair.paired`, `report.user_visibility_blocks`; RPCs behind search/feed logic | Medium-high | Need explainability schema for "why connected" |
| `echo-match` | MemoryFeed: `POST /api/search`, `GET /api/similar`; Mercury assist: `GET /api/friends` | `memory_new`, `social_canvas`, `pair.paired`, `report.user_visibility_blocks` | Medium | Match scoring output contract not yet standardized for SDK |
| `echo-community` | MemoryFeed: `POST /api/feed`, `POST /api/search` | `memory_new`, `social_canvas`, `report.user_visibility_blocks` | Medium | No community lifecycle tables (groups, roles, moderation) |
| `echo-identity` | EchoMem: `GET /api/extension/account/profile-summary`, `POST /api/extension/prompts/extract`, `POST /api/extension/prompts/generate`, `GET|POST|DELETE /api/extension/prompts/templates` | `memory_new`, `prompt_templates`, `social_canvas`, `user_preferences`, `third_party_user_map`, `users`/`twitter_users` views | Medium-high | Add versioned identity profile schema for deterministic updates |
| `memory-signal` | No dedicated API yet; can bootstrap from EchoMem search/time-range and MemoryFeed feed/search | `memory_new` fields (`emotion`, `time`, `category`, `object`, `keys`) | Low-medium | Add explicit signal endpoints and persisted aggregates |
| `chats` | EchoMem: `POST /api/extension/memories/ingest`, `POST /api/extension/memories/search`, `POST /api/extension/memories/time-range`; EchoMem context: `GET /api/extension/contexts/[id]/messages`; MCP: `GET|POST /api/extension/mcp` | `echoMessage`, `context`, `memory_new`, `source_of_truth` | High | Define stable chat-to-memory provenance schema across providers |
| `page` | No dedicated page route in `openclaw-skills`; optional source APIs from EchoMem graph/narrative and Mercury map APIs | `memory_new`, `social_canvas`, `story.doors` | Low | Requires page generation/publishing API + template model |

## Mercury Markdown to `memory_new` Pipeline Alignment

Current callable pieces:

- `POST /api/gold-mine/uploads/save-text-files` writes staged documents into `gold_mine.source_of_truth`.
- `POST /api/gold-mine/memories/process-text-memory` and `POST /api/gold-mine/memories/process-csv-memory` extract memories into `gold_mine.memory`.
- `POST /api/gold-mine/memories/process-memories-from-db` batch-processes staged rows.
- `POST /api/gold-mine/third-party/auto-run` can call RPC `migrate_third_party_memories`.
- SQL function `public.migrate_third_party_memories(...)` migrates `gold_mine.memory` into `public.memory_new`.

Observed gap:

- Markdown-specific prompt (`GetExtractMemoryMarkdownPrompt`) is present but not wired as a first-class path in the extraction endpoint contract.

## Phase 0-3 Delivery Plan

## Phase 0: Contract Freeze and Inventory (1-2 weeks)

- Freeze endpoint, RPC, and table contracts for all 11 skills.
- Add per-skill status tags: `ready`, `partial`, `experimental`.
- Add provider capability matrix: local markdown/sqlite vs EchoMem cloud vs social feed.
- Publish schema prerequisites for `memory_new` and minimal social fields.

Exit criteria:

- Every skill maps to exact routes and tables in docs.
- Every unsupported claim has an explicit gap note.

## Phase 1: Local-First OSS Core (2-4 weeks)

- Make `local_openclaw` provider default.
- Ship stable local implementations for `echo-memory`, `chats`, and base `memory-graph`.
- Add local sqlite index bridge for markdown memory recall compatibility.
- Add optional sirchmunk-style markdown scan/index adapter for context optimization.

Exit criteria:

- New OpenClaw user can run core skills without cloud account.
- Local quickstart and troubleshooting validated end-to-end.

## Phase 2: EchoMem Cloud + Pipeline Provider (3-5 weeks)

- Ship `echomem_cloud` adapter for `/api/extension/memories/*`, `/api/extension/sources*`, `/api/extension/mcp`.
- For `memory-graph`, add backend profiles:
  - `extension` profile (`/api/extension/memories/*`)
  - `iditor_user` profile (`/api/user-memory/*`)
- Add provenance checks: `source_of_truth_ids` and `context` linkage in responses.
- Document Mercury bridge from markdown/text staging to `memory_new`.
- Unify MCP tool capabilities between package MCP server and remote MCP endpoint.

Exit criteria:

- Cloud mode works with API key auth and deterministic fallback to local mode.
- Memory-graph backend switch works without changing skill logic.
- Ingestion lineage is traceable from source to memory row.

## Phase 3: Social Discovery Beta (4-6 weeks)

- Enable read-only social skills first: `connect`, `echo-match`, `echo-community`, `memory-network`.
- Standardize output schemas for match score, rationale, and privacy-filtered fields.
- Enforce privacy/blocking behavior aligned with `report.user_visibility_blocks`.
- Add reliability modes: graceful degradation if MemoryFeed or Mercury endpoints are unavailable.

Exit criteria:

- Social skills run in read-only mode with explicit privacy boundaries.
- Public beta docs include cloud data-flow and opt-out controls.

## Minimal Viable Open-Source Release Boundary (v0)

Included in v0:

- Stable skills: `echo-memory`, `chats`, `memory-graph` (base).
- Providers: `local_openclaw` required; `echomem_cloud` optional.
- Experimental but published: `memory-map`, `connect`, `echo-match` behind feature flags.
- Docs: setup, capability matrix, schema checklist, privacy matrix, failure modes.

Explicitly out of v0:

- Full community lifecycle management.
- Persistent network-edge service.
- Full page publishing engine.
- Hard requirement on Mercury/MemoryFeed for core local usage.

## Release Gates

1. Gate A (`v0.1.0`): Local-first core is stable and documented.
2. Gate B (`v0.2.0`): EchoMem cloud adapter and provenance checks are stable.
3. Gate C (public beta): Social discovery contracts and privacy guardrails are validated.

## Rename Track (post-v0)

1. Pick a neutral, product-facing name and publish alias package.
2. Keep `openclaw-skills` as compatibility shim for 1-2 minor releases.
3. Ship migration doc mapping old skill names/commands to new namespace.
