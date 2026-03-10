# OpenClaw Skills — Echo Ecosystem

OpenClaw agent skills by [Iditor](https://iditor.com). Published on [ClawHub](https://clawhub.com) under `@kkw-21`.

## Skills

| Folder | ClawHub Slug | Description |
|--------|-------------|-------------|
| `echo-memory/` | `echo-memory` | Memory sync — markdown to Supabase with Luhmann encoding |
| `memory-graph/` | `memory-graph` | Memory graph visualization and clustering |
| `memory-map/` | `memory-map` | Map your memories geographically |
| `memory-network/` | `memory-network` | Social memory network — communities through shared memory |
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

```
skill-name/
├── SKILL.md          # Required — skill definition
├── references/       # Optional — reference docs
├── scripts/          # Optional — automation scripts
└── ...
```

## License

MIT
