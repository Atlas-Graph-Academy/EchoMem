# OpenClaw Skills - Echo Ecosystem

OpenClaw agent skills by [Iditor](https://iditor.com). Published on [ClawHub](https://clawhub.com) under `@kkw-21`.

## Runtime

This repo now includes executable skill runtime scripts for EchoMem cloud integration.

### Prerequisites

- Node.js 18+
- EchoMem API key with scopes:
  - `memory:read`
  - `ingest:write`
  - `mcp:tools` (if using MCP tools)

### Environment

Runtime auto-loads `.env` and `.env.local` from either current working directory or this repo root.  
Recommended setup:

```bash
cp .env.example .env.local
```

```bash
export ECHOMEM_BASE_URL="http://localhost:3000"
export ECHOMEM_API_KEY="ec_your_key"
export MEMORY_FEED_BASE_URL="http://localhost:8787"
export MERCURY_BASE_URL="http://localhost:8788"
export MERCURY_AUTH_TOKEN=""
export GRAPH_BACKEND="extension" # or iditor_user
export IDITOR_BASE_URL=""
export IDITOR_AUTH_TOKEN=""
export OPENCLAW_MEMORY_DIR="/path/to/openclaw/markdown"
```

### Install local command shims

```bash
npm install
npm link
```

### Functional commands

```bash
echo-memory sync --dir "$OPENCLAW_MEMORY_DIR" --process-mode deferred --run-jobs
echo-memory status --limit 20
echo-chat search --query "launch planning"
memory-graph render --page 1 --page-size 220
connect find --user-id <uuid> --query "founder grief"
memory-network feed --user-id <uuid>
memory-map render --map-type category
echo-identity profile
memory-signal analyze --limit 200
echo-match find --user-id <uuid> --query "career pivot"
echo-community discover --topic "moving abroad" --user-id <uuid>
echo-page generate --user-id <uuid> --output ./tmp/echo-page.json
```

## Skills

| Folder | ClawHub Slug | Description |
|--------|-------------|-------------|
| `echo-memory/` | `echo-memory` | Memory sync - markdown to EchoMem cloud |
| `memory-graph/` | `memory-graph` | Memory graph visualization and clustering |
| `memory-map/` | `memory-map` | Map your memories geographically |
| `memory-network/` | `memory-network` | Social memory network |
| `connect/` | `connect` | Memory-driven human connections |
| `chats/` | `chats` | Echo Chat integration |
| `page/` | `page` | Every claw deserves a page |

## Publishing

```bash
# Login to ClawHub
clawhub login

# Publish a skill (from repo root)
clawhub publish ./echo-memory --slug echo-memory --name "Echo Memory" --version 0.2.0 --changelog "Description of changes"
```

## Structure

Each skill is a folder with at minimum a `SKILL.md`. Add reference docs, scripts, and supporting files as the skill matures.

```text
skill-name/
|-- SKILL.md
|-- references/
|-- scripts/
`-- ...
```

Top-level runtime scripts live in:

```text
scripts/
  echo-memory.js
  chats.js
  memory-graph.js
  lib/
```

## License

MIT
